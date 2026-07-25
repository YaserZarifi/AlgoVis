"""Streaming JSON writer.

Phase 1.

The whole trace is never buffered in memory. Events stream to disk as newline-delimited JSON and
are post-processed into the final trace.json afterwards (section 5.4). orjson is preferred for
throughput.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any


class StreamingWriter:
    """Appends newline-delimited JSON events, then finalizes into a trace.json."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def write_event(self, event: dict[str, Any]) -> None:
        raise NotImplementedError("not implemented: StreamingWriter.write_event (Phase 1)")

    def finalize(self, meta: dict[str, Any]) -> None:
        """Writes the schema-valid trace.json. Must produce a valid file even after truncation."""
        raise NotImplementedError("not implemented: StreamingWriter.finalize (Phase 1)")
