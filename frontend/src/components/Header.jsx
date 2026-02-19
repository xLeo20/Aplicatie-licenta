import { FaSignInAlt, FaSignOutAlt, FaUser, FaTools, FaChartLine, FaCalendarAlt, FaClipboardList, FaBook } from 'react-icons/fa'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

  // Helper pentru a vedea ce link este activ
  const isActive = (path) => location.pathname === path ? 'text-blue-400 bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'

  return (
    <header className="w-full max-w-6xl mt-6 mb-10 px-4">
      <nav className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-2xl ring-1 ring-white/5 gap-4">
        
        {/* LOGO SECTION */}
        <div className="flex items-center">
          <Link to='/' className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] group-hover:rotate-12 transition-transform">
              <FaTools className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-xl leading-none uppercase italic">Sistem</span>
              <span className="text-blue-400 font-bold text-xs tracking-[0.2em] uppercase leading-none">Ticketing</span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <ul className="flex flex-wrap justify-center items-center gap-2">
          {user ? (
            <>
              {/* Doar pentru Admin */}
              {user.role === 'admin' && (
                <li>
                  <Link to='/admin' className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/admin')}`}>
                    <FaTools /> Admin Panel
                  </Link>
                </li>
              )}
              
              <li>
                <Link to='/dashboard' className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/dashboard')}`}>
                  <FaChartLine /> Dashboard
                </Link>
              </li>

              <li>
                <Link to='/calendar' className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/calendar')}`}>
                  <FaCalendarAlt /> Calendar
                </Link>
              </li>

              <li>
                <Link to='/tickets' className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/tickets')}`}>
                  <FaClipboardList /> Tichete
                </Link>
              </li>
                <li>
                <Link to='/knowledge-base' className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive('/knowledge-base')}`}>
                <FaBook /> FAQ
                   </Link>
                </li>
              
            </>
          ) : null}
        </ul>

        {/* USER ACTIONS */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Profil Link */}
              <Link to='/profile' className="flex items-center gap-2 group">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-white font-bold text-sm leading-none">{user.name}</span>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest opacity-70">{user.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden group-hover:border-blue-500 transition-colors">
                  {user.profileImage ? (
                    <img src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                      <FaUser />
                    </div>
                  )}
                </div>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 p-3 rounded-xl transition-all shadow-lg active:scale-95"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to='/login' className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm transition-all">
                <FaSignInAlt /> Login
              </Link>
              <Link to='/register' className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2 rounded-xl shadow-lg transition-all text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header