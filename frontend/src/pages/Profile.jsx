import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaUserCircle, FaIdCard, FaBuilding, FaUserTag, FaCamera, FaEnvelope, FaArrowLeft, FaSave, FaShieldAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'

function Profile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(user?.profileImage || null)

  useEffect(() => {
     if (user?.profileImage) {
         setPreview(user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`)
     }
  }, [user])

  const onFileChange = (e) => {
      if (e.target.files[0]) {
        setFile(e.target.files[0])
        setPreview(URL.createObjectURL(e.target.files[0]))
      }
  }

  const onUpload = async () => {
      if(!file) {
          toast.error('Te rog selectează o poză mai întâi.')
          return
      }

      const formData = new FormData()
      formData.append('image', file)

      try {
          const config = {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${user.token}`
              }
          }

          const res = await axios.post('/api/users/upload', formData, config)
          toast.success('Poza de profil actualizată!')
          localStorage.setItem('user', JSON.stringify(res.data))
          window.location.reload()

      } catch (error) {
          toast.error('Eroare la încărcarea pozei')
      }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-blue-400 text-xl animate-pulse font-black tracking-widest">SE ÎNCARCĂ PROFILUL...</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center px-4 py-12 animate-in fade-in zoom-in duration-500">
      
      {/* --- HEADER NAVIGARE --- */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Link to="/" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition-all border border-white/5">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-blue-400" /> 
          <span className="font-bold text-sm uppercase tracking-wider">Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Cont Activ</span>
        </div>
      </div>

      {/* --- CARD PRINCIPAL (Identity File) --- */}
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden relative ring-1 ring-white/5">
        
        {/* Banner Decorativ Cyber */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        </div>

        <div className="px-8 pb-12 md:px-16">
          
          {/* --- SECȚIUNE AVATAR (Suprapusă peste banner) --- */}
          <div className="relative flex justify-center -mt-24 mb-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-40 h-40 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl">
                    {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <FaUserCircle size={160} />
                    </div>
                    )}
                    
                    {/* Overlay Cameră */}
                    <label htmlFor="fileInput" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                        <FaCamera className="text-white text-3xl mb-2" />
                        <span className="text-white text-[10px] uppercase font-bold tracking-widest">Schimbă</span>
                    </label>
                </div>
                {/* Input invizibil */}
                <input type="file" id="fileInput" className="hidden" onChange={onFileChange} accept="image/*" />
            </div>
          </div>

          {/* --- INFO UTILIZATOR --- */}
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{user.name}</h2>
            <div className="inline-flex items-center gap-2 bg-slate-950/50 px-4 py-1.5 rounded-full border border-white/5">
              <FaEnvelope className="text-blue-400 text-sm" /> 
              <span className="text-blue-100/60 text-sm font-medium tracking-wide">{user.email}</span>
            </div>

            {/* Buton Salvare (Apare doar la modificare) */}
            {file && (
              <div className="mt-6 animate-bounce">
                  <button 
                    onClick={onUpload} 
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all uppercase tracking-widest text-xs"
                  >
                    <FaSave size={16} /> Salvează Noua Poză
                  </button>
              </div>
            )}
          </div>

          {/* --- GRID DETALII (Tech Style) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card ID */}
            <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl flex items-center gap-5 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <FaIdCard />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">ID Unic</span>
                <span className="text-xs text-white font-mono break-all bg-white/5 px-2 py-1 rounded border border-white/5">{user._id}</span>
              </div>
            </div>

            {/* Card Rol */}
            <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl flex items-center gap-5 hover:border-blue-500/30 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform ${
                user.role === 'admin' ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-500'
              }`}>
                {user.role === 'admin' ? <FaShieldAlt /> : <FaUserTag />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Nivel Acces</span>
                <span className={`text-sm font-black uppercase tracking-widest ${
                  user.role === 'admin' ? 'text-red-400' : 'text-blue-400'
                }`}>{user.role}</span>
              </div>
            </div>

            {/* Card Departament (Full Width pe Desktop) */}
            <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl flex items-center gap-5 hover:border-blue-500/30 transition-all group md:col-span-2">
              <div className="w-14 h-14 bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                <FaBuilding />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Departament Asociat</span>
                <span className="text-lg font-bold text-white uppercase tracking-wider">{user.department || 'General'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mesaj subsol */}
      <p className="text-center text-blue-200/20 text-[10px] mt-8 uppercase tracking-[0.2em] font-medium">
        * Datele contului sunt administrate securizat de departamentul IT.
      </p>
    </div>
  )
}

export default Profile