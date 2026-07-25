"""Truncation policy. A ``while True:`` must not OOM.

Phase 1. Section 5.4.

- Hard cap at 10,000,000 events. On reaching it, stop recording, set ``meta.truncated``, and
  exit cleanly with a written, valid trace file — a truncated trace is still a usable trace.
- Loop collapse: if the same (line, call-depth) pair recurs more than 50,000 times with no
  writes to watched variables, switch to keeping 1 event in 100 and record a ``meta.collapsed``
  entry describing the range.
"""

from __future__ import annotations

MAX_EVENTS = 10_000_000
LOOP_COLLAPSE_THRESHOLD = 50_000
LOOP_COLLAPSE_KEEP_ONE_IN = 100


class Budget:
    """Tracks event count and repetition, and decides what to drop."""

    def __init__(self, max_events: int = MAX_EVENTS) -> None:
        self.max_events = max_events
        self.count = 0
        self.truncated = False

    def should_record(self, line: int, depth: int) -> bool:
        raise NotImplementedError("not implemented: Budget.should_record (Phase 1)")
