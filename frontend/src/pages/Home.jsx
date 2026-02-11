import { Link } from 'react-router-dom'
import { FaQuestionCircle, FaTicketAlt } from 'react-icons/fa'
import { useSelector } from 'react-redux'

function Home() {
  const { user } = useSelector((state) => state.auth)

  return (
    <>
      <section className='heading' style={{ textAlign: 'center', marginBottom: '40px', marginTop: '60px' }}>
        {/* Am sters stilul inline pentru culoare si il punem in CSS ca sa fie alb */}
        <h1 className="main-title">
          Salut, {user ? user.name : 'Vizitator'}!
        </h1>
        <p className="main-subtitle">
          Bine ai venit pe platforma de Help Desk. Ce dorești să faci astăzi?
        </p>
      </section>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        
        {/* Card 1 */}
        <div className='home-card'>
          <FaQuestionCircle size={50} className="card-icon" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '15px' }}>Ai o problemă?</h2>
          <p style={{ marginBottom: '20px', color: '#555' }}>
            Deschide un tichet nou și un agent va prelua solicitarea ta în cel mai scurt timp.
          </p>
          <Link to='/new-ticket' className='btn btn-reverse btn-block'>
            <FaQuestionCircle /> Creează Tichet Nou
          </Link>
        </div>

        {/* Card 2: Dashboard */}
        <div className='home-card' style={{ /* ... stiluri ... */ }}>
          <FaTicketAlt size={50} color='#000' style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '15px' }}>Dashboard & Statistici</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Vezi o privire de ansamblu asupra sistemului, grafice și tichete urgente.
          </p>
          <Link to='/dashboard' className='btn btn-block'> {/* Link catre DASHBOARD */}
             Mergi la Dashboard
          </Link>
        </div>

        {/* Card 3: Istoric Complet */}
        <div className='home-card' style={{ /* ... stiluri existente ... */ }}>
          <FaTicketAlt size={50} className="card-icon" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '15px' }}>Istoric Complet</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Accesează lista detaliată a tuturor tichetelor (închise, deschise, suspendate).
          </p>
          <Link to='/tickets' className='btn btn-reverse btn-block'>
             Vezi Lista
          </Link>
        </div>

      </div>

      {/* AM STERS FOOTERUL DE AICI */}
    </>
  )
}

export default Home