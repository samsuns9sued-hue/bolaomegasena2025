'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CincoJogos() {
    const router = useRouter();
    // Estado para armazenar os 5 jogos. Cada jogo é um array de números.
    const [jogos, setJogos] = useState([[], [], [], [], []]);
    const [jogoAtual, setJogoAtual] = useState(0); // Qual aba estamos editando (0 a 4)
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const toggleNumber = (num) => {
        const numerosDoJogoAtual = jogos[jogoAtual];
        let novosNumeros;

        if (numerosDoJogoAtual.includes(num)) {
            novosNumeros = numerosDoJogoAtual.filter((n) => n !== num);
        } else {
            if (numerosDoJogoAtual.length < 6) {
                novosNumeros = [...numerosDoJogoAtual, num].sort((a, b) => a - b);
            } else {
                return; // Já tem 6 números
            }
        }

        // Atualiza o estado geral dos jogos
        const novosJogos = [...jogos];
        novosJogos[jogoAtual] = novosNumeros;
        setJogos(novosJogos);
    };

    const enviarJogos = async () => {
        // Verifica se todos os 5 jogos têm 6 números
        const todosCompletos = jogos.every(j => j.length === 6);
        if (!todosCompletos) return alert('Você precisa preencher 6 números em TODOS os 5 jogos!');
        if (!nome) return alert('Preencha seu nome!');

        setLoading(true);

        await fetch('/api/jogos-fixos', {
            method: 'POST',
            body: JSON.stringify({ nome, jogos }),
        });

        setLoading(false);
        setEnviado(true);
    };

    const limparJogoAtual = () => {
        const novosJogos = [...jogos];
        novosJogos[jogoAtual] = [];
        setJogos(novosJogos);
    }

    // Função auxiliar para formatar os jogos do usuário para texto
    const copiarJogosUsuario = () => {
        const texto = `🎫 MEUS JOGOS - BOLÃO 2025\nParticipante: ${nome}\n\n` +
            jogos.map((j, i) => `Jogo ${i + 1}: ${j.join(' - ')}`).join('\n') +
            `\n\n🍀 Na torcida!`;

        navigator.clipboard.writeText(texto);
        alert("Jogos copiados! Agora cole no seu WhatsApp ou Bloco de Notas.");
    };

    if (enviado) {
        return (
            <div className="min-h-screen bg-blue-900 text-white p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-green-500 rounded-full p-4 mb-4 shadow-lg animate-bounce">
                    <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Sucesso, {nome}!</h1>
                <p className="opacity-90 mb-8">Seus 5 jogos foram registrados no sistema seguro.</p>

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
                <p className="mt-8 text-xs opacity-50">Salve seus jogos copiando eles!</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 font-sans text-gray-800">
            <div className="max-w-md mx-auto">
                <button onClick={() => router.push('/')} className="mb-4 text-sm text-gray-500 flex items-center">⬅ Voltar</button>

                <h1 className="text-2xl font-bold text-blue-800 mb-1">Meus 5 Jogos 🎯</h1>
                <p className="text-sm text-gray-600 mb-4">Monte 5 jogos de 6 números cada.</p>

                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Nome do Jogador:</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-blue-200 rounded text-lg bg-white"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome..."
                    />
                </div>

                {/* Abas dos Jogos */}
                <div className="flex justify-between mb-4 bg-white p-1 rounded-lg shadow-sm border">
                    {jogos.map((jogo, index) => (
                        <button
                            key={index}
                            onClick={() => setJogoAtual(index)}
                            className={`
                px-3 py-2 rounded text-sm font-bold flex flex-col items-center transition-all flex-1
                ${jogoAtual === index ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}
              `}
                        >
                            <span>J{index + 1}</span>
                            <span className="text-xs font-normal opacity-80">{jogo.length}/6</span>
                        </button>
                    ))}
                </div>

                {/* Volante */}
                <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-100 mb-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="font-bold text-lg text-blue-900">Editando Jogo {jogoAtual + 1}</h2>
                        <button onClick={limparJogoAtual} className="text-xs text-red-400 hover:text-red-600">Limpar Jogo</button>
                    </div>

                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => {
                            const isSelected = jogos[jogoAtual].includes(num);
                            return (
                                <button
                                    key={num}
                                    onClick={() => toggleNumber(num)}
                                    className={`
                    aspect-square rounded-full font-bold text-sm sm:text-base flex items-center justify-center transition-all
                    ${isSelected
                                            ? 'bg-blue-500 text-white transform scale-110 shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={enviarJogos}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl text-xl shadow-lg hover:shadow-xl transition-all mb-8"
                >
                    {loading ? 'Salvando...' : 'Confirmar os 5 Jogos ✅'}
                </button>
            </div>
        </div>
    );
}