// Manejo de la interfaz de usuario
class UIManager {
    constructor() {
        this.currentView = 'encuesta';
        this.currentEncuestaId = 1;
        this.elements = {};
        this.initializeElements();
    }

    /**
     * Inicializa las referencias a elementos del DOM
     */
    initializeElements() {
        this.elements = {
            // Views
            loading: document.getElementById('loading'),
            errorMessage: document.getElementById('errorMessage'),
            successMessage: document.getElementById('successMessage'),
            encuestaView: document.getElementById('encuestaView'),
            resultadosView: document.getElementById('resultadosView'),

            // Navigation
            navButtons: document.querySelectorAll('.nav-btn'),
            btnResultados: document.getElementById('btnResultados'),

            // Encuesta elements
            encuestaTitulo: document.getElementById('encuestaTitulo'),
            encuestaDescripcion: document.getElementById('encuestaDescripcion'),
            preguntasContainer: document.getElementById('preguntasContainer'),
            encuestaForm: document.getElementById('encuestaForm'),
            usuarioID: document.getElementById('usuarioID'),
            btnEnviar: document.getElementById('btnEnviar'),
            btnReset: document.getElementById('btnReset'),

            // Results elements
            selectResultados: document.getElementById('selectResultados'),
            btnCargarResultados: document.getElementById('btnCargarResultados'),
            resultadosContainer: document.getElementById('resultadosContainer'),

            // Messages
            errorText: document.getElementById('errorText'),
            successText: document.getElementById('successText'),
            btnRetry: document.getElementById('btnRetry'),
            btnContinuar: document.getElementById('btnContinuar')
        };
    }

    /**
     * Muestra el indicador de carga
     */
    showLoading(message = 'Cargando...') {
        this.hideAllViews();
        this.elements.loading.querySelector('p').textContent = message;
        this.elements.loading.classList.remove('hidden');
    }

    /**
     * Oculta el indicador de carga
     */
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    /**
     * Muestra un mensaje de error
     */
    showError(message, onRetry = null) {
        this.hideAllViews();
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        
        if (onRetry) {
            this.elements.btnRetry.onclick = onRetry;
            this.elements.btnRetry.style.display = 'inline-flex';
        } else {
            this.elements.btnRetry.style.display = 'none';
        }
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccess(message, onContinue = null) {
        this.hideAllViews();
        this.elements.successText.textContent = message;
        this.elements.successMessage.classList.remove('hidden');
        
        if (onContinue) {
            this.elements.btnContinuar.onclick = onContinue;
        } else {
            this.elements.btnContinuar.onclick = () => this.showEncuestaView();
        }
    }

    /**
     * Oculta todos los views
     */
    hideAllViews() {
        this.elements.loading.classList.add('hidden');
        this.elements.errorMessage.classList.add('hidden');
        this.elements.successMessage.classList.add('hidden');
        this.elements.encuestaView.classList.add('hidden');
        this.elements.resultadosView.classList.add('hidden');
    }

    /**
     * Muestra la vista de encuesta
     */
    showEncuestaView() {
        this.hideAllViews();
        this.elements.encuestaView.classList.remove('hidden');
        this.currentView = 'encuesta';
        this.updateNavigation();
    }

    /**
     * Muestra la vista de resultados
     */
    showResultadosView() {
        this.hideAllViews();
        this.elements.resultadosView.classList.remove('hidden');
        this.currentView = 'resultados';
        this.updateNavigation();
    }

    /**
     * Actualiza el estado de los botones de navegación
     */
    updateNavigation() {
        // Remover clase active de todos los botones
        this.elements.navButtons.forEach(btn => btn.classList.remove('active'));

        if (this.currentView === 'resultados') {
            this.elements.btnResultados.classList.add('active');
        } else {
            // Marcar como activo el botón de la encuesta actual
            const btnEncuesta = document.querySelector(`[data-encuesta="${this.currentEncuestaId}"]`);
            if (btnEncuesta) {
                btnEncuesta.classList.add('active');
            }
        }
    }

    /**
     * Renderiza una encuesta en la interfaz
     */
    renderEncuesta(encuesta) {
        // Actualizar información de la encuesta
        this.elements.encuestaTitulo.textContent = encuesta.titulo || 'Encuesta sin título';
        this.elements.encuestaDescripcion.textContent = encuesta.descripcion || 'Sin descripción';

        // Limpiar contenedor de preguntas
        this.elements.preguntasContainer.innerHTML = '';

        // Renderizar cada pregunta
        encuesta.preguntas.forEach((pregunta, index) => {
            const preguntaElement = this.createPreguntaElement(pregunta, index + 1);
            this.elements.preguntasContainer.appendChild(preguntaElement);
        });

        // Limpiar usuario ID
        this.elements.usuarioID.value = '';

        // Mostrar vista
        this.showEncuestaView();

        // Agregar animación
        this.elements.encuestaView.classList.add('fade-in');
    }

    /**
     * Crea el elemento HTML para una pregunta
     */
    createPreguntaElement(pregunta, numero) {
        const preguntaDiv = document.createElement('div');
        preguntaDiv.className = 'pregunta';

        const titulo = document.createElement('div');
        titulo.className = 'pregunta-titulo';
        titulo.innerHTML = `
            <span class="pregunta-numero">${numero}</span>
            <span>${pregunta.textoPregunta || 'Pregunta sin texto'}</span>
        `;

        const opcionesContainer = document.createElement('div');
        opcionesContainer.className = 'opciones-container';

        // Crear opciones
        pregunta.opciones.forEach(opcion => {
            const opcionElement = this.createOpcionElement(opcion, pregunta.preguntaID);
            opcionesContainer.appendChild(opcionElement);
        });

        preguntaDiv.appendChild(titulo);
        preguntaDiv.appendChild(opcionesContainer);

        return preguntaDiv;
    }

    /**
     * Crea el elemento HTML para una opción
     */
    createOpcionElement(opcion, preguntaId) {
        const opcionDiv = document.createElement('div');
        opcionDiv.className = 'opcion';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `opcion_${opcion.opcionID}`;
        checkbox.value = opcion.opcionID;
        checkbox.name = `pregunta_${preguntaId}`;

        const label = document.createElement('label');
        label.setAttribute('for', `opcion_${opcion.opcionID}`);
        label.textContent = opcion.textoOpcion || 'Opción sin texto';

        opcionDiv.appendChild(checkbox);
        opcionDiv.appendChild(label);

        // Hacer que toda la opción sea clickeable
        opcionDiv.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });

