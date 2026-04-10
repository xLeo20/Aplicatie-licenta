import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { FaUserShield, FaUsers, FaUserPlus, FaTrash, FaBuilding, FaEdit, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../components/Spinner'

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); 

function AdminPanel() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [usersList, setUsersList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'angajat', department: 'General'
  })

  const { name, email, password, role, department } = formData

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const { data } = await axios.get('/api/users/all', config)
      setUsersList(data)
      setIsLoading(false)
    } catch (error) {
      toast.error('Eroare la încărcarea bazei de date cu utilizatori')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.role !== 'admin') {
      toast.error('Acces Respins! Componentă restricționată la nivel de administrator.')
      navigate('/dashboard')
    } else {
      fetchUsers()
    }

    socket.on('usersChanged', () => {
      fetchUsers(); 
    });

    return () => {
      socket.off('usersChanged'); 
    }
  }, [user, navigate])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length > 0 && password.length < 6) {
      toast.warning('Lungimea minimă a parolei este de 6 caractere.')
      return
    }

    try {
      setIsLoading(true)
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const { data } = await axios.post('/api/users/add', formData, config)
      
      toast.success(`Contul pentru ${data.name} a fost creat cu succes!`)
      
      setFormData({ name: '', email: '', password: '', role: 'angajat', department: 'General' })
    } catch (error) {
      const message = (error.response?.data?.message) || 'Eroare de server la salvarea contului.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onDelete = async (userId, userName) => {
    if (window.confirm(`Ești sigur că dorești să ștergi definitiv contul: ${userName}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        await axios.delete(`/api/users/${userId}`, config)
        toast.success('Contul a fost șters cu succes!')
      } catch (error) {
        toast.error('Eroare la procesarea cererii de ștergere.')
      }
    }
  }

  if (isLoading) return <Spinner />

  return (
      <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
        
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <FaUserShield />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                Management Conturi
              </h1>
              <p className="text-red-400/80 font-bold tracking-widest text-xs uppercase mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Zonă cu Acces Restricționat
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panoul Creare Cont */}
          <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl ring-1 ring-white/5 h-fit sticky top-28">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 italic uppercase">
              <FaUserPlus className="text-blue-500" /> Creare Cont Nou
            </h2>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Nume Complet</label>
                <input type="text" name="name" value={name} onChange={onChange} required placeholder="ex: Popescu Ion" 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Email Instituțional</label>
                <input type="email" name="email" value={email} onChange={onChange} required placeholder="ex: nume@corp.deskflow.ro" 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Parolă de Acces</label>
                <input type="text" name="password" value={password} onChange={onChange} required placeholder="Setați o parolă temporară" 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Nivel Acces</label>
                  <select name="role" value={role} onChange={onChange} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="angajat">Angajat Normal</option>
                    <option value="agent">Agent Suport IT</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Departament</label>
                  <select name="department" value={department} onChange={onChange} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="General">General</option>
                    <option value="IT">IT</option>
                    <option value="HR">Resurse Umane</option>
                    <option value="Financiar">Financiar</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaUserPlus /> Creează Cont
              </button>
            </form>
          </div>

          {/* Tabel Utilizatori */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl ring-1 ring-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3 italic uppercase">
                <FaUsers className="text-emerald-500" /> Director Angajați
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 py-1 rounded-full border border-emerald-500/20">
                Total: {usersList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                    <th className="p-4 font-black">Nume / Email</th>
                    <th className="p-4 font-black">Departament</th>
                    <th className="p-4 font-black">Nivel Acces</th>
                    <th className="p-4 font-black text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            <p className="text-xs text-blue-400/70 font-mono mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-950/50 text-white/70 px-3 py-1 rounded-lg text-xs font-medium border border-white/5">
                          <FaBuilding className="text-blue-500/50" /> {u.department || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                          u.role === 'agent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.role === 'admin' ? 'Administrator' : u.role === 'agent' ? 'Agent IT' : 'Angajat'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {user._id !== u._id && (
                          <button 
                            onClick={() => onDelete(u._id, u.name)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all shadow-lg border border-red-500/20 opacity-50 group-hover:opacity-100"
                            title="Șterge Cont"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {usersList.length === 0 && (
                <div className="text-center py-10 text-white/40 italic">Niciun cont înregistrat.</div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default AdminPanel 