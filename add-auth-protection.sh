#!/bin/bash
# Script to add authentication protection to all HTML files

echo "Adding authentication protection to all course pages..."

# Find all HTML files in the pages directory (excluding auth pages)
HTML_FILES=$(find pages -name "*.html" | grep -v "pages/auth/")

# Counter for modified files
MODIFIED=0

for file in $HTML_FILES; do
  echo "Processing $file"
  
  # Check if the file already includes auth-protection.js
  if grep -q "auth-protection.js" "$file"; then
    echo "  Already protected, skipping."
    continue
  fi
  
  # Get the relative path to the root
  # Count directory levels and create the path
  DEPTH=$(echo "$file" | tr -cd '/' | wc -c)
  REL_PATH=""
  for ((i=0; i<DEPTH; i++)); do
    REL_PATH="${REL_PATH}../"
  done
  
  # Add auth.js reference in the head
  if ! grep -q "auth.js" "$file"; then
    sed -i "/<head>/a\\    <!-- Add auth.js -->\n    <script src=\"${REL_PATH}assets/js/auth.js\"></script>" "$file"
  fi
  
  # Add auth-protection.js at the end of body
  sed -i "/<\/body>/i\\    <!-- Add auth-protection.js -->\n    <script src=\"${REL_PATH}assets/js/auth-protection.js\"></script>" "$file"
  
  echo "  Added authentication protection."
  MODIFIED=$((MODIFIED+1))
done

echo "Done! Protected $MODIFIED HTML files."
