import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'

// Rutare High-Order Component (HOC) folosita pentru impiedicarea incarcarii componentelor de tip "Protected"
// de catre utilizatorii care nu au un token JWT valid in state-ul aplicatiei
const PrivateRoute = () => {
  // Flag-urile "loggedIn" si "checkingStatus" sunt obtinute asincron dintr-un custom hook
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) {
    // Redam un loading state vizual minimal in faza de interceptare a tokenului
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Randare "Outlet" pentru a propaga fluxul catre copii, in caz de interdictie directionam fortat catre "/login"
  return loggedIn ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute