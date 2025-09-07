# Frontend - Sistema de Encuestas Académicas

Aplicación web moderna para el sistema de encuestas académicas, desarrollada con HTML5, CSS3 y JavaScript ES6+.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Visualización de Encuestas**: Interfaz intuitiva para mostrar encuestas con preguntas y opciones
- **Respuesta a Encuestas**: Sistema de checkboxes para seleccionar opciones y enviar respuestas
- **Resultados Visuales**: Dashboard con indicadores de semáforo y gráficos de progreso
- **Navegación Fluida**: Cambio dinámico entre diferentes encuestas y vistas
- **Guardado Automático**: El ID de usuario se guarda automáticamente en localStorage

### 🎨 Características de UI/UX
- **Diseño Responsivo**: Adaptado para desktop, tablet y móvil
- **Animaciones Suaves**: Transiciones y efectos visuales modernos
- **Tema Glassmorphism**: Efectos de cristal con backdrop-filter
- **Indicadores Visuales**: Sistema de semáforo con emojis y colores
- **Notificaciones**: Toast notifications para feedback del usuario
- **Atajos de Teclado**: Ctrl+Enter para enviar, Escape para limpiar

## 📁 Estructura del Proyecto

```
EncuestasFrontend/
├── index.html              # Página principal
├── test-integration.html   # Página de pruebas
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── api.js             # Servicios de API
│   ├── ui.js              # Manejo de UI
│   └── app.js             # Lógica principal
└── README.md              # Este archivo
```

## 🔧 Configuración

### Prerrequisitos
- Navegador moderno (Chrome 80+, Firefox 75+, Safari 13+)
- API del backend ejecutándose en `http://localhost:5088`

### Instalación
1. **Clona o descarga** los archivos del frontend
2. **Asegúrate de que el backend esté ejecutándose**
3. **Abre el archivo** `index.html` directamente en tu navegador, O
4. **Sirve la aplicación** con un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server

# Con PHP
php -S localhost:8000
```

## 🧪 Pruebas

### Página de Pruebas
Abre `test-integration.html` para verificar la integración:

```bash
# Abre directamente
open test-integration.html

# O con servidor local
python -m http.server 8000
# Luego ve a http://localhost:8000/test-integration.html
```

### Pruebas Manuales
1. **Conexión API**: Verifica que se conecte al backend
2. **Carga de Encuestas**: Prueba cargar encuestas 1, 2 y 3
3. **Envío de Respuestas**: Selecciona opciones y envía
4. **Visualización de Resultados**: Revisa los gráficos y indicadores

## 📊 Funcionalidades por Vista

### 🗳️ Vista de Encuestas
- **Navegación**: Botones para cambiar entre encuestas (1, 2, 3)
- **Preguntas**: Cada pregunta se muestra con número y texto
- **Opciones**: Checkboxes interactivos para seleccionar
- **Usuario**: Campo para ingresar ID de usuario (se guarda automáticamente)
- **Validaciones**: Verificación de datos antes del envío
- **Envío**: Botón para enviar respuestas con confirmación

### 📈 Vista de Resultados
- **Selector**: Dropdown para elegir qué encuesta ver
- **Resumen General**: Indicador de satisfacción global
- **Indicadores Visuales**:
  - 😊 **Verde/Feliz**: ≥ 60% (Excelente)
  - 😐 **Amarillo/Serio**: 30-59% (Regular)  
  - 😞 **Rojo/Triste**: < 30% (Necesita mejorar)
- **Barras de Progreso**: Visualización del porcentaje por pregunta
- **Estadísticas**: Número de respuestas y evaluaciones

## 🔌 Integración con API

### Endpoints Consumidos
```javascript
// Obtener encuesta
GET /api/encuestas/{id}

// Enviar respuestas
POST /api/encuestas/responder
{
  "usuarioID": "string",
  "respuestas": [
    {"opcionID": number, "seleccionado": 1|0}
  ]
}

