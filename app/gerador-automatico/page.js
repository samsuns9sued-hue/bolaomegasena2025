'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeradorAutomatico() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [usuariosSalvos, setUsuariosSalvos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [ranking, setRanking] = useState([]);

    // Controle do Gerador
    const [topN, setTopN] = useState(15); // Padrão: Top 15
    const [loading, setLoading] = useState(false);
    const [ultimoGerado, setUltimoGerado] = useState(null);

    // Carrega lista de usuários e ranking ao abrir
    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    // Quando usuario para de digitar o nome ou seleciona um, busca histórico
    useEffect(() => {
        if (nome.length > 2) {
            buscarHistorico(nome);
        } else {
            setHistorico([]);
        }
    }, [nome]);

    const carregarDadosIniciais = async () => {
        const res = await fetch('/api/gerador');
        const data = await res.json();
        setUsuariosSalvos(data.usuarios || []);
        setRanking(data.ranking || []);
    };

    const buscarHistorico = async (nomeBusca) => {
        const res = await fetch(`/api/gerador?nome=${nomeBusca}`);
        const data = await res.json();
        setHistorico(data.historico || []);
    };

    const gerarJogo = async () => {
        if (!nome) return alert("Digite seu nome primeiro!");
        setLoading(true);

        const res = await fetch('/api/gerador', {
            method: 'POST',
            body: JSON.stringify({ nome, topN }),
        });

        const data = await res.json();
        if (data.success) {
            setUltimoGerado(data.numeros);
            buscarHistorico(nome); // Atualiza a lista lá embaixo
        } else {
            alert("Erro ao gerar");
        }
        setLoading(false);
    };

    const copiarJogos = () => {
        const texto = `🤖 JOGOS GERADOS (IA DO BOLÃO)\nParticipante: ${nome}\n\n` +
            historico.map((h, i) => `Jogo ${i + 1} (Base Top ${h.base_calculo}): ${h.numeros.join(' - ')}`).join('\n');
        navigator.clipboard.writeText(texto);
        alert("Histórico copiado!");
    }

    // Pega os números que fazem parte do Top N atual para mostrar pro usuário
    const poolAtual = ranking.slice(0, topN).map(r => r.numero);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.push('/')} className="mb-6 text-sm text-gray-400 hover:text-white">⬅ Voltar ao Menu</button>

                <h1 className="text-3xl font-bold text-purple-400 mb-2">⚡ Gerador Inteligente</h1>
                <p className="text-gray-400 text-sm mb-8">
                    Gera jogos aleatórios baseados APENAS nos números mais votados pelo grupo.
                </p>

                {/* 1. Identificação */}
                <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
                    <label className="block text-sm font-bold mb-2 text-gray-300">Quem vai jogar?</label>
                    <input
                        list="usuarios-list"
                        type="text"
                        className="w-full p-3 rounded bg-gray-900 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Digite ou selecione seu nome..."
                    />
                    <datalist id="usuarios-list">
                        {usuariosSalvos.map((u, i) => <option key={i} value={u} />)}
                    </datalist>
                </div>

                {/* 2. Configuração do Gerador */}
                <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-purple-500/30 shadow-lg shadow-purple-900/20">
                    <div className="flex justify-between items-end mb-4">
                        <label className="font-bold text-lg">Usar os Top {topN} mais votados</label>
                        <span className="text-purple-400 font-mono text-sm">Pool de {topN} números</span>
                    </div>

                    <input
                        type="range"
                        min="7"
                        max="60"
                        value={topN}
                        onChange={(e) => setTopN(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-6"
                    />

                    {/* Visualização do Pool */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-2">O sistema vai sortear 6 números dentre estes:</p>
                        <div className="flex flex-wrap gap-1">
                            {poolAtual.map((num) => (
                                <span key={num} className="text-xs bg-gray-900 text-gray-300 px-2 py-1 rounded border border-gray-700">
                                    {num}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={gerarJogo}
                        disabled={loading || !nome}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-lg text-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : '⚡ GERAR JOGO AGORA'}
                    </button>
                </div>

                {/* 3. Resultado Imediato */}
                {ultimoGerado && (
                    <div className="bg-gradient-to-r from-green-900 to-green-800 p-4 rounded-xl mb-8 border border-green-500 animate-pulse text-center">
                        <p className="text-green-300 text-xs font-bold uppercase mb-2">Jogo Gerado com Sucesso</p>
                        <div className="flex justify-center gap-2">
                            {ultimoGerado.map(n => (
                                <div key={n} className="w-10 h-10 bg-white text-green-900 rounded-full flex items-center justify-center font-bold text-lg shadow">
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Histórico do Usuário */}
                {historico.length > 0 && (
                    <div className="border-t border-gray-800 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-300">Histórico de {nome} ({historico.length})</h3>
                            <button onClick={copiarJogos} className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Copiar Tudo</button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {historico.map((jogo) => (
                                <div key={jogo.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {jogo.numeros.map(n => (
                                            <span key={n} className="font-mono font-bold text-purple-300">{n.toString().padStart(2, '0')}</span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Base Top {jogo.base_calculo}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}