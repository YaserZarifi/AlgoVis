# Fixtures

Committed `trace.json` files, small enough to read by hand and to keep in git.

Empty until Phase 1, which lands the first recorded trace along with the reconstruction property
test — the one asserting `reconstruct(trace, t)` matches a naively-recorded reference state for
every `t`.

Fixtures must stay small. A fixture nobody can open and read is a fixture nobody will debug
against, and reconstruction being off by one is silent by nature: it produces animations of
states that never existed.
