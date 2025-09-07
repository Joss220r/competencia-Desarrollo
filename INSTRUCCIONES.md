# 🚀 Instrucciones de Inicio Rápido

## Sistema de Encuestas Académicas

### ✅ El backend YA está ejecutándose
El backend está funcionando correctamente en **http://localhost:5088**

### 🌐 Cómo usar el frontend

#### Opción 1: Abrir directamente (Más Fácil)
1. Ve a la carpeta `EncuestasFrontend`
2. **Haz doble clic** en `index.html`
3. ¡Listo! La aplicación se abrirá en tu navegador

#### Opción 2: Con servidor local (Recomendado)
1. Abre PowerShell en la carpeta `EncuestasFrontend`
2. Ejecuta:
   ```powershell
   python -m http.server 8000
   ```
3. Ve a: **http://localhost:8000**

### 🧪 Probar que todo funciona
1. Abre `test-integration.html` (doble clic)
2. Haz clic en **"🚀 Ejecutar Todas"**
3. Deberías ver todas las pruebas en **verde ✅**

### 🎯 Usar la aplicación

#### Para responder encuestas:
1. Selecciona una encuesta (botones de arriba)
2. Lee las preguntas y marca las opciones
3. Ingresa tu ID de usuario
4. Haz clic en **"📤 Enviar Respuestas"**

#### Para ver resultados:
1. Haz clic en **"📈 Ver Resultados"**
2. Selecciona la encuesta que quieres ver
3. Haz clic en **"Cargar Resultados"**
4. Verás los indicadores de semáforo:
   - 😊 Verde: ≥ 60% (Excelente)
   - 😐 Amarillo: 30-59% (Regular)
   - 😞 Rojo: < 30% (Necesita mejorar)

### 🔧 Si hay problemas

#### "No se puede conectar"
- El backend ya está funcionando en **http://localhost:5088**
- Actualiza la página del frontend (F5)

#### Cambios no se ven
- Actualiza la página con **Ctrl+F5** (recarga completa)

#### Para reiniciar el backend
- Ve a la ventana de PowerShell que dice "Backend API"
- Presiona **Ctrl+C** para detener
- Ejecuta: `dotnet run --urls "http://localhost:5088"`

### 📱 URLs importantes
- **Frontend**: http://localhost:8000 (si usas servidor)
- **Backend API**: http://localhost:5088
- **Swagger UI**: http://localhost:5088
- **Pruebas**: test-integration.html

### ⚡ Atajos útiles
- **Ctrl+Enter**: Enviar formulario
- **Escape**: Limpiar formulario
- **F12**: Abrir DevTools para debugging

---

## 🎉 ¡Tu sistema está listo!

✅ Backend funcionando  
✅ Frontend creado  
✅ Base de datos conectada  
✅ Todas las funcionalidades implementadas

**¡Solo abre index.html y comienza a usar tu sistema de encuestas!** 🚀
