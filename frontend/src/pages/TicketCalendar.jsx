import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTickets, reset } from '../features/tickets/ticketSlice';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importăm stilurile de bază, apoi le suprascriem
import Spinner from '../components/Spinner';
import TicketItem from '../components/TicketItem';
import { FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

function TicketCalendar() {
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets);
  const dispatch = useDispatch();

  const [date, setDate] = useState(new Date());
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    dispatch(getTickets());
    return () => {
      if (isSuccess) dispatch(reset());
    };
  }, [dispatch, isSuccess]);

  // Filtrare tichete la schimbarea datei
  useEffect(() => {
    if (tickets) {
        const filtered = tickets.filter(ticket => {
            if (!ticket.deadline) return false;
            const tDate = new Date(ticket.deadline);
            return (
                tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
            );
        });
        setSelectedTickets(filtered);
    }
  }, [date, tickets]);

  // Indicator vizual pentru zilele cu deadline (Dot Roșu Neon)
  const tileContent = ({ date, view }) => {
    if (view === 'month' && tickets) {
        const hasDeadline = tickets.some(ticket => {
            if (!ticket.deadline || ticket.status === 'closed') return false;
            const tDate = new Date(ticket.deadline);
            return (
                tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
            );
        });

        if (hasDeadline) {
            return (
                <div className="flex justify-center mt-1">
                    <div className="h-2 w-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
                </div>
            );
        }
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="w-full max-w-6xl flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-blue-500/30">
            <FaCalendarAlt />
        </div>
        <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">Calendar Deadline-uri</h1>
            <p className="text-blue-200/50 text-sm font-medium">Monitorizare vizuală a termenelor limită</p>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        
        {/* --- ZONA CALENDAR (Left) --- */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            {/* Element decorativ fundal */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="calendar-wrapper">
                <Calendar 
                    onChange={setDate} 
                    value={date} 
                    tileContent={tileContent}
                    className="custom-calendar"
                    locale="ro-RO"
                />
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                <div className="h-2 w-2 bg-red-500 rounded-full shadow-[0_0_5px_red]"></div>
                <span>Indică tichet activ scadent</span>
            </div>
        </div>

        {/* --- ZONA LISTA TICHETE (Right) --- */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col h-fit min-h-[500px]">
            <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-end">
                <div>
                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Selecție Dată</p>
                    <h2 className="text-3xl font-black text-white capitalize">
                        {date.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl text-white font-mono font-bold text-xl border border-white/5">
                    {selectedTickets.length}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {selectedTickets.length > 0 ? (
                    selectedTickets.map(ticket => (
                        // Folosim TicketItem existent, dar într-un container care îi ajustează lățimea
                        <div key={ticket._id} className="scale-95 origin-left w-full">
                            <TicketItem ticket={ticket} />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
                        <FaCheckCircle className="text-6xl text-emerald-500/50 mb-4" />
                        <h3 className="text-xl font-bold text-white">Niciun Deadline</h3>
                        <p className="text-blue-200/60 text-sm">Nu există tichete programate pentru această zi. Relaxează-te! ☕</p>
                    </div>
                )}
            </div>
        </div>

      </div>
      
      {/* --- STILIZARE CSS CUSTOM PENTRU REACT-CALENDAR --- */}
      <style>{`
        /* Container general */
        .calendar-wrapper .react-calendar {
            width: 100%;
            background: transparent;
            border: none;
            font-family: 'Poppins', sans-serif;
        }
        
        /* Navigare (Luna/An) */
        .calendar-wrapper .react-calendar__navigation button {
            color: white;
            font-size: 1.2rem;
            font-weight: 800;
            text-transform: capitalize;
            background: transparent !important;
        }
        .calendar-wrapper .react-calendar__navigation button:hover {
            background: rgba(255,255,255,0.1) !important;
            border-radius: 10px;
        }
        .calendar-wrapper .react-calendar__navigation button:disabled {
            background: transparent !important;
            opacity: 0.5;
        }

        /* Zilele Săptămânii (Luni, Mar...) */
        .calendar-wrapper .react-calendar__month-view__weekdays__weekday {
            color: #60a5fa; /* Blue-400 */
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            text-decoration: none;
        }
        .calendar-wrapper abbr {
            text-decoration: none;
        }

        /* Celulele calendarului (Zilele) */
        .calendar-wrapper .react-calendar__tile {
            height: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 15px;
            color: white;
            font-weight: 600;
            background: transparent;
            border-radius: 1.5rem;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        /* Hover pe zile */
        .calendar-wrapper .react-calendar__tile:enabled:hover,
        .calendar-wrapper .react-calendar__tile:enabled:focus {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }

        /* Ziua curentă (Azi) */
        .calendar-wrapper .react-calendar__tile--now {
            background: rgba(59, 130, 246, 0.2) !important; /* Blue tint */
            border: 1px solid rgba(59, 130, 246, 0.5);
            color: #60a5fa;
        }

        /* Ziua selectată */
        .calendar-wrapper .react-calendar__tile--active {
            background: #2563eb !important; /* Blue-600 */
            color: white !important;
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
            border: none;
            transform: scale(1.05);
        }

        /* Zile din luna vecină */
        .calendar-wrapper .react-calendar__month-view__days__day--neighboringMonth {
            color: rgba(255,255,255,0.2) !important;
        }

        /* Scrollbar custom pentru lista */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}

export default TicketCalendar;