@echo off
setlocal
title ZONE Security Suite - local server

rem ---------------------------------------------------------------
rem  ZONE - start the website locally and open it in your browser.
rem  Double-click this file. Close this window to stop the server.
rem  Optional: set ZONE_PORT to use a different port (default 5500).
rem ---------------------------------------------------------------

if not defined ZONE_PORT set "ZONE_PORT=5500"
set "URL=http://localhost:%ZONE_PORT%/"

rem Always serve from the folder this .bat file lives in
cd /d "%~dp0"

echo.
echo   ZONE Security Suite
echo   -------------------
echo.

rem Already running on this port? Just open the browser.
netstat -ano | findstr /r /c:":%ZONE_PORT% .*LISTENING" >nul
if %errorlevel%==0 (
  echo   A server is already running on port %ZONE_PORT%.
  echo   Opening %URL%
  if not defined ZONE_NO_BROWSER start "" "%URL%"
  timeout /t 3 >nul
  exit /b 0
)

rem Find Python ("python" first, then the "py" launcher)
set "PY="
where python >nul 2>nul && python --version >nul 2>nul && set "PY=python"
if not defined PY (
  where py >nul 2>nul && py -3 --version >nul 2>nul && set "PY=py -3"
)
if not defined PY (
  echo   [ERROR] Python 3 was not found.
  echo   Install it from https://www.python.org/downloads/
  echo   and tick "Add python.exe to PATH" during setup.
  echo.
  pause
  exit /b 1
)

echo   Serving:  %CD%
echo   Address:  %URL%
echo.
echo   Leave this window open while you use the site.
echo   Press Ctrl+C or close the window to stop.
echo.

rem Open the browser a moment after the server starts
if not defined ZONE_NO_BROWSER start "" /min cmd /c "timeout /t 2 /nobreak >nul & start %URL%"

%PY% -m http.server %ZONE_PORT% --bind 127.0.0.1

echo.
echo   Server stopped.
pause
