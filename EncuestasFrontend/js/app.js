// Aplicación principal de Encuestas
class EncuestasApp {
    constructor() {
        this.initialized = false;
        this.currentEncuestaId = 1;
        this.encuestaData = null;
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando aplicación de encuestas...');
            
            this.setupEventListeners();
            await this.loadInitialData();
            
            this.initialized = true;
            console.log('✅ Aplicación iniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            ui.showError(
                APIUtils.manejarError(error),
                () => this.init()
            );
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('[data-encuesta]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const encuestaId = parseInt(e.target.dataset.encuesta);
                this.switchEncuesta(encuestaId);
            });
        });

        // Results button
        const btnResultados = document.getElementById('btnResultados');
        if (btnResultados) {
            btnResultados.addEventListener('click', () => this.showResultados());
        }

        // Form submission
        const encuestaForm = document.getElementById('encuestaForm');
        if (encuestaForm) {
            encuestaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Reset form
        const btnReset = document.getElementById('btnReset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                ui.limpiarFormulario();
                ui.showNotification('Formulario limpiado', 'info');
            });
        }

        // Load results
        const btnCargarResultados = document.getElementById('btnCargarResultados');
        if (btnCargarResultados) {
            btnCargarResultados.addEventListener('click', () => {
                const select = document.getElementById('selectResultados');
                const encuestaId = parseInt(select.value);
                this.loadResultados(encuestaId);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter to submit form
            if (e.ctrlKey && e.key === 'Enter') {
                if (ui.currentView === 'encuesta') {
                    this.handleFormSubmit();
                }
            }
            
            // Escape to clear form
            if (e.key === 'Escape') {
                if (ui.currentView === 'encuesta') {
                    ui.limpiarFormulario();
                }
            }
        });

        // Auto-save user ID in localStorage
        const usuarioIDInput = document.getElementById('usuarioID');
        if (usuarioIDInput) {
            // Load saved user ID
            const savedUserID = localStorage.getItem('encuestas_usuario_id');
            if (savedUserID) {
                usuarioIDInput.value = savedUserID;
            }

            // Save user ID on change
            usuarioIDInput.addEventListener('input', (e) => {
                localStorage.setItem('encuestas_usuario_id', e.target.value);
            });
        }
    }

    /**
     * Carga los datos iniciales
     */
    async loadInitialData() {
        ui.showLoading('Cargando encuesta...');
        
        try {
            // Verificar conexión con la API
            const conexionOK = await api.verificarConexion();
            if (!conexionOK) {
                throw new Error('No se puede conectar con la API. Asegúrate de que esté ejecutándose en http://localhost:5088');
            }

            // Cargar la primera encuesta
            await this.loadEncuesta(this.currentEncuestaId);
            
        } catch (error) {
            throw error; // Re-throw para que sea manejado por init()
        }
    }

    /**
     * Carga una encuesta específica
     */
    async loadEncuesta(encuestaId) {
        try {
            console.log(`📋 Cargando encuesta ${encuestaId}...`);
            
            ui.showLoading(`Cargando encuesta ${encuestaId}...`);
            
            const encuesta = await api.obtenerEncuesta(encuestaId);
            
            if (!encuesta) {
                throw new Error(`No se encontró la encuesta ${encuestaId}`);
            }

            console.log('✅ Encuesta cargada:', encuesta);
            
            this.encuestaData = encuesta;
            this.currentEncuestaId = encuestaId;
            ui.currentEncuestaId = encuestaId;
            
            // Renderizar en la UI
            ui.renderEncuesta(encuesta);
            
            ui.showNotification(`Encuesta "${encuesta.titulo}" cargada`, 'success');
            
        } catch (error) {
            console.error('❌ Error al cargar encuesta:', error);
            ui.showError(
                APIUtils.manejarError(error),
                () => this.loadEncuesta(encuestaId)
            );
        }
    }

    /**
     * Cambia a una encuesta diferente
     */
    async switchEncuesta(encuestaId) {
        if (encuestaId === this.currentEncuestaId && ui.currentView === 'encuesta') {
            return; // Ya está cargada
        }

        // Si hay respuestas sin enviar, preguntar al usuario
        if (APIUtils.validarRespuestas()) {
            const confirmar = confirm('Tienes respuestas sin enviar. ¿Estás seguro de cambiar de encuesta?');
            if (!confirmar) {
                return;
            }
        }

        await this.loadEncuesta(encuestaId);
    }

    /**
     * Maneja el envío del formulario
     */
    async handleFormSubmit() {
        try {
            // Validar formulario
            ui.validarFormulario();
            
            // Obtener datos del formulario
            const usuarioID = document.getElementById('usuarioID').value.trim();
            const respuestas = ui.getRespuestas();
            
            console.log('📤 Enviando respuestas:', { usuarioID, respuestas });
            
            // Mostrar estado de envío
            ui.setFormularioEnviando(true);
            
            // Enviar a la API
            const resultado = await api.enviarRespuestas(usuarioID, respuestas);
            
            console.log('✅ Respuestas enviadas exitosamente:', resultado);
            
            // Mostrar mensaje de éxito
            const mensaje = resultado.mensaje || 'Respuestas enviadas exitosamente';
            ui.showSuccess(
                `${mensaje}\n\n👤 Usuario: ${resultado.usuario}\n📝 Respuestas: ${resultado.respuestas_guardadas}`,
                () => {
                    ui.limpiarFormulario();
                    ui.showEncuestaView();
                }
            );

            // Notification
            ui.showNotification('¡Respuestas enviadas correctamente!', 'success');
            
        } catch (error) {
            console.error('❌ Error al enviar respuestas:', error);
            ui.setFormularioEnviando(false);
            ui.showNotification(APIUtils.manejarError(error), 'error');
        }
    }

    /**
     * Muestra la vista de resultados
     */
    async showResultados() {
        ui.showResultadosView();
        
        // Cargar resultados por defecto de la primera encuesta
        await this.loadResultados(1);
    }

    /**
     * Carga los resultados de una encuesta
     */
    async loadResultados(encuestaId) {
        try {
            console.log(`📊 Cargando resultados para encuesta ${encuestaId}...`);
            
            ui.showLoading(`Cargando resultados de la encuesta ${encuestaId}...`);
            
            const resumen = await api.obtenerResumen(encuestaId);
            
            console.log('✅ Resultados cargados:', resumen);
            
            // Mostrar vista de resultados
            ui.showResultadosView();
            
            // Renderizar resultados
            ui.renderResultados(resumen);
            
            ui.showNotification(`Resultados de la encuesta ${encuestaId} cargados`, 'success');
            
        } catch (error) {
            console.error('❌ Error al cargar resultados:', error);
            
            if (ui.currentView === 'resultados') {
                // Si estamos en la vista de resultados, mostrar el error ahí
                const container = document.getElementById('resultadosContainer');
                container.innerHTML = `
                    <div class="resultado-item">
                        <h3>❌ Error al cargar resultados</h3>
                        <p>${APIUtils.manejarError(error)}</p>
                        <button class="btn btn-primary" onclick="app.loadResultados(${encuestaId})">
                            🔄 Reintentar
                        </button>
                    </div>
                `;
            } else {
                ui.showError(
                    APIUtils.manejarError(error),
                    () => this.loadResultados(encuestaId)
                );
            }
        }
    }

    /**
     * Obtiene estadísticas de la aplicación
     */
    getStats() {
        return {
            initialized: this.initialized,
            currentEncuestaId: this.currentEncuestaId,
            currentView: ui.currentView,
            hasEncuestaData: !!this.encuestaData,
            userID: document.getElementById('usuarioID')?.value || null,
            selectedOptions: APIUtils.validarRespuestas() ? ui.getRespuestas().length : 0
        };
    }

    /**
     * Reinicia la aplicación
     */
    async restart() {
        console.log('🔄 Reiniciando aplicación...');
        
        ui.limpiarFormulario();
        this.initialized = false;
        this.encuestaData = null;
        this.currentEncuestaId = 1;
        
        await this.init();
    }

    /**
     * Métodos de debugging
     */
    async debug() {
        console.group('🔧 Debug Info');
        console.log('App Stats:', this.getStats());
        console.log('Current Encuesta Data:', this.encuestaData);
        
        try {
            const diagnostico = await api.obtenerDiagnostico(this.currentEncuestaId);
            console.log('API Diagnóstico:', diagnostico);
        } catch (error) {
            console.warn('No se pudo obtener diagnóstico:', error.message);
        }
        
        console.groupEnd();
    }
}

