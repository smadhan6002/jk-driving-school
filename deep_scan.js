const fs = require('fs');
const path = require('path');
const root = 'c:/Users/viswa/OneDrive/Desktop/div';
const exts = ['.html', '.js', '.css', '.json'];

const files = fs.readdirSync(root).filter(f => exts.some(e => f.endsWith(e)));

// Known good characters in this project
// The star ★ is U+2605, the en-dash – is U+2013, em-dash — is U+2014
// bullet • is U+2022, right single quote ' is U+2019

let foundAny = false;

files.forEach(file => {
  const fp = path.join(root, file);
  const buf = fs.readFileSync(fp);
  
  // Search for double-encoded UTF-8 patterns
  // Mojibake of ★ (E2 98 85) when double-encoded becomes: C3 A2 CB 9C C2 85
  // Mojibake of – (E2 80 93) when double-encoded becomes: C3 A2 E2 82 AC C2 93
  
  const patterns = [
    { name: 'corrupted-star', bytes: [0xC3, 0xA2, 0xCB, 0x9C, 0xC2, 0x85] },
    { name: 'corrupted-endash', bytes: [0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0x93] },
    { name: 'corrupted-emdash', bytes: [0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0x94] },
    { name: 'corrupted-bullet', bytes: [0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xA2] },
    { name: 'corrupted-rsquote', bytes: [0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0x99] },
  ];
  
  patterns.forEach(pat => {
    for (let i = 0; i <= buf.length - pat.bytes.length; i++) {
      let match = true;
      for (let j = 0; j < pat.bytes.length; j++) {
        if (buf[i + j] !== pat.bytes[j]) { match = false; break; }
      }
      if (match) {
        console.log('CORRUPTED BYTES in ' + file + ': ' + pat.name + ' at offset ' + i);
        foundAny = true;
        break;
      }
    }
  });
  
  // Also check for literal mojibake text stored as UTF-8
  const text = buf.toString('utf8');
  const badTexts = [
    { str: '\u00e2\u02dc\u2026', name: 'corrupted star text' },
    { str: '\u00e2\u20ac\u201c', name: 'corrupted en-dash text' },
    { str: '\u00e2\u20ac\u201d', name: 'corrupted em-dash text' },
    { str: '\u00e2\u20ac\u00a2', name: 'corrupted bullet text' },
    { str: '\u00e2\u20ac\u2122', name: 'corrupted apostrophe text' },
    { str: '\u00e2\u20ac\u0153', name: 'corrupted left quote text' },
  ];
  
  badTexts.forEach(bt => {
    if (text.includes(bt.str)) {
      console.log('CORRUPTED TEXT in ' + file + ': ' + bt.name);
      foundAny = true;
    }
  });
  
  console.log('OK: ' + file + ' (' + buf.length + ' bytes)');
});

if (!foundAny) {
  console.log('\nALL CLEAN - No corrupted encoding found in any file');
} else {
  console.log('\nFOUND ISSUES - See above');
}
