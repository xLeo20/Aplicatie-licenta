import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, closeTicket, suspendTicket, assignTicket, addFeedback, escalateTicket } from '../features/tickets/ticketSlice'
import { getNotes, createNote } from '../features/notes/noteSlice'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaExclamationTriangle, FaPause, FaCheckCircle, FaUserTag, FaBoxOpen, FaCalendarAlt, FaTimes, FaCommentDots, FaCloudUploadAlt, FaPaperclip, FaSearchPlus, FaStopwatch, FaStar, FaShare, FaBug, FaLayerGroup } from 'react-icons/fa' 
import Spinner from '../components/Spinner'
import NoteItem from '../components/NoteItem'
import SLACountdown from '../components/SLACountdown'
import axios from 'axios'

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

// Pagina complexa View-Type pentru managementul unui tichet individual
function Ticket() {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  
  // Controller de state pentru sistemul de logging note
  const [noteText, setNoteText] = useState('')
  const [noteFile, setNoteFile] = useState(null)
  const [isUploadingNote, setIsUploadingNote] = useState(false)

  // Zoom logic
  const [fullScreenImage, setFullScreenImage] = useState(null)

  // Post-resolution metric data
  const [rating, setRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')

  // Logic Tree pentru procedura de Escalation intre tier-urile de operatori
  const [escalateModalOpen, setEscalateModalOpen] = useState(false)
  const [agentsList, setAgentsList] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [escalateReason, setEscalateReason] = useState('')

  const { ticket, isLoading, isError, message } = useSelector((state) => state.tickets)
  const { notes, isLoading: notesIsLoading } = useSelector((state) => state.notes)
  const { user } = useSelector((state) => state.auth)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { ticketId } = useParams()

  // Algoritm timer relativ - preia timestamp-ul initial pt calculul de ETA
  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const total = Date.parse(deadline) - Date.parse(new Date());
    if (total <= 0) return { expired: true, text: "SLA Depasit" };
    
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { expired: false, text: `${minutes}m ${seconds}s` };
  };

  const [pickupTimeLeft, setPickupTimeLeft] = useState(null);

  useEffect(() => {
    // Declansam doar in faza primara a tichetului pentru agent assignment
    if (ticket?.pickupDeadline && ticket.status === 'new') {
      setPickupTimeLeft(calculateTimeRemaining(ticket.pickupDeadline));
      const interval = setInterval(() => {
        setPickupTimeLeft(calculateTimeRemaining(ticket.pickupDeadline));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [ticket]);

  useEffect(() => {
    // Interogare secundara strict vizuala daca modalul este invocat in view
    if (escalateModalOpen) {
        const fetchAgents = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } }
                const { data } = await axios.get('/api/tickets/agents', config)
                // Filter pentru excluderea self-referintelor din dropdown de pasare task
                setAgentsList(data.filter(a => a._id !== user._id))
            } catch (error) {
                toast.error('Lipsa raspuns server pentru maparea organigramei.')
            }
        }
        fetchAgents()
    }
  }, [escalateModalOpen, user])

  // Logica primara de binding WSS (WebSockets)
  useEffect(() => {
    if (isError) { toast.error(message) }
    
    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))

    socket.on('noteAdded', (newNote) => {
      // Refresh timeline fortat daca s-a produs un update specific acestui thread
      if (newNote && newNote.ticket === ticketId) {
         dispatch(getNotes(ticketId));
      }
    });

    socket.on('ticketUpdated', (updatedTicket) => {
      if (!updatedTicket || updatedTicket._id === ticketId || updatedTicket === ticketId) {
         dispatch(getTicket(ticketId));
      }
    });

    return () => {
      socket.off('noteAdded');
      socket.off('ticketUpdated');
    };
  }, [isError, message, ticketId, dispatch])

  const confirmClose = () => {
    dispatch(closeTicket(ticketId))
    toast.success(user?.role?.toLowerCase() === 'angajat' ? 'Cererea se considera incetata' : 'Ciclu de solutionare terminat')
    setConfirmationOpen(false)
    navigate('/tickets')
  }

  const onTicketSuspend = () => {
      if(window.confirm('Actioneaza optiunea de Wait-Time?')) {
          dispatch(suspendTicket(ticketId))
          toast.info('SLA-ul a fost setat pe statusul Blocked.')
      }
  }

  const onTicketAssign = () => {
    dispatch(assignTicket(ticketId))
    toast.success('Preluare inregistrata in sistem.')
  }

  const onFeedbackSubmit = (e) => {
    e.preventDefault()
    dispatch(addFeedback({ ticketId, rating, comment: feedbackComment }))
    toast.success('Raport trimis catre Quality Assurance.')
  }

  const onEscalateSubmit = () => {
      if (!selectedAgent) return toast.error('Trebuie marcat ID-ul tinta obligatoriu.')
      dispatch(escalateTicket({ ticketId, targetAgentId: selectedAgent, reason: escalateReason }))
      toast.success('Delegare trimisa mai departe catre index selectat.')
      setEscalateModalOpen(false)
      setSelectedAgent('')
      setEscalateReason('')
  }

  // Upload paralel - File API -> String Injection DB
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
            toast.error('Corupere payload multimedia. Resubmiteti cererea.')
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
  if (isError) return <div className="text-white text-center py-20 text-2xl font-black">RUNTIME ERROR: {message}</div>

  // Parser vizual pentru redarea badge-urilor de stare
  const getStatusBadge = (status) => {
      const styles = {
          new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
          open: 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
          suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
          closed: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      };
      const texts = { new: 'Nepreluat', open: 'Procesare', suspended: 'In Asteptare', closed: 'Rezolvat' };
      return (
          <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${styles[status]}`}>
              {texts[status]}
          </span>
      );
  }

  const displayId = ticket?.ticketId ? `#${ticket.ticketId}` : (ticket?._id ? `#${ticket._id.substring(ticket._id.length - 4)}` : '');
  
  // Tratare dinamica a uri-urilor sursa pentru display img
  const getAttachmentUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `http://localhost:5000${finalPath}`;
  };

  const mainAttachmentUrl = getAttachmentUrl(ticket?.attachment);

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 animate-in fade-in duration-500">
      
      {/* Componenta Header Breadcrumb */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
            <Link to='/tickets' className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all shadow-sm">
                <FaArrowLeft /> Inapoi la Index
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">Raport Incident {displayId}</h1>
        </div>
        {ticket && ticket.status && getStatusBadge(ticket.status)}
      </div>

      <div className="w-full max-w-5xl space-y-4 mb-8">
          
          {/* Tracker-ul First Response - Restrictionat pentru view-ul extern (angajat) folosind .toLowerCase pt siguranta de case-sensitivy */}
          {ticket?.status === 'new' && ticket?.pickupDeadline && pickupTimeLeft && user?.role?.toLowerCase() !== 'angajat' && (
            <div className={`w-full backdrop-blur-xl border p-4 rounded-2xl flex justify-between items-center transition-all ${
              pickupTimeLeft?.expired 
                ? 'bg-red-500/10 border-red-500/30 ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
            }`}>
              <div className="flex items-center gap-3">
                <FaStopwatch className={`text-2xl ${pickupTimeLeft?.expired ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Timp Asignare Operator</p>
                  <p className={`font-bold ${pickupTimeLeft?.expired ? 'text-red-400' : 'text-blue-300'}`}>Timp limita conform procedurii inainte ca SLA-ul sa devina breached.</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black tabular-nums tracking-wider ${pickupTimeLeft?.expired ? 'text-red-500' : 'text-white'}`}>
                  {pickupTimeLeft?.text}
                </span>
              </div>
            </div>
          )}

          {/* Tracker-ul Resolution Time - General valabil */}
          {ticket?.status !== 'closed' && ticket && (
            <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl ring-1 ring-white/10">
                <SLACountdown deadline={ticket.deadline} createdAt={ticket.createdAt} status={ticket.status} />
            </div>
          )}
      </div>

      {ticket && (
      <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden mb-8 ring-1 ring-white/5">
        <div className="p-8 md:p-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaBug /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Macro</p><h3 className="text-xl font-bold text-white">{ticket.issueType || 'N/A'}</h3></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaLayerGroup /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Micro - Domeniu</p><h3 className="text-xl font-bold text-white">{ticket.category || 'N/A'}</h3></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaExclamationTriangle /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Severitate Declarata</p><h3 className={`text-xl font-bold uppercase ${ticket.priority === 'Mare' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'}`}>{ticket.priority || 'Mica'}</h3></div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"><FaUserTag /></div>
                        <div><p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Operat De</p><h3 className="text-xl font-bold text-white">{ticket.assignedTo ? ticket.assignedTo.name : 'Niciun pointer / Null'}</h3></div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-950/50 border border-white/5 p-8 rounded-3xl shadow-inner">
                <h3 className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mb-4">Payload Raport Original</h3>
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                
                {mainAttachmentUrl && (
                    <div className="mt-8 border-t border-white/5 pt-6">
                        <p className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"><FaPaperclip /> Buffer Imagine Intiala</p>
                        <div 
                            className="relative group cursor-pointer w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black" 
                            onClick={() => setFullScreenImage(mainAttachmentUrl)}
                        >
                            <img src={mainAttachmentUrl} alt="Document" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaSearchPlus className="text-white text-4xl drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      )}

      {/* Conditional Rendering pt CSAT - doar daca incidentul s-a inchis anterior */}
      {ticket?.status === 'closed' && !ticket?.feedback?.isSubmitted && (
        <div className="w-full max-w-5xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/30 p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(79,70,229,0.15)] mb-8 animate-in slide-in-from-bottom-5">
            <h3 className="text-2xl font-black text-white uppercase italic drop-shadow-lg mb-6 flex items-center gap-3">
                <FaStar className="text-yellow-400" /> Raporteaza O Nota De Feedback
            </h3>
            <form onSubmit={onFeedbackSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="text-blue-200/60 text-xs font-black uppercase tracking-widest mb-2 block">Criteriu Punctaj</label>
                        <select 
                            value={rating} 
                            onChange={(e) => setRating(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        >
                            <option value="5">5 - Solutionare Completa ⭐⭐⭐⭐⭐</option>
                            <option value="4">4 - Satisfacator ⭐⭐⭐⭐</option>
                            <option value="3">3 - Mediocru ⭐⭐⭐</option>
                            <option value="2">2 - Partial Incomplet ⭐⭐</option>
                            <option value="1">1 - Esec total in suport ⭐</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label className="text-blue-200/60 text-xs font-black uppercase tracking-widest mb-2 block">Mentiuni Adiționale</label>
                         <input 
                            type="text" 
                            className="w-full bg-slate-950/60 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                            placeholder="Nota scrisa optionala..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                         />
                    </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-sm">
                    Inregistreaza Submiterea
                </button>
            </form>
        </div>
      )}

      {/* Review ReadOnly in baza parametrilor stocati */}
      {ticket?.feedback?.isSubmitted && (
        <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-md border border-yellow-500/20 p-6 rounded-[2rem] mb-8 flex items-center gap-6 shadow-lg">
            <div className="bg-yellow-500/20 p-4 rounded-full border border-yellow-500/30">
                <FaStar className="text-3xl text-yellow-400" />
            </div>
            <div>
                <p className="text-yellow-200/60 text-[10px] font-black uppercase tracking-widest">Record Evaluare Sistem</p>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white">{ticket.feedback.rating} / 5</span>
                    <span className="text-slate-400 italic">"{ticket.feedback.comment || 'Valoare null.'}"</span>
                </div>
            </div>
        </div>
      )}

      {/* Gruparea controalelor de stare. Functionalitate blocata pentru conturile fara grad de admin/agent */}
      <div className="w-full max-w-5xl flex flex-wrap gap-4 mb-10">
        
        {user && user.role?.toLowerCase() !== 'angajat' && ticket?.status === 'new' && (
            <button onClick={onTicketAssign} className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaCheckCircle /> Asignare Spre Mine
            </button>
        )}
        
        {ticket?.status !== 'closed' && (
            <button onClick={() => setModalIsOpen(true)} className="flex-1 min-w-[200px] bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm border border-white/5">
                <FaPlus /> Input Nota Noua
            </button>
        )}
        
        {user && user.role?.toLowerCase() !== 'angajat' && ticket?.status !== 'closed' && ticket?.status !== 'suspended' && (
            <button onClick={onTicketSuspend} className="flex-1 min-w-[200px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaPause /> Hold SLA
            </button>
        )}

        {user && user.role?.toLowerCase() !== 'angajat' && ticket?.status !== 'closed' && (
            <button onClick={() => setEscalateModalOpen(true)} className="flex-1 min-w-[200px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <FaShare /> Trigger Transfer / Pass
            </button>
        )}
      </div>

      <div className="w-full max-w-5xl space-y-4">
        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-2 ml-4 mb-6">
            <FaCommentDots className="text-blue-400" /> Log Mesagerie & Actiuni
        </h3>
        {notes.length > 0 ? (
            notes.map((note) => (
                <NoteItem key={note._id} note={note} onImageClick={setFullScreenImage} />
            ))
        ) : (
            <div className="text-center py-10 bg-slate-900/40 rounded-3xl border border-white/5 italic text-blue-200/30">Lipsa actiuni mapate la acest array.</div>
        )}
      </div>

      {ticket?.status !== 'closed' && (
        <button 
          onClick={() => {
            if (user?.role?.toLowerCase() !== 'angajat' && ticket?.status === 'new') {
              toast.error("Omitere logica: Tichetele in stare de asteptare (unassigned) nu pot fi omorate din start. Selectati 'Preia'.", {
                icon: "⚠️",
                theme: "dark"
              });
              return;
            }
            setConfirmationOpen(true)
          }} 
          className={`w-full max-w-5xl mt-12 font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-[0.2em] text-sm
            ${user?.role?.toLowerCase() !== 'angajat' && ticket?.status === 'new' 
              ? 'bg-slate-800/50 text-slate-500 border border-slate-700 cursor-not-allowed' 
              : 'bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20'
            }
          `}
        >
          {user?.role?.toLowerCase() === 'angajat' && ticket?.status === 'new' 
            ? 'Retragere Solicitare Curenta' 
            : (ticket?.status === 'new' ? 'Interdictie: Pre-asigneaza inainte de rezolutie.' : 'Marcare CAZ INCHIS')}
        </button>
      )}

      {/* Overlay Modal pt introducerea datelor */}
      {modalIsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-[#1e293b] border border-white/20 rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden ring-1 ring-white/10">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Adauga Intrare in Log</h2>
                      <button onClick={() => setModalIsOpen(false)} className="text-blue-200/40 hover:text-white p-2 bg-white/5 rounded-full"><FaTimes /></button>
                  </div>
                  <form onSubmit={onNoteSubmit} className="p-8 space-y-6">
                      <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] placeholder:text-slate-600"
                          placeholder="Adaugati instructiuni si comenzi tehnice..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          required
                      ></textarea>
                      
                      <div>
                          {!noteFile ? (
                              <label htmlFor="note-file" className="flex items-center justify-center w-full h-20 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 hover:border-blue-500/50 transition-all group">
                                  <div className="flex items-center gap-3">
                                      <FaCloudUploadAlt className="text-blue-400 text-2xl group-hover:scale-110 transition-transform" />
                                      <span className="text-blue-200/60 text-sm">Upload la fisiere externe permise (Opțional)</span>
                                  </div>
                                  <input id="note-file" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                              </label>
                          ) : (
                              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
                                  <span className="text-blue-400 font-bold text-sm truncate flex items-center gap-2"><FaPaperclip /> {noteFile.name}</span>
                                  <button type="button" onClick={() => setNoteFile(null)} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                              </div>
                          )}
                      </div>

                      <button type="submit" disabled={isUploadingNote} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all uppercase tracking-widest disabled:opacity-50">
                          {isUploadingNote ? 'Pipeline conectat. Se asteapta un raspuns de confirmare...' : 'Impinge catre Server'}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Modal destinat escaladarii catre alte tier-uri  */}
      {escalateModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in zoom-in duration-200">
              <div className="bg-slate-900 border border-purple-500/30 rounded-[2.5rem] p-10 max-w-lg w-full shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
                  <button onClick={() => setEscalateModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><FaTimes size={20}/></button>
                  <FaShare size={40} className="text-purple-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-white mb-2 uppercase text-center">Protocol de Escaladare</h2>
                  <p className="text-slate-400 mb-6 text-sm text-center">Permite alocarea superioara din lipsa de expertiza tehnica sau timp.</p>
                  
                  <div className="space-y-4 mb-8">
                      <div>
                          <label className="text-blue-200/60 text-xs font-black uppercase tracking-widest mb-2 block">Selectare Nod Endpoint (User)</label>
                          <select 
                              value={selectedAgent} 
                              onChange={(e) => setSelectedAgent(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-purple-500 outline-none"
                          >
                              <option value="">-- Dropdown Pointeri Activi --</option>
                              {agentsList.map(agent => (
                                  <option key={agent._id} value={agent._id}>{agent.name} ({agent.role})</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="text-blue-200/60 text-xs font-black uppercase tracking-widest mb-2 block">Argument pre-pasare (Log Intern)</label>
                          <textarea 
                              value={escalateReason}
                              onChange={(e) => setEscalateReason(e.target.value)}
                              placeholder="Notite pentru cel ce continua incidentul..."
                              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                          ></textarea>
                      </div>
                  </div>

                  <button onClick={onEscalateSubmit} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest shadow-lg">
                      Start Handover Protocol
                  </button>
              </div>
          </div>
      )}

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
                alt="Modal Focus" 
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/20 animate-in zoom-in-95 duration-300"
              />
          </div>
      )}

      {/* Pre-validation pt actiunile cu impact permanent (Soft delete/Status change) */}
      {confirmationOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in zoom-in duration-200">
              <div className="bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  <FaExclamationTriangle size={50} className="text-red-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-white mb-4 uppercase">Confirmati Bypass-ul Aprobarii</h2>
                  <div className="flex gap-4 mt-8">
                      <button onClick={confirmClose} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500 transition-all uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)]">Accepta Risc</button>
                      <button onClick={() => setConfirmationOpen(false)} className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase text-xs tracking-widest border border-white/5">Anulare Interventie</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}

export default Ticket