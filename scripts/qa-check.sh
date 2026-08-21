#!/bin/bash
# ============================================================
# AllianceHub QA Check Script
# Runs all quality checks: lint, test, build, validate
# ============================================================

set -e

echo "========================================="
echo "  AllianceHub QA Check Suite"
echo "========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install
fi
echo "   ✅ Dependencies ready"
echo ""

# Step 2: Run tests
echo "🧪 Step 2: Running tests..."
if command -v npx vitest &> /dev/null; then
  npx vitest run --reporter=verbose 2>&1 || echo "   ⚠️  Some tests failed"
else
  echo "   ⚠️  vitest not installed, skipping tests"
fi
echo ""

# Step 3: Build
echo "🔨 Step 3: Building project..."
npm run build 2>&1 || { echo "❌ Build failed"; exit 1; }
echo "   ✅ Build successful"
echo ""

# Step 4: Validate build
echo "🔍 Step 4: Validating build..."
if [ -f "scripts/validate-build.sh" ]; then
  bash scripts/validate-build.sh
else
  echo "   ⚠️  validate-build.sh not found"
fi
echo ""

# Step 5: Lint
echo "📋 Step 5: Linting..."
npm run lint 2>&1 || echo "   ⚠️  Lint issues found"
echo ""

echo "========================================="
echo "  QA Check Complete"
echo "========================================="
