#!/bin/bash
# Direct Cloudflare Pages deployment via API

ACCOUNT_ID="f891a7b56743e4fb41751c507e3c1c3d"
API_TOKEN="cfat_PFFY7eMgmCOgJPOdmf1QGsBioocHtWjKnloE267Raaafd6d1"
PROJECT_NAME="tk-shop-platform"

echo "Step 1: Creating deployment..."
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: multipart/form-data" \
  -F "branch=main")

echo "Response: $DEPLOY_RESPONSE"

# Check if deployment was created
if echo "$DEPLOY_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Deployment created!"
  
  # Get deployment URL
  DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*"' | head -1)
  echo "URL: $DEPLOY_URL"
else
  echo "❌ Failed to create deployment"
  
  # Try alternative: direct file upload
  echo ""
  echo "Trying direct file upload..."
  
  for file in dist/*; do
    if [ -f "$file" ]; then
      FILENAME=$(basename "$file")
      echo "Uploading: $FILENAME"
      curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments" \
        -H "Authorization: Bearer ${API_TOKEN}" \
        -F "files=@${file};filename=${FILENAME}" 2>&1 | head -1
    fi
  done
fi
