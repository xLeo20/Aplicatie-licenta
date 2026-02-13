import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTicket, reset } from '../features/tickets/ticketSlice'
import { FaArrowLeft, FaPaperPlane, FaTicketAlt, FaUser, FaEnvelope, FaLayerGroup, FaExclamationTriangle } from 'react-icons/fa'
import Spinner from '../components/Spinner'

function NewTicket() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.tickets
  )

  const [name] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [product, setProduct] = useState('IT')
  const [priority, setPriority] = useState('Mica')
  const [description, setDescription] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (isError) { toast.error(message) }
    if (isSuccess) {
      dispatch(reset())
      navigate('/tickets')
    }
    dispatch(reset())
  }, [dispatch, isError, isSuccess, navigate, message])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createTicket({ product, description, priority }))
  }

  if (!user || isLoading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in zoom-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <Link to="/" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition-all border border-white/5 shadow-lg">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-blue-400" /> 
          <span className="font-bold text-sm uppercase tracking-wider">Dashboard</span>
        </Link>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-md flex items-center gap-3">
            <FaTicketAlt className="text-blue-500" /> Deschide Tichet
        </h1>
      </div>

      {/* --- CARD FORMULAR (Glassmorphism) --- */}
      <div className="w-full max-w-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden relative ring-1 ring-white/5">
        
        {/* Header Decorativ Card */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        
        <div className="p-8 md:p-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-2">Formular Asistență</h2>
                <p className="text-blue-200/50 text-sm font-medium">Completează detaliile de mai jos pentru a deschide un incident nou.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                
                {/* GRUP 1: DATE UTILIZATOR (ReadOnly) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            <FaUser /> Nume Client
                        </label>
                        <input 
                            type='text' 
                            className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 text-white/50 focus:outline-none cursor-not-allowed font-mono" 
                            value={name} 
                            disabled 
                        />
                    </div>
                    
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            <FaEnvelope /> Email Client
                        </label>
                        <input 
                            type='text' 
                            className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 text-white/50 focus:outline-none cursor-not-allowed font-mono" 
                            value={email} 
                            disabled 
                        />
                    </div>
                </div>

                {/* GRUP 2: SELECȚII TICHET */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">
                            <FaLayerGroup /> Departament / Produs
                        </label>
                        <div className="relative">
                            <select 
                                name='product' 
                                id='product' 
                                value={product} 
                                onChange={(e) => setProduct(e.target.value)}
                                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:bg-slate-900"
                            >
                                <option className="bg-slate-900" value='IT'>IT & Hardware</option>
                                <option className="bg-slate-900" value='HR'>Resurse Umane</option>
                                <option className="bg-slate-900" value='Financiar'>Financiar & Contabilitate</option>
                                <option className="bg-slate-900" value='iPhone'>Dispozitive Mobile (iPhone)</option>
                                <option className="bg-slate-900" value='Macbook'>Laptop (Macbook)</option>
                                <option className="bg-slate-900" value='iMac'>Workstation (iMac)</option>
                                <option className="bg-slate-900" value='iPad'>Tablete (iPad)</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">
                            <FaExclamationTriangle /> Nivel Prioritate
                        </label>
                        <div className="relative">
                            <select 
                                name='priority' 
                                id='priority' 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:bg-slate-900"
                            >
                                <option className="bg-slate-900 text-emerald-400 font-bold" value='Mica'>🔵 Prioritate Mică</option>
                                <option className="bg-slate-900 text-amber-400 font-bold" value='Medie'>🟠 Prioritate Medie</option>
                                <option className="bg-slate-900 text-red-500 font-bold" value='Mare'>🔴 Prioritate Mare</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                        </div>
                    </div>
                </div>

                {/* GRUP 3: DESCRIERE */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                        Descriere Detaliată
                    </label>
                    <textarea 
                        name='description' 
                        id='description' 
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[150px] resize-y" 
                        placeholder='Descrie problema întâmpinată, pașii de reproducere sau mesajul de eroare...' 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                {/* BUTON SUBMIT */}
                <button type='submit' className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3">
                    <FaPaperPlane className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    Trimite Solicitarea
                </button>

            </form>
        </div>
      </div>
    </div>
  )
}

export default NewTicket