import { useSelector } from 'react-redux'

function NoteItem({ note }) {
  const isStaff = note.isStaff
  
  // Determinam eticheta pe baza rolului primit de la backend
  let authorLabel = 'Angajat';
  
  if (isStaff) {
    // Verificam daca avem datele userului (populate) si ce rol are
    if (note.user && note.user.role === 'admin') {
        authorLabel = 'Admin';
    } else {
        authorLabel = 'Agent Support';
    }
  }

  return (
    <div 
      className='note' 
      style={{ 
        // Adminul primeste o culoare usor diferita (ex: negru complet), Agentul gri inchis, Userul alb
        backgroundColor: isStaff ? (authorLabel === 'Admin' ? '#000' : 'rgba(0,0,0,0.7)') : '#fff', 
        color: isStaff ? '#fff' : '#000', 
        padding: '15px', 
        marginBottom: '20px', 
        border: '1px solid #e6e6e6',
        borderRadius: '5px',
        position: 'relative',
        textAlign: 'left'
      }}
    >
      <h4 style={{ marginBottom: '10px' }}>
        Notă de la: <span style={{fontWeight: 'bold'}}>{authorLabel}</span>
        
        <span style={{ fontSize: '12px', position: 'absolute', top: '15px', right: '15px', color: isStaff ? '#ccc' : '#555' }}>
            {note.createdAt ? new Date(note.createdAt).toLocaleString('ro-RO') : 'Acum'}
        </span>
      </h4>
      <p>{note.text}</p>
    </div>
  )
}

export default NoteItem