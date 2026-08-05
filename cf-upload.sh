#!/bin/bash
# Cloudflare Pages Direct Upload via API

ACCOUNT_ID="f891a7b56743e4fb41751c507e3c1c3d"
API_TOKEN="$1"

if [ -z "$API_TOKEN" ]; then
  echo "Usage: ./cf-upload.sh <CLOUDFLARE_API_TOKEN>"
  exit 1
fi

echo "Creating Pages project..."
CREATE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"tk-shop-platform","production_branch":"main"}')
echo "$CREATE"

echo ""
echo "Uploading files..."
# Upload each file in dist
for file in dist/**/* dist/*; do
  if [ -f "$file" ]; then
    REL_PATH="${file#dist/}"
    echo "  Uploading: $REL_PATH"
    curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/tk-shop-platform/deployments" \
      -H "Authorization: Bearer ${API_TOKEN}" \
      -F "files=@${file};filename=${REL_PATH}" 2>&1 | head -1
  fi
done

echo ""
echo "Done!"
