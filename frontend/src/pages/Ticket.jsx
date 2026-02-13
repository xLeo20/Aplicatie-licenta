import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, closeTicket, suspendTicket, assignTicket } from '../features/tickets/ticketSlice'
import { getNotes, createNote } from '../features/notes/noteSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaExclamationTriangle, FaPause, FaCheckCircle, FaUserTag, FaBoxOpen, FaCalendarAlt, FaTimes, FaCommentDots } from 'react-icons/fa' 
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import NoteItem from '../components/NoteItem'
import SLACountdown from '../components/SLACountdown'

function Ticket() {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { ticket, isLoading, isError, message } = useSelector((state) => state.tickets)
  const { notes, isLoading: notesIsLoading } = useSelector((state) => state.notes)
  const { user } = useSelector((state) => state.auth)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { ticketId } = useParams()

  useEffect(() => {
    if (isError) { toast.error(message) }
    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))
  }, [isError, message, ticketId, dispatch])

  const confirmClose = () => {
    dispatch(closeTicket(ticketId))
    toast.success('Tichetul a fost închis')
    setConfirmationOpen(false)
    navigate('/tickets')
  }

  const onTicketSuspend = () => {
      if(window.confirm('Vrei să suspenzi acest tichet temporar?')) {
          dispatch(suspendTicket(ticketId))
          toast.info('Tichetul a fost suspendat.')
      }
  }

  const onTicketAssign = () => {
    dispatch(assignTicket(ticketId))
    toast.success('Tichet preluat cu succes!')
  }

  const onNoteSubmit = (e) => {
    e.preventDefault()
    if(!noteText.trim()) return;
    dispatch(createNote({ noteText, ticketId }))
    setNoteText('')
    setModalIsOpen(false)
  }

  if (isLoading || notesIsLoading) return <Spinner />
  if (isError) return <div className="text-white text-center py-20 text-2xl font-black">EROARE: {message}</div>

  const getStatusBadge = (status) => {
      const styles = {
          new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          closed: 'bg-red-500/20 text-red-400 border-red-500/30'
      };
      const texts = { new: 'Nou', open: 'În Lucru', suspended: 'Suspendat', closed: 'Închis' };
      return (
          <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${styles[status]}`}>
              {texts[status]}
          </span>
      );
  }

  const displayId = ticket?.ticketId 
      ? `#${ticket.ticketId}` 
      : (ticket?._id ? `#${ticket._id.substring(ticket._id.length - 4)}` : '');

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
            <Link to='/tickets' className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                <FaArrowLeft /> Înapoi
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                Tichet {displayId}
            </h1>
        </div>
        {getStatusBadge(ticket.status)}
      </div>

      {/* --- SLA COUNTDOWN --- */}
      {ticket.status !== 'closed' && (
        <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl mb-8 ring-1 ring-white/10">
            <SLACountdown deadline={ticket.deadline} createdAt={ticket.createdAt} status={ticket.status} />
        </div>
      )}

      {/* --- DETALII TICHET --- */}
      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden mb-8">
        <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl"><FaBoxOpen /></div>
                        <div>
                            <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Produs / Subiect</p>
                            <h3 className="text-xl font-bold text-white">{ticket.product}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-xl"><FaCalendarAlt /></div>
                        <div>
                            <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Creat la data</p>
                            <h3 className="text-xl font-bold text-white">{new Date(ticket.createdAt).toLocaleString('ro-RO')}</h3>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-xl"><FaExclamationTriangle /></div>
                        <div>
                            <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Prioritate</p>
                            <h3 className={`text-xl font-bold uppercase ${ticket.priority === 'Mare' ? 'text-red-400' : 'text-white'}`}>{ticket.priority || 'Mica'}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-xl"><FaUserTag /></div>
                        <div>
                            <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Agent Responsabil</p>
                            <h3 className="text-xl font-bold text-white">{ticket.assignedTo ? ticket.assignedTo.name : 'Neasignat'}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl">
                <h3 className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mb-4">Descriere Problemă</h3>
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
        </div>
      </div>

      {/* --- ACȚIUNI RAPIDE --- */}
      <div className="w-full max-w-5xl flex flex-wrap gap-4 mb-10">
        {user && user.role !== 'angajat' && ticket.status === 'new' && (
            <button onClick={onTicketAssign} className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaCheckCircle /> Preia Tichetul
            </button>
        )}

        {ticket.status !== 'closed' && (
            <button onClick={() => setModalIsOpen(true)} className="flex-1 min-w-[200px] bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaPlus /> Adaugă Notă
            </button>
        )}

        {ticket.status !== 'closed' && ticket.status !== 'suspended' && (
            <button onClick={onTicketSuspend} className="flex-1 min-w-[200px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaPause /> Suspendă
            </button>
        )}
      </div>

      {/* --- TIMELINE NOTE --- */}
      <div className="w-full max-w-5xl space-y-6">
        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-2 ml-4">
            <FaCommentDots className="text-blue-400" /> Jurnal Activitate
        </h3>
        {notes.length > 0 ? (
            notes.map((note) => (<NoteItem key={note._id} note={note} />))
        ) : (
            <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/5 italic text-blue-200/30">Nicio notă adăugată pentru acest tichet.</div>
        )}
      </div>

      {/* --- ÎNCHIDERE TICHET --- */}
      {ticket.status !== 'closed' && (
        <button onClick={() => setConfirmationOpen(true)} className="w-full max-w-5xl mt-12 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-[0.2em] text-sm">
          Închide Tichetul Definitiv
        </button>
      )}

      {/* --- MODAL ADĂUGARE NOTĂ --- */}
      {modalIsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#1e293b] border border-white/20 rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Adaugă Comentariu</h2>
                      <button onClick={() => setModalIsOpen(false)} className="text-blue-200/40 hover:text-white p-2 bg-white/5 rounded-full"><FaTimes /></button>
                  </div>
                  <form onSubmit={onNoteSubmit} className="p-10">
                      <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[150px] placeholder:text-slate-600"
                          placeholder="Descrie intervenția sau mesajul pentru client..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          required
                      ></textarea>
                      <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest">Trimite Nota</button>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL CONFIRMARE ÎNCHIDERE --- */}
      {confirmationOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in zoom-in duration-200">
              <div className="bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  <FaExclamationTriangle size={50} className="text-red-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-white mb-4 uppercase">Confirmă Închiderea</h2>
                  <p className="text-blue-200/60 mb-8 font-medium">Ești sigur că vrei să marchezi acest tichet ca REZOLVAT? Această acțiune va opri cronometrul SLA.</p>
                  <div className="flex gap-4">
                      <button onClick={confirmClose} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest">DA, Închide</button>
                      <button onClick={() => setConfirmationOpen(false)} className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase text-xs tracking-widest">Anulează</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default Ticket