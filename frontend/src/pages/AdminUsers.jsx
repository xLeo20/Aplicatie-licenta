import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaTrash, FaUserShield, FaUserTie, FaUser, FaPlus, FaEdit, FaTimes, FaBuilding } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../components/Spinner'

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); 

// Componenta alternativa de management CRUD pentru entitatile de tip User
function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Controlere pentru contextul modalului (Add vs Edit)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add') 
  const [currentUserId, setCurrentUserId] = useState(null) 
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'angajat', department: 'General'
  })

  const { name, email, password, role, department } = formData
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  // Request sincron pentru incarcarea datelor la initializare
  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const response = await axios.get('/api/users/all', config)
      
      // Tratarea exceptiilor de tip cand raspunsul nu este o structura iterabila
      if (Array.isArray(response.data)) { setUsers(response.data) } 
      else { setUsers([]) }
      
      setIsLoading(false)
    } catch (error) {
      toast.error('A picat fetching-ul obiectelor User')
      setIsLoading(false)
    }
  }

  // Verificare access si instantiere ascultatori de WebSockets
  useEffect(() => {
    if (!user || user.role !== 'admin') { 
        navigate('/'); 
        return; 
    }
    fetchUsers()

    socket.on('usersChanged', () => {
        fetchUsers();
    });

    return () => {
        socket.off('usersChanged');
    }
  }, [user, navigate])

  const deleteUser = async (id) => {
    if (window.confirm('Esti pe cale sa stergi un cont de domeniu. Continui?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        await axios.delete(`/api/users/${id}`, config)
        toast.success('Inregistrare epurata din cluster')
        // Declansem un refresh manual in instanta curenta pentru feedback vizual mai rapid
        fetchUsers(); 
      } catch (error) {
        toast.error('Conflict la procesarea cererii de DELETE')
      }
    }
  }

  // Handler unificat care se adapteaza in functie de flag-ul setat (modalType)
  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Parola este optionala la Edit (bypass), dar blocanta la crearea unui cont nou
    if(modalType === 'add' && !password) {
        toast.error('Definirea parolei de acces este strict necesara.');
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        if (modalType === 'add') {
            await axios.post('/api/users/add', formData, config)
            toast.success('Entitate generata.')
        } else {
            // Curatam payload-ul de proprietatea password daca este goala pentru a nu trimite o parola blank in DB
            const dataToSend = { ...formData }
            if(!dataToSend.password) delete dataToSend.password
            
            await axios.put(`/api/users/${currentUserId}`, dataToSend, config)
            toast.success('Parametrii actualizati.')
        }
        closeModal()
        fetchUsers();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Server Timeout')
    }
  }

  // Resetam form-ul si trecem in modul Insert
  const openAddModal = () => {
    setModalType('add')
    setFormData({ name: '', email: '', password: '', role: 'angajat', department: 'General' })
    setModalOpen(true)
  }

  // Precompletam input-urile pe baza prop-urilor trecute in context
  const openEditModal = (userToEdit) => {
    setModalType('edit')
    setCurrentUserId(userToEdit._id)
    
    // Fallback logic pentru compatibilitatea cu versiunile vechi ale bazei de date (enum mapping)
    let safeDepartment = userToEdit.department || 'General';
    if (safeDepartment === 'HR') safeDepartment = 'Resurse Umane';
    if (safeDepartment === 'IT') safeDepartment = 'IT Tech';
    if (safeDepartment === 'Marketing') safeDepartment = 'Comercial';
    if (safeDepartment === 'Financiar') safeDepartment = 'General';
    if (safeDepartment === 'Vanzari') safeDepartment = 'Comercial';
    if (safeDepartment === 'Suport') safeDepartment = 'Customer Care';

    setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', 
        role: userToEdit.role,
        department: safeDepartment 
    })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setCurrentUserId(null); }

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }))
  }

  // Helper UI pentru uniformitatea componentelor pe pagina
  const getRoleBadge = (role) => {
      const safeRole = role ? role.toLowerCase() : '';
      switch(safeRole) {
          case 'admin':
              return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider"><FaUserShield/> Admin</span>;
          case 'agent':
              return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider"><FaUserTie/> Agent</span>;
          default: 
              return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider"><FaUser/> Angajat</span>;
      }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in duration-500">
      
      {/* Componenta principala pentru Action Buttons */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tight uppercase italic">Management Conturi</h1>
            <p className="text-blue-200/60 mt-1 font-medium">Controller central pentru accesul si validarea identitatii pe domeniu.</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105 active:scale-95"
          >
              <FaPlus /> 
              <span>NOU CONT</span>
          </button>
      </div>

      {/* Grid container pentru returnarea setului de rezultate */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
        <div className="overflow-x-auto text-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-blue-200/50 uppercase text-[10px] font-black tracking-[0.2em]">
                        <th className="px-8 py-6 font-black">Meta</th>
                        <th className="px-8 py-6 font-black">Corespondenta</th>
                        <th className="px-8 py-6 text-center font-black">Rol Sistem</th>
                        <th className="px-8 py-6 text-center font-black">Grup Afilere</th>
                        <th className="px-8 py-6 text-right font-black">Operatiuni</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map((u) => (
                        <tr key={u._id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                            <td className="px-8 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    {/* Placeholder simplist de avatar tip aplicatii Google */}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white font-bold text-lg">{u.name}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-blue-100/70 text-sm font-mono">{u.email}</td>
                            <td className="px-8 py-5 whitespace-nowrap text-center">
                                {getRoleBadge(u.role)}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-center">
                                <span className="inline-block bg-white/5 text-blue-100/90 px-4 py-1.5 rounded-xl text-xs border border-white/10 font-bold uppercase tracking-widest">
                                    {u.department || 'General'}
                                </span>
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(u)} className="text-amber-400 hover:text-amber-300 transition-colors transform hover:scale-125" title="Muta in state de Edit"><FaEdit size={20}/></button>
                                    {u._id !== user._id && (
                                        <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-300 transition-colors transform hover:scale-125" title="Flush ID"><FaTrash size={20}/></button>
                                    )}
                                </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="px-8 py-20 text-center text-blue-200/40 italic text-xl">Nu exista intrari mapate.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Overlay Component folosit pentru logica de update/insert */}
      {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#1e293b] border border-white/20 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] w-full max-w-lg relative overflow-hidden ring-1 ring-white/20">
                  
                  <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">
                          {modalType === 'add' ? 'Atribuire Drepturi Noi' : 'Overriding State'}
                      </h2>
                      <button onClick={closeModal} className="text-blue-200/40 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                          <FaTimes size={20} />
                      </button>
                  </div>

                  <div className="p-10">
                      <form onSubmit={onSubmit} className="space-y-6">
                          <div className="space-y-2">
                              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Identitate Document</label>
                              <input type='text' className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" name='name' value={name} onChange={onChange} required placeholder="Seteaza o entitate..." />
                          </div>
                          <div className="space-y-2">
                              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Contact Mail</label>
                              <input type='email' className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" name='email' value={email} onChange={onChange} required placeholder="adresa.test@domeniu.com" />
                          </div>
                          <div className="space-y-2">
                              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Nivel Criptare (Token Secret) {modalType === 'edit' && '[Opereaza doar pentru Rescriere]'}</label>
                              <input type='password' className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" name='password' value={password} onChange={onChange} placeholder={modalType === 'edit' ? '*** Hash Ascuns ***' : 'Input string parola...'} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Model Logic</label>
                                <select className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none" name='role' value={role} onChange={onChange}>
                                    <option value='angajat'>Angajat Normal</option>
                                    <option value='agent'>Operator L1/L2</option>
                                    <option value='admin'>Supervizor Core</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Mapare Grup</label>
                                <select className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none" name='department' value={department} onChange={onChange}>
                                    <option value='General'>General</option>
                                    <option value='IT Tech'>IT Tech</option>
                                    <option value='Resurse Umane'>Resurse Umane</option>
                                    <option value='Comercial'>Comercial</option>
                                    <option value='Customer Care'>Customer Care</option>
                                </select>
                            </div>
                          </div>

                          <button type='submit' className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest mt-4">
                              {modalType === 'add' ? 'Injecteaza Variabile' : 'Push Modificari'}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default AdminUsers