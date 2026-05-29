export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_SELFIE;
    if (!webhookUrl) return new Response('Missing webhook', { status: 500 });

    const formData = await req.formData();
    const file = formData.get('file');
    const payload = JSON.parse(formData.get('payload_json'));

    if (!file) return new Response('No file', { status: 400 });

    // Reenviar a Discord con imagen adjunta
    const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData // FormData se envía tal cual, Discord lo parsea
    });

    return new Response(JSON.stringify({ success: true }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
    });
}
