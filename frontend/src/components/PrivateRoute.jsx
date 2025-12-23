import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus()

  if (checkingStatus) {
    return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Se încarcă...</h1>
  }

  return loggedIn ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute