export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_SELFIE;
  
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: 'DISCORD_WEBHOOK_SELFIE not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await request.formData();
    
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Selfie sent to Discord' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[SELFIE WEBHOOK ERROR]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
