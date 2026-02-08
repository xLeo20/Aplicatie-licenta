import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaUserCircle, FaIdCard, FaEnvelope, FaBuilding, FaUserTag } from 'react-icons/fa'

function Profile() {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return <p>Se încarcă profilul...</p>
  }

  return (
    <div className='profile-container' style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>Profilul Meu</h1>

      <div className='profile-card' style={{ 
        backgroundColor: '#fff', 
        borderRadius: '15px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
        overflow: 'hidden',
        border: '1px solid #e6e6e6'
      }}>
        
        {/* Header-ul Cardului */}
        <div style={{ backgroundColor: '#333', color: '#fff', padding: '30px', textAlign: 'center' }}>
          <FaUserCircle size={80} style={{ marginBottom: '10px' }} />
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <p style={{ opacity: 0.8 }}>{user.email}</p>
        </div>

        {/* Detaliile */}
        <div style={{ padding: '30px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <FaIdCard size={25} color='#555' style={{ marginRight: '15px' }} />
            <div>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>ID Utilizator</p>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{user._id}</p>
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
              <p style={{ fontWeight: 'bold', margin: 0 }}>
                {user.department || 'General'}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to='/' className='btn' style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
          Înapoi la Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Profile