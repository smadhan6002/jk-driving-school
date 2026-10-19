$filePath = 'c:\Users\viswa\OneDrive\Desktop\div\index.html'

# Read raw bytes and decode as UTF-8
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# Skip BOM if present (EF BB BF)
$startIdx = 0
if ($bytes.Length -gt 2 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    $startIdx = 3
}
$contentBytes = $bytes[$startIdx..($bytes.Length - 1)]
$content = [System.Text.Encoding]::UTF8.GetString($contentBytes)

Write-Host "File loaded: $($content.Length) chars"
Write-Host "BOM skipped: $($startIdx -eq 3)"

# All replacements use Unicode escape sequences to avoid script encoding issues
# Each pair: [mojibake string] -> [correct Unicode codepoint(s)]

# Helper function to build string from codepoints
function C([int[]]$codes) { 
    $s = ''
    foreach ($c in $codes) { $s += [char]$c }
    return $s
}

$changes = 0

# Rupee sign: â‚¹ -> ₹ (U+20B9)
# â=U+00E2, ‚=U+201A, ¹=U+00B9  -> ₹=U+20B9
$from = (C 0x00E2, 0x201A, 0x00B9)
$to = (C 0x20B9)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Rupee: $n"; $changes+=$n }

# Em dash: â€" -> — (U+2014)
# â=U+00E2, €=U+20AC, "=U+201D  ... actually let's use direct char codes
# The sequence â€" in UTF-8 stored as Latin-1 double-encoded:
# — is U+2014, UTF-8: E2 80 94
# When those bytes read as Windows-1252: â(E2) €(80) "(94 not standard)
# Actually 0x94 in Windows-1252 = U+201D (right double quote)
# So — reads as: â + € + right-double-quote (U+201D)
$from = (C 0x00E2, 0x20AC, 0x201D)
$to = (C 0x2014)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Em dash: $n"; $changes+=$n }

# En dash: â€" -> – (U+2013)
# – is U+2013, UTF-8: E2 80 93
# 0x93 in Windows-1252 = U+201C (left double quote)
$from = (C 0x00E2, 0x20AC, 0x201C)
$to = (C 0x2013)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "En dash: $n"; $changes+=$n }

# Left double quote: â€œ -> " (U+201C)
# " is U+201C, UTF-8: E2 80 9C
# 0x9C in Windows-1252 = U+0153 (oe ligature)
$from = (C 0x00E2, 0x20AC, 0x0153)
$to = (C 0x201C)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Left dquote: $n"; $changes+=$n }

# Right double quote: â€ -> " (U+201D)
# " is U+201D, UTF-8: E2 80 9D
# 0x9D in Windows-1252 = U+009D (control char, often not displayed)
$from = (C 0x00E2, 0x20AC, 0x009D)
$to = (C 0x201D)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Right dquote: $n"; $changes+=$n }

# Right single quote: â€™ -> ' (U+2019)
# ' is U+2019, UTF-8: E2 80 99
# 0x99 in Windows-1252 = U+2122 (trademark)
$from = (C 0x00E2, 0x20AC, 0x2122)
$to = (C 0x2019)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Right squote: $n"; $changes+=$n }

# Left single quote: â€˜ -> ' (U+2018)
# ' is U+2018, UTF-8: E2 80 98
# 0x98 in Windows-1252 = U+02DC (small tilde)
$from = (C 0x00E2, 0x20AC, 0x02DC)
$to = (C 0x2018)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Left squote: $n"; $changes+=$n }

# Horizontal ellipsis: â€¦ -> … (U+2026)
# … is U+2026, UTF-8: E2 80 A6
# 0xA6 in Windows-1252 = U+00A6 (broken bar)
$from = (C 0x00E2, 0x20AC, 0x00A6)
$to = (C 0x2026)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Ellipsis: $n"; $changes+=$n }

# Bullet: â€¢ -> • (U+2022)
# • is U+2022, UTF-8: E2 80 A2
# 0xA2 in Windows-1252 = U+00A2 (cent sign)
$from = (C 0x00E2, 0x20AC, 0x00A2)
$to = (C 0x2022)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Bullet: $n"; $changes+=$n }

# Black star: â˜… -> ★ (U+2605)
# ★ is U+2605, UTF-8: E2 98 85
# â=U+00E2, ˜=U+02DC(0x98 in Win1252), …=U+2026 (0x85 in Win1252)
$from = (C 0x00E2, 0x02DC, 0x2026)
$to = (C 0x2605)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Star: $n"; $changes+=$n }

# Non-breaking space artifact: Â  -> just space or nbsp
# Â is U+00C2, followed by U+00A0 (non-breaking space)
$from = (C 0x00C2, 0x00A0)
$to = ' '
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "NBSP artifact: $n"; $changes+=$n }

# Middle dot: Â· -> · (U+00B7)
$from = (C 0x00C2, 0x00B7)
$to = (C 0x00B7)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Middle dot: $n"; $changes+=$n }

# Copyright: Â© -> © (U+00A9)
$from = (C 0x00C2, 0x00A9)
$to = (C 0x00A9)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Copyright: $n"; $changes+=$n }

# Euro sign: â‚¬ -> € (U+20AC) -- alternate rupee patterns
$from = (C 0x00E2, 0x201A, 0x00AC)
$to = (C 0x20AC)
if ($content.Contains($from)) { $n=[regex]::Matches($content,[regex]::Escape($from)).Count; $content=$content.Replace($from,$to); Write-Host "Euro: $n"; $changes+=$n }

Write-Host ""
Write-Host "Total changes: $changes"

# Save as UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
Write-Host "Saved as UTF-8 without BOM"
Write-Host "New file size: $((Get-Item $filePath).Length) bytes"
