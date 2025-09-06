using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json;

namespace EncuestasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticoController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<DiagnosticoController> _logger;

        public DiagnosticoController(IConfiguration configuration, ILogger<DiagnosticoController> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException("ConnectionString");
            _logger = logger;
        }

        /// <summary>
        /// Diagnóstico: Ver qué columnas y datos retorna el SP
        /// </summary>
        [HttpGet("sp-info/{tipoEncuestaId}")]
        public async Task<ActionResult> DiagnosticarStoredProcedure(int tipoEncuestaId)
        {
            try
            {
                var resultado = new
                {
                    TipoEncuestaID = tipoEncuestaId,
                    Columnas = new List<string>(),
                    PrimerRegistro = new Dictionary<string, object>(),
                    TotalRegistros = 0
                };

                using var connection = new SqlConnection(_connectionString);
                using var command = new SqlCommand("sp_ObtenerEncuestaPorTipo", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@TipoEncuestaID", tipoEncuestaId);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                // Obtener nombres de columnas
                var columnas = new List<string>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    columnas.Add(reader.GetName(i));
                }

                var primerRegistro = new Dictionary<string, object>();
                int totalRegistros = 0;

                // Leer datos
                while (await reader.ReadAsync())
                {
                    totalRegistros++;
                    
                    // Solo capturar el primer registro para diagnóstico
                    if (totalRegistros == 1)
                    {
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var valor = reader.IsDBNull(i) ? null : reader.GetValue(i);
                            primerRegistro[columnas[i]] = valor ?? "NULL";
                        }
                    }
                }

                return Ok(new
                {
                    TipoEncuestaID = tipoEncuestaId,
                    Columnas = columnas,
                    PrimerRegistro = primerRegistro,
                    TotalRegistros = totalRegistros,
                    StoredProcedure = "sp_ObtenerEncuestaPorTipo"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en diagnóstico del SP");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Diagnóstico: Ver qué retorna el SP de resumen
        /// </summary>
        [HttpGet("sp-resumen-info/{encuestaId}")]
        public async Task<ActionResult> DiagnosticarResumen(int encuestaId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                using var command = new SqlCommand("sp_ResumenEncuestaJson", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@EncuestaID", encuestaId);

                await connection.OpenAsync();
                var resultado = await command.ExecuteScalarAsync();

                return Ok(new
                {
                    EncuestaID = encuestaId,
                    ResultadoTipo = resultado?.GetType().Name,
                    Contenido = resultado?.ToString(),
                    EsNull = resultado == null,
                    StoredProcedure = "sp_ResumenEncuestaJson"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en diagnóstico del resumen");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Prueba simple de conexión a la base de datos
        /// </summary>
        [HttpGet("test-connection")]
        public async Task<ActionResult> TestConnection()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SqlCommand("SELECT GETDATE() as FechaServidor, @@VERSION as Version", connection);
                using var reader = await command.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    return Ok(new
                    {
                        Conexion = "Exitosa",
                        FechaServidor = reader["FechaServidor"],
                        VersionSQL = reader["Version"]
                    });
                }

                return Ok(new { Conexion = "Exitosa", Datos = "Sin datos" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Conexion = "Fallida", Error = ex.Message });
            }
        }
    }
}
