"""Levenshtein edit distance — the DP grid example.

`dp` is a nested list with uniform inner length, so view inference picks `grid` on its own
(section 11.1). Each cell's provenance edges point at the three cells it was computed from,
which is what the dependency arrows draw.
"""

SOURCE = "kitten"
TARGET = "sitting"


def edit_distance(a: str, b: str) -> int:
    # @view dp as grid
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j

    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            )

    return dp[len(a)][len(b)]


def main() -> int:
    return edit_distance(SOURCE, TARGET)


if __name__ == "__main__":
    main()
