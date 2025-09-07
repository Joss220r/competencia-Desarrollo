// Configuración de la API
const API_CONFIG = {
    baseURL: 'http://localhost:5088/api',
    timeout: 10000
};

// Servicio principal de la API
class EncuestasAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
    }

    /**
     * Realiza una petición HTTP genérica
     */
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: API_CONFIG.timeout
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            // Crear un controlador para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Intentar parsear como JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('La petición tardó demasiado tiempo (timeout)');
            }
            
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('No se puede conectar con el servidor. Verifica que la API esté ejecutándose.');
            }

            throw error;
        }
    }

    /**
     * Obtiene una encuesta por su ID de tipo
     * GET /api/encuestas/{id}
     */
    async obtenerEncuesta(tipoEncuestaId) {
        if (!tipoEncuestaId || tipoEncuestaId < 1 || tipoEncuestaId > 3) {
            throw new Error('El ID de tipo de encuesta debe ser 1, 2 o 3');
        }

        const url = `${this.baseURL}/encuestas/${tipoEncuestaId}`;
        
        try {
            const encuesta = await this.request(url);
            
            // Validar la estructura de la respuesta
            if (!encuesta || typeof encuesta !== 'object') {
                throw new Error('La respuesta de la API no tiene el formato esperado');
            }

            if (!encuesta.encuestaID || !encuesta.titulo) {
                throw new Error('La encuesta no tiene los datos básicos requeridos');
            }

            if (!Array.isArray(encuesta.preguntas)) {
                throw new Error('La encuesta no tiene preguntas válidas');
            }

            return encuesta;

        } catch (error) {
            console.error('Error al obtener encuesta:', error);
            throw new Error(`Error al cargar la encuesta: ${error.message}`);
        }
    }

    /**
     * Envía las respuestas de un usuario
     * POST /api/encuestas/responder
     */
    async enviarRespuestas(usuarioID, respuestas) {
        if (!usuarioID || usuarioID.trim() === '') {
            throw new Error('El ID de usuario es requerido');
        }

        if (!Array.isArray(respuestas) || respuestas.length === 0) {
            throw new Error('Se requiere al menos una respuesta');
        }

        // Validar estructura de respuestas
        for (const respuesta of respuestas) {
            if (!respuesta.opcionID || typeof respuesta.opcionID !== 'number') {
                throw new Error('Cada respuesta debe tener un OpcionID válido');
            }
            if (typeof respuesta.seleccionado !== 'number' || (respuesta.seleccionado !== 0 && respuesta.seleccionado !== 1)) {
                throw new Error('Seleccionado debe ser 0 o 1');
            }
        }

        const payload = {
            usuarioID: usuarioID.trim(),
            respuestas: respuestas.map(r => ({
                opcionID: r.opcionID,
                seleccionado: r.seleccionado
            }))
        };

        const url = `${this.baseURL}/encuestas/responder`;
        
        try {
            const resultado = await this.request(url, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return resultado;

        } catch (error) {
            console.error('Error al enviar respuestas:', error);
            throw new Error(`Error al enviar respuestas: ${error.message}`);
        }
    }

    /**
     * Obtiene el resumen de resultados de una encuesta
     * GET /api/encuestas/resumen/{id}
     */
    async obtenerResumen(encuestaId) {
        if (!encuestaId || encuestaId < 1 || encuestaId > 3) {
            throw new Error('El ID de encuesta debe ser 1, 2 o 3');
        }

        const url = `${this.baseURL}/encuestas/resumen/${encuestaId}`;
        
        try {
            const resumen = await this.request(url);
            return resumen;

        } catch (error) {
            console.error('Error al obtener resumen:', error);
            throw new Error(`Error al cargar el resumen: ${error.message}`);
        }
    }

    /**
     * Verifica si la API está disponible
     */
    async verificarConexion() {
        try {
            // Intentar hacer una petición simple a la API
            const url = `${this.baseURL}/encuestas/1`;
            await this.request(url);
            return true;
        } catch (error) {
            console.warn('La API no está disponible:', error.message);
            return false;
        }
    }

    /**
     * Obtiene información de diagnóstico (para desarrollo)
     */
    async obtenerDiagnostico(tipoEncuestaId = 1) {
        const url = `${this.baseURL}/diagnostico/sp-raw/${tipoEncuestaId}`;
        
        try {
            return await this.request(url);
        } catch (error) {
            console.error('Error en diagnóstico:', error);
            return null;
        }
    }
}

// Crear instancia global de la API
const api = new EncuestasAPI();

// Utilidades adicionales
const APIUtils = {
    /**
     * Convierte respuestas del formulario al formato esperado por la API
     */
    formatearRespuestas(formData) {
        const respuestas = [];
        
        // Iterar sobre todos los checkboxes marcados
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            const opcionID = parseInt(checkbox.value);
            if (!isNaN(opcionID)) {
                respuestas.push({
                    opcionID: opcionID,
                    seleccionado: 1
                });
            }
        });

        return respuestas;
    },

    /**
     * Valida si hay respuestas seleccionadas
     */
    validarRespuestas() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        return checkboxes.length > 0;
    },

    /**
     * Obtiene un indicador visual según el porcentaje
     */
    obtenerIndicador(porcentaje) {
        if (porcentaje >= 60) {
            return { emoji: '😊', color: 'high', texto: 'Excelente' };
        } else if (porcentaje >= 30) {
            return { emoji: '😐', color: 'medium', texto: 'Regular' };
        } else {
            return { emoji: '😞', color: 'low', texto: 'Necesita mejorar' };
        }
    },

    /**
     * Formatea números como porcentajes
     */
    formatearPorcentaje(numero) {
        return `${Math.round(numero)}%`;
    },

    /**
     * Manejo de errores comunes
     */
    manejarError(error) {
        console.error('Error en la aplicación:', error);

        let mensaje = 'Ha ocurrido un error inesperado';
        
        if (error.message.includes('conectar')) {
            mensaje = 'No se puede conectar con el servidor. Verifica que la API esté ejecutándose en http://localhost:5088';
        } else if (error.message.includes('timeout')) {
            mensaje = 'La petición tardó demasiado tiempo. Inténtalo de nuevo.';
        } else if (error.message.includes('404')) {
            mensaje = 'El recurso solicitado no se encontró.';
        } else if (error.message.includes('500')) {
            mensaje = 'Error interno del servidor.';
        } else if (error.message) {
            mensaje = error.message;
        }

        return mensaje;
    }
};

// Exportar para uso global
window.EncuestasAPI = EncuestasAPI;
window.api = api;
window.APIUtils = APIUtils;
