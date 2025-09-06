# API de Encuestas Académicas

Esta es una Web API desarrollada en .NET 8 para el manejo de encuestas académicas. La API se conecta a una base de datos SQL Server en Azure y expone 3 endpoints principales.

## Configuración

### Base de Datos
- **Servidor**: svr-sql-ctezo.southcentralus.cloudapp.azure.com
- **Base de datos**: db_WebDevUMG
- **Usuario**: UsuarioEncuestas
- **Contraseña**: DesaWeb2025$!

### Conexión
La cadena de conexión se configura en `appsettings.json`.

## Endpoints

### 1. GET /api/encuestas/{id}
Obtiene una encuesta y sus preguntas/opciones por tipo de encuesta.

**Parámetros:**
- `id`: ID del tipo de encuesta (1, 2 o 3)

**Respuesta exitosa (200):**
```json
{
  "encuestaID": 1,
  "titulo": "Encuesta de Satisfacción",
  "descripcion": "Evaluación de la experiencia académica",
  "tipoEncuestaID": 1,
  "preguntas": [
    {
      "preguntaID": 1,
      "textoPregunta": "¿Cómo califica el servicio?",
      "encuestaID": 1,
      "opciones": [
        {
          "opcionID": 1,
          "textoOpcion": "Excelente",
          "preguntaID": 1
        },
        {
          "opcionID": 2,
          "textoOpcion": "Bueno",
          "preguntaID": 1
        }
      ]
    }
  ]
}
```

### 2. GET /api/encuestas/resumen/{id}
Obtiene el resumen de resultados de una encuesta en formato JSON.

**Parámetros:**
- `id`: ID de la encuesta (1, 2 o 3)

**Respuesta exitosa (200):**
```json
{
  "resumen": "Datos del resumen en formato JSON según lo retornado por sp_ResumenEncuestaJson"
}
```

### 3. POST /api/encuestas/responder
Guarda las respuestas de un usuario.

**Cuerpo de la petición:**
```json
{
  "usuarioID": "cgonzalezr11",
  "respuestas": [
    {
      "opcionID": 1,
      "seleccionado": 1
    },
    {
      "opcionID": 3,
      "seleccionado": 1
    },
    {
      "opcionID": 7,
      "seleccionado": 1
    }
  ]
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Respuestas guardadas exitosamente",
  "usuario": "cgonzalezr11",
  "respuestas_guardadas": 3,
  "fecha": "2024-09-06T20:39:38Z"
}
```

## Stored Procedures Utilizados

### sp_ObtenerEncuestaPorTipo
```sql
EXEC sp_ObtenerEncuestaPorTipo @TipoEncuestaID = 1;
```
Retorna la encuesta y sus preguntas/opciones según el ID del tipo.

### sp_ResumenEncuestaJson
```sql
EXEC sp_ResumenEncuestaJson @EncuestaID = 1;
```
Retorna un resumen en formato JSON con los resultados de la encuesta.

## Tabla de Respuestas
Las respuestas se guardan en la tabla `RespuestasUsuario` con la siguiente estructura:
- `RespuestaID` (int, identity)
- `UsuarioID` (string)
- `OpcionID` (int)
- `Seleccionado` (int, 0 o 1)
- `FechaRespuesta` (datetime)

## Ejecutar la Aplicación

### Prerrequisitos
- .NET 8 SDK
- Visual Studio 2022 o VS Code

### Comandos
```bash
# Restaurar paquetes
dotnet restore

# Compilar
dotnet build

# Ejecutar
dotnet run
```

La API estará disponible en:
- HTTP: http://localhost:5085
- Swagger UI: http://localhost:5085 (en desarrollo)

## Estructura del Proyecto

```
EncuestasAPI/
├── Controllers/
│   └── EncuestasController.cs
├── Models/
│   ├── Encuesta.cs
│   ├── Pregunta.cs
│   ├── Opcion.cs
│   └── RespuestaUsuario.cs
├── Services/
│   └── EncuestaService.cs
├── Program.cs
├── appsettings.json
└── README.md
```

## CORS
La API está configurada para aceptar peticiones de cualquier origen durante el desarrollo, facilitando la integración con el frontend.

## Manejo de Errores
- Validación de parámetros de entrada
- Manejo de excepciones con logging
- Respuestas HTTP estándar (400, 404, 500)

## Notas de Desarrollo
- La API utiliza Entity Framework Core para la gestión de datos
- Implementa inyección de dependencias
- Incluye logging integrado
- Configurada para desarrollo con Swagger UI automático
