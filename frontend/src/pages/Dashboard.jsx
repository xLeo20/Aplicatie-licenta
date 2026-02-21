import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

// Importăm cele 2 view-uri separate
import ClientDashboard from '../components/dashboards/ClientDashboard'
import AgentDashboard from '../components/dashboards/AgentDashboard'

function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading } = useSelector((state) => state.auth)

  // Redirecționăm la login dacă utilizatorul nu este autentificat
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (isLoading || !user) {
    return <div className="mt-20"><Spinner /></div>
  }

  // --- LOGICA DE "SEMAFOR" (ROUTING INTERN) ---
  return (
    <div className="w-full flex flex-col items-center px-4 py-8">
      {user.role === 'angajat' ? (
        <ClientDashboard />
      ) : (
        <AgentDashboard />
      )}
    </div>
  )
}

export default Dashboard