// Obtener resultados
GET /api/encuestas/resumen/{id}
```

### Configuración de API
```javascript
// En js/api.js
const API_CONFIG = {
    baseURL: 'http://localhost:5088/api',
    timeout: 10000
};
```

## 🎯 Características Avanzadas

### Manejo de Estados
- **Loading**: Indicadores de carga durante peticiones
- **Error**: Mensajes de error con botón de reintentar
- **Success**: Confirmaciones de acciones exitosas
- **Empty**: Estados vacíos con instrucciones

### Persistencia Local
- **Usuario ID**: Se guarda en localStorage
- **Tema**: Preferencia de tema claro/oscuro
- **Estado de Navegación**: Recuerda la última encuesta vista

### Debugging y Desarrollo
```javascript
// Comandos disponibles en consola del navegador
debugApp()                    // Información de debug
restartApp()                 // Reiniciar aplicación
appUtils.exportData()        // Exportar datos a JSON
appUtils.toggleTheme()       // Cambiar tema
appUtils.showSystemInfo()    // Info del sistema
```

## 🔧 Personalización

### Cambiar URL de API
```javascript
// En js/api.js línea 3
const API_CONFIG = {
    baseURL: 'http://tu-servidor:puerto/api',
    timeout: 10000
};
```

### Modificar Colores del Tema
```css
/* En css/styles.css */
:root {
    --primary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
}
```

### Agregar Nuevos Indicadores
```javascript
// En js/api.js función obtenerIndicador()
obtenerIndicador(porcentaje) {
    if (porcentaje >= 80) return { emoji: '🎉', color: 'excellent' };
    if (porcentaje >= 60) return { emoji: '😊', color: 'high' };
    // ... más rangos
}
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 768px - Layout completo
- **Tablet**: 481-768px - Ajustado para tablets
- **Mobile**: ≤ 480px - Optimizado para móviles

### Características Móviles
- Navigation stack vertical
- Botones de tamaño touch-friendly
- Textos optimizados para lectura
- Formularios adaptados para móvil

## 🚨 Solución de Problemas

### Error: "No se puede conectar con el servidor"
```bash
# 1. Verifica que el backend esté ejecutándose
dotnet run --urls "http://localhost:5088"

# 2. Revisa la consola del navegador para errores CORS
# 3. Asegúrate de que la URL en api.js sea correcta
```

### Error: "Encuesta no tiene datos"
```bash
# 1. Verifica que el stored procedure retorne datos
# 2. Usa el endpoint de diagnóstico: /api/diagnostico/sp-raw/1
# 3. Revisa los logs del backend
```

### Problemas de Renderizado
```bash
# 1. Abre las DevTools del navegador (F12)
# 2. Revisa la consola para errores JavaScript
# 3. Verifica la pestaña Network para peticiones fallidas
```

## 🏆 Mejores Prácticas Implementadas

### Performance
- **Lazy Loading**: Carga de datos bajo demanda
- **Debouncing**: En inputs de usuario
- **Caching**: Almacenamiento local de datos de usuario
- **Optimized DOM**: Manipulación eficiente del DOM

### Seguridad
- **Input Validation**: Validación de datos antes del envío
- **XSS Prevention**: Escapado de contenido HTML
- **HTTPS Ready**: Preparado para producción con HTTPS

### Accesibilidad
- **Semantic HTML**: Estructura semántica correcta
- **Keyboard Navigation**: Navegación por teclado
- **ARIA Labels**: Etiquetas para screen readers
- **Color Contrast**: Contraste adecuado para lectura

## 🎨 Créditos

- **Iconos**: Emojis nativos del sistema
- **Fuentes**: Segoe UI, system fonts
- **Colores**: Paleta inspirada en Material Design
- **Animaciones**: CSS3 transitions y transforms

---

**📧 Soporte**: Para problemas técnicos, revisa la consola del navegador y los logs del backend.

**🔄 Versión**: 1.0.0 - Sistema de Encuestas Académicas
