#!/bin/bash
# ============================================================
# AllianceHub Build Validation Script
# Validates production build output for common issues
# ============================================================

set -e

echo "🔍 Validating AllianceHub build..."
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Build output not found. Run 'npm run build' first."
  exit 1
fi

# Count build files
FILE_COUNT=$(find dist -type f | wc -l)
echo "📦 Build files: $FILE_COUNT"

if [ "$FILE_COUNT" -lt 5 ]; then
  echo "❌ Too few build files. Build may have failed."
  exit 1
fi

# Total size
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "📏 Total size: $TOTAL_SIZE"

# Check for source maps in production
SOURCEMAPS=$(find dist -name "*.map" | wc -l)
if [ "$SOURCEMAPS" -gt 0 ]; then
  echo "⚠️  Warning: $SOURCEMAPS source map(s) found in production build"
  echo "   Consider disabling source maps for production"
fi

# Check for console.log statements
JS_FILES=$(find dist/assets -name "*.js" 2>/dev/null)
if [ -n "$JS_FILES" ]; then
  CONSOLE_LOGS=$(grep -r "console\.log" dist/assets/*.js 2>/dev/null | wc -l)
  CONSOLE_WARNS=$(grep -r "console\.warn" dist/assets/*.js 2>/dev/null | wc -l)
  CONSOLE_ERRORS=$(grep -r "console\.error" dist/assets/*.js 2>/dev/null | wc -l)
  echo "📝 Console statements: log=$CONSOLE_LOGS, warn=$CONSOLE_WARNS, error=$CONSOLE_ERRORS"
fi

# Check for index.html
if [ ! -f "dist/index.html" ]; then
  echo "❌ dist/index.html not found"
  exit 1
fi
echo "✅ index.html present"

# Check for assets directory
if [ ! -d "dist/assets" ]; then
  echo "❌ dist/assets not found"
  exit 1
fi

# Check for CSS files
CSS_COUNT=$(find dist -name "*.css" | wc -l)
echo "🎨 CSS files: $CSS_COUNT"

# Check for JS files
JS_FILE_COUNT=$(find dist -name "*.js" | wc -l)
echo "📜 JS files: $JS_FILE_COUNT"

# Check for image files
IMG_COUNT=$(find dist -name "*.png" -o -name "*.jpg" -o -name "*.svg" -o -name "*.webp" | wc -l)
echo "🖼️  Image files: $IMG_COUNT"

# Check for large files (>500KB)
LARGE_FILES=$(find dist -type f -size +500k | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
  echo "⚠️  Warning: $LARGE_FILES file(s) larger than 500KB"
  find dist -type f -size +500k -exec ls -lh {} \; 2>/dev/null | awk '{print "   " $5 " " $9}'
fi

# Check index.html for proper asset references
if grep -q 'src="/assets/' dist/index.html 2>/dev/null; then
  echo "✅ Asset references found in index.html"
else
  echo "⚠️  No asset references found in index.html"
fi

echo ""
echo "✅ Build validation complete"
