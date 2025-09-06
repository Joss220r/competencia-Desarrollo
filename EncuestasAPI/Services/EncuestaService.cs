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
            Encuesta? encuesta = null;
            var preguntas = new Dictionary<int, Pregunta>();

            using var connection = new SqlConnection(_connectionString);
            using var command = new SqlCommand("sp_ObtenerEncuestaPorTipo", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            
            command.Parameters.AddWithValue("@TipoEncuestaID", tipoEncuestaId);

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            // Obtener información sobre las columnas
            var fieldNames = new Dictionary<string, int>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                fieldNames[reader.GetName(i)] = i;
            }

            while (await reader.ReadAsync())
            {
                // Primera vez que leemos la encuesta
                if (encuesta == null)
                {
                    encuesta = new Encuesta
                    {
                        EncuestaID = GetSafeInt32(reader, fieldNames, "EncuestaID"),
                        Titulo = GetSafeString(reader, fieldNames, "Titulo") ?? "Sin título",
                        Descripcion = GetSafeString(reader, fieldNames, "Descripcion") ?? "Sin descripción",
                        TipoEncuestaID = tipoEncuestaId
                    };
                }

                var preguntaId = GetSafeInt32(reader, fieldNames, "PreguntaID");
                
                if (preguntaId > 0)
                {
                    // Agregar pregunta si no existe
                    if (!preguntas.ContainsKey(preguntaId))
                    {
                        var pregunta = new Pregunta
                        {
                            PreguntaID = preguntaId,
                            TextoPregunta = GetSafeString(reader, fieldNames, "TextoPregunta") ?? "Sin pregunta",
                            EncuestaID = encuesta.EncuestaID
                        };
                        preguntas[preguntaId] = pregunta;
                        encuesta.Preguntas.Add(pregunta);
                    }

                    // Agregar opción a la pregunta
                    var opcionId = GetSafeInt32(reader, fieldNames, "OpcionID");
                    if (opcionId > 0)
                    {
                        var opcion = new Opcion
                        {
                            OpcionID = opcionId,
                            TextoOpcion = GetSafeString(reader, fieldNames, "TextoOpcion") ?? "Sin opción",
                            PreguntaID = preguntaId
                        };
                        preguntas[preguntaId].Opciones.Add(opcion);
                    }
                }
            }

            return encuesta;
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
