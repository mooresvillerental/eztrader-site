import json
from pathlib import Path
from datetime import datetime

SIGNAL = Path("/data/data/com.termux/files/home/v71_clean/signal.json")
HISTORY = Path("/data/data/com.termux/files/home/eztrader-site/price_history.json")

MAX_POINTS = 100

def load_json(p):
    if not p.exists():
        return []
    try:
        return json.loads(p.read_text())
    except:
        return []

def save_json(p, data):
    p.write_text(json.dumps(data, indent=2))

def main():
    if not SIGNAL.exists():
        return

    s = json.loads(SIGNAL.read_text())
    price = float(s.get("price") or 0)
    if not price:
        return

    history = load_json(HISTORY)

    entry = {
        "t": datetime.now().astimezone().isoformat(timespec="seconds"),
        "p": price
    }

    history.append(entry)

    if len(history) > MAX_POINTS:
        history = history[-MAX_POINTS:]

    save_json(HISTORY, history)
    print("history updated:", len(history))

if __name__ == "__main__":
    main()
