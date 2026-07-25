"""Structural sharing, not deep copies.

Phase 1.

``copy.deepcopy`` of a 10,000-element list on every line produces gigabytes and takes minutes.
Instead each watched container is chunked at 64 elements, each chunk is hashed, and a mutation
replaces only the affected chunk — unchanged chunks stay shared by reference. A full keyframe is
written every 2,000 steps or 4 MB of deltas, whichever comes first (section 5.3).

Any step's state is then reconstructable from the nearest preceding keyframe by replaying writes
forward. The TypeScript side of that reconstruction lands first, with a property test against a
naively-recorded reference, because if reconstruction is off by one then every downstream stage
is silently wrong and nobody notices until the video looks strange in Phase 5.
"""

from __future__ import annotations

from typing import Any

CHUNK_SIZE = 64
KEYFRAME_EVERY_STEPS = 2_000
KEYFRAME_EVERY_BYTES = 4 * 1024 * 1024


def chunk_hash(chunk: list[Any]) -> int:
    """Hashes one chunk, preferring xxhash when it is installed."""
    raise NotImplementedError("not implemented: chunk_hash (Phase 1)")


class ChunkedSnapshot:
    """A watched container held as hashed 64-element chunks."""

    def __init__(self, values: list[Any]) -> None:
        self.values = values

    def apply_write(self, index: int, value: Any) -> None:
        raise NotImplementedError("not implemented: ChunkedSnapshot.apply_write (Phase 1)")
