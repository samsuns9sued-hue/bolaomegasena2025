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
    // Não precisamos mais ler searchParams, vamos ler do banco
    try {
        const client = await pool.connect();

        // 1. Pega palpites normais
        const resultPalpites = await client.query('SELECT nome, numeros FROM palpites');
        let todosOsPalpites = resultPalpites.rows;

        // 2. Lê a configuração global
        const configRes = await client.query("SELECT valor FROM configuracoes WHERE chave = 'fixos_ativos'");
        const nomesParaIncluir = configRes.rows[0]?.valor || [];

        let participantesFixosAdicionados = [];

        if (nomesParaIncluir.length > 0) {
            const queryFixos = 'SELECT nome, jogos FROM jogos_fixos WHERE nome = ANY($1)';
            const resultFixos = await client.query(queryFixos, [nomesParaIncluir]);

            resultFixos.rows.forEach(row => {
                const numerosUnicos = new Set();
                const jogosArray = typeof row.jogos === 'string' ? JSON.parse(row.jogos) : row.jogos;

                jogosArray.forEach(jogo => {
                    jogo.forEach(num => numerosUnicos.add(num));
                });

                todosOsPalpites.push({
                    nome: row.nome + " (Jogos Fixos)",
                    numeros: Array.from(numerosUnicos)
                });

                participantesFixosAdicionados.push(row.nome);
            });
        }

        client.release();

        // 3. O Cálculo do Ranking (agora com todo mundo misturado)
        const frequencia = {};
        for (let i = 1; i <= 60; i++) frequencia[i] = 0;

        todosOsPalpites.forEach(row => {
            row.numeros.forEach(num => {
                if (frequencia[num] !== undefined) frequencia[num]++;
            });
        });

        const ranking = Object.entries(frequencia)
            .map(([num, count]) => ({ numero: parseInt(num), votos: count }))
            .sort((a, b) => b.votos - a.votos);

        // Separa a lista de nomes para exibição
        const participantesOriginais = resultPalpites.rows.map(r => r.nome);

        return NextResponse.json({
            totalParticipantes: todosOsPalpites.length,
            participantes: participantesOriginais,
            participantesFixos: participantesFixosAdicionados, // Nova lista separada
            ranking
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}