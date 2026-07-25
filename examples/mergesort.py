"""Bottom-up mergesort.

Interesting to watch because the merge phase moves long runs at once, which is where staggered
group animation and FLIP reordering earn their keep (section 7.1).
"""

from random import Random

SEED = 20260725
SIZE = 128


def mergesort(arr: list[int]) -> list[int]:
    # @watch arr
    # @watch aux
    aux = list(arr)
    width = 1
    while width < len(arr):
        for lo in range(0, len(arr), 2 * width):
            mid = min(lo + width, len(arr))
            hi = min(lo + 2 * width, len(arr))
            merge(arr, aux, lo, mid, hi)
        width *= 2
    return arr


def merge(arr: list[int], aux: list[int], lo: int, mid: int, hi: int) -> None:
    for k in range(lo, hi):
        aux[k] = arr[k]

    left, right = lo, mid
    for k in range(lo, hi):
        if left >= mid:
            arr[k] = aux[right]
            right += 1
        elif right >= hi:
            arr[k] = aux[left]
            left += 1
        elif aux[right] < aux[left]:
            arr[k] = aux[right]
            right += 1
        else:
            arr[k] = aux[left]
            left += 1


def main() -> list[int]:
    data = list(range(1, SIZE + 1))
    Random(SEED).shuffle(data)
    return mergesort(data)


if __name__ == "__main__":
    main()
