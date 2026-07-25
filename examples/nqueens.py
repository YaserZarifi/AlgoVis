"""N-queens by backtracking — the recursion tree example.

Every call and return is a depth change, so the call tree is the thing worth drawing. The whole
final tree is laid out up front with Reingold-Tilford, so nodes do not jump sideways as their
siblings appear (section 11).
"""

N = 6


def solve(n: int) -> list[list[int]]:
    # @view queens as tree
    solutions: list[list[int]] = []
    queens: list[int] = []
    place(n, queens, solutions)
    return solutions


def place(n: int, queens: list[int], solutions: list[list[int]]) -> None:
    row = len(queens)
    if row == n:
        solutions.append(list(queens))
        return

    for column in range(n):
        if is_safe(queens, row, column):
            queens.append(column)
            place(n, queens, solutions)
            queens.pop()


def is_safe(queens: list[int], row: int, column: int) -> bool:
    for previous_row, previous_column in enumerate(queens):
        if previous_column == column:
            return False
        if abs(previous_column - column) == abs(previous_row - row):
            return False
    return True


def main() -> list[list[int]]:
    return solve(N)


if __name__ == "__main__":
    main()
