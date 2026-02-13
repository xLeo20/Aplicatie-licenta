import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaUserCircle, FaIdCard, FaBuilding, FaUserTag, FaCamera, FaEnvelope, FaArrowLeft, FaSave } from 'react-icons/fa'
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
        <p className="text-white text-xl animate-pulse">Se încarcă profilul...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in zoom-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all shadow-sm group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Înapoi la Dashboard</span>
        </Link>
        <h1 className="text-3xl font-black text-white drop-shadow-md">Profilul Meu</h1>
      </div>

      {/* --- MAIN PROFILE CARD --- */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Banner Decorativ Superior */}
        <div className="h-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-80"></div>

        <div className="px-8 pb-10">
          {/* Avatar Section */}
          <div className="relative flex justify-center -mt-20 mb-6">
            <div className="bg-white p-1.5 rounded-full shadow-2xl transition-transform hover:scale-105 duration-300">
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-7xl">
                    <FaUserCircle />
                  </div>
                )}
                
                {/* Camera Overlay */}
                <label htmlFor="fileInput" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                   <FaCamera className="text-white text-3xl" />
                </label>
              </div>
            </div>
            
            {/* Input invizibil */}
            <input type="file" id="fileInput" className="hidden" onChange={onFileChange} accept="image/*" />
          </div>

          {/* User Identity Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white tracking-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 text-white/70 mt-2 text-lg font-medium">
              <FaEnvelope className="text-sm" /> {user.email}
            </div>

            {/* Buton Salvare Poza (Apare doar daca ai ales un fisier) */}
            {file && (
              <button 
                onClick={onUpload} 
                className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all animate-bounce"
              >
                <FaSave /> Salvează Noua Poză
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            
            {/* ID Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5 group hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:rotate-12 transition-transform">
                <FaIdCard />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">ID Utilizator</span>
                <span className="text-xs text-white font-mono break-all leading-tight">{user._id}</span>
              </div>
            </div>

            {/* Role Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5 group hover:bg-white/10 transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                <FaUserTag />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Rol în Sistem</span>
                <span className={`text-base font-bold uppercase tracking-wider ${
                  user.role === 'admin' ? 'text-red-400' : 'text-blue-400'
                }`}>{user.role}</span>
              </div>
            </div>

            {/* Department Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-5 group hover:bg-white/10 transition-all md:col-span-2">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                <FaBuilding />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">Departament</span>
                <span className="text-lg font-bold text-white uppercase tracking-wider">{user.department || 'General'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mesaj subsol */}
      <p className="text-center text-white/30 text-xs mt-10 italic">
        * Setările avansate ale contului pot fi modificate doar de către departamentul IT.
      </p>
    </div>
  )
}

export default Profile