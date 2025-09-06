# Test simple usando curl
Write-Host "=== TEST SIMPLE CON CURL ===" -ForegroundColor Green

# 1. Test de conexión
Write-Host "`n1. Probando conexión..." -ForegroundColor Yellow
try {
    $response = curl "http://localhost:5086/api/diagnostico/test-connection" 2>$null
    Write-Host "✅ Conexión OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error de conexión" -ForegroundColor Red
}

# 2. Diagnóstico del SP
Write-Host "`n2. Diagnóstico SP tipo 1..." -ForegroundColor Yellow
try {
    $response = curl "http://localhost:5086/api/diagnostico/sp-raw/1" 2>$null
    Write-Host "✅ SP ejecutado" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error en SP" -ForegroundColor Red
}

# 3. Endpoint principal
Write-Host "`n3. Endpoint principal..." -ForegroundColor Yellow
try {
    $response = curl "http://localhost:5086/api/encuestas/1" 2>$null
    Write-Host "✅ Endpoint OK" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Error en endpoint" -ForegroundColor Red
}

Write-Host "`n=== FIN TEST ===" -ForegroundColor Green
