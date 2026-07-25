# Fonts

Fonts must be vendored here and loaded via `@font-face`. Never assume a face is present on the
system — a missing face means frame 0 renders in a fallback and looks different from frame 1,
which is §20's pitfall 6. The render hard-fails if a declared face is unavailable.

Nothing is committed here yet; this lands with the first composition that renders text.

## To vendor

| Face | Used by | Licence | Redistributable |
|---|---|---|---|
| JetBrains Mono | Oscilloscope (everything, including headings) | OFL 1.1 | yes |
| IBM Plex Mono | Risograph (code), Blueprint (everything) | OFL 1.1 | yes |
| Archivo Condensed | Risograph (display) | OFL 1.1 | yes |
| Berkeley Mono | Blueprint (opt-in override) | commercial | **no** |

Berkeley Mono is commercial and must never be committed. Blueprint ships with IBM Plex Mono as
its default; a user who owns Berkeley Mono supplies it themselves as an override (§3).

Never commit a font you have not verified is redistributable. Include each family's licence file
alongside its binaries.

## Requirements

- Weights 400 and 700 only — two weights maximum per theme (§13.4).
- Tabular figures are mandatory for Oscilloscope, which renders step counters that must not
  reflow as digits change.
- Subset if practical, but keep the full digit and box-drawing ranges.
