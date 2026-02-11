import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, closeTicket, suspendTicket, assignTicket } from '../features/tickets/ticketSlice'
import { getNotes, createNote } from '../features/notes/noteSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowCircleLeft, FaPlus, FaExclamationTriangle, FaClock, FaPause } from 'react-icons/fa' 
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import NoteItem from '../components/NoteItem'

function Ticket() {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { ticket, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.tickets
  )
  const { notes, isLoading: notesIsLoading } = useSelector((state) => state.notes)
  const { user } = useSelector((state) => state.auth)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { ticketId } = useParams()

  // SLA Logic
  const deadline = ticket.deadline ? new Date(ticket.deadline) : null;
  // Daca tichetul e suspendat sau inchis, nu mai calculam SLA ca overdue
  const isOverdue = deadline && deadline < new Date() && ticket.status !== 'closed' && ticket.status !== 'suspended';
  
  const calculateTimeLeft = () => {
      if(!deadline) return '';
      const diff = deadline - new Date();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} ore rămase`;
  }

  useEffect(() => {
    if (isError) { toast.error(message) }
    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))
    // eslint-disable-next-line
  }, [isError, message, ticketId])

  const onTicketCloseClick = () => { setConfirmationOpen(true) }

  const confirmClose = () => {
    dispatch(closeTicket(ticketId))
    toast.success('Tichetul a fost închis')
    setConfirmationOpen(false)
    navigate('/tickets')
  }

  // --- FUNCTIA DE SUSPENDARE ---
  const onTicketSuspend = () => {
      if(window.confirm('Vrei să suspenderzi acest tichet temporar?')) {
          dispatch(suspendTicket(ticketId))
          toast.info('Tichetul a fost suspendat.')
      }
  }

  const cancelClose = () => { setConfirmationOpen(false) }

  const onTicketAssign = () => {
    dispatch(assignTicket(ticketId))
    toast.success('Tichet preluat cu succes!')
  }

  const onNoteSubmit = (e) => {
    e.preventDefault()
    dispatch(createNote({ noteText, ticketId }))
    setNoteText('')
    setModalIsOpen(false)
  }

  if (isLoading || notesIsLoading) return <Spinner />
  if (isError) return <h3>Ceva nu a mers bine...</h3>

  // Helper pentru culoarea statusului
  const getStatusColor = (status) => {
      switch(status) {
          case 'new': return 'green';
          case 'open': return 'steelblue';
          case 'suspended': return 'orange'; // Culoare pentru suspendat
          case 'closed': return 'red';
          default: return 'gray';
      }
  }

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
    <div className='ticket-page' style={{ position: 'relative' }}>
      
      <header className='ticket-header' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <Link to='/tickets' className='btn btn-reverse btn-back' style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#000', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
            <FaArrowCircleLeft /> Înapoi
        </Link>
        <h2 style={{margin: 0}}>
          Tichet ID: {ticket._id}
          <span className={`status status-${ticket.status}`} style={{ 
            backgroundColor: getStatusColor(ticket.status), 
            color: '#fff', 
            fontSize: '14px', borderRadius: '10px', padding: '5px 10px', marginLeft: '15px', verticalAlign: 'middle'
          }}>
            {getStatusText(ticket.status)}
          </span>
        </h2>
      </header>

      {/* --- BANNER SLA --- */}
      {/* SLA se afiseaza doar daca NU e inchis si NU e suspendat */}
      {ticket.status !== 'closed' && ticket.status !== 'suspended' && deadline && (
        <div style={{
            backgroundColor: isOverdue ? '#f8d7da' : '#d4edda',
            color: isOverdue ? '#721c24' : '#155724',
            padding: '10px', borderRadius: '8px', marginBottom: '20px',
            border: `1px solid ${isOverdue ? '#f5c6cb' : '#c3e6cb'}`,
            display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            {isOverdue ? <FaExclamationTriangle size={20}/> : <FaClock size={20}/>}
            <div>
                <strong>Status SLA: </strong> 
                {isOverdue 
                    ? `ATENȚIE! Depășit termenul (${new Date(deadline).toLocaleString('ro-RO')}).` 
                    : `În grafic. Termen: ${new Date(deadline).toLocaleString('ro-RO')} (${calculateTimeLeft()}).`
                }
            </div>
        </div>
      )}
      
      {/* Mesaj special daca e suspendat */}
      {ticket.status === 'suspended' && (
          <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaPause />
              <strong>Acest tichet este momentan SUSPENDAT. Timpul SLA este înghețat.</strong>
          </div>
      )}

      <div className='ticket-desc' style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{marginBottom: '10px'}}>Subiect: {ticket.product}</h3>
        <hr style={{border: '1px solid #ccc', margin: '10px 0'}} />
        <div className='ticket-info'>
            <p style={{marginBottom: '5px'}}><strong>Dată creare:</strong> {new Date(ticket.createdAt).toLocaleString('ro-RO')}</p>
            <p style={{marginBottom: '5px'}}><strong>Produs:</strong> {ticket.product}</p>
            <p style={{marginBottom: '5px'}}><strong>Prioritate:</strong> {ticket.priority || 'Mica'}</p>
            <p style={{marginBottom: '5px'}}>
              <strong>Agent Responsabil: </strong> 
              {ticket.assignedTo ? <span style={{color: 'blue', fontWeight: 'bold'}}>{ticket.assignedTo.name}</span> : <span style={{color: '#888'}}>Neasignat</span>}
            </p>
        </div>
        <div className='ticket-desc-main' style={{marginTop: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '5px', border: '1px solid #e6e6e6'}}>
            <h3>Descriere Problemă</h3>
            <p>{ticket.description}</p>
        </div>
      </div>

      {/* Butoane Actiune */}
      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
        
        {/* Buton Preia */}
        {user && user.role !== 'angajat' && ticket.status === 'new' && (
            <button onClick={onTicketAssign} className='btn' style={{background: '#004085', color: '#fff', flex: 1}}>
            Preia Tichetul
            </button>
        )}

        {/* Buton Nota */}
        {ticket.status !== 'closed' && (
            <button onClick={() => setModalIsOpen(!modalIsOpen)} className='btn' style={{background: '#000', color: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                <FaPlus /> Adaugă Notă
            </button>
        )}

        {/* --- BUTON SUSPENDARE (Apare daca nu e inchis si nu e deja suspendat) --- */}
        {ticket.status !== 'closed' && ticket.status !== 'suspended' && (
             <button onClick={onTicketSuspend} className='btn' style={{background: 'orange', color: '#fff', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                <FaPause /> Suspendă
             </button>
        )}
      </div>

      {modalIsOpen && (
        <form onSubmit={onNoteSubmit} style={{ marginBottom: '30px', marginTop: '20px' }}>
            <div className='form-group'>
                <textarea name='noteText' id='noteText' className='form-control' placeholder='Scrie mesajul tău aici...' value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '80px' }}></textarea>
            </div>
            <button className='btn' type='submit' style={{ marginTop: '10px', background: '#333' }}>Trimite</button>
        </form>
      )}

      {notes.map((note) => (<NoteItem key={note._id} note={note} />))}

      {/* Buton Inchidere */}
      {ticket.status !== 'closed' && (
        <button onClick={onTicketCloseClick} className='btn btn-block btn-danger' style={{ width: '100%', marginTop: '40px', background: 'darkred' }}>
          Închide Tichetul
        </button>
      )}

      {/* Modal Confirmare Inchidere */}
      {confirmationOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
            <FaExclamationTriangle size={40} color="orange" style={{marginBottom: '15px'}} />
            <h2 style={{marginBottom: '10px'}}>Confirmare</h2>
            <p style={{marginBottom: '20px'}}>Ești sigur că vrei să închizi acest tichet?</p>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={confirmClose} style={{ flex: 1, padding: '10px', backgroundColor: 'darkred', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>DA, Închide</button>
              <button onClick={cancelClose} style={{ flex: 1, padding: '10px', backgroundColor: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>NU, Anulează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ticket