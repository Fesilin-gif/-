const fs = require('fs');

const path = 'src/data/catalogData.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace image paths in CATEGORIES
content = content.replace(/(name:\s*'Процессоры',\s*slug:\s*'cpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/cpu.jpg'");
content = content.replace(/(name:\s*'Видеокарты',\s*slug:\s*'gpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/gpu.jpg'");
content = content.replace(/(name:\s*'Материнские платы',\s*slug:\s*'motherboard',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/motherboard.jpg'");
content = content.replace(/(name:\s*'Оперативная память',\s*slug:\s*'ram',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/ram.jpg'");
content = content.replace(/(name:\s*'SSD и HDD',\s*slug:\s*'storage',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/storage.jpg'");
content = content.replace(/(name:\s*'Блоки питания',\s*slug:\s*'psu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/psu.jpg'");

// Replace image paths in PRODUCTS based on category
content = content.replace(/(categoryId:\s*'cpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/cpu.jpg'");
content = content.replace(/(categoryId:\s*'gpu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/gpu.jpg'");
content = content.replace(/(categoryId:\s*'motherboard',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/motherboard.jpg'");
content = content.replace(/(categoryId:\s*'ram',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/ram.jpg'");
content = content.replace(/(categoryId:\s*'storage',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/storage.jpg'");
content = content.replace(/(categoryId:\s*'psu',[\s\S]*?)image:\s*'[^']+'/g, "$1image: '/images/psu.jpg'");

fs.writeFileSync(path, content, 'utf8');
