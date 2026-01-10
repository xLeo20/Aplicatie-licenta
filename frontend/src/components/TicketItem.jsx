import { Link } from 'react-router-dom'

function TicketItem({ ticket }) {
  // Culori pentru prioritate
  const priorityColor = ticket.priority === 'Mare' ? 'red' : ticket.priority === 'Medie' ? '#e6b800' : 'green';

  return (
    <div className='ticket' style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px', backgroundColor: '#f4f4f4', padding: '10px 15px', borderRadius: '5px', alignItems: 'center', textAlign: 'center' }}>
      <div>{new Date(ticket.createdAt).toLocaleString('ro-RO').split(',')[0]}</div>
      <div>{ticket.product}</div>
      
      {/* Coloana Prioritate */}
      <div style={{ color: priorityColor, fontWeight: 'bold' }}>
        {ticket.priority || 'Mica'}
      </div>

      <div className={`status status-${ticket.status}`} style={{ 
          backgroundColor: ticket.status === 'new' ? 'green' : ticket.status === 'closed' ? 'red' : 'steelblue', 
          color: '#fff', 
          borderRadius: '10px', 
          padding: '5px 10px', 
          fontSize: '12px',
          margin: '0 auto',
          width: '80px'
      }}>
        {ticket.status === 'new' ? 'Nou' : ticket.status === 'closed' ? 'Închis' : 'Open'}
      </div>
      
      <Link to={`/ticket/${ticket._id}`} className='btn btn-reverse btn-sm' style={{ border: '1px solid #000', padding: '5px 10px', borderRadius: '5px', color: '#000', textDecoration: 'none', fontSize: '14px' }}>
        Vezi
      </Link>
    </div>
  )
}

export default TicketItem