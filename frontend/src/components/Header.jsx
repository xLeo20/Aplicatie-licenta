import { FaSignInAlt, FaSignOutAlt, FaUser, FaUserCircle } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

  return (
    <header className='header' style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #e6e6e6', marginBottom: '60px', alignItems: 'center' }}>
      <div className='logo'>
        <Link to='/' style={{ fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#000' }}>
            Sistem Ticketing
        </Link>
      </div>
      
      {/* Aici am adaugat listStyle: 'none' ca sa dispara punctele negre */}
      <ul style={{ display: 'flex', gap: '20px', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
        {user ? (
          <>
            {/* Buton vizibil doar pentru ADMIN */}
            {user.role === 'admin' && (
              <li>
                <Link to='/admin' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
                  <FaUser /> Admin Panel
                </Link>
              </li>
            )}

            {/* Link catre Profil (Numele Userului) */}
            <li>
                <Link to='/profile' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none' }}>
                    <FaUserCircle /> {user.name}
                </Link>
            </li>

            <li>
              <button className='btn' onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px', fontSize: '14px' }}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none' }}>
                <FaSignInAlt /> Login
              </Link>
            </li>
            <li>
              <Link to='/register' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none' }}>
                <FaUser /> Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  )
}

export default Header