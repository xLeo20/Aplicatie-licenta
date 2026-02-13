import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import BackButton from '../components/BackButton'
import TicketItem from '../components/TicketItem'
import { FaSearch, FaFilter, FaFilePdf, FaTicketAlt } from 'react-icons/fa'

function Tickets() {
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Toate Statusurile')

  useEffect(() => {
    dispatch(getTickets())
    return () => { if (isSuccess) dispatch(reset()) }
  }, [dispatch, isSuccess])

  if (isLoading) return <Spinner />

  // Filtrare Tichete
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (ticket.ticketId && ticket.ticketId.toString().includes(searchTerm))
    const matchesStatus = filterStatus === 'Toate Statusurile' || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <BackButton url='/' />
          <h1 className="text-4xl font-black text-white drop-shadow-md flex items-center gap-3">
            <FaTicketAlt className="text-blue-300" /> Toate Tichetele
          </h1>
        </div>
        <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all active:scale-95">
          <FaFilePdf /> Export PDF
        </button>
      </div>

      {/* --- FILTRE (Glassmorphism) --- */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
            <input 
              type="text"
              placeholder="Caută după produs sau ID..."
              className="w-full bg-white/10 border border-white/30 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/50 focus:bg-white/20 outline-none transition-all focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
            <select 
              className="w-full bg-white/10 border border-white/30 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Toate Statusurile" className="text-gray-900">Toate Statusurile</option>
              <option value="new" className="text-gray-900">Noi</option>
              <option value="open" className="text-gray-900">În Lucru</option>
              <option value="suspended" className="text-gray-900">Suspendate</option>
              <option value="closed" className="text-gray-900">Închise</option>
            </select>
          </div>

          {/* Info Statistici Rapid */}
          <div className="flex items-center justify-end text-white/80 font-medium">
            Rezultate găsite: <span className="ml-2 bg-white/20 px-3 py-1 rounded-full text-white">{filteredTickets.length}</span>
          </div>
        </div>
      </div>

      {/* --- LISTA TICHETE --- */}
      <div className="space-y-4">
        {/* Header Tabel (Vizibil doar pe desktop) */}
       <div className="hidden md:grid grid-cols-5 gap-4 px-8 py-4 text-white/60 font-bold uppercase text-xs tracking-widest border-b border-white/10 mb-2">
        <div className="text-left">Dată / ID</div>
          <div className="text-left">Produs</div>
          <div className="text-center">Prioritate / SLA</div>
        <div className="text-center">Status</div>
        <div className="text-right">Acțiune</div>
      </div>

        {/* Randurile propriu-zise */}
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketItem key={ticket._id} ticket={ticket} />
          ))
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl py-20 text-center">
            <p className="text-white/60 text-xl italic">Nu am găsit tichete conform filtrelor tale...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tickets