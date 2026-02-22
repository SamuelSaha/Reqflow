"""
Swarm Interactive CLI
Main entrypoint for interacting with the swarm agent system.

Usage:
    python -m scripts.run
    # or via pyproject.toml script:
    swarm

Then type your requests at the prompt. @swarm-lead handles everything.
"""

from __future__ import annotations

import sys
from datetime import datetime


def main():
    """Interactive CLI loop: user input → @swarm-lead → display output."""
    print("=" * 60)
    print("  🐝 SWARM Agent System (LangGraph)")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("  Type your request. @swarm-lead will handle it.")
    print("  Commands: /quit, /mode fast|deep, /graph, /memory")
    print("=" * 60)
    print()

    # Lazy import to avoid slow startup on import
    from graphs.main import get_graph, invoke, stream, get_graph_mermaid
    from core.mode_detector import ModeDetector

    detector = ModeDetector()
    force_mode = None
    thread_id = f"session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    while True:
        try:
            user_input = input("\n🐝 You > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye! 👋")
            break

        if not user_input:
            continue

        # Handle commands
        if user_input in ("/quit", "/exit", "/q"):
            print("Goodbye! 👋")
            break

        if user_input.startswith("/mode"):
            parts = user_input.split()
            if len(parts) > 1 and parts[1] in ("fast", "deep", "auto"):
                force_mode = None if parts[1] == "auto" else parts[1]
                print(f"  Mode set to: {force_mode or 'auto-detect'}")
            else:
                print("  Usage: /mode fast|deep|auto")
            continue

        if user_input == "/graph":
            try:
                mermaid = get_graph_mermaid()
                print("\n📊 Graph Topology (Mermaid):")
                print(mermaid[:2000])
            except Exception as e:
                print(f"  Error generating graph: {e}")
            continue

        if user_input == "/memory":
            try:
                from core.memory import SwarmMemoryAdapter
                memory = SwarmMemoryAdapter()
                print(f"\n📝 Memory Summary:\n{memory.get_summary()}")
            except Exception as e:
                print(f"  Memory unavailable: {e}")
            continue

        # Auto-detect mode
        if not force_mode:
            signal = detector.detect(user_input)
            mode_str = signal.mode.value
        else:
            mode_str = force_mode

        mode_icon = "⚡" if mode_str == "fast" else "🔍"
        print(f"\n{mode_icon} {mode_str.upper()} mode | Processing...")

        # Stream execution
        try:
            for event in stream(user_input, thread_id=thread_id):
                for node_name, state_update in event.items():
                    if node_name == "parse_intent":
                        scope = state_update.get("scope", "?")
                        print(f"  📋 Scope: {scope}")
                    elif node_name == "dispatch_agents":
                        agents = state_update.get("dispatched_agents", [])
                        print(f"  🎯 Dispatching: {', '.join(f'@{a}' for a in agents)}")
                    elif node_name in ("compile_results",):
                        print(f"  📦 Compiling results...")
                    elif node_name == "verify_gates":
                        results = state_update.get("verification_results", [])
                        if results:
                            from core.verification import format_gate_results
                            print(f"  🔒 Gates: {format_gate_results(results)}")
                    elif node_name == "deliver":
                        output = state_update.get("final_output", "")
                        print(f"\n{'='*60}")
                        print(output)
                        print(f"{'='*60}")
                    elif node_name == "handle_rejection":
                        retry = state_update.get("retry_count", 0)
                        print(f"  ⚠️ Retry {retry}/3...")

        except KeyboardInterrupt:
            print("\n  Cancelled.")
        except Exception as e:
            print(f"\n  ❌ Error: {e}")
            if "--debug" in sys.argv:
                import traceback
                traceback.print_exc()


if __name__ == "__main__":
    main()
