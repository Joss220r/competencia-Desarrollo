# Script para diagnosticar el Stored Procedure
Write-Host "=== DIAGNOSTICO DEL STORED PROCEDURE ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5086"

# Probar para tipos 1, 2 y 3
foreach ($tipo in 1..3) {
    Write-Host "Probando tipo $tipo..." -ForegroundColor Yellow
    try {
        $url = "$baseUrl/api/diagnostico/sp-raw/$tipo"
        Write-Host "URL: $url" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $url -Method GET
        
        Write-Host "✅ Respuesta exitosa para tipo $tipo" -ForegroundColor Green
        Write-Host "📊 Columnas encontradas: $($response.InfoColumnas.Count)" -ForegroundColor Cyan
        Write-Host "📈 Filas de datos: $($response.TotalFilas)" -ForegroundColor Cyan
        
        if ($response.InfoColumnas.Count -gt 0) {
            Write-Host "🔍 Columnas:" -ForegroundColor Magenta
            foreach ($col in $response.InfoColumnas) {
                Write-Host "   [$($col.Indice)] $($col.Nombre) ($($col.Tipo))" -ForegroundColor White
            }
        }
        
        if ($response.TotalFilas -gt 0) {
            Write-Host "📋 Primera fila de datos:" -ForegroundColor Magenta
            $response.TodosLosDatos[0].PSObject.Properties | ForEach-Object {
                Write-Host "   $($_.Name): $($_.Value)" -ForegroundColor White
            }
        } else {
            Write-Host "⚠️  No hay datos para tipo $tipo" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Error para tipo $tipo : $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "=== FIN DIAGNOSTICO ===" -ForegroundColor Green
