/* 
 * js/app.js - Lógica de Verificación (Selfie & Código)
 * Versión: 3.0 (Corrección de errores de API y Event Listeners)
 */

// 1. ESTADO GLOBAL
const State = {
    method: null,          // 'selfie' o 'code'
    selfieBlob: null,      // La foto capturada
    email: '',             // Email ingresado
    generatedCode: '',     // Código generado para verificación
    verificationId: '',    // ID único de la verificación
    stream: null           // Stream de la cámara
};

// 2. INICIALIZACIÓN AL CARGAR
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ App iniciada correctamente');
    
    // --- Navegación Principal ---
    document.getElementById('btn-selfie').addEventListener('click', startSelfieFlow);
    document.getElementById('btn-code').addEventListener('click', startCodeFlow);
    
    // --- Botones Selfie ---
    document.getElementById('btn-close-selfie').addEventListener('click', goHome);
    document.getElementById('btn-capture').addEventListener('click', capturePhoto);
    document.getElementById('btn-retake-selfie').addEventListener('click', retakePhoto);
    document.getElementById('btn-retry-selfie').addEventListener('click', retakePhoto);
    document.getElementById('btn-use-selfie').addEventListener('click', submitSelfie);

    // --- Botones Código ---
    document.getElementById('btn-close-code').addEventListener('click', goHome);
    document.getElementById('btn-send-code').addEventListener('click', sendCode);
    document.getElementById('btn-back-code').addEventListener('click', () => showScreen('screen-code-input'));
    document.getElementById('btn-resend-code').addEventListener('click', resendCode);
    document.getElementById('btn-verify-code').addEventListener('click', verifyCodeInput);

    // --- Botones Finales ---
    document.getElementById('btn-copy-id').addEventListener('click', copyToClipboard);
    document.getElementById('btn-go-home').addEventListener('click', goHome);

    // Setup input de código
    setupCodeInputs();
});

// 3. FUNCIONES DE NAVEGACIÓN
function showScreen(screenId) {
    // Ocultar todas
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    // Mostrar la deseada
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function goHome() {
    stopCamera();
    State.method = null;
    State.selfieBlob = null;
    State.email = '';
    State.generatedCode = '';
    State.verificationId = '';
    
    // Limpiar inputs
    document.getElementById('email-field').value = '';
    document.querySelectorAll('.code-digit').forEach(i => i.value = '');
    
    showScreen('screen-home');
}

// 4. FLUJO DE SELFIE
function startSelfieFlow() {
    State.method = 'selfie';
    showScreen('screen-selfie-camera');
    initCamera();
}

async function initCamera() {
    try {
        // Pedir cámara frontal
        State.stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        const video = document.getElementById('video-feed');
        video.srcObject = State.stream;
        console.log('📸 Cámara activa');
    } catch (err) {
        console.error('❌ Error cámara:', err);
        alert('No se pudo acceder a la cámara.\nVerifica los permisos o usa HTTPS.');
        goHome();
    }
}

function stopCamera() {
    if (State.stream) {
        State.stream.getTracks().forEach(track => track.stop());
        State.stream = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('video-feed');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar video en canvas
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Convertir a Blob
    canvas.toBlob(blob => {
        State.selfieBlob = blob;
        // Mostrar preview
        const url = URL.createObjectURL(blob);
        document.getElementById('selfie-preview-img').src = url;
        showScreen('screen-selfie-review');
        stopCamera();
    }, 'image/jpeg', 0.85);
}

function retakePhoto() {
    showScreen('screen-selfie-camera');
    initCamera();
}

// --- ENVIAR SELFIE A API (Con manejo de errores robusto) ---
async function submitSelfie() {
    if (!State.selfieBlob) return;
    
    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    showScreen('screen-loading');
    document.getElementById('loading-text').textContent = 'Subiendo selfie a Discord...';

    try {
        const formData = new FormData();
        formData.append('file', State.selfieBlob, 'selfie.jpg');
        formData.append('payload_json', JSON.stringify({
            content: `📸 **Solicitud de Verificación por Selfie**\n🔖 ID: \`${State.verificationId}\`\n📅 ${new Date().toLocaleString('es-ES')}`
        }));

        const res = await fetch('/api/webhook-selfie', {
            method: 'POST',
            body: formData
        });

        // VERIFICACIÓN DE ERROR CRÍTICA
        if (!res.ok) {
            // Si falla, leemos texto plano (probablemente HTML de error de Vercel)
            const errorText = await res.text();
            throw new Error(`API Error (${res.status}): ${errorText.substring(0, 150)}`);
        }

        // Si es OK, esperamos JSON
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        console.log('✅ Selfie enviada');
        setTimeout(() => showSuccess('Selfie'), 1000);

    } catch (err) {
        console.error('🚨 Error grave:', err);
        alert(' ERROR AL ENVIAR:\n\n' + err.message);
        goHome();
    }
}

// 5. FLUJO DE CÓDIGO
function startCodeFlow() {
    State.method = 'code';
    showScreen('screen-code-input');
}

function sendCode() {
    const email = document.getElementById('email-field').value.trim();
    if (!email.includes('@') || !email.includes('.')) {
        return alert('Por favor ingresa un email válido');
    }
    
    State.email = email;
    // Generar código simulado (en producción lo haría el backend)
    State.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔑 Código generado (DEV):', State.generatedCode);
    document.getElementById('code-email-display').textContent = email;
    showScreen('screen-code-verify');
    
    // Focus en el primer input
    setTimeout(() => document.querySelector('.code-digit').focus(), 100);
}

function resendCode() {
    State.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    alert('🔄 Nuevo código generado: ' + State.generatedCode);
}

function setupCodeInputs() {
    const inputs = document.querySelectorAll('.code-digit');
    inputs.forEach((input, i) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && i < inputs.length - 1) {
                inputs[i + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                inputs[i - 1].focus();
            }
        });
    });
}

async function verifyCodeInput() {
    const inputs = document.querySelectorAll('.code-digit');
    const code = Array.from(inputs).map(i => i.value).join('');
    
    if (code.length !== 6) return alert('Completa los 6 dígitos');

    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    showScreen('screen-loading');
    document.getElementById('loading-text').textContent = 'Verificando código...';

    try {
        // Validación local
        if (code !== State.generatedCode) {
            throw new Error('El código es incorrecto.');
        }

        // Enviar a API Discord
        const res = await fetch('/api/webhook-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: State.email,
                code: code,
                id: State.verificationId
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API Error (${res.status}): ${errorText.substring(0, 150)}`);
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        console.log('✅ Código verificado');
        setTimeout(() => showSuccess('Código'), 1000);

    } catch (err) {
        console.error('🚨 Error código:', err);
        alert('❌ ERROR:\n\n' + err.message);
        goHome();
    }
}

// 6. PANTALLA FINAL
function showSuccess(type) {
    const desc = type === 'Selfie' 
        ? 'Tu selfie ha sido enviada al soporte.' 
        : 'Código verificado correctamente.';
    
    document.getElementById('success-desc').textContent = desc;
    document.getElementById('success-id').textContent = State.verificationId;
    showScreen('screen-success');
}

function copyToClipboard() {
    const id = document.getElementById('success-id').textContent;
    navigator.clipboard.writeText(`ID: ${id}`);
    alert(' ID copiado al portapapeles');
}
