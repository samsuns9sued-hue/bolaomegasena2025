'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CincoJogos() {
    const router = useRouter();
    // Estado para armazenar os 5 jogos
    const [jogos, setJogos] = useState([[], [], [], [], []]);
    const [jogoAtual, setJogoAtual] = useState(0); // Começa no jogo 0 (Jogo 1)
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    // Referência para scrollar para o topo quando mudar de jogo
    const topRef = useRef(null);

    const toggleNumber = (num) => {
        const numerosDoJogoAtual = jogos[jogoAtual];
        let novosNumeros;

        // Se já marcou, desmarca
        if (numerosDoJogoAtual.includes(num)) {
            novosNumeros = numerosDoJogoAtual.filter((n) => n !== num);
            atualizarJogo(novosNumeros);
        } else {
            // Se ainda não marcou e tem menos de 6
            if (numerosDoJogoAtual.length < 6) {
                novosNumeros = [...numerosDoJogoAtual, num].sort((a, b) => a - b);
                atualizarJogo(novosNumeros);

                // AUTO-AVANÇAR: Se completou 6 números e não é o último jogo
                if (novosNumeros.length === 6 && jogoAtual < 4) {
                    // Pequeno delay para a pessoa ver que marcou o último número
                    setTimeout(() => {
                        avancarJogo();
                    }, 500);
                }
            }
        }
    };

    const atualizarJogo = (novosNumeros) => {
        const novosJogos = [...jogos];
        novosJogos[jogoAtual] = novosNumeros;
        setJogos(novosJogos);
    };

    const avancarJogo = () => {
        if (jogoAtual < 4) {
            setJogoAtual(jogoAtual + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const voltarJogo = () => {
        if (jogoAtual > 0) {
            setJogoAtual(jogoAtual - 1);
        }
    };

    const limparJogoAtual = () => {
        if (confirm("Quer apagar os números deste jogo e começar ele de novo?")) {
            atualizarJogo([]);
        }
    }

    const enviarJogos = async () => {
        const todosCompletos = jogos.every(j => j.length === 6);
        if (!todosCompletos) return alert('Opa! Algum jogo não tem 6 números. Verifique todos.');
        if (!nome) return alert('Por favor, escreva seu nome lá em cima.');

        setLoading(true);

        await fetch('/api/jogos-fixos', {
            method: 'POST',
            body: JSON.stringify({ nome, jogos }),
        });

        setLoading(false);
        setEnviado(true);
    };

    const copiarJogosUsuario = () => {
        const texto = `🎫 MEUS JOGOS - BOLÃO 2025\nParticipante: ${nome}\n\n` +
            jogos.map((j, i) => `Jogo ${i + 1}: ${j.join(' - ')}`).join('\n') +
            `\n\n🍀 Na torcida!`;

        navigator.clipboard.writeText(texto);
        alert("Jogos copiados! Agora cole no seu WhatsApp.");
    };

    if (enviado) {
        return (
            <div className="min-h-screen bg-blue-900 text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-green-500 rounded-full p-4 mb-4 shadow-lg animate-bounce">
                    <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Sucesso, {nome}!</h1>
                <p className="opacity-90 mb-8">Seus 5 jogos foram salvos.</p>

                <div className="w-full max-w-sm space-y-3">
                    <button
                        onClick={copiarJogosUsuario}
                        className="w-full bg-white text-blue-900 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        <span>📋</span> Copiar meus jogos
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-blue-800 text-white border border-blue-600 px-6 py-3 rounded-xl font-bold"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    // Quantos números foram marcados no jogo atual
    const marcados = jogos[jogoAtual].length;
    const faltam = 6 - marcados;

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans text-gray-800" ref={topRef}>

            {/* CABEÇALHO FIXO */}
            <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-20">
                <div className="max-w-md mx-auto flex items-center justify-between gap-2">
                    <button onClick={() => router.push('/')} className="text-sm text-gray-500">⬅ Sair</button>
                    <input
                        type="text"
                        className="flex-1 p-2 border border-blue-200 rounded text-center font-bold text-lg bg-blue-50 focus:bg-white transition-colors"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="DIGITE SEU NOME AQUI"
                    />
                </div>
            </div>

            <div className="max-w-md mx-auto p-4">

                {/* BARRA DE PROGRESSO (JOGOS) */}
                <div className="flex justify-between mb-6 px-2">
                    {jogos.map((j, idx) => {
                        const completo = j.length === 6;
                        const ativo = idx === jogoAtual;
                        return (
                            <div
                                key={idx}
                                onClick={() => setJogoAtual(idx)}
                                className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 cursor-pointer transition-all
                            ${ativo ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-lg' :
                                        completo ? 'border-green-500 bg-green-100 text-green-700' : 'border-gray-300 text-gray-400 bg-white'}
                        `}
                            >
                                {completo && !ativo ? '✓' : idx + 1}
                            </div>
                        )
                    })}
                </div>

                {/* CARTÃO DE INSTRUÇÃO GRANDE */}
                <div className={`p-6 rounded-2xl shadow-lg border-2 mb-6 text-center transition-all ${marcados === 6 ? 'bg-green-50 border-green-400' : 'bg-white border-blue-500'}`}>
                    <h2 className="text-blue-900 font-bold uppercase tracking-wider text-sm mb-1">
                        {marcados === 6 ? 'JOGO COMPLETO!' : `PREENCHENDO JOGO ${jogoAtual + 1}`}
                    </h2>

                    <div className="text-3xl font-extrabold mb-2 text-gray-800 h-8">
                        {marcados === 0 ? <span className="text-gray-300 text-xl font-normal">Escolha 6 números</span> : jogos[jogoAtual].join(' - ')}
                    </div>

                    <p className={`text-sm font-bold ${marcados === 6 ? 'text-green-600' : 'text-orange-500'}`}>
                        {marcados === 6
                            ? (jogoAtual < 4 ? 'Indo para o próximo...' : 'Tudo pronto!')
                            : `Faltam ${faltam} número(s)`}
                    </p>
                </div>

                {/* TECLADO NÚMERICO */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => {
                            const isSelected = jogos[jogoAtual].includes(num);
                            return (
                                <button
                                    key={num}
                                    onClick={() => toggleNumber(num)}
                                    className={`
                    aspect-square rounded-full font-bold text-lg sm:text-xl flex items-center justify-center transition-all touch-manipulation
                    ${isSelected
                                            ? 'bg-blue-600 text-white transform scale-95 shadow-inner'
                                            : 'bg-gray-100 text-gray-600 active:bg-gray-300'}
                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={voltarJogo}
                        disabled={jogoAtual === 0}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold disabled:opacity-30"
                    >
                        ◀ Anterior
                    </button>

                    {jogoAtual === 4 && jogos[4].length === 6 ? (
                        <button
                            onClick={enviarJogos}
                            className="flex-[2] bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg animate-pulse"
                        >
                            FINALIZAR TUDO ✅
                        </button>
                    ) : (
                        <button
                            onClick={avancarJogo}
                            disabled={marcados < 6}
                            className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:bg-gray-400"
                        >
                            Próximo Jogo ▶
                        </button>
                    )}
                </div>

                <button onClick={limparJogoAtual} className="w-full text-red-400 text-sm py-2">
                    Limpar números deste jogo
                </button>

            </div>
        </div>
    );
}