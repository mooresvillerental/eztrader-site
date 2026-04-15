#!/usr/bin/env python3
import json
from pathlib import Path


ROOT = Path("/data/data/com.termux/files/home")
SITE_DIR = ROOT / "eztrader-site"
SIGNALS_DIR = ROOT / "v71_clean" / "signals"

ENGINE_STATE = SITE_DIR / "engine_state.json"
CLOSED = SIGNALS_DIR / "shadow_trades_closed.jsonl"
OPEN = SIGNALS_DIR / "shadow_trades_open.jsonl"
OUT = SITE_DIR / "performance.json"


def load_json(path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def load_jsonl(path):
    rows = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    return rows


def to_float(value, default=0.0):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except Exception:
        return default


def to_int(value, default=0):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default


def pick_count(shadow_value, rows_len):
    shadow_int = to_int(shadow_value, 0)
    if shadow_int == 0 and rows_len > 0:
        return rows_len
    return shadow_int


def main():
    state = load_json(ENGINE_STATE, {}) or {}
    assistant = state.get("assistant_portfolio", {}) or {}
    latest_signal = state.get("latest_signal", {}) or {}
    shadow_stats = state.get("shadow_stats", {}) or {}

    closed_rows = load_jsonl(CLOSED)
    open_rows = load_jsonl(OPEN)

    start_equity = to_float(assistant.get("assistant_starting_value"), 500.0)
    final_equity = to_float(
        assistant.get("assistant_portfolio_value"),
        start_equity,
    )
    live_price = to_float(
        assistant.get("live_price", latest_signal.get("price")),
        0.0,
    )

    wins = 0
    losses = 0
    history = []
    equity = start_equity

    for r in closed_rows:
        pnl_pct = to_float(r.get("pnl_pct"), 0.0)
        outcome = str(r.get("outcome", "")).upper()
        ts = r.get("exit_timestamp") or r.get("opened_timestamp")

        equity *= (1 + pnl_pct / 100.0)

        if outcome == "WIN":
            wins += 1
        else:
            losses += 1

        history.append({
            "t": ts,
            "equity": round(equity, 2),
        })

    closed_trades = pick_count(shadow_stats.get("closed_trades"), len(closed_rows))
    open_trades = pick_count(shadow_stats.get("open_positions_count"), len(open_rows))
    wins_final = pick_count(shadow_stats.get("wins"), wins)
    losses_final = pick_count(shadow_stats.get("losses"), losses)

    if len(closed_rows) > 0:
        closed_pnl_pct = ((equity / start_equity) - 1) * 100.0 if start_equity else 0.0
    else:
        closed_pnl_pct = 0.0

    combined_pnl_pct = ((final_equity / start_equity) - 1) * 100.0 if start_equity else 0.0
    open_pnl_pct = combined_pnl_pct - closed_pnl_pct

    if closed_trades > 0:
        derived_win_rate = (wins_final / closed_trades) * 100.0
    else:
        derived_win_rate = 0.0

    result = {
        "start_equity": round(start_equity, 2),
        "closed_trades": closed_trades,
        "open_trades": open_trades,
        "wins": wins_final,
        "losses": losses_final,
        "win_rate": round(
            (
                derived_win_rate
                if to_float(shadow_stats.get("win_rate"), 0.0) == 0.0 and closed_trades > 0
                else to_float(shadow_stats.get("win_rate"), derived_win_rate)
            ),
            2,
        ),
        "closed_pnl_pct": round(closed_pnl_pct, 4),
        "open_pnl_pct": round(open_pnl_pct, 4),
        "combined_pnl_pct": round(combined_pnl_pct, 4),
        "final_equity": round(final_equity, 2),
        "live_price": round(live_price, 8),
        "history": history,
        "source": "engine_state",
    }

    OUT.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print("wrote", OUT)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
