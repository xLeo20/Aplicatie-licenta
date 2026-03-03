import React from 'react'

// Componenta standalone pentru randarea cardurilor simple de KPI
function TicketStats({ tickets }) {
  
  // Functii pre-calcul pentru metricile afisate
  const totalTickets = tickets.length
  const newTickets = tickets.filter((t) => t.status === 'new').length
  const openTickets = tickets.filter((t) => t.status === 'open').length
  const closedTickets = tickets.filter((t) => t.status === 'closed').length
  
  // Regula de business pentru P1 (Priority 1) tickets nerezolvate
  const urgentTickets = tickets.filter((t) => t.priority === 'Mare' && t.status !== 'closed').length

  return (
    <div className='ticket-stats' style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      
      {/* Node KPI 1 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid #333' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>Total Tichete</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalTickets}</p>
      </div>

      {/* Node KPI 2 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid green' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>Noi (Necitite)</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>{newTickets}</p>
      </div>

      {/* Node KPI 3 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid steelblue' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>In Lucru</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'steelblue' }}>{openTickets}</p>
      </div>

      {/* Node KPI 4 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid red' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>URGENTE Active</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'red' }}>{urgentTickets}</p>
      </div>

    </div>
  )
}

export default TicketStats