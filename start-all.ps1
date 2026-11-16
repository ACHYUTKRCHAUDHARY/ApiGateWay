# Start all Gatekeeper services in separate PowerShell windows
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Gatekeeper Smart API Gateway Platform" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$baseDir = Get-Location

Write-Host "[1/4] Starting API Management Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\api-management-service'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 4

Write-Host "[2/4] Starting Smart Gateway Service (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\smart-gateway-service'; .\mvnw.cmd spring-boot:run"

Write-Host "[3/4] Starting Analytics Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\analytics-service'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Frontend Dashboard (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "`nGatekeeper Cluster Started!" -ForegroundColor Green
Write-Host "Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host "Smart Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "API Mgmt:      http://localhost:8081" -ForegroundColor White
Write-Host "Analytics:     http://localhost:8082" -ForegroundColor White

