import json
import urllib.request
from pathlib import Path

OUT = Path("/data/data/com.termux/files/home/eztrader-site/ohlc.json")

SYMBOL_MAP = {
    "BTC-USD": "XXBTZUSD",
}

def fetch_kraken_ohlc(pair: str, interval: int = 5):
    url = f"https://api.kraken.com/0/public/OHLC?pair={pair}&interval={interval}"
    with urllib.request.urlopen(url, timeout=12) as r:
        data = json.loads(r.read().decode("utf-8"))
    if data.get("error"):
        raise RuntimeError("Kraken error: " + "; ".join(map(str, data["error"])))
    result = data.get("result") or {}
    rows = None
    for k, v in result.items():
        if k == "last":
            continue
        if isinstance(v, list):
            rows = v
            break
    if rows is None:
        return []
    candles = []
    for row in rows[-200:]:
        try:
            candles.append({
                "time": int(float(row[0])),
                "open": float(row[1]),
                "high": float(row[2]),
                "low": float(row[3]),
                "close": float(row[4]),
            })
        except Exception:
            pass
    return candles

def main():
    out = {}
    for sym, pair in SYMBOL_MAP.items():
        out[sym] = fetch_kraken_ohlc(pair, interval=5)
    OUT.write_text(json.dumps(out, indent=2))
    print(f"wrote {OUT}")

if __name__ == "__main__":
    main()
