"""Quicksort with Lomuto partitioning.

The canonical example. `tracecam run examples/quicksort.py`, with no other arguments, must
produce four watchable MP4s — if it does not, the project has failed regardless of what else
works (CLAUDE.md section 16).

The seed is fixed so the recorded trace is reproducible run to run.
"""

from random import Random

SEED = 20260725
SIZE = 200


def quicksort(arr: list[int], lo: int = 0, hi: int | None = None) -> list[int]:
    # @watch arr
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr

    pivot = arr[hi]
    boundary = lo
    for j in range(lo, hi):
        if arr[j] <= pivot:
            arr[boundary], arr[j] = arr[j], arr[boundary]
            boundary += 1
    arr[boundary], arr[hi] = arr[hi], arr[boundary]

    quicksort(arr, lo, boundary - 1)
    quicksort(arr, boundary + 1, hi)
    return arr


def main() -> list[int]:
    data = list(range(1, SIZE + 1))
    Random(SEED).shuffle(data)
    return quicksort(data)


if __name__ == "__main__":
    main()
