import { useEffect, useState, useRef } from 'react' 
import { FaSignInAlt, FaSignOutAlt, FaUser, FaTools, FaChartLine, FaCalendarAlt, FaClipboardList, FaBook, FaBell, FaCheckDouble } from 'react-icons/fa' 
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { toast } from 'react-toastify' 
import { io } from 'socket.io-client' 

const socket = io('http://localhost:5000')

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  
  // State pentru Notificări
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState([]) // Aici salvăm lista
  
  const dropdownRef = useRef(null) // Pentru a închide meniul când dai click în afara lui

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

  // --- LOGICA SOCKET.IO & NOTIFICĂRI ---
  useEffect(() => {
    if (user) {
      socket.on('notificare_noua', (data) => {
        // Afișăm toast-ul scurt
        toast.info(data.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark", 
        });
        
        // Adăugăm notificarea în lista noastră (la început)
        setNotifications((prev) => [
          {
             id: Date.now(), 
             message: data.message, 
             ticketId: data.ticketId, 
             time: new Date() 
          },
          ...prev
        ])
        
        setHasNewNotification(true)
      })
    }

    return () => {
      socket.off('notificare_noua')
    }
  }, [user])

  // Închide dropdown-ul dacă dai click oriunde altundeva pe ecran
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const handleBellClick = () => {
    setHasNewNotification(false) // Stingem ledul
    setIsDropdownOpen(!isDropdownOpen) // Deschidem/Închidem meniul
  }

  const goToTicket = (ticketId) => {
    setIsDropdownOpen(false)
    navigate(`/ticket/${ticketId}`)
  }

  const clearNotifications = () => {
    setNotifications([])
    setIsDropdownOpen(false)
  }

  const isActive = (path) => location.pathname === path ? 'text-blue-400 bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'

  return (
    <header className="w-full max-w-6xl mt-6 mb-10 px-4 z-50 relative">
      <nav className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-2xl ring-1 ring-white/5 gap-4 relative">
        
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
            <div className="flex items-center gap-5">
              
              {/* --- ZONA CLOPOȚEL & DROPDOWN --- */}
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="relative cursor-pointer text-white/50 hover:text-white transition-colors p-2"
                  onClick={handleBellClick}
                  title="Notificări"
                >
                  <FaBell size={20} className={hasNewNotification ? "animate-[ring_1s_ease-in-out_infinite] text-blue-400" : ""} />
                  {hasNewNotification && (
                    <span className="absolute top-1 right-1 -mt-1 -mr-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
                    </span>
                  )}
                </div>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-4 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                      <h3 className="text-white font-bold text-sm tracking-widest uppercase">Notificări Recente</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-blue-400/50 hover:text-blue-400 transition-colors" title="Șterge toate">
                          <FaCheckDouble size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => goToTicket(notif.ticketId)}
                            className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <p className="text-xs text-blue-100/80 leading-relaxed group-hover:text-white transition-colors">{notif.message}</p>
                            <p className="text-[10px] text-blue-400/50 mt-2 font-mono uppercase tracking-widest">{notif.time.toLocaleTimeString('ro-RO')}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                          <FaBell className="text-white/10 text-3xl" />
                          <p className="text-white/40 text-xs italic">Nu ai nicio notificare momentan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <style>{`
                @keyframes ring {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(15deg); }
                  75% { transform: rotate(-15deg); }
                }
              `}</style>

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