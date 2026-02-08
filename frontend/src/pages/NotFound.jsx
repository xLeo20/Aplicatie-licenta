import { FaExclamationTriangle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px', marginTop: '50px' }}>
      <FaExclamationTriangle size={80} color='#dc3545' style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#555' }}>
        Oops! Pagina căutată nu există.
      </p>
      <Link to='/' className='btn btn-primary' style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
        Înapoi Acasă
      </Link>
    </div>
  )
}

export default NotFound