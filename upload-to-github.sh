#!/bin/bash

# Navigate to the project directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/MedLYNX"

# Check git status
echo "=== Git Status ==="
git status

# Add all changes
echo -e "\n=== Adding all changes ==="
git add -A

# Commit with message
echo -e "\n=== Committing changes ==="
git commit -m "Enhanced MedLYNX app with clickable Health Tips, LynxPulse health articles page, and uniform health card sizing

- Made Health Tips articles clickable with proper navigation
- Created comprehensive LynxPulse health articles page with category filtering
- Fixed Today's Health cards to uniform 120px height for consistent UI
- Added 10+ comprehensive health articles with professional styling
- Enhanced user experience with proper routing and article accessibility"

# Push to GitHub
echo -e "\n=== Pushing to GitHub ==="
git push origin main

echo -e "\n=== Upload Complete ==="
