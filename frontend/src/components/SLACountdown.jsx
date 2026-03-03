import { useState, useEffect } from 'react';
import { FaClock, FaFireAlt, FaCheckCircle, FaPauseCircle } from 'react-icons/fa';

// Componenta de tip Widget pentru tracking-ul Service Level Agreement-ului (SLA)
const SLACountdown = ({ deadline, createdAt, status }) => {
    // Calculul deltei totale pentru a stabili procentajul de progres
    const totalDuration = new Date(deadline).getTime() - new Date(createdAt).getTime();
    
    const calculateTimeLeft = () => {
        const difference = new Date(deadline) - new Date();
        // Returnam 0 daca deadline-ul a fost depasit pentru a nu randa valori negative in UI
        return difference > 0 ? difference : 0;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    // Timer loop pentru actualizarea UI-ului in timp real (la nivel de secunda)
    useEffect(() => {
        // Inghetam timer-ul pe front-end daca statusul a fost modificat
        if (status === 'closed' || status === 'suspended') return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline, status]);

    // Helper pentru string formatting din milisecunde in format human-readable
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Calculam fill-ul dinamic al barei (limitat intre 0% si 100%)
    const percentLeft = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
    
    // Logica de mapping pentru paleta de culori a barei de progres (degradare vizuala)
    let barColor = 'bg-emerald-500'; 
    let textColor = 'text-emerald-400';
    let shadowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.5)]';

    if (percentLeft < 50) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-400';
        shadowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    }
    if (percentLeft < 20) {
        barColor = 'bg-red-600';
        textColor = 'text-red-500';
        shadowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse';
    }

    // Branch de randare separata daca SLA-ul este indeplinit (Task Closed)
    if (status === 'closed') {
        return (
            <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-xl" />
                    <div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Status SLA</p>
                        <p className="text-white font-bold">Tichet Finalizat</p>
                    </div>
                </div>
                <div className="h-2 w-32 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-emerald-500"></div>
                </div>
            </div>
        );
    }

    // Branch de randare pentru task-urile in Pending (ex: asteapta raspuns de la client)
    if (status === 'suspended') {
        return (
            <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaPauseCircle className="text-amber-500 text-xl" />
                    <div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Status SLA</p>
                        <p className="text-white font-bold">Cronometru Inghetat</p>
                    </div>
                </div>
                <div className="h-2 w-32 bg-amber-500/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-amber-500 dashed-bar"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative overflow-hidden">
            {/* Animatie CSS injectata direct pentru gradientul barei de loading */}
            <style>{`
                @keyframes move-stripes {
                    0% { background-position: 1rem 0; }
                    100% { background-position: 0 0; }
                }
                .sla-bar-animated {
                    background-image: linear-gradient(
                        45deg, 
                        rgba(255, 255, 255, 0.15) 25%, 
                        transparent 25%, 
                        transparent 50%, 
                        rgba(255, 255, 255, 0.15) 50%, 
                        rgba(255, 255, 255, 0.15) 75%, 
                        transparent 75%, 
                        transparent
                    );
                    background-size: 1rem 1rem;
                    animation: move-stripes 1s linear infinite;
                }
            `}</style>

            <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                    <FaFireAlt className={`${textColor} ${percentLeft < 20 ? 'animate-bounce' : ''}`} />
                    <span className="text-white font-black uppercase tracking-widest text-xs opacity-80">
                        Timp Ramas SLA
                    </span>
                </div>
                <span className={`text-3xl font-black font-mono text-white drop-shadow-md tracking-tight`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : "00:00:00"}
                </span>
            </div>

            {/* Componenta Container a barei de incarcare */}
            <div className="w-full h-6 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                {/* Elementul activ cu tranzitie CSS hardware-accelerated */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor} ${shadowClass} sla-bar-animated`}
                    style={{ width: `${percentLeft}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] text-white/30 font-bold uppercase">START</span>
                <span className="text-[10px] text-white/30 font-bold uppercase">
                    LIMITA: {new Date(deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        </div>
    );
};

export default SLACountdown;