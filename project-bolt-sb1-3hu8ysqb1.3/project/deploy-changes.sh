#!/bin/bash

echo "Copying changed files to your project..."

DEST="/mnt/c/Users/sbthm/OneDrive/Documents/Purely Plutonic/project"

echo "Copying auth fixes..."
mkdir -p "$DEST/src/lib"
mkdir -p "$DEST/src/components"

echo "  - supabase.ts (removed email redirect)"
cp -f "src/lib/supabase.ts" "$DEST/src/lib/supabase.ts"

echo "  - SignUpFlow.tsx (auto-login after signup)"
cp -f "src/components/SignUpFlow.tsx" "$DEST/src/components/SignUpFlow.tsx"

echo "  - App.tsx (refresh auth state after signup)"
cp -f "src/App.tsx" "$DEST/src/App.tsx"

echo ""
echo "Done! Files copied to your project."
echo ""
echo "Now running git commands..."
cd "$DEST"
git add .
git commit -m "Fix email verification - auto-login after signup"
git push

echo ""
echo "Vercel will automatically deploy your changes!"
