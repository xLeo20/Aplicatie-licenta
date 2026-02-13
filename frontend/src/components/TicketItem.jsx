import { Link } from 'react-router-dom'
import { FaClock, FaExclamationCircle, FaPause, FaChevronRight } from 'react-icons/fa'

function TicketItem({ ticket }) {
  // Calcul SLA
  const isOverdue = new Date(ticket.deadline) < new Date() && ticket.status !== 'closed' && ticket.status !== 'suspended';
  
  const deadlineDate = new Date(ticket.deadline).toLocaleString('ro-RO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  // Badge Status Color Logic
  const getStatusStyle = (status) => {
    switch(status) {
        case 'new': return 'bg-blue-500/20 text-blue-200 border-blue-500/50';
        case 'open': return 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50';
        case 'suspended': return 'bg-amber-500/20 text-amber-200 border-amber-500/50';
        case 'closed': return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50';
        default: return 'bg-gray-500/20 text-gray-200 border-gray-500/50';
    }
  }

  const getStatusText = (status) => {
    const texts = { new: 'Nou', open: 'În Lucru', suspended: 'Suspendat', closed: 'Închis' };
    return texts[status] || status;
  }

  const displayId = ticket.ticketId 
      ? `#${ticket.ticketId}` 
      : (ticket._id ? `#${ticket._id.substring(ticket._id.length - 4)}` : '...');

  return (
    <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:px-8 md:py-5 hover:bg-white/20 transition-all duration-300 shadow-lg mb-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
        
        {/* COLOANA 1: DATA / ID - Aliniat stânga */}
        <div className="flex flex-col text-left">
          <span className="text-lg font-black text-white tracking-tighter">{displayId}</span>
          <span className="text-[10px] text-white/50 uppercase font-bold">
            {new Date(ticket.createdAt).toLocaleDateString('ro-RO')}
          </span>
        </div>

        {/* COLOANA 2: PRODUS - Aliniat stânga (sub 'PRODUS') */}
        <div className="text-left">
          <span className="text-white font-semibold text-base">
            {ticket.product}
          </span>
        </div>

        {/* COLOANA 3: PRIORITATE / SLA - Centrat */}
        <div className="flex flex-col items-center">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md mb-1 border uppercase tracking-wider ${
            ticket.priority === 'Mare' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/10 text-white/70 border-white/20'
          }`}>
            {ticket.priority || 'Mica'}
          </span>
          {ticket.status !== 'closed' && (
             <div className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                {ticket.status === 'suspended' ? 'ÎNGHEȚAT' : (new Date(ticket.deadline).toLocaleDateString('ro-RO'))}
             </div>
          )}
        </div>

        {/* COLOANA 4: STATUS - Centrat */}
        <div className="flex justify-center">
          <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
            {getStatusText(ticket.status)}
          </span>
        </div>

        {/* COLOANA 5: ACȚIUNE - Aliniat dreapta */}
        <div className="flex justify-end">
          <Link 
            to={`/ticket/${ticket._id}`} 
            className="flex items-center gap-2 bg-white text-indigo-900 font-bold py-2 px-6 rounded-xl hover:shadow-lg transition-all group-hover:scale-105 active:scale-95 text-sm"
          >
            Vezi
          </Link>
        </div>

      </div>
    </div>
  )
}

export default TicketItem