// ===== CÁMARA / SELFIE =====
let cameraStream = null;

async function initCamera() {
    try {
        const video = document.getElementById('camera-preview');
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        video.srcObject = cameraStream;
    } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function captureSelfie() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('selfie-preview');
    const img = document.getElementById('captured-selfie');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convertir a base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Mostrar preview
    img.src = imageData;
    preview.style.display = 'flex';
    video.style.display = 'none';

    AppState.selfieData = imageData;

    // Actualizar botones
    document.getElementById('btn-capture').style.display = 'none';
    document.getElementById('btn-retake').style.display = 'block';
    document.getElementById('btn-submit-selfie').style.display = 'block';
}

function retakeSelfie() {
    const video = document.getElementById('camera-preview');
    const preview = document.getElementById('selfie-preview');

    preview.style.display = 'none';
    video.style.display = 'block';

    document.getElementById('btn-capture').style.display = 'block';
    document.getElementById('btn-retake').style.display = 'none';
    document.getElementById('btn-submit-selfie').style.display = 'none';

    AppState.selfieData = null;
}

async function submitSelfie() {
    if (!AppState.selfieData) {
        alert('Por favor, toma una selfie primero.');
        return;
    }

    showScreen('screen-processing');
    document.getElementById('processing-text').textContent = 'Enviando selfie al equipo de soporte...';

    try {
        AppState.verificationId = generateVerificationId();

        // Enviar webhook a Discord
        await fetch('/api/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'selfie',
                verificationId: AppState.verificationId,
                selfieData: AppState.selfieData,
                timestamp: formatDate(),
                method: 'Selfie de Verificación'
            })
        });

        await simulateProcessing(2000);
        showSuccessScreen('Selfie');
    } catch (error) {
        console.error('Error:', error);
        showScreen('screen-failed');
    }
}

// ===== EMAIL =====
function sendEmailCode() {
    const email = document.getElementById('email-input').value.trim();

    if (!email || !isValidEmail(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    AppState.email = email;

    // Generar código aleatorio de 6 dígitos
    AppState.emailCode = Math.floor(100000 + Math.random() * 900000).toString();

    // En producción, enviar al backend para envío real de email
    // Por ahora, simulamos el envío
    sendEmailCodeAPI(email, AppState.emailCode);
}

async function sendEmailCodeAPI(email, code) {
    try {
        const response = await fetch('/api/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        if (response.ok) {
            showEmailStep2(email);
        } else {
            alert('Error al enviar el código. Intenta de nuevo.');
        }
    } catch (error) {
        // Fallback para demo
        console.log('Código generado (demo):', code);
        showEmailStep2(email);
    }
}

function showEmailStep2(email) {
    document.getElementById('email-step-1').style.display = 'none';
    document.getElementById('email-step-2').style.display = 'block';
    document.getElementById('email-display').textContent = email;
}

function verifyEmailCode() {
    const inputCode = document.getElementById('code-input').value.trim();

    if (!inputCode) {
        alert('Ingresa el código de verificación.');
        return;
    }

    // En producción, verificar con el backend
    verifyEmailCodeAPI(inputCode);
}

async function verifyEmailCodeAPI(code) {
    showScreen('screen-processing');
    document.getElementById('processing-text').textContent = 'Verificando código...';

    try {
        const response = await fetch('/api/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: AppState.email,
                code: code,
                expectedCode: AppState.emailCode // En producción, esto viene del servidor
            })
        });

        const data = await response.json();

        if (data.success || code === AppState.emailCode) {
            AppState.verificationId = generateVerificationId();

            // Enviar webhook de verificación por email
            await fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'email',
                    verificationId: AppState.verificationId,
                    email: AppState.email,
                    timestamp: formatDate(),
                    method: 'Verificación por Email'
                })
            });

            await simulateProcessing(1500);
            showSuccessScreen('Email');
        } else {
            showScreen('screen-failed');
            document.getElementById('fail-reason').textContent =
                'El código ingresado es incorrecto. Verifica tu correo e intenta de nuevo.';
        }
    } catch (error) {
        // Fallback para demo
        if (code === AppState.emailCode) {
            AppState.verificationId = generateVerificationId();
            showSuccessScreen('Email');
        } else {
            showScreen('screen-failed');
        }
    }
}

function resendCode() {
    AppState.emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    sendEmailCodeAPI(AppState.email, AppState.emailCode);
    alert('Nuevo código enviado (demo: ' + AppState.emailCode + ')');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== PANTALLA DE ÉXITO =====
function showSuccessScreen(methodName) {
    document.getElementById('verify-method-text').textContent = methodName;
    document.getElementById('verify-date').textContent = formatDate();
    document.getElementById('verify-id').textContent = AppState.verificationId;
    document.getElementById('verify-method').textContent =
        AppState.selectedMethod === 'selfie' ? '📸 Selfie' : '📧 Email';

    showScreen('screen-success');
}

// Simular procesamiento
function simulateProcessing(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
