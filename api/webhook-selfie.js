export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const webhookUrl = process.env.DISCORD_WEBHOOK_SELFIE;
  if (!webhookUrl) return new Response('Webhook URL no configurada', { status: 500 });

  try {
    const formData = await req.formData();
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Discord error: ${response.status} - ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[SELFIE WEBHOOK ERROR]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
