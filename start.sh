#!/bin/sh
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
(sleep 2; (xdg-open http://localhost:3000 || open http://localhost:3000) >/dev/null 2>&1) &
npm start
