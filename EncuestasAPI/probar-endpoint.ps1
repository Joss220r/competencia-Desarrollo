# Script para probar el endpoint corregido
Write-Host "=== PROBANDO ENDPOINT CORREGIDO ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:5086"

# 1. Primero hacer diagnóstico detallado
Write-Host "1. Ejecutando diagnóstico detallado..." -ForegroundColor Yellow
try {
    $diagnostico = Invoke-RestMethod -Uri "$baseUrl/api/diagnostico/sp-raw/1" -Method GET
    Write-Host "✅ Diagnóstico exitoso" -ForegroundColor Green
    Write-Host "📊 Columnas disponibles:" -ForegroundColor Cyan
    foreach ($col in $diagnostico.InfoColumnas) {
        Write-Host "   - $($col.Nombre) ($($col.Tipo))" -ForegroundColor White
    }
    Write-Host "📈 Total de filas: $($diagnostico.TotalFilas)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error en diagnóstico: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# 2. Probar endpoint principal
Write-Host "2. Probando endpoint principal GET /api/encuestas/1..." -ForegroundColor Yellow
try {
    $encuesta = Invoke-RestMethod -Uri "$baseUrl/api/encuestas/1" -Method GET
    
    Write-Host "✅ Respuesta exitosa" -ForegroundColor Green
    Write-Host "🆔 EncuestaID: $($encuesta.encuestaID)" -ForegroundColor Cyan
    Write-Host "📝 Título: $($encuesta.titulo)" -ForegroundColor Cyan
    Write-Host "📄 Descripción: $($encuesta.descripcion)" -ForegroundColor Cyan
    Write-Host "❓ Total Preguntas: $($encuesta.preguntas.Count)" -ForegroundColor Cyan
    
    if ($encuesta.preguntas.Count -gt 0) {
        Write-Host ""
        Write-Host "📋 Primera pregunta:" -ForegroundColor Magenta
        $pregunta1 = $encuesta.preguntas[0]
        Write-Host "   ID: $($pregunta1.preguntaID)" -ForegroundColor White
        Write-Host "   Texto: $($pregunta1.textoPregunta)" -ForegroundColor White
        Write-Host "   Opciones: $($pregunta1.opciones.Count)" -ForegroundColor White
        
        if ($pregunta1.opciones.Count -gt 0) {
            Write-Host "   Primera opción:" -ForegroundColor DarkCyan
            Write-Host "     ID: $($pregunta1.opciones[0].opcionID)" -ForegroundColor Gray
            Write-Host "     Texto: $($pregunta1.opciones[0].textoOpcion)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Error en endpoint principal: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Probar todos los tipos
Write-Host "3. Probando todos los tipos de encuesta..." -ForegroundColor Yellow
foreach ($tipo in 1..3) {
    try {
        $encuesta = Invoke-RestMethod -Uri "$baseUrl/api/encuestas/$tipo" -Method GET
        Write-Host "✅ Tipo $tipo - ID: $($encuesta.encuestaID), Preguntas: $($encuesta.preguntas.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Tipo $tipo - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Green
