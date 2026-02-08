import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaTrash, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../components/Spinner'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  // Functia care aduce utilizatorii din Backend
  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const response = await axios.get('/api/users/all', config)
      
      // --- DEBUG: Vedem in consola ce primim de la server ---
      console.log("Raspuns Server Users:", response.data);

      // Verificam daca raspunsul este intr-adevar un Array (lista)
      if (Array.isArray(response.data)) {
          setUsers(response.data)
      } else {
          // Daca serverul trimite altceva (ex: mesaj de eroare), nu crapam pagina
          console.error("Format invalid primit:", response.data)
          toast.error("Formatul datelor primite este invalid.")
          setUsers([]) 
      }
      setIsLoading(false)

    } catch (error) {
      console.error(error)
      // Mesaj mai clar in caz de eroare 404 (ruta inexistenta) sau 401 (fara drepturi)
      const message = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Nu am putut încărca lista de utilizatori'
      
      toast.error(message)
      setIsLoading(false)
    }
  }

  // Functia de stergere
  const deleteUser = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
        await axios.delete(`/api/users/${id}`, config)
        
        // Scoatem userul sters din lista locala
        setUsers(users.filter((u) => u._id !== id))
        toast.success('Utilizator șters cu succes')
      } catch (error) {
        toast.error('Eroare la ștergerea utilizatorului')
      }
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }

    fetchUsers()
    // eslint-disable-next-line
  }, [user, navigate])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Panou Administrare</h1>
      <p style={{ marginBottom: '30px', color: '#555' }}>Gestionează utilizatorii aplicației</p>

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
            {/* AICI ERA EROAREA: Verificam Array.isArray inainte de map */}
            {Array.isArray(users) && users.length > 0 ? (
                users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '15px' }}>{u.email}</td>
                    <td style={{ padding: '15px' }}>
                    <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        padding: '5px 10px', 
                        borderRadius: '15px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
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
                    {u._id !== user._id && (
                        <button 
                        onClick={() => deleteUser(u._id)}
                        style={{ backgroundColor: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '18px' }}
                        title="Șterge Utilizator"
                        >
                        <FaTrash />
                        </button>
                    )}
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nu există utilizatori de afișat sau a apărut o eroare.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminUsers