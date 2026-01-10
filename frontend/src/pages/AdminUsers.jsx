import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        }
        const res = await axios.get('http://localhost:5000/api/users/all', config)
        setUsers(res.data)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user.token])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 style={{fontSize: '2rem', marginBottom: '20px'}}>Panou Administrare</h1>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{backgroundColor: '#333', color: '#fff', textAlign: 'left'}}>
            <th style={{padding: '10px'}}>Nume</th>
            <th style={{padding: '10px'}}>Email</th>
            <th style={{padding: '10px'}}>Rol</th>
            <th style={{padding: '10px'}}>Departament</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} style={{borderBottom: '1px solid #ccc'}}>
              <td style={{padding: '10px'}}>{u.name}</td>
              <td style={{padding: '10px'}}>{u.email}</td>
              <td style={{padding: '10px', fontWeight: 'bold', color: u.role === 'admin' ? 'red' : u.role === 'agent' ? 'blue' : 'black'}}>
                {u.role.toUpperCase()}
              </td>
              <td style={{padding: '10px'}}>{u.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsers