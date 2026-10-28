#!/usr/bin/env bash
# api-checks.sh — the milestone-3 curl checks, run in Git Bash against the
# local dev server. Usage: bash scripts/api-checks.sh <step>
#
# -s            = "silent": hide curl's connection-speed noise, show only the response
# -w "..."      = after the response, print the HTTP status code (e.g. 200, 400)
set -euo pipefail

STATUS='\nHTTP status: %{http_code}\n'
BASE=http://localhost:3000

case "${1:-}" in
  get-restaurant)
    curl -s -w "$STATUS" "$BASE/api/restaurants/1" ;;
  get-missing)
    curl -s -w "$STATUS" "$BASE/api/restaurants/999" ;;
  post-good)
    curl -s -w "$STATUS" -X POST "$BASE/api/reviews" -H "Content-Type: application/json" -d '{"restaurantId":1,"rating":5,"comment":"Great"}' ;;
  post-rating-too-big)
    curl -s -w "$STATUS" -X POST "$BASE/api/reviews" -H "Content-Type: application/json" -d '{"restaurantId":1,"rating":500,"comment":"Great"}' ;;
  post-blank-comment)
    curl -s -w "$STATUS" -X POST "$BASE/api/reviews" -H "Content-Type: application/json" -d '{"restaurantId":1,"rating":4,"comment":" "}' ;;
  post-bad-restaurant)
    curl -s -w "$STATUS" -X POST "$BASE/api/reviews" -H "Content-Type: application/json" -d '{"restaurantId":999,"rating":4,"comment":"Great"}' ;;
  *)
    echo "Unknown step. Use: get-restaurant, get-missing, post-good, post-rating-too-big, post-blank-comment, post-bad-restaurant"
    exit 1
    ;;
esac
