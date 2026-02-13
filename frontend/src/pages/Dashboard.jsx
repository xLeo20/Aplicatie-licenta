import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import { FaTicketAlt, FaExclamationCircle, FaCheckCircle, FaPlus, FaHistory } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function Dashboard() {
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTickets())
    return () => { if (isSuccess) dispatch(reset()) }
  }, [dispatch, isSuccess])

  if (isLoading) return <Spinner />

  // --- LOGICA CALCUL STATISTICI ---
  const totalTickets = tickets.length
  const activeTickets = tickets.filter(t => t.status === 'new' || t.status === 'open').length
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length
  const urgentTickets = tickets.filter(t => t.priority === 'Mare' && t.status !== 'closed')

  // Date Grafic Pie (Status)
  const pieData = {
    labels: ['Noi', 'În Lucru', 'Suspendate', 'Închise'],
    datasets: [{
      data: [
        tickets.filter(t => t.status === 'new').length,
        tickets.filter(t => t.status === 'open').length,
        tickets.filter(t => t.status === 'suspended').length,
        tickets.filter(t => t.status === 'closed').length
      ],
      backgroundColor: ['#3b82f6', '#0ea5e9', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  }

  // Date Grafic Bar (Prioritate)
  const barData = {
    labels: ['Mică', 'Medie', 'Mare'],
    datasets: [{
      label: 'Număr Tichete',
      data: [
        tickets.filter(t => t.priority === 'Mica').length,
        tickets.filter(t => t.priority === 'Medie').length,
        tickets.filter(t => t.priority === 'Mare').length
      ],
      backgroundColor: '#6366f1',
      borderRadius: 8,
    }]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-md">Dashboard Analiză</h1>
          <p className="text-blue-100 opacity-90">Privire de ansamblu asupra performanței sistemului</p>
        </div>
        <Link to="/new-ticket" className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1">
          <FaPlus /> Crează Tichet
        </Link>
      </div>

      {/* --- KPI CARDS (Statistici Sus) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card Total */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
            <FaTicketAlt />
          </div>
          <div>
            <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Total Tichete</p>
            <h3 className="text-3xl font-black text-gray-800">{totalTickets}</h3>
          </div>
        </div>

        {/* Card Active */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">
            <FaExclamationCircle />
          </div>
          <div>
            <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Active (Noi + Lucru)</p>
            <h3 className="text-3xl font-black text-gray-800">{activeTickets}</h3>
          </div>
        </div>

        {/* Card Rezolvate */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 flex items-center gap-5">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">Rezolvate</p>
            <h3 className="text-3xl font-black text-gray-800">{resolvedTickets}</h3>
          </div>
        </div>
      </div>

      {/* --- GRAFICE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Distribuție Status */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Status Tichete
          </h3>
          <div className="h-[300px] flex justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        {/* Distribuție Prioritate */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Prioritate
          </h3>
          <div className="h-[300px]">
            <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* --- URGENTE ACTIVE --- */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-10">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FaExclamationCircle className="text-red-400 animate-pulse" /> Urgențe Active (Prioritate Mare)
        </h3>
        
        {urgentTickets.length > 0 ? (
          <div className="space-y-4">
            {urgentTickets.map(ticket => (
              <div key={ticket._id} className="bg-white/90 p-4 rounded-2xl flex justify-between items-center hover:bg-white transition-colors">
                <div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md mr-3">URGENT</span>
                  <span className="font-semibold text-gray-800">{ticket.product}</span>
                </div>
                <Link to={`/ticket/${ticket._id}`} className="text-indigo-600 font-bold text-sm hover:underline">Vezi Detalii</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-100 text-center py-4 italic">Nu există urgențe active. Totul este sub control! ✨</p>
        )}
      </div>

      {/* --- BUTON ISTORIC JOS --- */}
      <div className="flex justify-center">
        <Link to="/tickets" className="group flex items-center gap-3 bg-gray-900 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl hover:bg-black transition-all transform hover:scale-105">
          <FaHistory className="group-hover:rotate-[-20deg] transition-transform" />
          Vezi Tot Istoricul Tichetelor
        </Link>
      </div>

    </div>
  )
}

export default Dashboard