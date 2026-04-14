import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTicket, reset } from '../features/tickets/ticketSlice'
import { FaArrowLeft, FaPaperPlane, FaTicketAlt, FaUser, FaEnvelope, FaLayerGroup, FaExclamationTriangle, FaPaperclip, FaCloudUploadAlt, FaTimes, FaBug } from 'react-icons/fa'
import Spinner from '../components/Spinner'
import axios from 'axios'

function NewTicket() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.tickets
  )

  const [name] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  
  const [issueType, setIssueType] = useState('Incident')
  const [category, setCategory] = useState('Hardware & Echipamente')
  const [priority, setPriority] = useState('Mica')
  const [description, setDescription] = useState('')
  
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      dispatch(reset())
      navigate('/tickets')
    }

  }, [dispatch, isError, isSuccess, navigate, message])

  const onSubmit = async (e) => {
    e.preventDefault()

    let attachmentPath = null

    if (file) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('attachment', file)

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            }
            const res = await axios.post('/api/tickets/upload', formData, config)
            attachmentPath = res.data 
        } catch (error) {
            setIsUploading(false)
            toast.error('Eroare la incarcarea atasamentului. Va rugam sa incercati din nou.')
            return 
        }
    }

    dispatch(createTicket({ 
        issueType,
        category, 
        description, 
        priority, 
        attachment: attachmentPath 
    }))
    setIsUploading(false)
  }

  const handleFileRemove = () => {
      setFile(null);
      document.getElementById('dropzone-file').value = ""; 
  }

  if (!user || isLoading || isUploading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in zoom-in duration-500">
      
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <Link to="/" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition-all border border-white/5 shadow-lg">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-blue-400" /> 
          <span className="font-bold text-sm uppercase tracking-wider">Acasa</span>
        </Link>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-md flex items-center gap-3">
            <FaTicketAlt className="text-blue-500" /> Deschide Tichet Nou
        </h1>
      </div>

      <div className="w-full max-w-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden relative ring-1 ring-white/5">
        
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        
        <div className="p-8 md:p-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-2">Formular de Suport</h2>
                <p className="text-blue-200/50 text-sm font-medium">Completati campurile de mai jos pentru a ne ajuta sa directionam solicitarea corect.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            <FaUser /> Numele Dumneavoastra
                        </label>
                        <input type='text' className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 text-white/50 cursor-not-allowed font-mono outline-none" value={name} disabled />
                    </div>
                    
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">
                            <FaEnvelope /> Adresa de Email
                        </label>
                        <input type='text' className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 text-white/50 cursor-not-allowed font-mono outline-none" value={email} disabled />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                            <FaBug /> Tipul Solicitarii
                        </label>
                        <div className="relative">
                            <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                <option className="bg-slate-900" value='Incident'>🔴 Raportare Problema/Eroare</option>
                                <option className="bg-slate-900" value='Cerere de Serviciu'>🟢 Solicitare Echipament/Serviciu</option>
                                <option className="bg-slate-900" value='Cerere de Acces'>🔐 Cerere Drepturi de Acces</option>
                                <option className="bg-slate-900" value='Onboarding / Offboarding'>🧑‍💼 Angajat Nou / Plecare</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                            <FaLayerGroup /> Departament Vizat
                        </label>
                        <div className="relative">
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                <option className="bg-slate-900" value='Hardware & Echipamente'>💻 Echipamente Fizice (Hardware)</option>
                                <option className="bg-slate-900" value='Software & Licente'>💽 Aplicatii si Licente (Software)</option>
                                <option className="bg-slate-900" value='Retea & Comunicatii'>🌐 Retea si Internet</option>
                                <option className="bg-slate-900" value='Conturi & Permisiuni'>🔑 Conturi si Parole</option>
                                <option className="bg-slate-900" value='Infrastructura Administrativa'>🏢 Mentenanta Cladire</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                            <FaExclamationTriangle /> Nivel de Urgenta
                        </label>
                        <div className="relative">
                            <select name='priority' value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                <option className="bg-slate-900 text-emerald-400 font-bold" value='Mica'>🔵 Mica </option>
                                <option className="bg-slate-900 text-amber-400 font-bold" value='Medie'>🟠 Medie </option>
                                <option className="bg-slate-900 text-red-500 font-bold" value='Mare'>🔴 Mare </option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                        Descrierea Detaliata a Solicitarii
                    </label>
                    <textarea 
                        name='description' 
                        required
                        className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[150px] resize-y" 
                        placeholder='Va rugam sa oferiti cat mai multe detalii despre problema sau cerere...' 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest ml-1">
                        <FaPaperclip /> Adaugare Atasament (Optional)
                    </label>
                    
                    {!file ? (
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 hover:border-blue-500/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FaCloudUploadAlt className="w-8 h-8 mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <p className="mb-2 text-sm text-blue-200/60"><span className="font-bold text-white">Click pentru a incarca o imagine sau un document</span></p>
                                    <p className="text-xs text-blue-200/40 font-mono tracking-widest uppercase">Formate: PNG, JPG, PDF (Max. 5MB)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                            </label>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                            <div className="flex items-center gap-4 truncate">
                                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                    <FaPaperclip />
                                </div>
                                <div className="truncate">
                                    <p className="text-emerald-400 font-bold text-sm truncate">{file.name}</p>
                                    <p className="text-emerald-500/60 text-xs font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleFileRemove} className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                    )}
                </div>

                <button type='submit' className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3 mt-6">
                    <FaPaperPlane className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    {isUploading ? 'Se trimite cererea...' : 'Trimite Solicitarea'}
                </button>

            </form>
        </div>
      </div>
    </div>
  )
}

export default NewTicket