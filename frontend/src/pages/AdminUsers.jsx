import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaTrash, FaUserShield, FaUserTie, FaUser, FaPlus, FaEdit, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../components/Spinner'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // --- STATE-URI PENTRU MODAL (Formular) ---
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' sau 'edit'
  const [currentUserId, setCurrentUserId] = useState(null) // ID-ul userului pe care il editam
  
  // Datele formularului
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'angajat',
    department: 'General'
  })

  const { name, email, password, role, department } = formData

  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  // 1. Incarcare Utilizatori
  const fetchUsers = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      }
      const response = await axios.get('/api/users/all', config)
      
      if (Array.isArray(response.data)) {
          setUsers(response.data)
      } else {
          setUsers([]) 
      }
      setIsLoading(false)
    } catch (error) {
      toast.error('Nu am putut încărca lista de utilizatori')
      setIsLoading(false)
    }
  }

  // 2. Stergere Utilizator
  const deleteUser = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        await axios.delete(`/api/users/${id}`, config)
        setUsers(users.filter((u) => u._id !== id))
        toast.success('Utilizator șters cu succes')
      } catch (error) {
        toast.error('Eroare la ștergerea utilizatorului')
      }
    }
  }

  // 3. Submit Formular (Add sau Edit)
  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validare simpla
    if(modalType === 'add' && !password) {
        toast.error('Parola este obligatorie la creare!');
        return;
    }

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        
        if (modalType === 'add') {
            // --- LOGICA DE CREARE ---
            const res = await axios.post('/api/users/add', formData, config)
            setUsers([...users, res.data]) 
            toast.success('Utilizator creat cu succes!')
        } else {
            // --- LOGICA DE EDITARE ---
            const dataToSend = { ...formData }
            if(!dataToSend.password) delete dataToSend.password

            const res = await axios.put(`/api/users/${currentUserId}`, dataToSend, config)
            
            // Actualizam lista locala
            setUsers(users.map((u) => (u._id === currentUserId ? res.data : u)))
            toast.success('Utilizator actualizat cu succes!')
        }
        closeModal()

    } catch (error) {
        const msg = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : 'A apărut o eroare'
        toast.error(msg)
    }
  }

  // Helper: Deschide modalul pentru ADAUGARE
  const openAddModal = () => {
    setModalType('add')
    setFormData({ name: '', email: '', password: '', role: 'angajat', department: 'General' })
    setModalOpen(true)
  }

  // Helper: Deschide modalul pentru EDITARE
  const openEditModal = (userToEdit) => {
    setModalType('edit')
    setCurrentUserId(userToEdit._id)
    setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', 
        role: userToEdit.role,
        department: userToEdit.department || 'General'
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentUserId(null)
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
    }))
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    fetchUsers()
    // eslint-disable-next-line
  }, [user, navigate])

  // Helper pentru Badge Roluri
  const getRoleBadge = (role) => {
      switch(role) {
          case 'admin':
              return (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
                      <FaUserShield className="text-sm"/> ADMIN
                  </span>
              );
          case 'agent':
              return (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                      <FaUserTie className="text-sm"/> AGENT
                  </span>
              );
          default: 
              return (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                      <FaUser className="text-sm"/> ANGAJAT
                  </span>
              );
      }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Panou Administrare</h1>
            <p className="text-gray-500 mt-1">Gestionează utilizatorii, rolurile și departamentele.</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
              <FaPlus /> 
              <span>Adaugă Utilizator</span>
          </button>
      </div>

      {/* --- TABEL CARD --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                        <th className="px-6 py-4 font-bold">Nume</th>
                        <th className="px-6 py-4 font-bold">Email</th>
                        <th className="px-6 py-4 font-bold">Rol</th>
                        <th className="px-6 py-4 font-bold">Departament</th>
                        <th className="px-6 py-4 font-bold text-center">Acțiuni</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    {u.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getRoleBadge(u.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm border border-gray-200">
                                    {u.department || '-'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditModal(u)} 
                                        className="text-amber-500 hover:text-amber-700 bg-amber-50 p-2 rounded-full hover:bg-amber-100 transition-colors"
                                        title="Editează"
                                    >
                                        <FaEdit />
                                    </button>
                                    {u._id !== user._id && (
                                        <button 
                                            onClick={() => deleteUser(u._id)} 
                                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                            title="Șterge"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Nu există utilizatori înregistrați.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden transform transition-all scale-100">
                  
                  {/* Modal Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-800">
                          {modalType === 'add' ? 'Adaugă Utilizator Nou' : 'Editează Utilizator'}
                      </h2>
                      <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                          <FaTimes size={20} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                      <form onSubmit={onSubmit} className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
                              <input 
                                type='text' 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                name='name' 
                                value={name} 
                                onChange={onChange} 
                                required 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input 
                                type='email' 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                name='email' 
                                value={email} 
                                onChange={onChange} 
                                required 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Parolă {modalType === 'edit' && <span className="text-xs text-gray-400 font-normal">(Opțional)</span>}
                              </label>
                              <input 
                                type='password' 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                name='password' 
                                value={password} 
                                onChange={onChange} 
                                placeholder={modalType === 'edit' ? '******' : 'Introduceți parola'} 
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    name='role' 
                                    value={role} 
                                    onChange={onChange}
                                >
                                    <option value='angajat'>Angajat</option>
                                    <option value='agent'>Agent</option>
                                    <option value='admin'>Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departament</label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    name='department' 
                                    value={department} 
                                    onChange={onChange}
                                >
                                    <option value='General'>General</option>
                                    <option value='IT'>IT</option>
                                    <option value='HR'>HR</option>
                                    <option value='Vanzari'>Vânzări</option>
                                    <option value='Suport'>Suport</option>
                                </select>
                            </div>
                          </div>

                          <button 
                            type='submit' 
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-transform active:scale-[0.98]"
                          >
                              {modalType === 'add' ? 'Creează Cont' : 'Salvează Modificările'}
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