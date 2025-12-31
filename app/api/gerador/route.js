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

        // === MUDANÇA AQUI: LÓGICA DE FUSÃO GLOBAL ===

        // 1. Pega palpites normais
        const palpitesRes = await client.query('SELECT numeros FROM palpites');
        let todosNumeros = [];
        palpitesRes.rows.forEach(r => todosNumeros.push(...r.numeros));

        // 2. Verifica a configuração de quem deve ser incluído (Jogos Fixos)
        const configRes = await client.query("SELECT valor FROM configuracoes WHERE chave = 'fixos_ativos'");
        const nomesAtivos = configRes.rows[0]?.valor || [];

        // 3. Se tiver nomes ativos, busca os jogos deles e mistura
        if (nomesAtivos.length > 0) {
            const fixosRes = await client.query('SELECT jogos FROM jogos_fixos WHERE nome = ANY($1)', [nomesAtivos]);

            fixosRes.rows.forEach(row => {
                // Extrai números únicos dos jogos dessa pessoa
                const jogosArray = typeof row.jogos === 'string' ? JSON.parse(row.jogos) : row.jogos;
                const unicosDestaPessoa = new Set();
                jogosArray.forEach(jogo => jogo.forEach(n => unicosDestaPessoa.add(n)));

                // Adiciona ao bolo principal
                todosNumeros.push(...Array.from(unicosDestaPessoa));
            });
        }

        // 4. Calcula Frequência com TODOS os dados misturados
        const frequencia = {};
        // Inicia com 0
        for (let i = 1; i <= 60; i++) frequencia[i] = 0;

        todosNumeros.forEach(num => {
            if (frequencia[num] !== undefined) frequencia[num]++;
        });

        // Gera o Ranking Final Global
        const ranking = Object.entries(frequencia)
            .map(([num, count]) => ({ numero: parseInt(num), votos: count }))
            .sort((a, b) => b.votos - a.votos);

        // === FIM DA MUDANÇA DE FUSÃO ===

        // Resto do código continua igual (buscar histórico, usuarios, etc)
        let historico = [];
        if (nome) {
            const histRes = await client.query('SELECT * FROM jogos_gerados WHERE nome = $1 ORDER BY created_at DESC', [nome]);
            historico = histRes.rows;
        }

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