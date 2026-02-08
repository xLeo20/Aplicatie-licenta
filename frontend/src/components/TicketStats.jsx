import React from 'react'

function TicketStats({ tickets }) {
  // Calculam statisticile din lista de tichete primita
  const totalTickets = tickets.length
  const newTickets = tickets.filter((t) => t.status === 'new').length
  const openTickets = tickets.filter((t) => t.status === 'open').length
  const closedTickets = tickets.filter((t) => t.status === 'closed').length
  
  // Calculam urgentele (Prioritate Mare + status diferit de inchis)
  const urgentTickets = tickets.filter((t) => t.priority === 'Mare' && t.status !== 'closed').length

  return (
    <div className='ticket-stats' style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      
      {/* Card 1: Total */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid #333' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>Total Tichete</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalTickets}</p>
      </div>

      {/* Card 2: Noi */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid green' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>Noi (Necitite)</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>{newTickets}</p>
      </div>

      {/* Card 3: In Lucru */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid steelblue' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>În Lucru</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'steelblue' }}>{openTickets}</p>
      </div>

      {/* Card 4: Urgente */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid red' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#888' }}>URGENTE Active</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'red' }}>{urgentTickets}</p>
      </div>

    </div>
  )
}

export default TicketStats