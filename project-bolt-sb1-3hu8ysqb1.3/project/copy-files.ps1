# Copy Purely Plutonic project files
$dest = "C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew"

Write-Host "Copying files to $dest..." -ForegroundColor Green

# Copy all files except .git, node_modules, dist
$exclude = @('.git', 'node_modules', 'dist', '.bolt')

Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    foreach ($ex in $exclude) {
        if ($item.FullName -like "*\$ex\*" -or $item.Name -eq $ex) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | ForEach-Object {
    $targetPath = $_.FullName.Replace((Get-Location).Path, $dest)
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    } else {
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

Write-Host "Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd C:\Users\sbthm\OneDrive\Desktop\bolt\purelyplutonicnew"
Write-Host "2. git add ."
Write-Host "3. git commit -m 'Initial commit - Purely Plutonic app'"
Write-Host "4. git push origin main"
