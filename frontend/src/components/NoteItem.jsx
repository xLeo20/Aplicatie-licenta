import { useSelector } from 'react-redux'
import { FaUserShield, FaUser, FaInfoCircle, FaSearchPlus } from 'react-icons/fa'

function NoteItem({ note, onImageClick }) {
  const { user } = useSelector((state) => state.auth)

  // -------------------------------------------------------------
  // Randare specifica pentru entry-urile din Audit Log generate automat de catre actiunile in sistem (isSystem = true)
  // -------------------------------------------------------------
  if (note.isSystem) {
    return (
      <div className="w-full flex justify-center my-6 animate-in fade-in duration-300">
        <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-md px-5 py-2 rounded-full flex items-center gap-3 shadow-inner">
           <FaInfoCircle className="text-blue-400" />
           <p className="text-slate-300 text-xs sm:text-sm font-medium">
             <strong className="text-white">{note.user?.name}</strong> {note.text}
           </p>
           <span className="text-slate-500 text-xs ml-2 border-l border-slate-700 pl-3">
             {new Date(note.createdAt).toLocaleString('ro-RO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
           </span>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // Randare UI standard pentru nodurile de conversatie umane (Chat UI Style)
  // -------------------------------------------------------------
  const isAgent = note.isStaff
  // Comparam adresa referintei sau entitatea propriu-zisa pentru a stabili directia alinierii CSS
  const isCurrentUser = user && user._id === (note.user?._id || note.user)

  return (
    <div className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex flex-col max-w-[80%] ${isAgent ? 'items-start' : 'items-end'}`}>
        
        {/* Identificator Meta (Nume + Badge Rol) */}
        <div className="flex items-center gap-2 mb-1 px-2">
          {isAgent ? (
            <>
              <FaUserShield className="text-blue-400 text-xs" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">{note.user?.name || 'Agent'}</span>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{note.user?.name || 'Client'}</span>
              <FaUser className="text-emerald-400 text-xs" />
            </>
          )}
        </div>

        {/* Container Payload Text */}
        <div className={`p-4 rounded-2xl shadow-lg relative ${
          isAgent 
            ? 'bg-slate-800 border border-blue-500/20 text-white rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}>
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{note.text}</p>
          
          {/* Randare conditionata pentru fisiere atasate la acest nod */}
          {note.attachment && (
              <div className="mt-4 border-t border-white/10 pt-3">
                  <div 
                      className="relative group cursor-pointer w-48 rounded-xl overflow-hidden shadow-md bg-black"
                      onClick={() => onImageClick && onImageClick(`http://localhost:5000${note.attachment}`)}
                  >
                      <img src={`http://localhost:5000${note.attachment}`} alt="Atasament fisier" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                      <div className="absolute inset-0 bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaSearchPlus className="text-white text-2xl drop-shadow-md" />
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-[10px] text-slate-500 mt-1 px-2 font-medium">
          {new Date(note.createdAt).toLocaleString('ro-RO')}
        </div>
        
      </div>
    </div>
  )
}

export default NoteItem