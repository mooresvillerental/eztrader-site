#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$HOME/eztrader-site"

cp "$HOME/v71_clean/signals/latest_signal.json" live_signal.json
curl -s http://127.0.0.1:8000/assistant-portfolio > live_portfolio.json
curl -s http://127.0.0.1:8000/assistant-trade-history > live_trades.json
curl -s http://127.0.0.1:8000/shadow-stats > live_shadow_stats.json
python3 build_live_ohlc.py

changed=0
for f in live_signal.json live_portfolio.json live_trades.json live_shadow_stats.json live_ohlc.json \
         api/latest-signal.js api/assistant-portfolio.js api/assistant-trade-history.js api/shadow-stats.js; do
  if ! git diff --quiet -- "$f"; then
    changed=1
  fi
done

if [ "$changed" -eq 0 ]; then
  echo "No live feed changes to publish."
  exit 0
fi

git add live_signal.json live_portfolio.json live_trades.json live_shadow_stats.json live_ohlc.json \
        api/latest-signal.js api/assistant-portfolio.js api/assistant-trade-history.js api/shadow-stats.js
git commit -m "Add live HTTPS feed for app and Telegram"
git push
