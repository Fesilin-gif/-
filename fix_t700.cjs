const fs = require('fs');
const path = 'src/data/catalogData.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/(id:\s*'p12',[\s\S]*?image:\s*')[^']+(\')/, "$1/images/crucial_t700.png$2");
fs.writeFileSync(path, content, 'utf8');
