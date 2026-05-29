export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Solo POST' }, { status: 405 })
  }

  const url = process.env.DISCORD_WEBHOOK_CODE
  if (!url) {
    return Response.json({ error: 'Falta webhook' }, { status: 500 })
  }

  const body = await req.json()
  await fetch(url, {
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
  
  return Response.json({ success: true })
}
