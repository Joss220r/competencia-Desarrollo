Write-Host "🚀 Iniciando Backend - API de Encuestas" -ForegroundColor Green
Write-Host "📍 Puerto: http://localhost:5088" -ForegroundColor Cyan
Write-Host "⏹️  Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

try {
    dotnet run --urls "http://localhost:5088" --no-launch-profile
} catch {
    Write-Host "❌ Error al iniciar el backend: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
}
