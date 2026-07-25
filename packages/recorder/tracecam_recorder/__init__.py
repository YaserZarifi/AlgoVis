"""Records Python execution as a tracecam trace.

The recorder is deliberately dumb: it emits primitive facts — lines, calls, returns, and reads
and writes to watched containers — and nothing else. Recognizing that two writes were a swap is
packages/lift's job, not this one's (CLAUDE.md section 5.2).
"""

__version__ = "0.0.0"

TRACE_SCHEMA_VERSION = 1

__all__ = ["TRACE_SCHEMA_VERSION", "__version__"]
