export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Solo POST' }, { status: 405 });
  }

  const webhook = process.env.DISCORD_WEBHOOK_SELFIE;
  if (!webhook) {
    return Response.json({ error: 'Falta webhook' }, { status: 500 });
  }

  const formData = await req.formData();
  await fetch(webhook, { method: 'POST', body: formData });
  
  return Response.json({ success: true });
}
