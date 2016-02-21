(del /f/q "%~0"
if exist "%~0" (echo.How did that happen?) else (npm install)
pause
exit)   