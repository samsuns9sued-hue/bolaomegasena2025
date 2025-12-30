// app/page.js
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [selected, setSelected] = useState([]);
  const [nome, setNome] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verResultado, setVerResultado] = useState(false);
  const [dadosResultado, setDadosResultado] = useState(null);

  const toggleNumber = (num) => {
    if (selected.includes(num)) {
      setSelected(selected.filter((n) => n !== num));
    } else {
      if (selected.length < 30) {
        setSelected([...selected, num]);
      }
    }
  };

  const enviarPalpite = async () => {
    if (selected.length !== 30 || !nome) return alert('Preencha o nome e escolha 30 números!');
    setLoading(true);

    await fetch('/api/bolao', {
      method: 'POST',
      body: JSON.stringify({ nome, numeros: selected }),
    });

    setLoading(false);
    setEnviado(true);
  };

  const carregarResultado = async () => {
    const res = await fetch('/api/bolao');
    const data = await res.json();
    setDadosResultado(data);
    setVerResultado(true);
  };

  if (verResultado && dadosResultado) {
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4 text-green-400">Estatísticas do Bolão</h1>
        <p className="mb-4">Participantes: {dadosResultado.participantes.join(', ')}</p>

        <h2 className="text-xl font-bold mt-6 mb-2">Números mais repetidos (Top 15)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
          {dadosResultado.ranking.slice(0, 15).map((item, idx) => (
            <div key={item.numero} className="bg-gray-800 p-2 rounded border border-green-500 flex justify-between">
              <span className="font-bold text-xl">#{item.numero}</span>
              <span className="text-sm text-gray-400">{item.votos} votos</span>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mt-6 mb-2">Todos os números (Ranking)</h2>
        <div className="text-xs text-gray-400 grid grid-cols-5 gap-1">
          {dadosResultado.ranking.map((item) => (
            <div key={item.numero} className="p-1 border border-gray-700">
              {item.numero} ({item.votos})
            </div>
          ))}
        </div>

        <button onClick={() => setVerResultado(false)} className="mt-8 bg-blue-600 px-4 py-2 rounded">Voltar</button>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Boa Sorte, {nome}! 🍀</h1>
        <p>Seus 30 números foram registrados.</p>
        <p className="mt-4 text-sm opacity-75">Aguarde o administrador gerar os jogos finais.</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-underline">Novo cadastro</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Bolão: Herdeiros da Mega 2025 🥂</h1>
        <p className="text-gray-600">Escolha seus 30 números da sorte</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Seu Nome:</label>
        <input
          type="text"
          className="w-full p-2 border rounded text-lg"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Tio João"
        />
      </div>

      <div className="mb-4 sticky top-0 bg-white p-2 border-b z-10 flex justify-between items-center">
        <span className="font-bold">Selecionados: {selected.length} / 30</span>
        {selected.length === 30 && <span className="text-green-600 font-bold">Pronto!</span>}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => toggleNumber(num)}
            className={`
              aspect-square rounded-full font-bold text-lg flex items-center justify-center transition-all
              ${selected.includes(num)
                ? 'bg-green-600 text-white transform scale-105 shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {num}
          </button>
        ))}
      </div>

      <button
        onClick={enviarPalpite}
        disabled={selected.length !== 30 || !nome || loading}
        className="w-full bg-green-700 text-white font-bold py-4 rounded-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed mb-12 shadow-xl"
      >
        {loading ? 'Enviando...' : 'Confirmar Meus Números 🤞'}
      </button>

      <div className="text-center mt-12 border-t pt-4">
        <button onClick={carregarResultado} className="text-xs text-gray-400">Área do Administrador (Ver Ranking)</button>
      </div>
    </div>
  );
}