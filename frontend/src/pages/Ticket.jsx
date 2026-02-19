import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, closeTicket, suspendTicket, assignTicket } from '../features/tickets/ticketSlice'
import { getNotes, createNote } from '../features/notes/noteSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaExclamationTriangle, FaPause, FaCheckCircle, FaUserTag, FaBoxOpen, FaCalendarAlt, FaTimes, FaCommentDots, FaCloudUploadAlt, FaPaperclip, FaSearchPlus } from 'react-icons/fa' 
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import NoteItem from '../components/NoteItem'
import SLACountdown from '../components/SLACountdown'
import axios from 'axios'

function Ticket() {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  
  // State pentru o Notă nouă
  const [noteText, setNoteText] = useState('')
  const [noteFile, setNoteFile] = useState(null)
  const [isUploadingNote, setIsUploadingNote] = useState(false)

  // State pentru vizualizarea unei imagini Full Screen
  const [fullScreenImage, setFullScreenImage] = useState(null)

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

  // Functia modificată pentru a suporta poză la adăugarea unei note
  const onNoteSubmit = async (e) => {
    e.preventDefault()
    if(!noteText.trim()) return;

    let attachmentPath = null;

    if (noteFile) {
        setIsUploadingNote(true)
        const formData = new FormData()
        formData.append('attachment', noteFile)
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } }
            const res = await axios.post('/api/tickets/upload', formData, config)
            attachmentPath = res.data
        } catch (error) {
            setIsUploadingNote(false)
            toast.error('Eroare la încărcarea pozei.')
            return
        }
    }

    dispatch(createNote({ noteText, ticketId, attachment: attachmentPath }))
    setNoteText('')
    setNoteFile(null)
    setIsUploadingNote(false)
    setModalIsOpen(false)
  }

  if (isLoading || notesIsLoading) return <Spinner />
  if (isError) return <div className="text-white text-center py-20 text-2xl font-black">EROARE: {message}</div>

  const getStatusBadge = (status) => {
      const styles = {
          new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
          open: 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
          suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
          closed: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      };
      const texts = { new: 'Nou', open: 'În Lucru', suspended: 'Suspendat', closed: 'Închis' };
      return (
          <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${styles[status]}`}>
              {texts[status]}
          </span>
      );
  }

  const displayId = ticket?.ticketId ? `#${ticket.ticketId}` : (ticket?._id ? `#${ticket._id.substring(ticket._id.length - 4)}` : '');
  const mainAttachmentUrl = ticket?.attachment ? (ticket.attachment.startsWith('http') ? ticket.attachment : `http://localhost:5000${ticket.attachment}`) : null;

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
            <Link to='/tickets' className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                <FaArrowLeft /> Înapoi
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">Tichet {displayId}</h1>
        </div>
        {getStatusBadge(ticket.status)}
      </div>

      {/* SLA */}
      {ticket.status !== 'closed' && (
        <div className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl mb-8 ring-1 ring-white/10">
            <SLACountdown deadline={ticket.deadline} createdAt={ticket.createdAt} status={ticket.status} />
        </div>
      )}

      {/* DETALII TICHET */}
      <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden mb-8 ring-1 ring-white/5">
        <div className="p-8 md:p-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaBoxOpen /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Produs</p><h3 className="text-xl font-bold text-white">{ticket.product}</h3></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaCalendarAlt /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Creat la</p><h3 className="text-xl font-bold text-white">{new Date(ticket.createdAt).toLocaleString('ro-RO')}</h3></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaExclamationTriangle /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Prioritate</p><h3 className={`text-xl font-bold uppercase ${ticket.priority === 'Mare' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>{ticket.priority || 'Mica'}</h3></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaUserTag /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Agent Responsabil</p><h3 className="text-xl font-bold text-white">{ticket.assignedTo ? ticket.assignedTo.name : 'Neasignat'}</h3></div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-950/50 border border-white/5 p-8 rounded-3xl shadow-inner">
                <h3 className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mb-4">Descriere Problemă</h3>
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                
                {/* AFIȘARE POZĂ TICHET INLINE */}
                {mainAttachmentUrl && (
                    <div className="mt-8 border-t border-white/5 pt-6">
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"><FaPaperclip /> Atașament Initial</p>
                        <div 
                            className="relative group cursor-pointer w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black" 
                            onClick={() => setFullScreenImage(mainAttachmentUrl)}
                        >
                            <img src={mainAttachmentUrl} alt="Tichet Attachment" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaSearchPlus className="text-white text-4xl drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* BUTOANE ACȚIUNE */}
      <div className="w-full max-w-5xl flex flex-wrap gap-4 mb-10">
        {user && user.role !== 'angajat' && ticket.status === 'new' && (
            <button onClick={onTicketAssign} className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaCheckCircle /> Preia Tichetul
            </button>
        )}
        {ticket.status !== 'closed' && (
            <button onClick={() => setModalIsOpen(true)} className="flex-1 min-w-[200px] bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm border border-white/5">
                <FaPlus /> Răspunde (Notă)
            </button>
        )}
        {ticket.status !== 'closed' && ticket.status !== 'suspended' && (
            <button onClick={onTicketSuspend} className="flex-1 min-w-[200px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaPause /> Suspendă
            </button>
        )}
      </div>

      {/* TIMELINE (CHAT) */}
      <div className="w-full max-w-5xl space-y-4">
        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-2 ml-4 mb-6">
            <FaCommentDots className="text-blue-400" /> Conversație Tichet
        </h3>
        {notes.length > 0 ? (
            notes.map((note) => (
                <NoteItem key={note._id} note={note} onImageClick={setFullScreenImage} />
            ))
        ) : (
            <div className="text-center py-10 bg-slate-900/40 rounded-3xl border border-white/5 italic text-blue-200/30">Fii primul care lasă un mesaj!</div>
        )}
      </div>

      {/* ÎNCHIDERE TICHET */}
      {ticket.status !== 'closed' && (
        <button onClick={() => setConfirmationOpen(true)} className="w-full max-w-5xl mt-12 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-[0.2em] text-sm">
          Închide Tichetul Definitiv
        </button>
      )}

      {/* --- MODAL ADĂUGARE NOTĂ + FIȘIER --- */}
      {modalIsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#1e293b] border border-white/20 rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden ring-1 ring-white/10">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Adaugă Mesaj</h2>
                      <button onClick={() => setModalIsOpen(false)} className="text-blue-200/40 hover:text-white p-2 bg-white/5 rounded-full"><FaTimes /></button>
                  </div>
                  <form onSubmit={onNoteSubmit} className="p-8 space-y-6">
                      <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] placeholder:text-slate-600"
                          placeholder="Scrie răspunsul tău aici..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          required
                      ></textarea>
                      
                      {/* Zona Upload in Modal */}
                      <div>
                          {!noteFile ? (
                              <label htmlFor="note-file" className="flex items-center justify-center w-full h-20 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 hover:border-blue-500/50 transition-all group">
                                  <div className="flex items-center gap-3">
                                      <FaCloudUploadAlt className="text-blue-400 text-2xl group-hover:scale-110 transition-transform" />
                                      <span className="text-blue-200/60 text-sm">Atașează o poză (Opțional)</span>
                                  </div>
                                  <input id="note-file" type="file" className="hidden" onChange={(e) => setNoteFile(e.target.files[0])} />
                              </label>
                          ) : (
                              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
                                  <span className="text-blue-400 font-bold text-sm truncate flex items-center gap-2"><FaPaperclip /> {noteFile.name}</span>
                                  <button type="button" onClick={() => setNoteFile(null)} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                              </div>
                          )}
                      </div>

                      <button type="submit" disabled={isUploadingNote} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest disabled:opacity-50">
                          {isUploadingNote ? 'Se trimite...' : 'Trimite Mesajul'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL FULLSCREEN IMAGE (LIGHTBOX) --- */}
      {fullScreenImage && (
          <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setFullScreenImage(null)}
          >
              <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-colors">
                  <FaTimes size={24} />
              </button>
              <img 
                src={fullScreenImage} 
                alt="Fullscreen" 
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/20 animate-in zoom-in-95 duration-300"
              />
          </div>
      )}

      {/* Modal Confirmare Închidere (Rămâne neschimbat) */}
      {confirmationOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in zoom-in duration-200">
              <div className="bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  <FaExclamationTriangle size={50} className="text-red-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-white mb-4 uppercase">Confirmă Închiderea</h2>
                  <div className="flex gap-4 mt-8">
                      <button onClick={confirmClose} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)]">DA, Închide</button>
                      <button onClick={() => setConfirmationOpen(false)} className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase text-xs tracking-widest border border-white/5">Anulează</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default Ticket