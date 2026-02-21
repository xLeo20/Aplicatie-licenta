import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaTicketAlt, FaBook, FaClipboardList, FaRegSmile } from 'react-icons/fa'

function ClientDashboard() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
      
      {/* Header Angajat */}
      <div className="w-full max-w-5xl mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg flex items-center justify-center md:justify-start gap-3">
            Salut, {user?.name.split(' ')[0]} <FaRegSmile className="text-emerald-400" />
          </h1>
          <p className="text-blue-200/50 text-sm font-medium mt-2">Bine ai venit în portalul de asistență. Cu ce te putem ajuta astăzi?</p>
        </div>
      </div>

      {/* Carduri de Acțiune (Butoane Mari) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <Link to="/new-ticket" className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 group-hover:scale-110 transition-transform">
            <FaTicketAlt />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Deschide Tichet</h2>
          <p className="text-blue-100/70 text-sm">Raportează o problemă nouă către departamentul IT sau HR.</p>
        </Link>

        <Link to="/knowledge-base" className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl hover:bg-slate-800/80 transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center ring-1 ring-white/5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            <FaBook />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Baza de Cunoștințe</h2>
          <p className="text-blue-200/50 text-sm">Caută soluții rapide, tutoriale și răspunsuri la întrebări frecvente.</p>
        </Link>

        <Link to="/tickets" className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl hover:bg-slate-800/80 transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center ring-1 ring-white/5">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
            <FaClipboardList />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Tichetele Mele</h2>
          <p className="text-blue-200/50 text-sm">Verifică stadiul solicitărilor tale și răspunde agenților.</p>
        </Link>

      </div>
    </div>
  )
}

export default ClientDashboard