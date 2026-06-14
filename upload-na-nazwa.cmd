@echo off
setlocal
cd /d "%~dp0"

echo Pacjent360 - upload na nazwa.pl
echo.
echo Skrypt wysle zawartosc dist\upload-ready na hosting i po uploadzie sprawdzi domene.
echo Haslo FTP wpiszesz w oknie PowerShell. Nie zostanie zapisane w repo.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\upload-to-nazwa.ps1"

echo.
pause
