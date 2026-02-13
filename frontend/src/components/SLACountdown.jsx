import { useState, useEffect } from 'react';
import { FaClock, FaFireAlt, FaCheckCircle, FaPauseCircle } from 'react-icons/fa';

const SLACountdown = ({ deadline, createdAt, status }) => {
    // Calculăm durata totală
    const totalDuration = new Date(deadline).getTime() - new Date(createdAt).getTime();
    
    const calculateTimeLeft = () => {
        const difference = new Date(deadline) - new Date();
        return difference > 0 ? difference : 0;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (status === 'closed' || status === 'suspended') return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline, status]);

    // Formatare timp (HH:MM:SS)
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Calcul procentaj bară
    const percentLeft = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
    
    // Culori dinamice (Verde -> Galben -> Roșu)
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

    // Cazuri speciale: Închis sau Suspendat
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

    if (status === 'suspended') {
        return (
            <div className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FaPauseCircle className="text-amber-500 text-xl" />
                    <div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Status SLA</p>
                        <p className="text-white font-bold">Cronometru Înghețat</p>
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
            {/* Injectăm animația CSS local */}
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
                        Timp Rămas SLA
                    </span>
                </div>
                <span className={`text-3xl font-black font-mono text-white drop-shadow-md tracking-tight`}>
                    {timeLeft > 0 ? formatTime(timeLeft) : "00:00:00"}
                </span>
            </div>

            {/* CONTAINER BARA */}
            <div className="w-full h-6 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                {/* BARA PROPRIU-ZISĂ CU ANIMAȚIE */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor} ${shadowClass} sla-bar-animated`}
                    style={{ width: `${percentLeft}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] text-white/30 font-bold uppercase">START</span>
                <span className="text-[10px] text-white/30 font-bold uppercase">
                    LIMITĂ: {new Date(deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        </div>
    );
};

export default SLACountdown;