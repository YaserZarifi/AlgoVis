<#
.SYNOPSIS
  Runs every Phase 0 acceptance check and reports pass/fail.

.DESCRIPTION
  Exits 0 only if every check passes, so it is usable as a pre-push gate.

  Native stderr is captured through `cmd /c` rather than PowerShell's `2>`, because Windows
  PowerShell wraps a native command's stderr in ErrorRecords and turns readable output into a
  wall of NativeCommandError noise.

.EXAMPLE
  pwsh scripts/verify.ps1
  powershell -File scripts\verify.ps1
#>

[CmdletBinding()]
param(
  # Skip the slow steps (install, build) when you have already built.
  [switch]$Fast
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# ffmpeg is often installed into a shell that is already open; pick up PATH changes.
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

$script:Failures = @()
$script:Checks = 0

# Tools colourize when they detect a console, so output differs between an interactive run and
# a piped one. Strip the escape sequences centrally or anchored matches fail only for the user.
function Remove-Ansi {
  param([string[]]$Text)
  return $Text | ForEach-Object { [regex]::Replace([string]$_, "\x1B\[[0-9;]*[A-Za-z]", "") }
}

function Invoke-Cli {
  param([string]$Arguments)
  return (Remove-Ansi (cmd /c "node packages\cli\dist\index.js $Arguments 2>&1"))
}

function Test-Step {
  param(
    [string]$Name,
    [scriptblock]$Body,
    # Extra detail printed only when the step fails.
    [string]$Detail = ""
  )
  $script:Checks += 1
  # Deliberately obscure name: PowerShell resolves variables in $Body dynamically, so a local
  # here called $ok would shadow the caller's $ok and silently evaluate to $false.
  $stepResult = $false
  try { $stepResult = [bool](& $Body) } catch { $stepResult = $false; $Detail = $_.Exception.Message }

  if ($stepResult) {
    Write-Host ("  PASS  " + $Name) -ForegroundColor Green
  } else {
    Write-Host ("  FAIL  " + $Name) -ForegroundColor Red
    if ($Detail) { Write-Host ("        " + $Detail) -ForegroundColor DarkGray }
    $script:Failures += $Name
  }
}

function Write-Section {
  param([string]$Title)
  Write-Host ""
  Write-Host $Title -ForegroundColor Cyan
}

Write-Host ""
Write-Host "AlgoVis - Phase 0 verification" -ForegroundColor White
Write-Host "repo: $root"

# ---------------------------------------------------------------- prerequisites
Write-Section "Prerequisites"

if (-not $Fast) {
  pnpm install --silent | Out-Null
}

$doctor = Invoke-Cli "doctor"
$doctorOk = $LASTEXITCODE -eq 0
$doctor | ForEach-Object { Write-Host ("        " + $_) -ForegroundColor DarkGray }
Test-Step "doctor reports all four prerequisites satisfied" { $doctorOk } "doctor exited $LASTEXITCODE"

# ---------------------------------------------------------------- acceptance triple
Write-Section "Acceptance: build, test, lint"

if (-not $Fast) {
  $build = Remove-Ansi (cmd /c "pnpm build 2>&1")
  Test-Step "pnpm build" { $LASTEXITCODE -eq 0 } (($build | Select-String "error" | Select-Object -First 3) -join "; ")
}

$testOut = Remove-Ansi (cmd /c "pnpm test 2>&1")
$testOk = $LASTEXITCODE -eq 0
$testLine = ($testOut | Select-String "Tests\s+\d+ passed" | Select-Object -First 1)
Test-Step "pnpm test$(if ($testLine) { '  (' + $testLine.ToString().Trim() + ')' })" { $testOk } (($testOut | Select-String "FAIL|✕" | Select-Object -First 5) -join "; ")

cmd /c "pnpm lint 2>&1" | Out-Null
Test-Step "pnpm lint" { $LASTEXITCODE -eq 0 } "eslint reported problems; run 'pnpm lint' to see them"

# ---------------------------------------------------------------- determinism rule
Write-Section "Determinism rule (the section 2.1 ban)"

$probe = "packages/views/src/__probe.ts"
try {
  'export const elapsed = (): number => Date.now();' | Out-File -Encoding utf8 $probe
  $probeOut = cmd /c "pnpm lint 2>&1"
  $rejected = ($LASTEXITCODE -ne 0) -and (($probeOut -join "`n") -match "Date\.now")
  Test-Step "planted Date.now() in packages/views is rejected" { $rejected } "lint should have failed but did not"
}
finally {
  if (Test-Path $probe) { Remove-Item $probe -Force }
}

cmd /c "pnpm lint 2>&1" | Out-Null
Test-Step "lint is clean again once the probe is removed" { $LASTEXITCODE -eq 0 }

# ---------------------------------------------------------------- cli surface
Write-Section "CLI surface"

$help = Invoke-Cli "--help"
$helpText = $help -join "`n"
$subcommands = @("run", "record", "lift", "direct", "render", "studio", "diff", "doctor")
$missing = $subcommands | Where-Object { $helpText -notmatch ("algovis\s+" + $_ + "\b") }
Test-Step "--help lists all eight subcommands" { $missing.Count -eq 0 } ("missing: " + ($missing -join ", "))
Test-Step "--help reports the binary as 'algovis'" { $helpText -match "^algovis" } ("first line was: " + (($helpText -split "`n")[0]))

# The bin shim is what makes `pnpm exec algovis` work; without @algovis/cli as a root dependency
# pnpm never creates it, and the only way to run the CLI is the full path into dist.
$shim = Remove-Ansi (cmd /c "pnpm exec algovis --version 2>&1")
$shimOk = $LASTEXITCODE -eq 0
Test-Step "'pnpm exec algovis' resolves the bin shim" { $shimOk } (($shim -join " ").Trim())

# ---------------------------------------------------------------- argument rejection
Write-Section "Bad arguments are rejected"

$bad = @(
  @{ args = "render sb.json --frames 900-840";     expect = "ends before it starts" },
  @{ args = "render sb.json --frames 840";         expect = "expects .from-to." },
  @{ args = "direct ops.json --theme neon";        expect = "oscilloscope, risograph, blueprint" },
  @{ args = "direct ops.json --duration 0";        expect = "positive number" },
  @{ args = "render sb.json --format widescreen";  expect = "landscape, vertical, square, portrait" },
  @{ args = "lift trace.json --complexity 100";    expect = "at least two input sizes" },
  @{ args = "run x.py --audio loud";               expect = "none, events, or music" }
)

foreach ($case in $bad) {
  $out = (Invoke-Cli $case.args) -join "`n"
  $code = $LASTEXITCODE
  Test-Step ("rejects: " + $case.args) {
    ($code -ne 0) -and ($out -match $case.expect)
  } ("exit=$code output=" + ($out -replace "`n", " ").Trim())
}

# ---------------------------------------------------------------- not implemented
Write-Section "Valid arguments parse, then report not-implemented"

$stages = @(
  @{ stage = "run";    args = "run examples/quicksort.py" },
  @{ stage = "record"; args = "record examples/quicksort.py --entry quicksort(data) -o trace.json" },
  @{ stage = "lift";   args = "lift trace.json -o ops.json --complexity 10,100,1000" },
  @{ stage = "direct"; args = "direct ops.json -o sb.json --format vertical --duration 14 --theme oscilloscope --loop" },
  @{ stage = "render"; args = "render sb.json -o out/ --format all --frames 840-900 --guides" },
  @{ stage = "studio"; args = "studio sb.json" },
  @{ stage = "diff";   args = "diff a.json b.json -o sb.json" }
)

foreach ($case in $stages) {
  $out = (Invoke-Cli $case.args) -join "`n"
  $code = $LASTEXITCODE
  Test-Step ("not implemented: " + $case.stage) {
    ($code -eq 1) -and ($out -match ("not implemented: " + $case.stage))
  } ("exit=$code output=" + $out.Trim())
}

# ---------------------------------------------------------------- examples
Write-Section "Example programs are correct"

$examples = python -c @"
import sys
sys.path.insert(0, 'examples')
import quicksort, mergesort, edit_distance, dijkstra, nqueens
q = quicksort.main(); m = mergesort.main()
d = dijkstra.main()
checks = [
    ('quicksort sorts 200 elements', q == sorted(q) and len(q) == 200),
    ('mergesort sorts 128 elements', m == sorted(m) and len(m) == 128),
    ('edit_distance kitten->sitting is 3', edit_distance.main() == 3),
    ('nqueens finds 4 solutions for n=6', len(nqueens.main()) == 4),
    ('dijkstra reaches F at cost 13', d['F'] == 13),
]
for name, ok in checks:
    print(('OK' if ok else 'BAD') + '|' + name)
"@

foreach ($line in $examples) {
  if ($line -match "^(OK|BAD)\|(.+)$") {
    $exampleOk = $Matches[1] -eq "OK"
    Test-Step $Matches[2] { $exampleOk }
  }
}

# ---------------------------------------------------------------- hygiene
Write-Section "Repository hygiene"

# Assembled at runtime so this file does not match its own search and report itself.
$oldName = "trace" + "cam"
$stale = git ls-files | ForEach-Object {
  Select-String -Path $_ -Pattern $oldName -SimpleMatch -ErrorAction SilentlyContinue
}
Test-Step "no '$oldName' references remain" { -not $stale } (($stale | ForEach-Object { $_.Path }) -join ", ")

$ignored = @("CLAUDE.md", ".agents/skills/frontend-design/SKILL.md", "skills-lock.json") |
  Where-Object { Test-Path $_ } |
  Where-Object { -not (git check-ignore $_) }
Test-Step "local-only files are gitignored" { $ignored.Count -eq 0 } ("not ignored: " + ($ignored -join ", "))

$tracked = git ls-tree -r HEAD --name-only | Select-String -Pattern "CLAUDE\.md|^\.agents/|skills-lock\.json"
Test-Step "local-only files are absent from the published tree" { -not $tracked } (($tracked -join ", "))

$dirty = git status --porcelain
Test-Step "working tree is clean" { -not $dirty } (($dirty -join "; "))

# ---------------------------------------------------------------- summary
Write-Host ""
if ($script:Failures.Count -eq 0) {
  Write-Host ("All $($script:Checks) checks passed.") -ForegroundColor Green
  exit 0
} else {
  Write-Host ("$($script:Failures.Count) of $($script:Checks) checks FAILED:") -ForegroundColor Red
  $script:Failures | ForEach-Object { Write-Host ("  - " + $_) -ForegroundColor Red }
  exit 1
}
