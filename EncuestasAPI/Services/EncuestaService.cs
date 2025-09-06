using Microsoft.Data.SqlClient;
using EncuestasAPI.Models;
using System.Data;

namespace EncuestasAPI.Services
{
    public interface IEncuestaService
    {
        Task<Encuesta?> ObtenerEncuestaPorTipoAsync(int tipoEncuestaId);
        Task<string> ObtenerResumenEncuestaAsync(int encuestaId);
        Task<bool> GuardarRespuestasUsuarioAsync(RespuestaUsuarioRequest request);
    }

    public class EncuestaService : IEncuestaService
    {
        private readonly string _connectionString;

        public EncuestaService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException("ConnectionString");
        }

        public async Task<Encuesta?> ObtenerEncuestaPorTipoAsync(int tipoEncuestaId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                using var command = new SqlCommand("sp_ObtenerEncuestaPorTipo", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                
                command.Parameters.AddWithValue("@TipoEncuestaID", tipoEncuestaId);

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    // El SP devuelve un JSON en la columna "JsonResult"
                    if (!reader.IsDBNull("JsonResult"))
                    {
                        var jsonResult = reader.GetString("JsonResult");
                        
                        // Parsear el JSON usando JsonDocument
                        using var doc = System.Text.Json.JsonDocument.Parse(jsonResult);
                        var root = doc.RootElement;
                        
                        var encuesta = new Encuesta
                        {
                            EncuestaID = root.GetProperty("EncuestaID").GetInt32(),
                            Titulo = root.GetProperty("Nombre").GetString() ?? "Sin título",
                            Descripcion = root.GetProperty("Descripcion").GetString() ?? "Sin descripción",
                            TipoEncuestaID = tipoEncuestaId,
                            Preguntas = new List<Pregunta>()
                        };

                        // Procesar preguntas
                        if (root.TryGetProperty("Preguntas", out var preguntasJson))
                        {
                            foreach (var preguntaJson in preguntasJson.EnumerateArray())
                            {
                                var pregunta = new Pregunta
                                {
                                    PreguntaID = preguntaJson.GetProperty("PreguntaID").GetInt32(),
                                    TextoPregunta = preguntaJson.GetProperty("TextoPregunta").GetString() ?? "Sin pregunta",
                                    EncuestaID = encuesta.EncuestaID,
                                    Opciones = new List<Opcion>()
                                };

                                // Procesar opciones
                                if (preguntaJson.TryGetProperty("Opciones", out var opcionesJson))
                                {
                                    foreach (var opcionJson in opcionesJson.EnumerateArray())
                                    {
                                        var opcion = new Opcion
                                        {
                                            OpcionID = opcionJson.GetProperty("OpcionID").GetInt32(),
                                            TextoOpcion = opcionJson.GetProperty("TextoOpcion").GetString() ?? "Sin opción",
                                            PreguntaID = pregunta.PreguntaID
                                        };
                                        pregunta.Opciones.Add(opcion);
                                    }
                                }

                                encuesta.Preguntas.Add(pregunta);
                            }
                        }

                        return encuesta;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                // Para debugging, devolver una encuesta con el error
                return new Encuesta
                {
                    EncuestaID = 0,
                    Titulo = $"Error: {ex.Message}",
                    Descripcion = ex.StackTrace ?? "Sin stack trace",
                    TipoEncuestaID = tipoEncuestaId,
                    Preguntas = new List<Pregunta>()
                };
            }
        }

        private int BuscarYObtenerInt(IDataReader reader, List<string> columnas, string[] posiblesNombres)
        {
            foreach (var nombre in posiblesNombres)
            {
                var columna = columnas.FirstOrDefault(c => c.Equals(nombre, StringComparison.OrdinalIgnoreCase));
                if (columna != null)
                {
                    var index = reader.GetOrdinal(columna);
                    return reader.IsDBNull(index) ? 0 : reader.GetInt32(index);
                }
            }
            return 0;
        }

        private string? BuscarYObtenerString(IDataReader reader, List<string> columnas, string[] posiblesNombres)
        {
            foreach (var nombre in posiblesNombres)
            {
                var columna = columnas.FirstOrDefault(c => c.Equals(nombre, StringComparison.OrdinalIgnoreCase));
                if (columna != null)
                {
                    var index = reader.GetOrdinal(columna);
                    return reader.IsDBNull(index) ? null : reader.GetString(index);
                }
            }
            return null;
        }

        private int GetSafeInt32(IDataReader reader, Dictionary<string, int> fieldNames, string columnName)
        {
            if (fieldNames.TryGetValue(columnName, out int index) && !reader.IsDBNull(index))
            {
                return reader.GetInt32(index);
            }
            return 0;
        }

        private string? GetSafeString(IDataReader reader, Dictionary<string, int> fieldNames, string columnName)
        {
            if (fieldNames.TryGetValue(columnName, out int index) && !reader.IsDBNull(index))
            {
                return reader.GetString(index);
            }
            return null;
        }

        public async Task<string> ObtenerResumenEncuestaAsync(int encuestaId)
        {
            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("sp_ResumenEncuestaJson", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            
            command.Parameters.AddWithValue("@EncuestaID", encuestaId);

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            
            return result?.ToString() ?? "{}";
        }

        public async Task<bool> GuardarRespuestasUsuarioAsync(RespuestaUsuarioRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();
            
            try
            {
                foreach (var respuesta in request.Respuestas)
                {
                    var insertCommand = new SqlCommand(
                        "INSERT INTO RespuestasUsuario (UsuarioID, OpcionID, Seleccionado, FechaRespuesta) " +
                        "VALUES (@UsuarioID, @OpcionID, @Seleccionado, @FechaRespuesta)", 
                        connection, transaction);

                    insertCommand.Parameters.AddWithValue("@UsuarioID", request.UsuarioID);
                    insertCommand.Parameters.AddWithValue("@OpcionID", respuesta.OpcionID);
                    insertCommand.Parameters.AddWithValue("@Seleccionado", respuesta.Seleccionado);
                    insertCommand.Parameters.AddWithValue("@FechaRespuesta", DateTime.Now);

                    await insertCommand.ExecuteNonQueryAsync();
                }

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }
    }
}
