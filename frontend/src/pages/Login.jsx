import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { login, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const userData = {
      email,
      password,
    }

    dispatch(login(userData))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in fade-in zoom-in duration-500">
      
      {/* --- FORMULAR LOGIN (Dark Glass) --- */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] p-8 md:p-12 relative overflow-hidden ring-1 ring-white/5">
        
        {/* Bară colorată sus */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>

        <div className="text-center mb-10 mt-2">
          <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <FaSignInAlt className="text-4xl text-blue-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
            Autentificare
          </h1>
          <p className="text-blue-200/50 font-medium mt-2 text-sm">
            Conectează-te pentru a gestiona tichetele
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Câmp Email */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
              Adresă Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                id="email"
                name="email"
                value={email}
                placeholder="nume@companie.ro"
                onChange={onChange}
                required
              />
            </div>
          </div>

          {/* Câmp Parolă */}
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
              Parolă Acces
            </label>
            <div className="relative">
              <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="password"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                id="password"
                name="password"
                value={password}
                placeholder="••••••••"
                onChange={onChange}
                required
              />
            </div>
          </div>

          {/* Buton Submit */}
          <button className="w-full mt-8 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3">
            <FaSignInAlt className="group-hover:translate-x-1 transition-transform" />
            Intră în cont
          </button>

        </form>
      </div>
    </div>
  )
}

export default Login