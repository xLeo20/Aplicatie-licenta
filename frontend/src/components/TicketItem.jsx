import { Link } from 'react-router-dom'
import { FaClock, FaExclamationCircle, FaPause } from 'react-icons/fa' // Am adaugat FaPause

function TicketItem({ ticket }) {
  // Calculam daca SLA-ul e depasit, DAR doar daca nu e inchis si nu e suspendat
  const isOverdue = new Date(ticket.deadline) < new Date() && ticket.status !== 'closed' && ticket.status !== 'suspended';
  
  // Formatam data deadline-ului
  const deadlineDate = new Date(ticket.deadline).toLocaleString('ro-RO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  // Helper pentru textul statusului
  const getStatusText = (status) => {
    switch(status) {
        case 'new': return 'Nou';
        case 'open': return 'În Lucru';
        case 'suspended': return 'Suspendat';
        case 'closed': return 'Închis';
        default: return status;
    }
  }

  return (
    <div className='ticket' style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '20px', 
        marginBottom: '10px', 
        padding: '10px 15px', 
        alignItems: 'center',
        textAlign: 'center',
        borderLeft: isOverdue ? '5px solid #dc3545' : ticket.status === 'suspended' ? '5px solid orange' : '5px solid transparent'
    }}>
      <div>
          {new Date(ticket.createdAt).toLocaleDateString('ro-RO')}
          <div style={{fontSize: '10px', color: '#888'}}>
              {new Date(ticket.createdAt).toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'})}
          </div>
      </div>
      
      <div>{ticket.product}</div>
      
      <div>
        <span className={`status status-${ticket.priority}`}>
          {ticket.priority}
        </span>
        
        {/* LOGICA SLA AFISARE */}
        {ticket.status !== 'closed' && ticket.deadline && (
            <div style={{ 
                fontSize: '11px', 
                marginTop: '5px', 
                fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px'
            }}>
                {/* Daca e suspendat */}
                {ticket.status === 'suspended' ? (
                   <span style={{color: 'orange', display: 'flex', alignItems: 'center', gap: '3px'}}>
                     <FaPause /> SLA Înghețat
                   </span>
                ) : isOverdue ? (
                   <span style={{color: '#dc3545', display: 'flex', alignItems: 'center', gap: '3px'}}>
                     <FaExclamationCircle /> SLA Depășit
                   </span>
                ) : (
                   <span style={{color: '#28a745', display: 'flex', alignItems: 'center', gap: '3px'}}>
                     <FaClock /> Termen: {deadlineDate}
                   </span>
                )}
            </div>
        )}
      </div>

      <div>
        <span className={`status status-${ticket.status}`}>
          {getStatusText(ticket.status)}
        </span>
      </div>

      <Link to={`/ticket/${ticket._id}`} className='btn btn-reverse btn-sm' style={{justifySelf: 'center'}}>
        Vezi
      </Link>
    </div>
  )
}

export default TicketItem