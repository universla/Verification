export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_SELFIE
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: 'Webhook URL missing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const formData = await req.formData()
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Discord rejected the request')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Selfie webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
