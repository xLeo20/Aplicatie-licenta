import { FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
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
    <header className='header' style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #e6e6e6', marginBottom: '60px' }}>
      <div className='logo'>
        <Link to='/' style={{ fontWeight: 'bold', fontSize: '20px' }}>Sistem Ticketing</Link>
      </div>
      <ul style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            {/* Buton vizibil doar pentru ADMIN */}
            {user.role === 'admin' && (
              <li>
                <Link to='/admin' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaUser /> Admin Panel
                </Link>
              </li>
            )}

            <li>
              <button className='btn' onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '16px' }}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaSignInAlt /> Login
              </Link>
            </li>
            <li>
              <Link to='/register' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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