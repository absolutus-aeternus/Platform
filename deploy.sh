#!/bin/bash
# Auto Deploy Script - GitHub + Supabase + Cloudflare

set -e

echo "🚀 Starting deployment..."

# 1. Build
echo "📦 Building..."
npm run build

# 2. Copy deploy files to dist
cp dist/_headers dist/_headers 2>/dev/null || true
cp dist/_redirects dist/_redirects 2>/dev/null || true

# 3. Git commit and push
echo "📤 Pushing to GitHub..."
git add -A
if [ -n "$(git status --porcelain)" ]; then
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  git commit -m "Auto-deploy: $TIMESTAMP"
  git push
  echo "✅ GitHub: Pushed"
else
  echo "⏭️ GitHub: No changes"
fi

# 4. Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
if command -v npx &> /dev/null; then
  npx wrangler pages deploy dist --project-name=tk-shop-platform --commit-dirty=true 2>&1 || echo "⚠️ Cloudflare: Deploy failed (check API token)"
else
  echo "⚠️ Wrangler not found, skipping Cloudflare deploy"
fi

echo ""
echo "✅ Deployment complete!"
echo "   GitHub: https://github.com/absolutus-aeternus/Platform"
echo "   Cloudflare: https://tk-shop-platform.pages.dev"
