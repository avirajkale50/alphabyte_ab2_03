# Save this as start-all.ps1
$currentDir = Get-Location

# Start patient app on port 5173
Write-Host "Starting patient app on port 5173..." -ForegroundColor Green
Set-Location -Path "$currentDir\patient"
Start-Process npm -ArgumentList "run", "dev", "--", "--port", "5173" -NoNewWindow

# Start doctor app
Write-Host "Starting doctor app..." -ForegroundColor Green
Set-Location -Path "$currentDir\doctor"
Start-Process npm -ArgumentList "run", "dev" -NoNewWindow

# Start OTP authentication
Write-Host "Starting OTP authentication..." -ForegroundColor Green
Set-Location -Path "$currentDir\backend\otpauth"
Start-Process python -ArgumentList "OTPauth.py" -NoNewWindow

# Start backend main
Write-Host "Starting backend main..." -ForegroundColor Green
Set-Location -Path "$currentDir\backend"
Start-Process python -ArgumentList "main.py" -NoNewWindow

# Start rag main
Write-Host "Starting backend main..." -ForegroundColor Green
Set-Location -Path "$currentDir"
Start-Process python -ArgumentList "rag_endpt.py" -NoNewWindow

# Start Redis in WSL
Write-Host "Starting Redis in WSL..." -ForegroundColor Green
Set-Location -Path $currentDir
wsl redis-server