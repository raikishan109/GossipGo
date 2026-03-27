@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo.
echo ============================================
echo   GossipGo Dev Launcher
echo ============================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm was not found in PATH.
  echo Install Node.js, then run this script again.
  exit /b 1
)

call :ensure_env_files
call :check_mongo
call :ensure_redis
call :start_backend
call :start_frontend
call :start_admin

echo.
echo User Panel  : http://localhost:3000
echo Admin Panel : http://localhost:3001
echo Backend API : http://localhost:5000
echo.
echo If a service was already running, this script left it untouched.
echo.
exit /b 0

:ensure_env_files
if not exist "%ROOT%\backend\.env" if exist "%ROOT%\backend\.env.example" (
  copy /Y "%ROOT%\backend\.env.example" "%ROOT%\backend\.env" >nul
  echo [INFO] Created backend\.env from .env.example
)

if not exist "%ROOT%\frontend\user-panel\.env.local" if exist "%ROOT%\frontend\user-panel\.env.local.example" (
  copy /Y "%ROOT%\frontend\user-panel\.env.local.example" "%ROOT%\frontend\user-panel\.env.local" >nul
  echo [INFO] Created frontend\user-panel\.env.local from .env.local.example
)

if not exist "%ROOT%\frontend\admin-panel\.env.local" if exist "%ROOT%\frontend\admin-panel\.env.local.example" (
  copy /Y "%ROOT%\frontend\admin-panel\.env.local.example" "%ROOT%\frontend\admin-panel\.env.local" >nul
  echo [INFO] Created frontend\admin-panel\.env.local from .env.local.example
)
exit /b 0

:check_mongo
call :port_in_use 27017
if errorlevel 1 (
  echo [WARN] MongoDB does not appear to be listening on port 27017.
  echo        Start MongoDB manually before using the app.
  echo.
  exit /b 0
)

echo [OK] MongoDB is available on port 27017.
exit /b 0

:ensure_redis
call :port_in_use 6379
if not errorlevel 1 (
  echo [OK] Redis is already running on port 6379.
  exit /b 0
)

if exist "C:\Program Files\Redis\redis-server.exe" (
  echo [INFO] Starting Redis on port 6379...
  start "GossipGo Redis" /MIN "C:\Program Files\Redis\redis-server.exe" --port 6379
  timeout /t 2 /nobreak >nul

  call :port_in_use 6379
  if not errorlevel 1 (
    echo [OK] Redis started successfully.
  ) else (
    echo [WARN] Redis did not start successfully.
  )
  exit /b 0
)

echo [WARN] Redis is not running and redis-server.exe was not found at:
echo        C:\Program Files\Redis\redis-server.exe
exit /b 0

:start_backend
call :port_in_use 5000
if not errorlevel 1 (
  echo [OK] Backend is already running on port 5000.
  exit /b 0
)

echo [INFO] Starting backend in a new window...
start "GossipGo Backend" cmd /k "cd /d ""%ROOT%"" && npm run dev:backend"
exit /b 0

:start_frontend
call :port_in_use 3000
if not errorlevel 1 (
  echo [OK] Frontend is already running on port 3000.
  exit /b 0
)

echo [INFO] Starting frontend in a new window...
start "GossipGo Frontend" cmd /k "cd /d ""%ROOT%"" && npm run dev:frontend"
exit /b 0

:start_admin
call :port_in_use 3001
if not errorlevel 1 (
  echo [OK] Admin Panel is already running on port 3001.
  exit /b 0
)

echo [INFO] Starting Admin Panel in a new window...
start "GossipGo Admin" cmd /k "cd /d ""%ROOT%"" && npm run dev:admin"
exit /b 0

:port_in_use
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
exit /b %errorlevel%
