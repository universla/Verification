// Estado global
const State = {
    method: null,
    selfieBlob: null,
    email: '',
    generatedCode: '',
    verificationId: '',
    stream: null
};

// Navegación
function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function goHome() {
    stopCamera();
    show('screen-home');
    State.method = null;
}

// Iniciar flujo
function startFlow(type) {
    State.method = type;
    if (type === 'selfie') {
        show('screen-selfie-camera');
        initCamera();
    } else {
        show('screen-code-input');
        document.getElementById('email-field').value = '';
    }
}

// === CÁMARA / SELFIE ===
async function initCamera() {
    try {
        State.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        document.getElementById('video-feed').srcObject = State.stream;
    } catch (e) {
        alert('No se pudo acceder a la cámara. Permisos denegados.');
    }
}
function stopCamera() {
    if (State.stream) State.stream.getTracks().forEach(t => t.stop());
}

function capturePhoto() {
    const video = document.getElementById('video-feed');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(blob => {
        State.selfieBlob = blob;
        document.getElementById('selfie-preview-img').src = URL.createObjectURL(blob);
        show('screen-selfie-review');
        stopCamera();
    }, 'image/jpeg', 0.85);
}

function retakePhoto() {
    show('screen-selfie-camera');
    initCamera();
}

async function submitSelfie() {
    if (!State.selfieBlob) return;
    show('screen-loading');
    document.getElementById('loading-text').textContent = 'Enviando selfie a Discord...';
    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
        // Enviar a API
        const formData = new FormData();
        formData.append('file', State.selfieBlob, 'selfie.jpg');
        formData.append('payload_json', JSON.stringify({
            content: `📸 **Solicitud de Verificación por Selfie**\n🔖 ID: \`${State.verificationId}\`\n📅 ${new Date().toLocaleString('es-ES')}`
        }));

        await fetch('/api/webhook-selfie', { method: 'POST', body: formData });
        
        setTimeout(() => showSuccess('Selfie'), 1200);
    } catch (e) {
        alert('Error al enviar. Intenta de nuevo.');
        goHome();
    }
}

// === CÓDIGO ===
function sendCode() {
    const email = document.getElementById('email-field').value.trim();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert('Email inválido');
    
    State.email = email;
    State.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // En producción: fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ email, code: State.generatedCode }) })
    console.log('🔑 Código generado (DEV):', State.generatedCode);
    
    document.getElementById('code-email-display').textContent = email;
    show('screen-code-verify');
    document.querySelector('.code-digit').focus();
}

function retakeEmail() {
    show('screen-code-input');
}

function resendCode() {
    sendCode();
    alert('Nuevo código enviado.');
}

// Auto-focus code inputs
document.querySelectorAll('.code-digit').forEach((input, idx, arr) => {
    input.addEventListener('input', e => {
        if (e.target.value.length === 1 && idx < 5) arr[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) arr[idx - 1].focus();
    });
});

async function verifyCode() {
    const code = Array.from(document.querySelectorAll('.code-digit')).map(i => i.value).join('');
    if (code.length !== 6) return alert('Completa los 6 dígitos');

    show('screen-loading');
    document.getElementById('loading-text').textContent = 'Verificando código...';
    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
        // Verificar (en producción, comparar contra backend)
        if (code !== State.generatedCode) throw new Error('Código incorrecto');

        await fetch('/api/webhook-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: State.email,
                code: code,
                id: State.verificationId
            })
        });

        setTimeout(() => showSuccess('Código'), 1000);
    } catch (e) {
        alert(e.message || 'Código incorrecto. Verifica tu bandeja de entrada.');
        goHome();
    }
}

// === ÉXITO ===
function showSuccess(type) {
    document.getElementById('success-desc').textContent = 
        type === 'Selfie' 
        ? 'Tu selfie ha sido enviada. El equipo de soporte la revisará en Discord.'
        : 'Código verificado correctamente. Tu cuenta está en proceso de activación.';
    document.getElementById('success-id').textContent = State.verificationId;
    show('screen-success');
}

function copyToClipboard() {
    const id = document.getElementById('success-id').textContent;
    navigator.clipboard.writeText(`ID Verificación: ${id}`);
    alert('✅ Copiado al portapapeles');
}
