# Script de pruebas para la API de Encuestas
# Ejecuta: .\test-api.ps1

$baseUrl = "http://localhost:5086"

Write-Host "=== PROBANDO API DE ENCUESTAS ===" -ForegroundColor Green
Write-Host ""

# 1. Test de conexion
Write-Host "1. Probando conexion a la base de datos..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/diagnostico/test-connection" -Method GET
    Write-Host "Conexion: $($response.Conexion)" -ForegroundColor Green
    Write-Host "Fecha del servidor: $($response.FechaServidor)" -ForegroundColor Cyan
} catch {
    Write-Host "Error de conexion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Diagnostico del SP para diferentes tipos
foreach ($tipo in 1..3) {
    Write-Host "2.$tipo. Diagnosticando SP para tipo $tipo..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/diagnostico/sp-info/$tipo" -Method GET
        Write-Host "Tipo $tipo - Columnas: $($response.Columnas -join ', ')" -ForegroundColor Cyan
        Write-Host "Registros encontrados: $($response.TotalRegistros)" -ForegroundColor Cyan
        
        if ($response.TotalRegistros -gt 0) {
            Write-Host "Primer registro:" -ForegroundColor Magenta
            $response.PrimerRegistro.PSObject.Properties | ForEach-Object {
                Write-Host "   $($_.Name): $($_.Value)" -ForegroundColor White
            }
        }
    } catch {
        Write-Host "Error tipo $tipo : $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 3. Test de endpoints principales
Write-Host "3. Probando endpoints principales..." -ForegroundColor Yellow
foreach ($id in 1..3) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/encuestas/$id" -Method GET
        Write-Host "GET /api/encuestas/$id - EncuestaID: $($response.encuestaID), Preguntas: $($response.preguntas.Count)" -ForegroundColor Green
    } catch {
        Write-Host "Error GET /api/encuestas/$id : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Green
