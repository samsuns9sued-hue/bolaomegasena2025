import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// GET: Lê quem está ativo
export async function GET() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT valor FROM configuracoes WHERE chave = 'fixos_ativos'");
        client.release();

        // Se não tiver nada, retorna array vazio
        const ativos = res.rows[0]?.valor || [];
        return NextResponse.json(ativos);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}

// POST: Atualiza a lista de ativos
export async function POST(request) {
    const { nomes } = await request.json(); // Recebe o array novo completo

    try {
        const client = await pool.connect();
        // Atualiza o JSON no banco (upsert simples)
        await client.query(
            "INSERT INTO configuracoes (chave, valor) VALUES ('fixos_ativos', $1) ON CONFLICT (chave) DO UPDATE SET valor = $1",
            [JSON.stringify(nomes)]
        );
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}