import { useSelector } from 'react-redux'
import { FaUserCircle, FaUserShield, FaSearchPlus } from 'react-icons/fa'

function NoteItem({ note, onImageClick }) {
  const { user } = useSelector((state) => state.auth)
  
  // Verificăm dacă nota e scrisă de user-ul curent (pentru a o alinia la dreapta/stânga)
  const isMine = note.user === user._id

  // Construim URL-ul corect pentru imagine
  const attachmentUrl = note.attachment 
      ? (note.attachment.startsWith('http') ? note.attachment : `http://localhost:5000${note.attachment}`)
      : null;

  return (
    <div className={`flex w-full mb-6 ${isMine ? 'justify-end' : 'justify-start'}`}>
      
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {note.isStaff ? (
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <FaUserShield size={20} />
              </div>
          ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-white/50 shadow-inner">
                  <FaUserCircle size={24} />
              </div>
          )}
        </div>

        {/* Bula de Chat */}
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 px-1">
                {note.isStaff ? 'Echipa Suport' : 'Client'} • {new Date(note.createdAt).toLocaleString('ro-RO')}
            </span>

            <div className={`p-5 rounded-3xl backdrop-blur-md shadow-lg ${
                note.isStaff 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tl-sm' 
                : 'bg-slate-800/60 border border-white/10 text-white rounded-tr-sm'
            }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{note.text}</p>

                {/* AFIȘARE POZĂ INLINE ÎN COMENTARIU */}
                {attachmentUrl && (
                    <div className="mt-4 relative group cursor-pointer rounded-xl overflow-hidden border border-white/10 w-64 max-w-full" onClick={() => onImageClick(attachmentUrl)}>
                        <img src={attachmentUrl} alt="Note Attachment" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaSearchPlus className="text-white text-3xl drop-shadow-lg" />
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}

export default NoteItem