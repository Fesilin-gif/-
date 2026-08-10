const fs = require('fs');

const path = 'src/components/HeroSection.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/image:\s*'\/images\/img_10\.jpg'/, "image: '/images/gpu.jpg'");
content = content.replace(/image:\s*'\/images\/img_13\.jpg'/, "image: '/images/cpu.jpg'");
content = content.replace(/image:\s*'\/images\/img_6\.jpg'/, "image: '/images/ram.jpg'");
content = content.replace(/image:\s*'\/images\/img_15\.jpg'/, "image: '/images/storage.jpg'");

fs.writeFileSync(path, content, 'utf8');
