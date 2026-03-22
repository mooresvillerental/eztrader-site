import json
from pathlib import Path

CLOSED = Path("/data/data/com.termux/files/home/v71_clean/signals/shadow_trades_closed.jsonl")
OPEN = Path("/data/data/com.termux/files/home/v71_clean/signals/shadow_trades_open.jsonl")
SIGNAL = Path("/data/data/com.termux/files/home/eztrader-site/signal.json")
OUT = Path("/data/data/com.termux/files/home/eztrader-site/performance.json")

START_EQUITY = 1000.0

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

def load_json(path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default

closed_rows = load_jsonl(CLOSED)
open_rows = load_jsonl(OPEN)
sig = load_json(SIGNAL, {}) or {}
current_price = float(sig.get("price", 0) or 0)

wins = 0
losses = 0
closed_pnl_pct = 0.0
history = []
equity = START_EQUITY

for r in closed_rows:
    pnl_pct = float(r.get("pnl_pct", 0) or 0)
    outcome = str(r.get("outcome", "")).upper()
    ts = r.get("exit_timestamp") or r.get("opened_timestamp")

    closed_pnl_pct += pnl_pct
    equity *= (1 + pnl_pct / 100.0)

    if outcome == "WIN":
        wins += 1
    else:
        losses += 1

    history.append({
        "t": ts,
        "equity": round(equity, 2)
    })

open_pnl_pct = 0.0
for r in open_rows:
    entry = float(r.get("entry_price", 0) or 0)
    action = str(r.get("action", "BUY")).upper()
    if entry <= 0 or current_price <= 0:
        continue

    if action == "BUY":
        pnl_pct = ((current_price - entry) / entry) * 100.0
    elif action == "SELL":
        pnl_pct = ((entry - current_price) / entry) * 100.0
    else:
        pnl_pct = 0.0

    open_pnl_pct += pnl_pct

combined_equity = equity * (1 + open_pnl_pct / 100.0)

result = {
    "start_equity": START_EQUITY,
    "closed_trades": len(closed_rows),
    "open_trades": len(open_rows),
    "wins": wins,
    "losses": losses,
    "win_rate": round((wins / len(closed_rows) * 100.0), 2) if closed_rows else 0.0,
    "closed_pnl_pct": round(closed_pnl_pct, 4),
    "open_pnl_pct": round(open_pnl_pct, 4),
    "combined_pnl_pct": round((((combined_equity / START_EQUITY) - 1) * 100.0), 4),
    "final_equity": round(combined_equity, 2),
    "history": history
}

OUT.write_text(json.dumps(result, indent=2), encoding="utf-8")
print("wrote", OUT)
print(json.dumps(result, indent=2))
