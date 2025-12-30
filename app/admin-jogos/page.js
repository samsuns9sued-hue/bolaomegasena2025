'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminJogos() {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);
    const [listaJogos, setListaJogos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [msgParaCopiar, setMsgParaCopiar] = useState('');
    const [nomeAtual, setNomeAtual] = useState('');

    useEffect(() => {
        // Senha simples ao entrar
        const senha = prompt("Senha do Admin:");
        if (senha === "admin2025") {
            setAutorizado(true);
            carregarJogos();
        } else {
            alert("Senha incorreta");
            router.push('/');
        }
    }, []);

    const carregarJogos = async () => {
        try {
            const res = await fetch('/api/jogos-fixos');
            const data = await res.json();
            setListaJogos(data);
        } catch (error) {
            alert("Erro ao carregar jogos");
        }
    };

    const abrirModalConfirmacao = (pessoa) => {
        // Monta a mensagem bonita para o WhatsApp
        const jogosFormatados = pessoa.jogos.map((j, i) => `🎲 *Jogo ${i + 1}:* ${j.join(' - ')}`).join('\n');

        const mensagem = `🥂 *BOLÃO HERDEIROS 2025* 🥂\n\n` +
            `Olá *${pessoa.nome}*! Confirmando o recebimento dos seus jogos:\n\n` +
            `${jogosFormatados}\n\n` +
            `✅ *Status:* Registrado no sistema.\n` +
            `Boa sorte! 🍀`;

        setNomeAtual(pessoa.nome);
        setMsgParaCopiar(mensagem);
        setModalOpen(true);
    };

    const copiarMensagem = () => {
        navigator.clipboard.writeText(msgParaCopiar);
        alert("Mensagem copiada! Agora mande no WhatsApp do " + nomeAtual);
        setModalOpen(false);
    };

    if (!autorizado) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Verificando...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Painel de Jogos Fixos ({listaJogos.length})</h1>
                <button onClick={() => router.push('/')} className="text-sm text-blue-600 underline">Sair</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listaJogos.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="font-bold text-lg text-blue-900">{item.nome}</h2>
                            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <div className="space-y-1 mb-4">
                            {item.jogos.map((jogo, idx) => (
                                <div key={idx} className="text-sm bg-gray-50 p-1 rounded border border-gray-100 text-gray-600 font-mono">
                                    <span className="font-bold mr-2 text-gray-400">{idx + 1}:</span>
                                    {jogo.map(n => n.toString().padStart(2, '0')).join('-')}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => abrirModalConfirmacao(item)}
                            className="w-full bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>📲</span> Gerar Msg WhatsApp
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL DE CÓPIA */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Confirmar Jogos de {nomeAtual}</h3>

                        <textarea
                            readOnly
                            value={msgParaCopiar}
                            className="w-full h-48 p-3 bg-gray-100 rounded-lg text-sm font-mono mb-4 border focus:outline-none resize-none"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={copiarMensagem}
                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg"
                            >
                                Copiar Msg ✅
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}