export const config = {
    runtime: 'edge'
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { email, code, expectedCode } = await req.json();

    // Verificar código
    if (code === expectedCode) {
        return new Response(JSON.stringify({
            success: true,
            message: 'Código verificado correctamente',
            email: email
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
        success: false,
        message: 'Código incorrecto'
    }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
}
