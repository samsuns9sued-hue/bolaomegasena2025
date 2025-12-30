// app/api/bolao/route.js
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request) {
    const { nome, numeros } = await request.json();

    if (!nome || !numeros || numeros.length !== 30) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    try {
        const client = await pool.connect();
        await client.query('INSERT INTO palpites (nome, numeros) VALUES ($1, $2)', [nome, numeros]);
        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    // Essa rota retorna o ranking dos números
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM palpites');
        client.release();

        const frequencia = {};
        // Inicializa todos os números com 0
        for (let i = 1; i <= 60; i++) frequencia[i] = 0;

        // Conta as repetições
        result.rows.forEach(row => {
            row.numeros.forEach(num => {
                if (frequencia[num] !== undefined) frequencia[num]++;
            });
        });

        // Transforma em array e ordena
        const ranking = Object.entries(frequencia)
            .map(([num, count]) => ({ numero: parseInt(num), votos: count }))
            .sort((a, b) => b.votos - a.votos); // Do mais votado para o menos votado

        return NextResponse.json({
            totalParticipantes: result.rows.length,
            participantes: result.rows.map(r => r.nome),
            ranking
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}