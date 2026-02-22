"""
Graph Visualizer
Generates a Mermaid diagram of the full swarm graph topology.

Usage:
    python -m scripts.visualize
    # or:
    swarm-viz
"""

from __future__ import annotations


def main():
    """Generate and display the graph topology."""
    from graphs.main import get_graph_mermaid

    print("# Swarm Agent System — Graph Topology\n")
    print("```mermaid")
    print(get_graph_mermaid())
    print("```\n")
    print("Copy the above into any Mermaid-compatible renderer.")


if __name__ == "__main__":
    main()
