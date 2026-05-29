export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Solo POST' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const webhook = process.env.DISCORD_WEBHOOK_CODE
  if (!webhook) {
    return new Response(
      JSON.stringify({ error: 'Falta configurar webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Verification',
        embeds: [{
          title: '✅ Verified',
          color: 0x2ecc71,
          fields: [
            { name: 'ID', value: body.id },
            { name: 'Email', value: body.email }
          ]
        }]
      })
    })
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
