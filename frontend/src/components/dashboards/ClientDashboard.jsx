import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaTicketAlt, FaBook, FaClipboardList, FaRegSmile, FaClock, FaCheckCircle, FaPauseCircle, FaInfoCircle } from 'react-icons/fa'
import { getTickets } from '../../features/tickets/ticketSlice'
import Spinner from '../Spinner'

import { io } from 'socket.io-client'
const socket = io('http://localhost:5000')

function ClientDashboard() {
  const dispatch = useDispatch()
  
  const { user } = useSelector((state) => state.auth)
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets)

  useEffect(() => {
    dispatch(getTickets())

    socket.on('ticketUpdated', () => {
      dispatch(getTickets())
    })

    return () => {
      socket.off('ticketUpdated')
    }
  }, [dispatch])

  if (isLoading && !isSuccess) {
      return <Spinner />
  }

  const activeTickets = tickets.filter(t => t.status === 'new' || t.status === 'open')
  const suspendedTickets = tickets.filter(t => t.status === 'suspended')
  const closedTickets = tickets.filter(t => t.status === 'closed')

  const recentTickets = tickets.slice(0, 4)

  const getStatusStyle = (status) => {
    switch(status) {
        case 'new': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'suspended': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        case 'closed': return 'bg-red-500/20 text-red-400 border-red-500/30'
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status) => {
    const texts = { new: 'În Așteptare', open: 'În Lucru', suspended: 'Pe Pauză', closed: 'Rezolvat' }
    return texts[status] || status
  }

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
      
      <div className="w-full max-w-5xl mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg flex items-center justify-center md:justify-start gap-3">
            Salut, {user?.name.split(' ')[0]} <FaRegSmile className="text-emerald-400" />
          </h1>
          <p className="text-blue-200/50 text-sm font-medium mt-2">Bine ai venit în portalul de asistență IT. Cu ce te putem ajuta astăzi?</p>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <Link to="/new-ticket" className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 group-hover:scale-110 transition-transform">
            <FaTicketAlt />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Deschide Tichet</h2>
          <p className="text-blue-100/70 text-sm">Raportează o problemă sau cere suport tehnic către un departament.</p>
        </Link>

        <Link to="/knowledge-base" className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl hover:bg-slate-800/80 transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center ring-1 ring-white/5">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            <FaBook />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Baza de Cunoștințe</h2>
          <p className="text-blue-200/50 text-sm">Documentație internă, soluții Self-Service și răspunsuri frecvente.</p>
        </Link>

        <Link to="/tickets" className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl hover:bg-slate-800/80 transition-all transform hover:-translate-y-2 border border-white/10 group flex flex-col items-center text-center ring-1 ring-white/5">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
            <FaClipboardList />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Solicitările Mele</h2>
          <p className="text-blue-200/50 text-sm">Urmărește evoluția sesizărilor tale și menține legătura cu tehnicianul.</p>
        </Link>

      </div>

      <div className="w-full max-w-5xl animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-slate-800/50 transition-all">
                <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Tichete Active</p>
                    <h3 className="text-4xl font-black text-white">{activeTickets.length}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    <FaClock />
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-slate-800/50 transition-all">
                <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">În Așteptare</p>
                    <h3 className="text-4xl font-black text-white">{suspendedTickets.length}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    <FaPauseCircle />
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg flex items-center justify-between group hover:bg-slate-800/50 transition-all">
                <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Finalizate</p>
                    <h3 className="text-4xl font-black text-white">{closedTickets.length}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    <FaCheckCircle />
                </div>
            </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl mb-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <FaInfoCircle className="text-blue-400" /> Activitate Recentă
                </h3>
                <Link to="/tickets" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
                    Vezi Tot Istoricul &rarr;
                </Link>
            </div>

            {recentTickets.length === 0 ? (
                <div className="text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/10">
                    <FaClipboardList className="mx-auto text-4xl text-white/20 mb-3" />
                    <p className="text-slate-400 italic">Nu ai deschis niciun tichet încă. Sistemul așteaptă solicitările tale.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-widest">
                                <th className="p-3 font-black">ID Tichet</th>
                                <th className="p-3 font-black">Categorie</th>
                                <th className="p-3 font-black text-center">Status Curent</th>
                                <th className="p-3 font-black text-right">Acțiune</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTickets.map(ticket => (
                                <tr key={ticket._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="p-3 font-mono text-sm text-blue-300 font-bold">
                                        #{ticket.ticketId || ticket._id.substring(ticket._id.length - 4)}
                                    </td>
                                    <td className="p-3 text-white font-medium">
                                        <span className="block text-[10px] text-white/50 uppercase tracking-widest font-bold mb-0.5">{ticket.issueType || 'N/A'}</span>
                                        {ticket.category || 'N/A'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                                            {getStatusText(ticket.status)}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Link to={`/ticket/${ticket._id}`} className="text-blue-400 hover:text-white font-bold text-xs bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 px-4 py-2 rounded-xl transition-all inline-block">
                                            Deschide
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>

    </div>
  )
}

export default ClientDashboard