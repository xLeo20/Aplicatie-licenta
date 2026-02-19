import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FaSearch, FaBook, FaPlus, FaLaptopCode, FaUserTie, FaMoneyBillWave, FaChevronDown, FaTimes, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
import { getFaqs, createFaq, deleteFaq, reset } from '../features/faqs/faqSlice'

function KnowledgeBase() {
  const { user } = useSelector((state) => state.auth)
  const { faqs, isLoading, isError, message } = useSelector((state) => state.faqs)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Toate')
  const [openArticleId, setOpenArticleId] = useState(null)
  
  // State pentru Modal Adăugare Articol
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', category: 'IT' })

  useEffect(() => {
    if (isError) { toast.error(message) }
    dispatch(getFaqs())
    return () => { dispatch(reset()) }
  }, [dispatch, isError, message])

  // Filtrare articole din MongoDB
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.title.toLowerCase().includes(searchTerm.toLowerCase()) || faq.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'Toate' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleArticle = (id) => { setOpenArticleId(openArticleId === id ? null : id) }

  // Submit Articol Nou
  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createFaq(formData))
    toast.success('Articol adăugat cu succes în Baza de Cunoștințe!')
    setIsModalOpen(false)
    setFormData({ title: '', content: '', category: 'IT' })
  }

  // Ștergere Articol
  const onDelete = (id) => {
      if(window.confirm('Ești sigur că vrei să ștergi acest articol?')) {
          dispatch(deleteFaq(id))
          toast.success('Articol șters!')
      }
  }

  const getCategoryIcon = (cat) => {
      switch(cat) {
          case 'IT': return <FaLaptopCode className="text-blue-400" />
          case 'HR': return <FaUserTie className="text-emerald-400" />
          case 'Financiar': return <FaMoneyBillWave className="text-amber-400" />
          default: return <FaBook className="text-white" />
      }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <BackButton url='/' />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg flex items-center gap-3">
            <FaBook className="text-blue-400" /> FAQ
          </h1>
        </div>
        
        {user && user.role !== 'angajat' && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-6 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
            <FaPlus /> Articol Nou
          </button>
        )}
      </div>

      {/* --- ZONA DE CĂUTARE --- */}
      <div className="w-full max-w-5xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl mb-10 relative overflow-hidden ring-1 ring-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-white mb-4">Cum te putem ajuta astăzi?</h2>
            <div className="relative group mt-6">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 text-xl" />
                <input 
                    type="text"
                    placeholder="Ex: resetare parolă, concediu, VPN..."
                    className="w-full bg-slate-950/60 border border-white/20 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* --- CATEGORII --- */}
      <div className="w-full max-w-5xl flex flex-wrap justify-center gap-4 mb-10">
          {['Toate', 'IT', 'HR', 'Financiar', 'General'].map(cat => (
              <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border ${
                      activeCategory === cat 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* --- LISTĂ ARTICOLE DIN MONGODB --- */}
      <div className="w-full max-w-5xl space-y-4">
          {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                  <div key={faq._id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
                      <button onClick={() => toggleArticle(faq._id)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner">
                                  {getCategoryIcon(faq.category)}
                              </div>
                              <h3 className="text-lg font-bold text-white tracking-wide">{faq.title}</h3>
                          </div>
                          <FaChevronDown className={`text-blue-400 transition-transform duration-300 ${openArticleId === faq._id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <div className={`transition-all duration-300 ease-in-out ${openArticleId === faq._id ? 'max-h-96 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                          <div className="pl-14">
                              <span className="inline-block bg-white/5 border border-white/10 text-blue-300 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-4">
                                  CategoriA: {faq.category}
                              </span>
                              <p className="text-blue-100/70 leading-relaxed text-sm whitespace-pre-wrap">{faq.content}</p>
                              
                              {/* Buton ștergere pt Admin/Agent */}
                              {user && user.role !== 'angajat' && (
                                  <button onClick={() => onDelete(faq._id)} className="mt-6 flex items-center gap-2 text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
                                      <FaTrash /> Șterge Articol
                                  </button>
                              )}
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl py-20 text-center">
                  <p className="text-blue-200/40 text-lg font-medium italic">Nu am găsit niciun articol pentru această căutare.</p>
              </div>
          )}
      </div>

      {/* --- MODAL ADĂUGARE ARTICOL NOU --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
              <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative overflow-hidden ring-1 ring-white/20">
                  <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Adaugă Articol FAQ</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-blue-200/40 hover:text-white p-2 bg-white/5 rounded-full"><FaTimes /></button>
                  </div>
                  
                  <form onSubmit={onSubmit} className="p-8 space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Titlu / Întrebare</label>
                          <input 
                              type='text' 
                              required
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600" 
                              placeholder="ex: Cum configurez adresa de email?" 
                              value={formData.title} 
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Categorie</label>
                          <select 
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              value={formData.category}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                              <option value="IT">IT</option>
                              <option value="HR">HR</option>
                              <option value="Financiar">Financiar</option>
                              <option value="General">General</option>
                          </select>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Răspuns Detaliat</label>
                          <textarea 
                              required
                              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[150px] placeholder:text-slate-600"
                              placeholder="Descrie soluția pas cu pas..."
                              value={formData.content}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                          ></textarea>
                      </div>

                      <button type="submit" className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">
                          Salvează Articolul
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  )
}

export default KnowledgeBase