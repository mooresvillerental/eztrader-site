import json
from pathlib import Path

SRC = Path("/data/data/com.termux/files/home/v71_clean/signals/ohlc")
OUT = Path("/data/data/com.termux/files/home/eztrader-site/live_ohlc.json")

def main():
    out = {}
    if not SRC.exists():
        OUT.write_text("{}\n", encoding="utf-8")
        print(f"source missing, wrote empty {OUT}")
        return

    for fp in sorted(SRC.glob("*.json")):
        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
            sym = str(data.get("symbol") or fp.stem).upper()
            highs = [float(x) for x in data.get("highs", [])]
            lows = [float(x) for x in data.get("lows", [])]
            closes = [float(x) for x in data.get("closes", [])]
            volumes = [float(x) for x in data.get("volumes", [])]
            ts = int(data.get("timestamp") or 0)

            n = min(len(highs), len(lows), len(closes), len(volumes))
            if n <= 0 or ts <= 0:
                out[sym] = []
                continue

            step = 300
            start = ts - ((n - 1) * step)
            candles = []
            for i in range(n):
                close = closes[i]
                prev_close = closes[i - 1] if i > 0 else close
                candles.append({
                    "time": start + i * step,
                    "open": float(prev_close),
                    "high": float(highs[i]),
                    "low": float(lows[i]),
                    "close": float(close),
                })
            out[sym] = candles[-300:]
        except Exception:
            out[fp.stem.upper()] = []

    OUT.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT}")
    print("symbols:", ", ".join(sorted(out.keys())))

if __name__ == "__main__":
    main()
