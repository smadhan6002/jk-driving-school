import os, glob

root = r'c:\Users\viswa\OneDrive\Desktop\div'
exts = ['.html', '.js', '.css', '.json', '.txt']

# Mojibake corrupted sequences (these appear literally in text when UTF-8 bytes are misread as Windows-1252)
corrupted = [
    '\u00e2\u02dc\u2026',      # â˜… (corrupted star U+2605)
    '\u00e2\u20ac\u201c',      # â€" (corrupted en-dash U+2013)
    '\u00e2\u20ac\u201d',      # â€" (corrupted em-dash U+2014)
    '\u00e2\u20ac\u00a2',      # â€¢ (corrupted bullet U+2022)
    '\u00e2\u20ac\u2122',      # â€™ (corrupted right single quote U+2019)
    '\u00e2\u20ac\u0153',      # â€œ (corrupted left double quote U+201C)
    '\u00e2\u20ac\ufffd',      # â€ (corrupted right double quote U+201D)
    '\u00c3\u00a9',            # Ã© (corrupted e-acute)
    '\u00c3',                  # Ã (any corrupted Latin)
    '\u00c2\u00b7',            # Â· (corrupted middle dot)
    '\u00c2\u00a9',            # Â© (corrupted copyright)
]

found_any = False
for ext in exts:
    for filepath in glob.glob(os.path.join(root, '*' + ext)):
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            fname = os.path.basename(filepath)
            for pat in corrupted:
                if pat in content:
                    print(f'CORRUPTED in {fname}: found pattern {repr(pat)}')
                    found_any = True
        except Exception as e:
            print(f'ERROR reading {filepath}: {e}')

if not found_any:
    print('ALL CLEAN - No corrupted mojibake patterns found in any file')
