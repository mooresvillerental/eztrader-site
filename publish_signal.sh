#!/data/data/com.termux/files/usr/bin/bash
set -e

SRC="$HOME/v71_clean/signal.json"
DST="$HOME/eztrader-site/signal.json"
HIST="$HOME/eztrader-site/price_history.json"

cd "$HOME/eztrader-site"

cp "$SRC" "$DST"
python "$HOME/eztrader-site/sync_trades.py"
python "$HOME/eztrader-site/build_performance.py"

changed=0

if ! git diff --quiet -- signal.json; then
  changed=1
fi

if [ -f "$HIST" ] && ! git diff --quiet -- price_history.json; then
  changed=1
fi

if ! git diff --quiet -- trades.json; then
  changed=1
fi

if ! git diff --quiet -- performance.json; then
  changed=1
fi

if [ "$changed" -eq 0 ]; then
  echo "No public data changes to publish."
  exit 0
fi

git add signal.json
[ -f "$HIST" ] && git add price_history.json || true
git add trades.json
git add performance.json
git commit -m "Auto-update public signal data"
git push
