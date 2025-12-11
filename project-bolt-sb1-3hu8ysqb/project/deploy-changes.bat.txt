@"
@echo off
echo Deploying changes to Vercel...

REM Build the project
call npm run build

REM Add all changes
git add .

REM Commit changes
git commit -m "Update: %date% %time%"

REM Push to GitHub
git push origin main

echo Deployment initiated! Check Vercel dashboard for status.
pause
"@ | Out-File -FilePath "deploy-changes.bat" -Encoding ASCII
