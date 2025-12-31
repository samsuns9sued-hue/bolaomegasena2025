import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// GET: Retorna lista de usuários, histórico de um usuário específico e o Ranking atual
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get('nome');

    try {
        const client = await pool.connect();

        // 1. Pegar Ranking (Lógica dos 30 números)
        const palpitesRes = await client.query('SELECT numeros FROM palpites');
        const frequencia = {};
        palpitesRes.rows.forEach(row => {
            row.numeros.forEach(num => {
                frequencia[num] = (frequencia[num] || 0) + 1;
            });
        });
        // Ordena do mais votado para o menos votado
        const ranking = Object.entries(frequencia)
            .map(([num, count]) => ({ numero: parseInt(num), votos: count }))
            .sort((a, b) => b.votos - a.votos);

        // 2. Se tiver nome, busca histórico dele
        let historico = [];
        if (nome) {
            const histRes = await client.query('SELECT * FROM jogos_gerados WHERE nome = $1 ORDER BY created_at DESC', [nome]);
            historico = histRes.rows;
        }

        // 3. Busca lista de todos os usuários únicos desta tabela
        const usuariosRes = await client.query('SELECT DISTINCT nome FROM jogos_gerados');
        const usuarios = usuariosRes.rows.map(r => r.nome);

        client.release();

        return NextResponse.json({ ranking, historico, usuarios });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Gera o jogo e salva
export async function POST(request) {
    const { nome, topN } = await request.json();

    if (!nome || !topN || topN < 7 || topN > 60) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    try {
        const client = await pool.connect();

        // 1. Recalcula ranking (para garantir dados frescos)
        const palpitesRes = await client.query('SELECT numeros FROM palpites');
        const frequencia = {};
        // Preenche todos com 0 para garantir que números sem votos também existam se precisar
        for (let i = 1; i <= 60; i++) frequencia[i] = 0;

        palpitesRes.rows.forEach(row => {
            row.numeros.forEach(num => {
                frequencia[num] = (frequencia[num] || 0) + 1;
            });
        });

        const ranking = Object.entries(frequencia)
            .map(([num, count]) => ({ numero: parseInt(num), votos: count }))
            .sort((a, b) => b.votos - a.votos);

        // 2. Pega os Top N números
        const poolNumeros = ranking.slice(0, topN).map(r => r.numero);

        // 3. Sorteia 6 números aleatórios DENTRO desse pool
        const sorteados = [];
        while (sorteados.length < 6) {
            const randomIndex = Math.floor(Math.random() * poolNumeros.length);
            const num = poolNumeros[randomIndex];
            if (!sorteados.includes(num)) {
                sorteados.push(num);
            }
        }
        sorteados.sort((a, b) => a - b);

        // 4. Salva
        await client.query(
            'INSERT INTO jogos_gerados (nome, numeros, base_calculo) VALUES ($1, $2, $3)',
            [nome, sorteados, topN]
        );

        client.release();
        return NextResponse.json({ success: true, numeros: sorteados });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}