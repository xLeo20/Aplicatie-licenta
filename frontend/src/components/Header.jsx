import { FaSignInAlt, FaSignOutAlt, FaUser, FaUserCircle, FaList, FaChartBar, FaCalendarAlt } from 'react-icons/fa' // <--- Am adaugat FaColumns aici
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

  // Helper pentru a decide ce afisam: Poza sau Iconita
  const getProfileImage = () => {
      if (user && user.profileImage) {
          const imgUrl = user.profileImage.startsWith('http') 
            ? user.profileImage 
            : `http://localhost:5000${user.profileImage}`;
            
          return (
            <img 
              src={imgUrl} 
              alt="Avatar" 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                marginRight: '5px',
                border: '2px solid white' 
              }} 
            />
          );
      }
      return <FaUserCircle style={{ marginRight: '5px', fontSize: '20px' }} />;
  }

  return (
    <header className='header' style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #e6e6e6', marginBottom: '60px', alignItems: 'center' }}>
      <div className='logo'>
        <Link to='/' style={{ fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#000' }}>
            Sistem Ticketing
        </Link>
      </div>
      
      <ul style={{ display: 'flex', gap: '20px', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
        {user ? (
          <>
            {/* 1. Buton ADMIN (Vizibil doar pentru admini) */}
            {user.role === 'admin' && (
              <li>
                <Link to='/admin' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
                  <FaUser /> Admin Panel
                </Link>
              </li>
            )}

            {/* 2. Buton DASHBOARD */}
            <li>
                <Link to='/dashboard' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
                   <FaChartBar /> Dashboard
                </Link>
            </li>

            {/* 3. Buton CALENDAR (In loc de Kanban) */}
            <li>
                <Link to='/calendar' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
                   <FaCalendarAlt /> Calendar
                </Link>
            </li>

            {/* 4. Buton LISTA COMPLETA */}
            <li>
                <Link to='/tickets' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none', fontWeight: 'bold' }}>
                   <FaList /> Toate Tichetele
                </Link>
            </li>

            {/* 5. Link PROFIL */}
            <li>
                <Link to='/profile' style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#000', textDecoration: 'none' }}>
                    {getProfileImage()}
                    {user.name}
                </Link>
            </li>

            {/* 6. Buton LOGOUT */}
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