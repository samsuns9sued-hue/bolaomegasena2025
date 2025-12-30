import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request) {
    const { nome, jogos } = await request.json();

    // Validação simples
    if (!nome || !jogos || !Array.isArray(jogos)) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    try {
        const client = await pool.connect();
        // Salva o array de jogos como um JSON
        await client.query('INSERT INTO jogos_fixos (nome, jogos) VALUES ($1, $2)', [nome, JSON.stringify(jogos)]);
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const client = await pool.connect();
        // Pega os jogos ordenados do mais recente para o mais antigo
        const result = await client.query('SELECT * FROM jogos_fixos ORDER BY created_at DESC');
        client.release();

        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}