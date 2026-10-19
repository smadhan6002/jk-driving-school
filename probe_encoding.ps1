# Read file as raw bytes
$filePath = 'c:\Users\viswa\OneDrive\Desktop\div\index.html'
$bytes = [System.IO.File]::ReadAllBytes($filePath)
Write-Host ("File size: " + $bytes.Length + " bytes")
Write-Host ("First 3 bytes: " + $bytes[0].ToString('X2') + " " + $bytes[1].ToString('X2') + " " + $bytes[2].ToString('X2'))

# Try reading as UTF-8 directly from raw bytes
$utf8Content = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Host ("UTF-8 decode length: " + $utf8Content.Length)

# Check if the star character exists in UTF-8 decoded content
if ($utf8Content.Contains([char]0x2605)) {
    Write-Host "STAR CHARACTER (U+2605) found in UTF-8 decoded content - file IS actually UTF-8"
} else {
    Write-Host "Star NOT found in UTF-8 decoded - file may be Windows-1252"
}

# Also try reading as Windows-1252
$win1252 = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
if ($win1252.Contains([char]0x2605)) {
    Write-Host "STAR found in Windows-1252 decoded content"
}

# Look for the mojibake pattern â˜… in Win-1252
if ($win1252.Contains("â˜…")) {
    Write-Host "Mojibake 'â˜…' found in Windows-1252 content - file is NOT Windows-1252"
}

# Look for mojibake in UTF-8 decoded
if ($utf8Content.Contains("â˜…")) {
    Write-Host "Mojibake found even after UTF-8 decode - double-encoded or mixed"
}

# Check specific byte sequence around offset where we expect a star
Write-Host ""
Write-Host "Searching for star character bytes (E2 98 85) in file..."
$found = $false
for ($i = 0; $i -lt $bytes.Length - 2; $i++) {
    if ($bytes[$i] -eq 0xE2 -and $bytes[$i+1] -eq 0x98 -and $bytes[$i+2] -eq 0x85) {
        Write-Host ("Found UTF-8 star bytes at offset: " + $i)
        $found = $true
        break
    }
}
if (-not $found) { Write-Host "UTF-8 star bytes (E2 98 85) NOT found" }

# Check for mojibake of star (C3 A2 CB 9C C2 85) - double-encoded
Write-Host "Searching for double-encoded star bytes..."
for ($i = 0; $i -lt $bytes.Length - 5; $i++) {
    if ($bytes[$i] -eq 0xC3 -and $bytes[$i+1] -eq 0xA2 -and $bytes[$i+2] -eq 0xCB -and $bytes[$i+3] -eq 0x9C -and $bytes[$i+4] -eq 0xC2 -and $bytes[$i+5] -eq 0x85) {
        Write-Host ("Found double-encoded star at offset: " + $i)
        break
    }
}

Write-Host "Done probing"
