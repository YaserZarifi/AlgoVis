"""sys.monitoring hooks (PEP 669).

Phase 1.

Two things matter here more than anything else:

1. Restrict LINE events to code objects originating from the user's file, via
   ``mon.set_local_events``. Tracing the standard library is useless and is the difference
   between a 2x and a 200x slowdown (section 5.1, and pitfall 4 in section 20).

2. Return ``mon.DISABLE`` from a callback to permanently retire that event for that code
   location once it has been determined uninteresting.

``sys.settrace`` is the fallback for 3.11 and below, behind a capability check and with a
warning about the performance difference.
"""

from __future__ import annotations

from pathlib import Path

TOOL_ID = 2
TOOL_NAME = "tracecam"


class Recorder:
    """Owns the monitoring registration for a single run."""

    def __init__(self, source: Path, entry: str, watched: list[str]) -> None:
        self.source = source
        self.entry = entry
        self.watched = watched

    def __enter__(self) -> Recorder:
        raise NotImplementedError("not implemented: Recorder.__enter__ (Phase 1)")

    def __exit__(self, *_exc: object) -> None:
        raise NotImplementedError("not implemented: Recorder.__exit__ (Phase 1)")


def supports_sys_monitoring() -> bool:
    """True on 3.12+, where PEP 669 is available."""
    import sys

    return hasattr(sys, "monitoring")
