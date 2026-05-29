async function submitSelfie() {
  if (!State.selfieBlob) return;
  show('screen-loading');
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
    
    if (!res.ok) throw new Error(data.error || 'Error desconocido del servidor');
    setTimeout(() => showSuccess('Selfie'), 1000);
  } catch (err) {
    console.error('🚨 Error Selfie:', err);
    alert('❌ No se pudo enviar la selfie.\nMotivo: ' + err.message);
    goHome();
  }
}

async function verifyCode() {
  const code = Array.from(document.querySelectorAll('.code-digit')).map(i => i.value).join('');
  if (code.length !== 6) return alert('Completa los 6 dígitos');

  show('screen-loading');
  document.getElementById('loading-text').textContent = 'Verificando código...';
  State.verificationId = 'VER-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    if (code !== State.generatedCode) throw new Error('El código es incorrecto');

    const res = await fetch('/api/webhook-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: State.email, code, id: State.verificationId })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error al enviar a Discord');
    setTimeout(() => showSuccess('Código'), 1000);
  } catch (err) {
    console.error('🚨 Error Código:', err);
    alert('❌ Error: ' + err.message);
    goHome();
  }
}
