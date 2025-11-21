/**
 * DIABRED BOLIVIA - Chatbot Interactivo
 * Chatbot educativo sobre diabetes
 */

class DiabredChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatUI();
        this.addWelcomeMessage();
        this.setupEventListeners();
    }

    createChatUI() {
        // Crear contenedor del chat
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatbot-container';
        chatContainer.innerHTML = `
            <div id="chatbot-toggle" class="chatbot-toggle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="chatbot-badge">1</span>
            </div>
            <div id="chatbot-window" class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">🤖</div>
                        <div>
                            <h3>Asistente DIABRED</h3>
                            <p class="chatbot-status">En línea</p>
                        </div>
                    </div>
                    <button id="chatbot-close" class="chatbot-close">×</button>
                </div>
                <div id="chatbot-messages" class="chatbot-messages"></div>
                <div class="chatbot-input-container">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        class="chatbot-input" 
                        placeholder="Escribe tu pregunta sobre diabetes..."
                        autocomplete="off"
                    >
                    <button id="chatbot-send" class="chatbot-send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div class="chatbot-quick-actions">
                    <button class="quick-action-btn" data-question="¿Qué es la diabetes?">¿Qué es la diabetes?</button>
                    <button class="quick-action-btn" data-question="¿Cómo usar la herramienta?">¿Cómo usar la herramienta?</button>
                    <button class="quick-action-btn" data-question="¿Dónde están los artículos?">Artículos médicos</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);
    }

    addWelcomeMessage() {
        const welcomeMsg = {
            type: 'bot',
            text: '¡Hola! 👋 Soy el asistente de DIABRED BOLIVIA. Puedo ayudarte con información sobre diabetes, la herramienta interactiva, artículos médicos y más. ¿En qué puedo ayudarte?',
            timestamp: new Date()
        };
        this.addMessage(welcomeMsg);
    }

    setupEventListeners() {
        // Toggle chat
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChat();
        });

        // Cerrar chat
        document.getElementById('chatbot-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Enviar mensaje
        document.getElementById('chatbot-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter para enviar
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Botones de acción rápida
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                document.getElementById('chatbot-input').value = question;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            toggle.classList.add('active');
            document.getElementById('chatbot-input').focus();
            this.scrollToBottom();
        } else {
            chatWindow.classList.remove('open');
            toggle.classList.remove('active');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.remove('open');
        document.getElementById('chatbot-toggle').classList.remove('active');
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const userMessage = input.value.trim();

        if (!userMessage) return;

        // Agregar mensaje del usuario
        this.addMessage({
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        });

        // Limpiar input
        input.value = '';

        // Simular typing
        this.showTyping();

        // Responder después de un breve delay
        setTimeout(() => {
            this.hideTyping();
            const response = this.getResponse(userMessage);
            this.addMessage({
                type: 'bot',
                text: response.text,
                timestamp: new Date(),
                actions: response.actions
            });
        }, 1000 + Math.random() * 1000);
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    }

    addMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;

        const time = this.formatTime(message.timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message.type === 'bot' ? '<div class="message-avatar">🤖</div>' : ''}
                <div class="message-bubble">
                    <p>${this.formatMessage(message.text)}</p>
                    <span class="message-time">${time}</span>
                </div>
                ${message.type === 'user' ? '<div class="message-avatar user">👤</div>' : ''}
            </div>
            ${message.actions ? this.createActionButtons(message.actions) : ''}
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    createActionButtons(actions) {
        let buttonsHTML = '<div class="message-actions">';
        actions.forEach(action => {
            buttonsHTML += `<button class="action-btn" data-action="${action.action}">${action.label}</button>`;
        });
        buttonsHTML += '</div>';

        // Agregar event listeners después de crear los botones
        setTimeout(() => {
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data-action');
                    this.handleAction(action);
                });
            });
        }, 100);

        return buttonsHTML;
    }

    handleAction(action) {
        switch(action) {
            case 'open-tool':
                this.closeChat();
                document.getElementById('herramienta').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'open-articles':
                this.closeChat();
                document.getElementById('articulos').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'open-team':
                this.closeChat();
                document.getElementById('equipo').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'what-is-diabetes':
                this.addMessage({
                    type: 'bot',
                    text: 'La diabetes mellitus es un grupo de enfermedades crónicas que afectan la forma en que nuestro cuerpo procesa el azúcar (glucosa). Puedes leer más en la sección "¿Qué es la Diabetes Mellitus?" de la página.',
                    timestamp: new Date()
                });
                break;
        }
    }

    formatMessage(text) {
        // Convertir URLs a enlaces
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        // Convertir secciones mencionadas a enlaces
        text = text.replace(/sección "([^"]+)"/g, 'sección "<a href="#$1" onclick="document.getElementById(\'$1\').scrollIntoView({behavior:\'smooth\'}); return false;">$1</a>"');
        return text;
    }

    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Respuestas sobre qué es la diabetes
        if (message.includes('qué es') && (message.includes('diabetes') || message.includes('diab'))) {
            return {
                text: 'La diabetes mellitus es un grupo de enfermedades crónicas que afectan la forma en que nuestro cuerpo procesa el azúcar (glucosa) de los alimentos. En condiciones normales, la insulina (una hormona producida por el páncreas) permite que la glucosa entre a las células para ser utilizada como energía. En la diabetes, este proceso no funciona correctamente.\n\n¿Te gustaría saber más sobre los tipos de diabetes o cómo se diagnostica?',
                actions: [
                    { label: 'Ver sección completa', action: 'what-is-diabetes' }
                ]
            };
        }

        // Tipos de diabetes
        if (message.includes('tipo') && message.includes('diabetes')) {
            return {
                text: 'Existen varios tipos de diabetes:\n\n• **Tipo 1**: Debida a destrucción autoinmune de células beta, requiere insulina.\n• **Tipo 2**: Debida a pérdida progresiva de secreción de insulina, frecuentemente con resistencia a la insulina.\n• **Diabetes Gestacional**: Diagnosticada durante el embarazo.\n• **Tipos Específicos**: Incluyen diabetes monogénica, enfermedades del páncreas, etc.\n\nPuedes leer más detalles en la sección "Clasificación Clínica" de la página.',
                actions: [
                    { label: 'Ver clasificación', action: 'what-is-diabetes' }
                ]
            };
        }

        // Herramienta interactiva
        if (message.includes('herramienta') || message.includes('predictor') || message.includes('calcular')) {
            return {
                text: 'La herramienta interactiva es un **Predictor Educativo de Riesgo Glucémico** que te ayuda a comprender cómo tus hábitos diarios impactan en tu control glucémico.\n\nPara usarla:\n1. Ve a la sección "Herramienta" en el menú\n2. Completa el formulario con tus datos (horas desde última comida, actividad física, estrés, sueño)\n3. Haz clic en "Calcular Riesgo"\n4. Revisa el análisis y recomendaciones\n\n⚠️ **Importante**: Es solo educativa, no reemplaza la consulta médica.',
                actions: [
                    { label: 'Abrir herramienta', action: 'open-tool' }
                ]
            };
        }

        // Artículos
        if (message.includes('artículo') || message.includes('pdf') || message.includes('documento')) {
            return {
                text: 'Tenemos varios artículos médicos disponibles en formato PDF:\n\n• Diagnóstico y Clasificación de la DM\n• DM en Bolivia\n• Epidemiología de la DM\n• Epidemiología Genética\n• Tratamiento Farmacológico DM Tipo 2\n• Tratamiento No Farmacológico DM Tipo 2\n\nTodos están disponibles en la sección "Artículos Médicos" y puedes verlos o descargarlos directamente.',
                actions: [
                    { label: 'Ver artículos', action: 'open-articles' }
                ]
            };
        }

        // Tratamiento
        if (message.includes('tratamiento') || message.includes('medicamento') || message.includes('medicina')) {
            return {
                text: 'El tratamiento de la diabetes es integral e incluye:\n\n• **Educación**: Aprender a reconocer hipoglucemia, inyectar insulina, ajustar alimentación\n• **Medicamentos**: Dependen del tipo de diabetes (insulina para tipo 1, metformina u otros para tipo 2)\n• **Revisión regular**: Controles de ojos, riñones, pies y corazón\n• **Dieta y ejercicio**: Alimentación balanceada y actividad física regular\n\nPuedes leer más detalles en la sección "Tratamiento y Enfoque Integral" de la página.'
            };
        }

        // Dieta
        if (message.includes('dieta') || message.includes('alimentación') || message.includes('comida') || message.includes('qué comer')) {
            return {
                text: 'La alimentación para diabetes no es una lista de prohibiciones. Recomendamos:\n\n• **Método del plato**: 1/2 verduras, 1/4 proteína, 1/4 carbohidratos complejos\n• **Alimentos beneficiosos**: Fibra soluble (avena, lentejas), grasas saludables (aguacate, pescado), proteínas vegetales\n• **Limitar**: Bebidas azucaradas, alimentos ultraprocesados, frituras frecuentes\n• **Combinar con**: Actividad física, sueño de calidad, manejo del estrés\n\nLee más en la sección "Dieta y Recomendaciones Prácticas".'
            };
        }

        // Síntomas
        if (message.includes('síntoma') || message.includes('signo') || message.includes('cómo saber')) {
            return {
                text: 'Los síntomas clásicos de diabetes incluyen:\n\n• Poliuria (orinar frecuentemente)\n• Polidipsia (sed excesiva)\n• Pérdida de peso\n• Fatiga\n• Visión borrosa\n\nSi presentas estos síntomas, consulta con un médico. El diagnóstico se realiza mediante análisis de sangre (glucemia en ayunas, HbA1c, OGTT).'
            };
        }

        // Equipo médico
        if (message.includes('equipo') || message.includes('doctor') || message.includes('médico') || message.includes('contacto')) {
            return {
                text: 'El equipo médico de DIABRED BOLIVIA está formado por 7 profesionales especializados:\n\n• Dr. Gunder Rolando Aguirre Nina\n• Dr. Hilder Yambal Limachi Huanca\n• Dr. Jaime Marcelo Medina Vera\n• Dr. Willy Claudio Tarifa Aliaga\n• Dr. Franck Edgardo Chacón Bozo\n• Dra. Daniela Sara Conde Ortega\n• Dr. Wilfredo Tancara Cuentas\n\nPuedes ver más información en la sección "Equipo Médico".',
                actions: [
                    { label: 'Ver equipo', action: 'open-team' }
                ]
            };
        }

        // Prevención
        if (message.includes('prevención') || message.includes('complicación') || message.includes('evitar')) {
            return {
                text: 'La prevención de complicaciones incluye:\n\n• **Ojos**: Retinografía anual, control de HbA1c\n• **Riñones**: Análisis de orina anual, control de presión arterial\n• **Pies**: Inspección diaria, evaluación con monofilamento\n• **Corazón**: Control de colesterol, presión arterial, ECG si es necesario\n\nLa clave es detectar a tiempo, no esperar a que aparezcan síntomas. Lee más en la sección "Tratamiento y Enfoque Integral".'
            };
        }

        // Saludos
        if (message.includes('hola') || message.includes('buenos días') || message.includes('buenas tardes') || message.includes('hi')) {
            return {
                text: '¡Hola! 👋 Bienvenido a DIABRED BOLIVIA. Estoy aquí para ayudarte con información sobre diabetes, la herramienta interactiva, artículos médicos y más. ¿En qué puedo ayudarte?',
                actions: [
                    { label: '¿Qué es la diabetes?', action: 'what-is-diabetes' },
                    { label: 'Usar herramienta', action: 'open-tool' }
                ]
            };
        }

        // Ayuda
        if (message.includes('ayuda') || message.includes('help') || message.includes('qué puedo')) {
            return {
                text: 'Puedo ayudarte con:\n\n• Información sobre diabetes y sus tipos\n• Cómo usar la herramienta interactiva\n• Acceso a artículos médicos\n• Información sobre tratamiento y dieta\n• Síntomas y prevención\n• Información del equipo médico\n\nSolo pregunta lo que necesites. También puedes usar los botones de acción rápida.',
                actions: [
                    { label: 'Abrir herramienta', action: 'open-tool' },
                    { label: 'Ver artículos', action: 'open-articles' }
                ]
            };
        }

        // Respuesta por defecto
        return {
            text: 'Gracias por tu pregunta. Puedo ayudarte con información sobre:\n\n• ¿Qué es la diabetes?\n• Tipos de diabetes\n• La herramienta interactiva\n• Artículos médicos\n• Tratamiento y dieta\n• Síntomas y prevención\n• Equipo médico\n\n¿Hay algo específico sobre lo que te gustaría saber más?',
            actions: [
                { label: 'Ver herramienta', action: 'open-tool' },
                { label: 'Ver artículos', action: 'open-articles' }
            ]
        };
    }
}

// Inicializar chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.diabredChatbot = new DiabredChatbot();
});