// Funciones utilitarias globales
window.appUtils = {
    /**
     * Exporta los datos actuales a JSON
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            encuesta: app.encuestaData,
            respuestas: ui.getRespuestas(),
            usuario: document.getElementById('usuarioID')?.value
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `encuesta_${app.currentEncuestaId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        ui.showNotification('Datos exportados', 'success');
    },

    /**
     * Cambia el tema de la aplicación
     */
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        ui.showNotification(`Tema ${isDark ? 'oscuro' : 'claro'} activado`, 'info');
    },

    /**
     * Muestra información del sistema
     */
    showSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            online: navigator.onLine,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            api: API_CONFIG.baseURL,
            timestamp: new Date().toLocaleString()
        };

        console.table(info);
        alert(`Sistema de Encuestas\n\nAPI: ${info.api}\nNavegador: ${info.userAgent.split(' ')[0]}\nResolución: ${info.viewport}\nConexión: ${info.online ? 'Online' : 'Offline'}`);
    }
};

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM cargado, iniciando aplicación...');
    
    // Crear instancia global de la aplicación
    window.app = new EncuestasApp();
    
    // Inicializar
    await app.init();
    
    // Agregar métodos globales para debugging
    window.debugApp = () => app.debug();
    window.restartApp = () => app.restart();
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);
    ui.showNotification('Ha ocurrido un error inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazado:', event.reason);
    ui.showNotification('Error en operación asíncrona', 'error');
});

// Información de la aplicación
console.log(`
🎯 Sistema de Encuestas Académicas
📅 Versión: 1.0.0
🔗 API: ${API_CONFIG.baseURL}
📱 Cargado: ${new Date().toLocaleString()}

Comandos disponibles:
- debugApp() - Información de debug
- restartApp() - Reiniciar aplicación
- appUtils.exportData() - Exportar datos
- appUtils.toggleTheme() - Cambiar tema
- appUtils.showSystemInfo() - Info del sistema
`);