        return opcionDiv;
    }

    /**
     * Renderiza los resultados de una encuesta
     */
    renderResultados(resumen) {
        this.elements.resultadosContainer.innerHTML = '';

        if (!resumen || typeof resumen !== 'object') {
            this.elements.resultadosContainer.innerHTML = `
                <div class="resultado-item">
                    <p>No se pudieron cargar los resultados.</p>
                </div>
            `;
            return;
        }

        // Si el resumen es un JSON string, parsearlo
        let data = resumen;
        if (typeof resumen === 'string') {
            try {
                data = JSON.parse(resumen);
            } catch (e) {
                console.error('Error parsing resumen JSON:', e);
                this.elements.resultadosContainer.innerHTML = `
                    <div class="resultado-item">
                        <p>Error al procesar los resultados.</p>
                    </div>
                `;
                return;
            }
        }

        // Crear elemento de resumen general
        const resumenGeneral = this.createResumenGeneral(data);
        this.elements.resultadosContainer.appendChild(resumenGeneral);

        // Si hay preguntas específicas en el resumen
        if (data.preguntas && Array.isArray(data.preguntas)) {
            data.preguntas.forEach(pregunta => {
                const preguntaElement = this.createResultadoPregunta(pregunta);
                this.elements.resultadosContainer.appendChild(preguntaElement);
            });
        }

        // Agregar animación
        this.elements.resultadosContainer.classList.add('fade-in');
    }

    /**
     * Crea el resumen general
     */
    createResumenGeneral(data) {
        const div = document.createElement('div');
        div.className = 'resultado-item';

        // Calcular porcentaje general (mock)
        const porcentajeGeneral = Math.random() * 100; // Reemplazar con cálculo real
        const indicador = APIUtils.obtenerIndicador(porcentajeGeneral);

        div.innerHTML = `
            <div class="resultado-header">
                <h3 class="resultado-pregunta">📊 Resumen General</h3>
                <span class="resultado-indicador">${indicador.emoji}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${indicador.color}" style="width: ${porcentajeGeneral}%"></div>
            </div>
            <div class="resultado-stats">
                <div class="stat-item">
                    <div class="stat-value">${APIUtils.formatearPorcentaje(porcentajeGeneral)}</div>
                    <div class="stat-label">Satisfacción General</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.floor(Math.random() * 100) + 50}</div>
                    <div class="stat-label">Total Respuestas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${indicador.texto}</div>
                    <div class="stat-label">Evaluación</div>
                </div>
            </div>
        `;

        return div;
    }

    /**
     * Crea el resultado para una pregunta específica
     */
    createResultadoPregunta(pregunta) {
        const div = document.createElement('div');
        div.className = 'resultado-item';

        // Calcular porcentaje para esta pregunta (mock)
        const porcentaje = Math.random() * 100;
        const indicador = APIUtils.obtenerIndicador(porcentaje);

        div.innerHTML = `
            <div class="resultado-header">
                <h4 class="resultado-pregunta">${pregunta.texto || 'Pregunta'}</h4>
                <span class="resultado-indicador">${indicador.emoji}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${indicador.color}" style="width: ${porcentaje}%"></div>
            </div>
            <div class="resultado-stats">
                <div class="stat-item">
                    <div class="stat-value">${APIUtils.formatearPorcentaje(porcentaje)}</div>
                    <div class="stat-label">Puntuación</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.floor(Math.random() * 50) + 10}</div>
                    <div class="stat-label">Respuestas</div>
                </div>
            </div>
        `;

        return div;
    }

    /**
     * Obtiene las respuestas del formulario
     */
    getRespuestas() {
        return APIUtils.formatearRespuestas();
    }

    /**
     * Valida las respuestas del formulario
     */
    validarFormulario() {
        const usuarioID = this.elements.usuarioID.value.trim();
        const hayRespuestas = APIUtils.validarRespuestas();

        if (!usuarioID) {
            throw new Error('Por favor, ingresa tu ID de usuario');
        }

        if (!hayRespuestas) {
            throw new Error('Por favor, selecciona al menos una opción');
        }

        return true;
    }

    /**
     * Limpia el formulario
     */
    limpiarFormulario() {
        // Limpiar checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        // Limpiar usuario ID
        this.elements.usuarioID.value = '';
    }

    /**
     * Deshabilita el formulario durante el envío
     */
    setFormularioEnviando(enviando = true) {
        const formElements = this.elements.encuestaForm.querySelectorAll('input, button');
        
        formElements.forEach(element => {
            element.disabled = enviando;
        });

        if (enviando) {
            this.elements.btnEnviar.textContent = '⏳ Enviando...';
        } else {
            this.elements.btnEnviar.textContent = '📤 Enviar Respuestas';
        }
    }

    /**
     * Muestra una notificación temporal
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remover después del tiempo especificado
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Crear instancia global del UI Manager
const ui = new UIManager();

// Exportar para uso global
window.UIManager = UIManager;
window.ui = ui;
