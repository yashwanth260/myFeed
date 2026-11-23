@echo off
echo ===================================================
echo   Starting CraveCart / Feedo Docker Platform
echo ===================================================
docker compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker compose failed to start.
    echo Please make sure Docker Desktop is running.
    echo If this is the first time launching Docker Desktop, open Docker Desktop
    echo from your Start Menu or Desktop to accept the service agreement.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   All Services Successfully Started in Docker!
echo ===================================================
echo   - Customer Mobile App:      http://localhost:8081
echo   - Restaurant Partner App:   http://localhost:8082
echo   - Delivery Partner App:     http://localhost:8083
echo   - Platform Admin Dashboard: http://localhost:8084
echo   - Backend REST API:         http://localhost:4000/api/v1
echo   - Swagger / OpenAPI Docs:   http://localhost:4000/api/v1/docs
echo   - PostgreSQL Database:      localhost:5432
echo   - Redis Cache / Queue:      localhost:6379
echo ===================================================
echo.
pause

