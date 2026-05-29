export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { email, code } = await req.json();

    // Opción 1: Usar Resend (recomendado para Vercel)
    if (process.env.RESEND_API_KEY) {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Verificación <noreply@tudominio.com>',
                to: [email],
                subject: '🔐 Tu Código de Verificación',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #5865F2, #4752c4); padding: 30px; border-radius: 16px; text-align: center; color: white;">
                            <h1 style="margin: 0 0 10px;">🔐 Código de Verificación</h1>
                            <p style="opacity: 0.9; margin: 0 0 20px;">Tu código de verificación es:</p>
                            <div style="background: rgba(255,255,255,0.2); padding: 16px; border-radius: 12px; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                                ${code}
                            </div>
                            <p style="opacity: 0.8; font-size: 13px; margin: 0;">
                                Este código expira en 10 minutos.<br>
                                Si no solicitaste este código, ignora este email.
                            </p>
                        </div>
                        <p style="color: #888; font-size: 12px; text-align: center; margin-top: 20px;">
                            Enviado por el Sistema de Verificación
                        </p>
                    </div>
                `
            })
        });

        const result = await res.json();
        return new Response(JSON.stringify(result), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Opción 2: Fallback - solo loguear (para desarrollo)
    console.log(`Código ${code} enviado a ${email}`);

    return new Response(JSON.stringify({
        success: true,
        message: 'Código generado (modo desarrollo)',
        code: code
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
