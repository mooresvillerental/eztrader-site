import json
from pathlib import Path
from datetime import datetime

SRC = Path("/data/data/com.termux/files/home/v71_clean/signals/assistant_trade_history.json")
DST = Path("/data/data/com.termux/files/home/eztrader-site/trades.json")

if not SRC.exists():
    raise SystemExit("source trade history not found")

data = json.loads(SRC.read_text(encoding="utf-8"))
out = []

for t in data if isinstance(data, list) else []:
    ts = t.get("timestamp")
    pretty_time = ""
    try:
        pretty_time = datetime.fromtimestamp(int(ts)).strftime("%b %d %I:%M %p")
    except Exception:
        pretty_time = ""

    out.append({
        "symbol": t.get("symbol", "BTC-USD"),
        "action": t.get("action", ""),
        "price": t.get("price", 0),
        "size_usd": t.get("size_usd", 0),
        "filled_qty": t.get("filled_qty", 0),
        "timestamp": ts,
        "time": pretty_time
    })

DST.write_text(json.dumps(out, indent=2), encoding="utf-8")
print("wrote", DST)
print(json.dumps(out[-3:], indent=2))
