import { Link } from 'react-router-dom'
import { FaQuestionCircle, FaTicketAlt } from 'react-icons/fa'

function Home() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Ce ajutor cauți astăzi?</h1>
      <p style={{ color: '#828282', marginBottom: '40px', fontSize: '1.5rem' }}>
        Alege o opțiune de mai jos
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Link to='/new-ticket' style={{ padding: '20px', border: '1px solid #333', borderRadius: '10px', display: 'block', width: '200px' }}>
            <FaQuestionCircle size={30} />
            <p style={{ marginTop: '10px' }}>Creează Tichet Nou</p>
        </Link>

        <Link to='/tickets' style={{ padding: '20px', border: '1px solid #333', borderRadius: '10px', display: 'block', width: '200px', backgroundColor: '#333', color: '#fff' }}>
            <FaTicketAlt size={30} />
            <p style={{ marginTop: '10px' }}>Vezi Tichetele Mele</p>
        </Link>
      </div>
    </div>
  )
}

export default Home