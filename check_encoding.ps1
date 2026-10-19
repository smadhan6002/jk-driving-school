# Check all text files for corrupted characters
$rootPath = 'c:\Users\viswa\OneDrive\Desktop\div'
$extensions = @('html', 'js', 'css', 'json', 'txt', 'ps1')

# Corrupted patterns to search for (UTF-8 mojibake strings)
$patterns = @(
    [char]0xE2,[char]0x02,[char]0x18,[char]0x02 # not real chars, just placeholder approach
)

# Better approach: read as UTF-8, look for known mojibake sequences
$corruptedStrings = @(
    "â˜…",   # ★ encoded incorrectly
    "â€"",   # – em-dash
    "â€"",   # — em-dash  
    "â€¢",   # • bullet
    "â€™",   # ' right single quote
    "â€œ",   # " left double quote
    "â€",    # " right double quote
    "Ã©",    # é
    "Â·",    # ·
    "Â©",    # ©
    "Ã",     # various Latin
    "Â"      # non-breaking space issues
)

$found = $false
Get-ChildItem -Path $rootPath | Where-Object { $extensions -contains $_.Extension.TrimStart('.') } | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    
    foreach ($pattern in $corruptedStrings) {
        if ($content.Contains($pattern)) {
            Write-Host "CORRUPTED in $($_.Name): found '$pattern'"
            $script:found = $true
        }
    }
}

if (-not $found) {
    Write-Host "ALL CLEAN - No corrupted characters found in any file"
}
