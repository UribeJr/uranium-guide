#!/bin/sh
# full re-pagination: rebuild book.js, paginate the guide, then append the measured Pokédex
set -e; B=${1:-http://localhost:5188}; cd "$(dirname "$0")/.."
python3 tools/fandom/build.py >/dev/null   # fresh unpaginated book.js from the cached wiki pages
python3 tools/paginate.py "$B" | tail -2; python3 tools/dexpaginate.py "$B" | tail -1
