const fs = require('fs');
const path = 'src/data/catalogData.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace product images with placeholders based on category
content = content.replace(/(categoryId:\s*'cpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=CPU'");
content = content.replace(/(categoryId:\s*'gpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=GPU'");
content = content.replace(/(categoryId:\s*'motherboard',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=Motherboard'");
content = content.replace(/(categoryId:\s*'ram',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=RAM'");
content = content.replace(/(categoryId:\s*'storage',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=Storage'");
content = content.replace(/(categoryId:\s*'psu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: 'https://placehold.co/300x200/eee/999?text=PSU'");

fs.writeFileSync(path, content, 'utf8');
