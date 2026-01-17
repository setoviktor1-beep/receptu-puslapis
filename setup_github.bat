@echo off
echo ========================================================
echo  GitHub Setup Helper
echo ========================================================
echo.
echo 1. Nueikite i https://github.com/new
echo 2. Sukurkite nauja repozitorija pavadinimu: receptu-puslapis
echo 3. Nieko ten nekeiskite (Public, be README, be .gitignore)
echo 4. Spauskite "Create repository"
echo 5. Nukopijuokite HTTPS nuoroda (pvz. https://github.com/JusuVardas/receptu-puslapis.git)
echo.
set /p REPO_URL="Ijuostykite (Paste) nuoroda cia ir spauskite ENTER: "

if "%REPO_URL%"=="" goto error

echo.
echo Konfiguruojama...
git remote add origin %REPO_URL%
git branch -M master
git push -u origin master

echo.
echo Atlikta! Dabar galite eiti i GitHub Settings ir suvesti GEMINI_API_KEY.
pause
goto :eof

:error
echo Klaida: Neivedete nuorodos.
pause
