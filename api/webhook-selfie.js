export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Solo POST' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const webhook = process.env.DISCORD_WEBHOOK_SELFIE
  if (!webhook) {
    return new Response(
      JSON.stringify({ error: 'Falta configurar webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const formData = await req.formData()
    await fetch(webhook, { method: 'POST', body: formData })
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
