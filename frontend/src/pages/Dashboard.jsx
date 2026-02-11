import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { FaTicketAlt, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa'

// Inregistram componentele ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  )
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) { console.log(message) }
    if (!user) { navigate('/login') }

    dispatch(getTickets())

    return () => { dispatch(reset()) }
  }, [user, navigate, isError, message, dispatch])

  if (isLoading) return <Spinner />

  // --- CALCULARE STATISTICI ---
  
  // 1. Calcule pentru Status (Pie Chart)
  const newCount = tickets.filter(t => t.status === 'new').length
  const openCount = tickets.filter(t => t.status === 'open').length
  const suspendedCount = tickets.filter(t => t.status === 'suspended').length
  const closedCount = tickets.filter(t => t.status === 'closed').length

  // 2. Calcule pentru Prioritate (Bar Chart)
  const lowCount = tickets.filter(t => t.priority === 'Mica').length
  const medCount = tickets.filter(t => t.priority === 'Medie').length
  const highCount = tickets.filter(t => t.priority === 'Mare').length

  // 3. Tichete Urgente (Lista)
  const urgentTickets = tickets
    .filter(t => t.priority === 'Mare' && t.status !== 'closed')
    .slice(0, 5) // Luam doar primele 5

  // --- CONFIGURARE GRAFICE ---

  // Date Pie Chart (Status)
  const pieData = {
    labels: ['Noi', 'În Lucru', 'Suspendate', 'Închise'],
    datasets: [
      {
        label: '# Tichete',
        data: [newCount, openCount, suspendedCount, closedCount],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',   // Verde (Nou)
          'rgba(70, 130, 180, 0.8)',  // Albastru (Open)
          'rgba(255, 165, 0, 0.8)',   // Portocaliu (Suspendat)
          'rgba(220, 53, 69, 0.8)',   // Rosu (Inchis)
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(70, 130, 180, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Date Bar Chart (Prioritate)
  const barData = {
    labels: ['Mică', 'Medie', 'Mare'],
    datasets: [
      {
        label: 'Număr Tichete',
        data: [lowCount, medCount, highCount],
        backgroundColor: 'rgba(53, 162, 235, 0.6)',
        borderRadius: 5,
      },
    ],
  }

  const optionsBar = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Distribuție după Prioritate' },
    },
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div>
            <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>Dashboard</h1>
            <p style={{color: '#555'}}>Analiză generală a sistemului</p>
        </div>
        <Link to="/new-ticket" className="btn btn-reverse">
            <FaTicketAlt /> Tichet Nou
        </Link>
      </div>

      {/* --- RANDUL 1: STATISTICI RAPIDE (CARDURI) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className='home-card' style={{ padding: '20px !important', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaTicketAlt size={40} color="steelblue" />
            <div>
                <h3 style={{fontSize: '2rem', margin: 0}}>{tickets.length}</h3>
                <p style={{margin: 0, color: '#666'}}>Total Tichete</p>
            </div>
        </div>

        <div className='home-card' style={{ padding: '20px !important', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaExclamationCircle size={40} color="#dc3545" />
            <div>
                <h3 style={{fontSize: '2rem', margin: 0}}>{newCount + openCount}</h3>
                <p style={{margin: 0, color: '#666'}}>Active (Noi + Open)</p>
            </div>
        </div>

        <div className='home-card' style={{ padding: '20px !important', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaCheckCircle size={40} color="green" />
            <div>
                <h3 style={{fontSize: '2rem', margin: 0}}>{closedCount}</h3>
                <p style={{margin: 0, color: '#666'}}>Rezolvate</p>
            </div>
        </div>
      </div>

      

      {/* --- RANDUL 2: GRAFICE (GRID 2 COL) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        
        {/* PIE CHART */}
        <div className='home-card' style={{ padding: '20px !important', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{marginBottom: '20px'}}>Status Tichete</h3>
            <div style={{ width: '100%', maxWidth: '300px' }}>
                <Pie data={pieData} />
            </div>
        </div>

        {/* BAR CHART */}
        <div className='home-card' style={{ padding: '20px !important', minHeight: '350px' }}>
             <Bar options={optionsBar} data={barData} />
        </div>
      </div>

      {/* --- RANDUL 3: LISTA URGENTE --- */}
      <div className='home-card' style={{ padding: '20px !important' }}>
        <h3 style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <FaExclamationCircle color="#dc3545"/> Urgențe Active (Prioritate Mare)
        </h3>
        
        {urgentTickets.length > 0 ? (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{textAlign: 'left', borderBottom: '2px solid #eee'}}>
                        <th style={{padding: '10px'}}>Produs</th>
                        <th style={{padding: '10px'}}>Dată</th>
                        <th style={{padding: '10px'}}>Status</th>
                        <th style={{padding: '10px'}}>Acțiune</th>
                    </tr>
                </thead>
                <tbody>
                    {urgentTickets.map(ticket => (
                        <tr key={ticket._id} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '10px', fontWeight: 'bold'}}>{ticket.product}</td>
                            <td style={{padding: '10px'}}>{new Date(ticket.createdAt).toLocaleDateString('ro-RO')}</td>
                            <td style={{padding: '10px'}}>
                                <span className={`status status-${ticket.status}`}>{ticket.status}</span>
                            </td>
                            <td style={{padding: '10px'}}>
                                <Link to={`/ticket/${ticket._id}`} className="btn btn-sm">Vezi</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p>Nu există tichete urgente active. Totul este sub control! 🎉</p>
        )}
      </div>

      {/* --- BUTON CATRE ISTORIC COMPLET --- */}
      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <Link to='/tickets' className='btn btn-block' style={{ background: '#333', color: '#fff', fontSize: '1.2rem', padding: '15px' }}>
              <FaTicketAlt /> Vezi Tot Istoricul Tichetelor
          </Link>
      </div>
    </>
  )
}

export default Dashboard