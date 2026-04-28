const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /\bbg-white\/40\b/g, replacement: 'bg-[#1e293b]/40' }, // special cases
  { regex: /\bbg-white\b/g, replacement: 'bg-[#0f172a]' }, 
  { regex: /\bbg-gray-50\/30\b/g, replacement: 'bg-[#1e293b]/30' },
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-[#1e293b]/50' }, 
  { regex: /\bbg-gray-100\b/g, replacement: 'bg-[#1e293b]' }, 
  { regex: /\bbg-gray-200\b/g, replacement: 'bg-[#334155]' }, 
  { regex: /\bborder-gray-100\b/g, replacement: 'border-[#1e293b]' },
  { regex: /\bborder-gray-200\b/g, replacement: 'border-[#334155]' },
  { regex: /\bborder-gray-300\b/g, replacement: 'border-[#475569]' },
  { regex: /\btext-gray-900\b/g, replacement: 'text-white' },
  { regex: /\btext-gray-800\b/g, replacement: 'text-slate-200' },
  { regex: /\btext-gray-700\b/g, replacement: 'text-slate-300' },
  { regex: /\btext-gray-600\b/g, replacement: 'text-slate-400' },
  { regex: /\btext-gray-500\b/g, replacement: 'text-slate-400' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-slate-500' },
  { regex: /\btext-gray-300\b/g, replacement: 'text-slate-600' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Refactoring complete.');
