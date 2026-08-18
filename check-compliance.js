import fs from 'fs';
import path from 'path';

const clientSrc = path.join(process.cwd(), 'client', 'src');
let hasErrors = false;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Exclude comment lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        // Check for 'this'
        if (/\bthis\b/.test(line)) {
          console.error(`❌ VIOLATION: 'this' keyword found at ${path.relative(process.cwd(), fullPath)}:${index + 1}`);
          hasErrors = true;
        }

        // Check for forbidden tags (svg, canvas, table)
        if (/<(canvas|svg|table|tbody|thead|tr|td|th)\b/i.test(line)) {
          console.error(`❌ VIOLATION: Forbidden tag found at ${path.relative(process.cwd(), fullPath)}:${index + 1}`);
          hasErrors = true;
        }

        // Check for jQuery
        if (/\b(jquery|\$)\s*\(/i.test(line) && !line.includes('process.env')) {
          console.error(`❌ VIOLATION: Potential jQuery usage at ${path.relative(process.cwd(), fullPath)}:${index + 1}`);
          hasErrors = true;
        }
      });
    }
  }
}

console.log('🔍 Running Subject Compliance Check on client/src...');
scanDir(clientSrc);

if (hasErrors) {
  console.error('\n🚨 Compliance check FAILED! Please fix the violations above.');
  process.exit(1);
} else {
  console.log('✅ Compliance check PASSED! (0 "this", 0 SVG/Canvas/Tables, 0 jQuery)');
}