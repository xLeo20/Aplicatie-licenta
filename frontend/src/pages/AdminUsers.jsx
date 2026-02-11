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
      // Folosim ruta corecta prin proxy
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
            setUsers([...users, res.data]) // Adaugam noul user in lista
            toast.success('Utilizator creat cu succes!')
        } else {
            // --- LOGICA DE EDITARE ---
            // Daca parola e goala, o scoatem din obiect ca sa nu o suprascriem cu null/gol
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
    // Populam formularul cu datele existente (fara parola)
    setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '', // Lasam gol, se completeaza doar daca vrea sa o schimbe
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

  if (isLoading) return <Spinner />

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Panou Administrare</h1>
            <p style={{ color: '#555' }}>Gestionează utilizatorii, rolurile și departamentele</p>
          </div>
          <button onClick={openAddModal} className='btn' style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaPlus /> Adaugă Utilizator
          </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Nume</th>
              <th style={{ padding: '15px' }}>Email</th>
              <th style={{ padding: '15px' }}>Rol</th>
              <th style={{ padding: '15px' }}>Departament</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '15px' }}>{u.email}</td>
                    <td style={{ padding: '15px' }}>
                    <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: u.role === 'admin' ? '#ffebee' : u.role === 'agent' ? '#e3f2fd' : '#f5f5f5',
                        color: u.role === 'admin' ? 'red' : u.role === 'agent' ? 'blue' : '#333'
                    }}>
                        {u.role === 'admin' && <FaUserShield />}
                        {u.role === 'agent' && <FaUserTie />}
                        {u.role === 'angajat' && <FaUser />}
                        {u.role ? u.role.toUpperCase() : 'N/A'}
                    </span>
                    </td>
                    <td style={{ padding: '15px' }}>{u.department || '-'}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                        {/* Buton Editare */}
                        <button onClick={() => openEditModal(u)} style={{ marginRight: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'orange', fontSize: '18px' }} title="Editează">
                            <FaEdit />
                        </button>
                        {/* Buton Stergere (Nu ne stergem pe noi insine) */}
                        {u._id !== user._id && (
                            <button onClick={() => deleteUser(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', fontSize: '18px' }} title="Șterge">
                                <FaTrash />
                            </button>
                        )}
                    </td>
                </tr>
                ))
            ) : (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nu există utilizatori.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PENTRU ADD/EDIT USER --- */}
      {modalOpen && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
              display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
              <div style={{
                  backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
                  width: '90%', maxWidth: '500px', position: 'relative',
                  boxShadow: '0 5px 30px rgba(0,0,0,0.3)'
              }}>
                  <button onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}><FaTimes /></button>
                  
                  <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                      {modalType === 'add' ? 'Adaugă Utilizator Nou' : 'Editează Utilizator'}
                  </h2>

                  <form onSubmit={onSubmit}>
                      <div className='form-group'>
                          <label>Nume</label>
                          <input type='text' className='form-control' name='name' value={name} onChange={onChange} required />
                      </div>
                      <div className='form-group'>
                          <label>Email</label>
                          <input type='email' className='form-control' name='email' value={email} onChange={onChange} required />
                      </div>
                      <div className='form-group'>
                          <label>Parolă {modalType === 'edit' && '(Lasă gol pentru a păstra parola veche)'}</label>
                          <input type='password' className='form-control' name='password' value={password} onChange={onChange} placeholder={modalType === 'edit' ? '******' : ''} />
                      </div>
                      
                      <div style={{display: 'flex', gap: '20px'}}>
                        <div className='form-group' style={{flex: 1}}>
                            <label>Rol</label>
                            <select className='form-control' name='role' value={role} onChange={onChange}>
                                <option value='angajat'>Angajat</option>
                                <option value='agent'>Agent</option>
                                <option value='admin'>Admin</option>
                            </select>
                        </div>
                        <div className='form-group' style={{flex: 1}}>
                            <label>Departament</label>
                            <select className='form-control' name='department' value={department} onChange={onChange}>
                                <option value='General'>General</option>
                                <option value='IT'>IT</option>
                                <option value='HR'>HR</option>
                                <option value='Vanzari'>Vânzări</option>
                                <option value='Suport'>Suport</option>
                            </select>
                        </div>
                      </div>

                      <button type='submit' className='btn btn-block' style={{ marginTop: '20px' }}>
                          {modalType === 'add' ? 'Creează' : 'Salvează Modificările'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </>
  )
}

export default AdminUsers