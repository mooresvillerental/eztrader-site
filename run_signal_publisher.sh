#!/data/data/com.termux/files/usr/bin/bash
set -e

while true; do
  python "$HOME/v71_clean/sync_signal.py"
  python "$HOME/eztrader-site/build_price_history.py"
  "$HOME/eztrader-site/publish_signal.sh"
  sleep 60
done
