export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Solo permitir POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_SELFIE;
  
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: 'Webhook no configurado en Vercel' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await request.formData();
    
    // Reenviar a Discord
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord respondió: ${discordResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
