const fs = require('fs');

const catalogData = fs.readFileSync('src/data/catalogData.ts', 'utf8');
const regex = /image:\s*'([^']+)'/g;
let match;
const images = new Set();
while ((match = regex.exec(catalogData)) !== null) {
  images.add(match[1]);
}

const missing = [];
for (const img of images) {
  if (img.startsWith('/images/')) {
    const filePath = `public${img}`;
    if (!fs.existsSync(filePath)) {
      missing.push(img);
    }
  }
}

console.log("Missing files:", missing);
