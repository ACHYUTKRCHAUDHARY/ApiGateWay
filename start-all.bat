@echo off
echo ===================================================
echo Starting Gatekeeper Smart API Gateway Platform
echo ===================================================

echo [1/4] Starting API Management Service (Port 8081)...
start "Gatekeeper - API Management (8081)" cmd /k "cd api-management-service && mvnw.cmd spring-boot:run"

echo [2/4] Waiting 5 seconds before starting Gateway & Analytics...
timeout /t 5 /nobreak > nul

echo [3/4] Starting Smart Gateway Service (Port 8080)...
start "Gatekeeper - Smart Gateway (8080)" cmd /k "cd smart-gateway-service && mvnw.cmd spring-boot:run"

echo [4/4] Starting Analytics Service (Port 8082)...
start "Gatekeeper - Analytics Service (8082)" cmd /k "cd analytics-service && mvnw.cmd spring-boot:run"

echo [5/5] Starting Frontend Dashboard (Port 3000)...
start "Gatekeeper - Frontend (3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo All services launched in separate windows!
echo Frontend Dashboard: http://localhost:3000
echo Smart Gateway:      http://localhost:8080
echo API Management:     http://localhost:8081
echo Analytics Engine:   http://localhost:8082
echo ===================================================
pause

