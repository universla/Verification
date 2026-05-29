// Estado global de la aplicación
const AppState = {
    currentMethod: null,
    selfieData: null,
    email: '',
    emailCode: '',
    verificationId: '',
    discordWebhookUrl: '', // Se configura en el backend
    selectedMethod: 'selfie' // 'selfie' o 'email'
};

// Navegación entre pantallas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function selectMethod(method) {
    AppState.selectedMethod = method;

    if (method === 'selfie') {
        showScreen('screen-selfie');
        initCamera();
    } else if (method === 'email') {
        showScreen('screen-email');
    }
}

function goBack() {
    if (document.getElementById('screen-selfie').classList.contains('active') ||
        document.getElementById('screen-email').classList.contains('active')) {
        showScreen('screen-method');
        stopCamera();
    } else {
        showScreen('screen-method');
    }
}

// Generar ID único
function generateVerificationId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'VER-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Formatear fecha
function formatDate() {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Copiar información al portapapeles
function copyVerificationInfo() {
    const info = `
🛡️ VERIFICACIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━
📋 ID: ${AppState.verificationId}
📅 Fecha: ${formatDate()}
📋 Método: ${AppState.selectedMethod === 'selfie' ? 'Selfie' : 'Email'}
━━━━━━━━━━━━━━━━━━━━
Por favor, envía esta información a nuestro soporte en Discord.
    `.trim();

    navigator.clipboard.writeText(info).then(() => {
        alert('✅ Información copiada al portapapeles');
    }).catch(() => {
        alert('No se pudo copiar. Toma una captura de pantalla.');
    });
}

// Abrir Discord
function openDiscord() {
    window.open('https://discord.gg/TU-SERVIDOR', '_blank');
}
