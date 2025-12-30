import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">BOLÃO 2025 🥂</h1>
                    <p className="text-gray-500">Escolha sua estratégia para o bilhão.</p>
                </div>

                <div className="space-y-6">

                    {/* CARTÃO 1: 5 JOGOS */}
                    <Link href="/5-jogos" className="block group">
                        <div className="bg-gradient-to-br from-blue-400 to-cyan-300 rounded-3xl p-6 shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white opacity-20 text-9xl font-bold rotate-12">5</div>

                            <div className="relative z-10 text-white">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Estratégico</span>
                                    <span className="text-2xl">🎲</span>
                                </div>
                                <h2 className="text-2xl font-bold leading-tight mb-2">Escolha seus<br />5 Jogos Pessoais</h2>
                                <p className="text-sm opacity-90 mb-4">Monte 5 jogos exatos de 6 números com seus palpites fechados.</p>

                                <div className="flex items-center text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-lg backdrop-blur-sm">
                                    Começar agora ➜
                                </div>
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center justify-center text-gray-400 font-bold text-sm">
                        — OU —
                    </div>

                    {/* CARTÃO 2: 30 NÚMEROS */}
                    <Link href="/30-numeros" className="block group">
                        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl relative overflow-hidden text-white">
                            <div className="absolute -right-4 -bottom-4 text-gray-700 opacity-20 text-9xl font-bold -rotate-12">30</div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-green-400">Intuitivo</span>
                                    <span className="text-2xl">🍀</span>
                                </div>
                                <h2 className="text-2xl font-bold leading-tight mb-2 text-green-400">30 Números<br />da Sorte</h2>
                                <p className="text-sm text-gray-400 mb-4">Datas, sonhos, idade... Escolha 30 números para o nosso algoritmo cruzar.</p>

                                <div className="flex items-center text-sm font-bold bg-gray-800 border border-gray-700 w-fit px-4 py-2 rounded-lg group-hover:bg-gray-700 transition-colors">
                                    Escolher meus 30 ➜
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>

                <p className="text-center text-xs text-gray-400 mt-12">
                    Herdeiros da Mega 2025 ©
                </p>

            </div>
        </div>
    );
}