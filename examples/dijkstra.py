"""Dijkstra's shortest paths — the graph example.

`graph` is a dict of dicts of numbers, so view inference picks `graph` (section 11.1). Node
positions come from a force-directed layout run to convergence once, in the director, so they
are deterministic and never move; only the frontier, the visited set, and the distance labels
animate.
"""

import heapq

GRAPH: dict[str, dict[str, int]] = {
    "A": {"B": 4, "C": 2},
    "B": {"C": 5, "D": 10},
    "C": {"E": 3},
    "D": {"F": 11},
    "E": {"D": 4, "F": 8},
    "F": {},
}


def dijkstra(graph: dict[str, dict[str, int]], start: str) -> dict[str, float]:
    # @watch dist
    # @watch visited
    dist: dict[str, float] = {node: float("inf") for node in graph}
    dist[start] = 0
    visited: list[str] = []
    queue: list[tuple[float, str]] = [(0, start)]

    while queue:
        current_dist, node = heapq.heappop(queue)
        if node in visited:
            continue
        visited.append(node)

        for neighbour, weight in graph[node].items():
            candidate = current_dist + weight
            if candidate < dist[neighbour]:
                dist[neighbour] = candidate
                heapq.heappush(queue, (candidate, neighbour))

    return dist


def main() -> dict[str, float]:
    return dijkstra(GRAPH, "A")


if __name__ == "__main__":
    main()
