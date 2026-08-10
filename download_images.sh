#!/bin/bash
counter=1
grep -ho 'https://images.unsplash.com/[^"'"'"']*' src/data/catalogData.ts src/components/HeroSection.tsx | sort | uniq | while read url; do
  ext="jpg"
  filename="img_${counter}.${ext}"
  echo "Downloading $url to public/images/$filename"
  curl -s -L "$url" -o "public/images/$filename"
  
  # Replace in both files
  # Use | as delimiter in sed
  sed -i "s|$url|/images/$filename|g" src/data/catalogData.ts
  sed -i "s|$url|/images/$filename|g" src/components/HeroSection.tsx
  
  counter=$((counter+1))
done
