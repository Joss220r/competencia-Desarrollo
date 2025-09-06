Write-Host "Ejecutando API en segundo plano..." -ForegroundColor Yellow

# Ejecutar la API en segundo plano
$job = Start-Job -ScriptBlock { 
    Set-Location "C:\Users\Milton Gómez\Desktop\Enunciado de Actividad en Clase (2 horas)\EncuestasAPI"
    dotnet run --urls "http://localhost:5087" --no-launch-profile 
}

Start-Sleep -Seconds 5

Write-Host "Probando diagnóstico..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5087/api/diagnostico/sp-raw/1" -Method GET
    
    Write-Host "=== DIAGNÓSTICO DEL SP ===" -ForegroundColor Green
    Write-Host "Columnas encontradas:" -ForegroundColor Yellow
    foreach ($col in $response.InfoColumnas) {
        Write-Host "  - $($col.Nombre) ($($col.Tipo))" -ForegroundColor White
    }
    
    Write-Host "`nTotal de filas: $($response.TotalFilas)" -ForegroundColor Yellow
    
    if ($response.TotalFilas -gt 0) {
        Write-Host "`nPrimeras 3 filas de datos:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $response.TodosLosDatos.Count); $i++) {
            Write-Host "--- Fila $($i + 1) ---" -ForegroundColor Cyan
            $response.TodosLosDatos[$i].PSObject.Properties | ForEach-Object {
                Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "`n=== PROBANDO ENDPOINT PRINCIPAL ===" -ForegroundColor Green
    $encuesta = Invoke-RestMethod -Uri "http://localhost:5087/api/encuestas/1" -Method GET
    Write-Host "Resultado del endpoint:" -ForegroundColor Yellow
    Write-Host ($encuesta | ConvertTo-Json -Depth 10) -ForegroundColor White
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Detener el job
Stop-Job $job
Remove-Job $job
