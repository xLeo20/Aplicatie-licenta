import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

import ClientDashboard from '../components/dashboards/ClientDashboard'
import AgentDashboard from '../components/dashboards/AgentDashboard'

// Componenta de tip Wrapper/Router intern
// Rolul ei este de a servi dashboard-ul corect pe baza rolului (RBAC) din state-ul Redux, pastrand acelasi endpoint (/dashboard)
function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoading } = useSelector((state) => state.auth)

  // Middleware de rutare pentru sesiunile invalide
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (isLoading || !user) {
    return <div className="mt-20"><Spinner /></div>
  }

  return (
    <div className="w-full flex flex-col items-center px-4 py-8">
      {/* Switcher pe baza de rol: End-user vs Staff */}
      {user.role === 'angajat' ? (
        <ClientDashboard />
      ) : (
        <AgentDashboard />
      )}
    </div>
  )
}

export default Dashboard