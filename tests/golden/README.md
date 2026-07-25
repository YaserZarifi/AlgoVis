# Golden frames

Committed reference PNGs, one set per theme × format × fixture, compared with `pixelmatch` at
threshold 0.02.

Empty until Phase 3, which commits goldens for frames 0, 120, 240, and 480.

The failure mode this guards against is the one that matters here: everything type-checks, every
unit test passes, and the video looks wrong. Pixels are the only thing that actually tells you.

## Updating

When output legitimately changes, update goldens in a commit that touches **only** goldens, and
put the visual reason in the message. A goldens update mixed into a behaviour change hides
exactly the regression the goldens exist to catch.
