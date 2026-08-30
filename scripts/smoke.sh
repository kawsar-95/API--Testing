#!/usr/bin/env bash
# End-to-end smoke test against a running server on http://localhost:3000.
# Idempotent — uses a unique email per run, so repeated runs are safe.
#
# Usage: bash scripts/smoke.sh
set -u
BASE=${BASE:-http://localhost:3000}
PASS=0; FAIL=0

check() {
  local label="$1"; local expect="$2"; local actual="$3"
  if [ "$actual" = "$expect" ]; then
    echo "  PASS [$expect] $label"
    PASS=$((PASS+1))
  else
    echo "  FAIL expected $expect got $actual : $label"
    FAIL=$((FAIL+1))
  fi
}
j() { python3 -c "import sys,json;print(json.load(sys.stdin)$1)"; }

# Unique email per run so this script can be replayed.
STAMP=$(date +%s%N)
USER_EMAIL="john_${STAMP}@example.com"

echo "=== Admin login ==="
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}')
CODE=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
check "POST /api/auth/login (admin)" "200" "$CODE"
ADMIN_TOKEN=$(echo "$BODY" | j "['token']")

echo "=== Register fresh user ($USER_EMAIL) ==="
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/auth/register -H "Content-Type: application/json" -d "{\"firstname\":\"John\",\"lastname\":\"Doe\",\"email\":\"$USER_EMAIL\",\"password\":\"password123\"}")
check "POST /api/auth/register" "201" "$(echo "$RESP" | tail -1)"

echo "=== User login ==="
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$USER_EMAIL\",\"password\":\"password123\"}")
CODE=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
check "POST /api/auth/login (user)" "200" "$CODE"
USER_TOKEN=$(echo "$BODY" | j "['token']")

echo "=== Guest lists blogs (public) ==="
check "GET /api/blogs" "200" "$(curl -s -o /dev/null -w "%{http_code}" $BASE/api/blogs)"

echo "=== User creates blog ==="
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/api/blogs/create -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d '{"blogTitle":"Intro to API Testing","blog":"body content","category":"Testing"}')
CODE=$(echo "$RESP" | tail -1); BODY=$(echo "$RESP" | head -n -1)
check "POST /api/blogs/create" "201" "$CODE"
BLOG_ID=$(echo "$BODY" | j "['blog']['id']")

echo "=== User updates own blog ==="
RESP=$(curl -s -w "\n%{http_code}" -X PUT $BASE/api/blogs/update/$BLOG_ID -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d '{"category":"Automation"}')
check "PUT /api/blogs/update/:id" "200" "$(echo "$RESP" | tail -1)"

echo "=== User deletes own blog ==="
check "DELETE /api/blogs/delete/:id" "200" "$(curl -s -o /dev/null -w "%{http_code}" -X DELETE -H "Authorization: Bearer $USER_TOKEN" $BASE/api/blogs/delete/$BLOG_ID)"

echo "=== Admin lists users ==="
check "GET /api/users (admin)" "200" "$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/api/users)"

echo "=== Public search by partial title ==="
check "GET /api/blogs?title=playwright" "200" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/blogs?title=playwright")"

echo "=== Public filter by category ==="
check "GET /api/blogs?category=Testing" "200" "$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/blogs?category=Testing")"

echo "==================================="
echo "  PASS: $PASS    FAIL: $FAIL"
echo "==================================="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
