import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux' // Importam useDispatch
import { Link } from 'react-router-dom'
import { FaUserCircle, FaIdCard, FaBuilding, FaUserTag, FaCamera } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import { logout, reset } from '../features/auth/authSlice' // Ca sa putem face update fortat (login silentios)

function Profile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // State pentru fisierul selectat
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(user?.profileImage || null)

  useEffect(() => {
     if (user?.profileImage) {
         // Construim URL-ul complet daca e cale relativa
         setPreview(user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`)
     }
  }, [user])

  // Cand utilizatorul alege un fisier
  const onFileChange = (e) => {
      setFile(e.target.files[0])
      // Facem un preview local imediat
      setPreview(URL.createObjectURL(e.target.files[0]))
  }

  // Cand apasa "Incarca Poza"
  const onUpload = async () => {
      if(!file) {
          toast.error('Te rog selectează o poză mai întâi.')
          return
      }

      const formData = new FormData()
      formData.append('image', file) // 'image' trebuie sa bata cu upload.single('image') din backend

      try {
          const config = {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${user.token}`
              }
          }

          const res = await axios.post('/api/users/upload', formData, config)
          
          toast.success('Poza de profil actualizată!')
          
          // TRUC: Actualizam userul in localStorage cu noile date primite de la server
          localStorage.setItem('user', JSON.stringify(res.data))
          
          // Fortam un refresh al paginii ca sa se vada peste tot (sau am putea face un update in Redux)
          window.location.reload()

      } catch (error) {
          toast.error('Eroare la încărcarea pozei')
      }
  }

  if (!user) {
    return <p>Se încarcă profilul...</p>
  }

  return (
    <div className='profile-container' style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 className="main-title" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', color: '#333' }}>Profilul Meu</h1>

      <div className='profile-card'>
        
        {/* Header-ul Cardului cu Poza */}
        <div style={{ backgroundColor: '#f4f4f4', padding: '30px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {preview ? (
                <img 
                    src={preview} 
                    alt="Profile" 
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                />
            ) : (
                <FaUserCircle size={100} color="#ccc" />
            )}
            
            {/* Inputul de fisier ascuns si Label-ul care il activeaza */}
            <label htmlFor="fileInput" style={{ 
                position: 'absolute', bottom: '0', right: '0', 
                backgroundColor: '#0056b3', color: 'white', 
                padding: '8px', borderRadius: '50%', cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <FaCamera size={16} />
            </label>
            <input 
                type="file" 
                id="fileInput" 
                style={{ display: 'none' }} 
                onChange={onFileChange}
                accept="image/*"
            />
          </div>

          <h2 style={{ margin: '15px 0 5px 0', color: '#333' }}>{user.name}</h2>
          <p style={{ color: '#777' }}>{user.email}</p>

          {file && (
              <button onClick={onUpload} className='btn' style={{ marginTop: '15px', fontSize: '14px', padding: '5px 15px' }}>
                  Salvează Noua Poză
              </button>
          )}
        </div>

        {/* Detaliile - Raman la fel */}
        <div style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <FaIdCard size={25} color='#555' style={{ marginRight: '15px' }} />
            <div>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>ID Utilizator</p>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>{user._id}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <FaUserTag size={25} color='#555' style={{ marginRight: '15px' }} />
            <div>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Rol în sistem</p>
              <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'capitalize', color: user.role === 'admin' ? 'red' : 'blue' }}>
                {user.role}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <FaBuilding size={25} color='#555' style={{ marginRight: '15px' }} />
            <div>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Departament</p>
              <p style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>
                {user.department || 'General'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to='/' className='btn btn-reverse'>
          Înapoi la Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Profile