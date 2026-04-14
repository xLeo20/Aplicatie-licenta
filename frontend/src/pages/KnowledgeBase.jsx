import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaBook, FaPlus, FaTrash, FaChevronDown, FaTimes, FaTags, FaSearch } from 'react-icons/fa'
import Spinner from '../components/Spinner'

import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); 

function KnowledgeBase() {
  const { user } = useSelector((state) => state.auth)

  const [faqs, setFaqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [activeFaq, setActiveFaq] = useState(null)
  
  const [filterCategory, setFilterCategory] = useState('Toate')
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'IT Hardware & Software'
  })
  const { question, answer, category } = formData

  const fetchFaqs = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      const { data } = await axios.get('/api/faqs', config)
      setFaqs(data)
      setIsLoading(false)
    } catch (error) {
      toast.error('Eroare la descarcarea bazei de cunostinte.')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()

    socket.on('faqChanged', () => {
        fetchFaqs(); 
    });

    return () => {
        socket.off('faqChanged');
    };
  }, [user.token])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      await axios.post('/api/faqs', formData, config)
      
      setIsModalOpen(false)
      setFormData({ question: '', answer: '', category: 'IT Hardware & Software' })
      toast.success('Articolul a fost adaugat cu succes.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nu am putut salva articolul.')
    }
  }

  const onDelete = async (id) => {
    if(window.confirm('Esti sigur ca vrei sa stergi definitiv acest articol?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } }
        await axios.delete(`/api/faqs/${id}`, config)
        
        toast.success('Articolul a fost sters.')
      } catch (error) {
        toast.error('Eroare la stergerea articolului.')
      }
    }
  }

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const toggleAccordion = (id) => {
    if (activeFaq === id) {
      setActiveFaq(null) 
    } else {
      setActiveFaq(id) 
    }
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = filterCategory === 'Toate' || faq.category === filterCategory
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  const categories = ['Toate', ...new Set(faqs.map(faq => faq.category))]

  if (isLoading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <FaBook />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">Baza de Cunostinte</h1>
            <p className="text-indigo-300/50 text-xs font-bold tracking-widest uppercase mt-1">Ghiduri si Solutii Rapide</p>
          </div>
        </div>

        {user && (user.role === 'admin' || user.role === 'agent') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <FaPlus /> Adauga Articol
          </button>
        )}
      </div>

      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl mb-8 ring-1 ring-white/5 flex flex-col gap-6">
        
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:scale-110 transition-transform" />
          <input 
            type="text"
            placeholder="Cauta o problema (ex: parola uitata, lipsa internet)..."
            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FaTags className="text-white/30 text-xl mr-2 self-center" />
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterCategory === cat 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div 
              key={faq._id} 
              className={`bg-slate-900/50 backdrop-blur-sm border transition-all duration-300 rounded-2xl overflow-hidden ${
                activeFaq === faq._id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div 
                className="p-6 cursor-pointer flex justify-between items-center gap-4 select-none"
                onClick={() => toggleAccordion(faq._id)}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded w-fit uppercase font-black tracking-widest border border-indigo-500/20">
                    {faq.category}
                  </span>
                  <h3 className={`text-lg font-bold transition-colors ${activeFaq === faq._id ? 'text-indigo-400' : 'text-white'}`}>
                    {faq.question}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  {user && (user.role === 'admin' || user.role === 'agent') && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(faq._id); }} 
                      className="text-white/20 hover:text-red-500 transition-colors p-2 z-10"
                      title="Sterge Articol"
                    >
                      <FaTrash />
                    </button>
                  )}
                  <div className={`text-white/50 transition-transform duration-300 ${activeFaq === faq._id ? 'rotate-180 text-indigo-400' : ''}`}>
                    <FaChevronDown />
                  </div>
                </div>
              </div>

              <div 
                className={`transition-all duration-500 ease-in-out ${
                  activeFaq === faq._id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 border-t border-white/5 mt-2 bg-slate-950/30">
                  <p className="text-blue-100/70 leading-relaxed whitespace-pre-wrap mt-4">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
            <p className="text-white/40 text-lg italic">Nu am gasit niciun articol pentru aceasta cautare.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-white/20 rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden ring-1 ring-white/10">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black text-white tracking-widest uppercase italic flex items-center gap-2">
                  <FaPlus className="text-indigo-400" /> Adauga Articol Nou
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-blue-200/40 hover:text-white p-2 bg-white/5 rounded-full transition-colors"><FaTimes /></button>
            </div>
            
            <form onSubmit={onSubmit} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Intrebare / Titlu</label>
                  <input type="text" name="question" value={question} onChange={onChange} required placeholder="ex: Cum imi resetez parola de la mail?" 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-white/20" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Categorie (Departament)</label>
                  <select name="category" value={category} onChange={onChange} className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                    <option value="IT Hardware & Software">IT Hardware & Software</option>
                    <option value="Resurse Umane">Resurse Umane</option>
                    <option value="Financiar / Contabilitate">Financiar / Contabilitate</option>
                    <option value="Sarcini Generale">Sarcini Generale</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Solutie (Pasi de rezolvare)</label>
                  <textarea name="answer" value={answer} onChange={onChange} required placeholder="Descrie aici solutia pas cu pas..." 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px] placeholder:text-white/20"></textarea>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all uppercase tracking-widest text-sm transform hover:scale-105 active:scale-95">
                    Salveaza Articolul
                </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default KnowledgeBase