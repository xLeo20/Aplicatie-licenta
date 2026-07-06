import { Link } from 'react-router-dom'
import { FaCircle, FaFireAlt } from 'react-icons/fa'

function TicketItem({ ticket }) {
  
  // Verificăm dacă SLA-ul este depășit (fie din istoric DB, fie live)
  const isSlaBreached = ticket.pickupSlaBreached || ticket.resolveSlaBreached || 
      (ticket.status === 'new' && ticket.pickupDeadline && new Date(ticket.pickupDeadline) < new Date()) || 
      (ticket.status !== 'closed' && ticket.status !== 'suspended' && ticket.deadline && new Date(ticket.deadline) < new Date());
  
  const deadlineDate = new Date(ticket.deadline).toLocaleString('ro-RO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

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
        
        {/* Referință și Data */}
        <div className="flex flex-col text-left">
          <span className="text-lg font-black text-white tracking-tighter">{displayId}</span>
          <span className="text-[10px] text-white/50 uppercase font-bold">
            {new Date(ticket.createdAt).toLocaleDateString('ro-RO')}
          </span>
        </div>

        {/* Tip Solicitare și Departament */}
        <div className="flex flex-col text-left">
          <span className="text-white font-semibold text-sm flex items-center gap-2">
            {ticket.issueType === 'Incident' && <FaCircle className="text-red-500 text-[8px]" />}
            {ticket.issueType === 'Cerere de Serviciu' && <FaCircle className="text-green-500 text-[8px]" />}
            {ticket.issueType === 'Cerere de Acces' && <FaCircle className="text-blue-500 text-[8px]" />}
            {ticket.issueType === 'Onboarding / Offboarding' && <FaCircle className="text-purple-500 text-[8px]" />}
            {ticket.issueType || 'N/A'}
          </span>
          <span className="text-[10px] text-blue-300 uppercase tracking-wider font-bold mt-1">
            {ticket.category || 'N/A'}
          </span>
        </div>

        {/* Prioritate și Termen */}
        <div className="flex flex-col items-center gap-1">
          
          {/* 1. Eticheta de Prioritate */}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
            ticket.priority === 'Mare' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 
            ticket.priority === 'Medie' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 
            'bg-slate-700/50 text-slate-300 border-slate-600'
          }`}>
            {ticket.priority || 'Mică'}
          </span>
          
          {/* 2. ETICHETA DE SLA DEPĂȘIT  */}
          {isSlaBreached && (
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <FaFireAlt /> SLA Depășit
            </span>
          )}

          {/* 3. Data Limită */}
          {ticket.status !== 'closed' && (
             <div className={`text-[10px] font-bold whitespace-nowrap mt-0.5 ${isSlaBreached ? 'text-red-400' : 'text-emerald-400'}`}>
                {ticket.status === 'suspended' ? 'PE PAUZĂ' : (new Date(ticket.deadline).toLocaleDateString('ro-RO'))}
             </div>
          )}
        </div>

        {/* Status Curent */}
        <div className="flex justify-center">
          <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
            {getStatusText(ticket.status)}
          </span>
        </div>

        {/* Buton Acțiune */}
        <div className="flex justify-end">
          <Link 
            to={`/ticket/${ticket._id}`} 
            className="flex items-center gap-2 bg-white text-indigo-900 font-bold py-2 px-6 rounded-xl hover:shadow-lg transition-all group-hover:scale-105 active:scale-95 text-sm"
          >
            Detalii
          </Link>
        </div>

      </div>
    </div>
  )
}

export default TicketItem