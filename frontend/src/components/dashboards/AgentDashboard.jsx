import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../../features/tickets/ticketSlice'
import Spinner from '../Spinner'
import { FaTicketAlt, FaExclamationCircle, FaCheckCircle, FaPlus, FaHistory, FaChartBar, FaChartPie, FaUserShield } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function AgentDashboard() {
  const { user } = useSelector((state) => state.auth)
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTickets())
    return () => { if (isSuccess) dispatch(reset()) }
  }, [dispatch, isSuccess])

  if (isLoading) return <Spinner />

  // --- LOGICA STATISTICI ---
  const totalTickets = tickets.length
  const activeTickets = tickets.filter(t => t.status === 'new' || t.status === 'open').length
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length
  const urgentTickets = tickets.filter(t => t.priority === 'Mare' && t.status !== 'closed')

  // Grafic Status
  const pieData = {
    labels: ['Noi', 'În Lucru', 'Suspendate', 'Închise'],
    datasets: [{
      data: [
        tickets.filter(t => t.status === 'new').length,
        tickets.filter(t => t.status === 'open').length,
        tickets.filter(t => t.status === 'suspended').length,
        tickets.filter(t => t.status === 'closed').length
      ],
      backgroundColor: ['#3b82f6', '#6366f1', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  }

  // Grafic Prioritate
  const barData = {
    labels: ['Mică', 'Medie', 'Mare'],
    datasets: [{
      label: 'Tichete',
      data: [
        tickets.filter(t => t.priority === 'Mica').length,
        tickets.filter(t => t.priority === 'Medie').length,
        tickets.filter(t => t.priority === 'Mare').length
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 8
    }]
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
      
      {/* --- HEADER AGENT --- */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <FaUserShield />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
              Command Center
            </h1>
            <p className="text-blue-200/50 text-xs font-bold tracking-widest uppercase mt-1">Nivel Acces: {user?.role}</p>
          </div>
        </div>
        <Link to="/new-ticket" className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 tracking-widest text-sm uppercase">
          <FaPlus /> Crează Tichet
        </Link>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl ring-1 ring-white/5 group hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"><FaTicketAlt /></div>
          <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Total Tichete</p><h3 className="text-4xl font-black text-white">{totalTickets}</h3></div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl ring-1 ring-white/5 group hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"><FaExclamationCircle /></div>
          <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Active (Noi + Lucru)</p><h3 className="text-4xl font-black text-white">{activeTickets}</h3></div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl ring-1 ring-white/5 group hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform"><FaCheckCircle /></div>
          <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Rezolvate</p><h3 className="text-4xl font-black text-white">{resolvedTickets}</h3></div>
        </div>
      </div>

      {/* --- GRAFICE --- */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-gray-800 text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2"><FaChartPie className="text-blue-600" /> Status Tichete</h3>
          <div className="h-[300px] flex justify-center"><Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold' } } } } }} /></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-gray-800 text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2"><FaChartBar className="text-indigo-600" /> Distribuție Prioritate</h3>
          <div className="h-[300px]"><Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } } } }} /></div>
        </div>
      </div>

      {/* --- URGENȚE --- */}
      <div className="w-full max-w-6xl bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[2.5rem] p-8 mb-10">
        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase italic"><FaExclamationCircle className="text-red-500 animate-pulse" /> Urgențe Active</h3>
        {urgentTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentTickets.map(ticket => (
              <div key={ticket._id} className="bg-white/90 p-5 rounded-2xl flex justify-between items-center hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md w-fit mb-1">URGENT</span>
                  <span className="font-bold text-gray-800 text-lg">{ticket.product}</span>
                </div>
                <Link to={`/ticket/${ticket._id}`} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-600 transition-colors">DETALII</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/5 rounded-3xl border border-white/5">
             <p className="text-blue-100/60 text-lg italic">Nu există urgențe active. Totul este sub control! ✨</p>
          </div>
        )}
      </div>

      {/* --- ISTORIC --- */}
      <Link to="/tickets" className="group flex items-center gap-3 bg-slate-900 text-white font-black py-5 px-12 rounded-2xl shadow-2xl hover:bg-black transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">
        <FaHistory className="group-hover:rotate-[-20deg] transition-transform" />
        Vezi Toate Tichetele
      </Link>

    </div>
  )
}

export default AgentDashboard