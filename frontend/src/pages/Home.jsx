import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaQuestionCircle, FaTicketAlt, FaChartPie } from 'react-icons/fa'

function Home() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="container mx-auto px-4 py-12">
        
        {/* --- HERO SECTION (Titlu) --- */}
        <section className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md tracking-tight">
                Salut, {user ? user.name : 'Vizitator'}!
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                Bine ai venit pe platforma de Help Desk. Ce dorești să faci astăzi?
            </p>
        </section>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* CARD 1: TICHET NOU */}
            <Link to="/new-ticket" className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                    <FaQuestionCircle />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Ai o problemă?</h2>
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                    Deschide un tichet nou și un agent va prelua solicitarea ta în cel mai scurt timp posibil.
                </p>
                <span className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-bold shadow-md group-hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <FaQuestionCircle className="text-sm" /> Creează Tichet Nou
                </span>
            </Link>

            {/* CARD 2: DASHBOARD */}
             <Link to="/dashboard" className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                    <FaChartPie />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Dashboard & Statistici</h2>
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                    Vezi o privire de ansamblu asupra sistemului, grafice de performanță și tichete urgente.
                </p>
                <span className="w-full py-3 px-6 rounded-xl bg-purple-600 text-white font-bold shadow-md group-hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <FaChartPie className="text-sm" /> Mergi la Dashboard
                </span>
            </Link>

            {/* CARD 3: ISTORIC */}
             <Link to="/tickets" className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                    <FaTicketAlt />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Istoric Complet</h2>
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                     Accesează lista detaliată a tuturor tichetelor tale (închise, deschise sau suspendate).
                </p>
                <span className="w-full py-3 px-6 rounded-xl bg-pink-600 text-white font-bold shadow-md group-hover:bg-pink-700 transition-colors flex items-center justify-center gap-2">
                    <FaTicketAlt className="text-sm" /> Vezi Lista
                </span>
            </Link>

        </div>
    </div>
  )
}

export default Home