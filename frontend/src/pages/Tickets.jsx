import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import BackButton from '../components/BackButton'
import TicketItem from '../components/TicketItem'
import { FaSearch, FaFilter, FaFilePdf, FaFileCsv, FaTicketAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000')

function Tickets() {
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets)
  const dispatch = useDispatch()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Toate Statusurile')

  const [currentPage, setCurrentPage] = useState(1)
  const ticketsPerPage = 8 

  useEffect(() => {
    dispatch(getTickets())
    return () => { 
      dispatch(reset()) 
    }
  }, [dispatch])

  useEffect(() => {
    socket.on('tichet_nou_creat', () => {
      dispatch(getTickets())
    });
    socket.on('ticketUpdated', () => {
      dispatch(getTickets())
    });
    return () => {
      socket.off('tichet_nou_creat');
      socket.off('ticketUpdated');
    };
  }, [dispatch]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const filteredTickets = tickets.filter(ticket => {
    const searchString = searchTerm.toLowerCase()
    
    const matchesSearch = 
        (ticket.category && ticket.category.toLowerCase().includes(searchString)) || 
        (ticket.issueType && ticket.issueType.toLowerCase().includes(searchString)) || 
        (ticket.ticketId && ticket.ticketId.toString().includes(searchString))

    const matchesStatus = filterStatus === 'Toate Statusurile' || ticket.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Sistem Asistenta Deskflow", 14, 20); 
    
    doc.setFontSize(10);
    doc.setTextColor(96, 165, 250);
    doc.text("Raport Centralizator Tichete", 14, 28);

    const date = new Date().toLocaleString('ro-RO');
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generat: ${date}`, pageWidth - 15, 20, { align: 'right' });
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(`Tichete gasite: ${filteredTickets.length}`, 14, 50);
    doc.line(14, 55, pageWidth - 14, 55);

    const tableColumn = ["ID", "Categorie", "Domeniu", "Prioritate", "Status Curent"];
    const tableRows = [];

    filteredTickets.forEach(ticket => {
      const ticketData = [
        ticket.ticketId || 'N/A',
        ticket.issueType || 'N/A',
        ticket.category || 'N/A',
        ticket.priority || 'N/A',
        ticket.status.toUpperCase()
      ]
      tableRows.push(ticketData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, valign: 'middle', halign: 'center' },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`Raport_Tichete_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  const exportCSV = () => {
    const headers = ['ID Tichet', 'Categorie', 'Domeniu', 'Prioritate', 'Status', 'Data Creare'];
    
    const csvRows = filteredTickets.map(ticket => {
        return [
            ticket.ticketId || 'N/A',
            `"${ticket.issueType || 'N/A'}"`, 
            `"${ticket.category || 'N/A'}"`,
            ticket.priority || 'N/A',
            ticket.status.toUpperCase(),
            new Date(ticket.createdAt).toLocaleDateString('ro-RO')
        ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Excel_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (isLoading) return <Spinner />

  return (
    <div className="w-full flex flex-col items-center px-4 py-8 animate-in fade-in duration-700">
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <BackButton url='/' />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg flex items-center gap-3">
            <FaTicketAlt className="text-blue-400" /> Registru Tichete
          </h1>
        </div>
        
        <div className="flex gap-4">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
              <FaFileCsv size={18} /> Exporta Excel
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black py-3 px-6 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
              <FaFilePdf size={18} /> Generare PDF
            </button>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-10 ring-1 ring-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:scale-110 transition-transform" />
            <input 
              type="text"
              placeholder="Cauta dupa ID sau categorie..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-blue-200/20 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
            <select 
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Toate Statusurile" className="bg-slate-900">Toate Tichetele</option>
              <option value="new" className="bg-slate-900">Status: In Asteptare</option>
              <option value="open" className="bg-slate-900">Status: In Lucru</option>
              <option value="suspended" className="bg-slate-900">Status: Pe Pauza</option>
              <option value="closed" className="bg-slate-900">Status: Rezolvat</option>
            </select>
          </div>

          <div className="flex flex-col items-end justify-center text-blue-200/50 font-black uppercase tracking-[0.2em] text-[10px]">
            <span>Rezultate gasite: <span className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs shadow-lg shadow-blue-500/20">{filteredTickets.length}</span></span>
            {filteredTickets.length > 0 && <span className="mt-2 opacity-50">Pagina {currentPage} din {totalPages}</span>}
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-4">
        
        <div className="hidden md:grid grid-cols-5 gap-4 px-8 py-4 text-blue-200/40 font-black uppercase text-[10px] tracking-[0.2em] border-b border-white/5 mb-2">
          <div className="text-left">Referinta</div>
          <div className="text-left">Detalii</div>
          <div className="text-center">Termen (SLA)</div>
          <div className="text-center">Status Curent</div>
          <div className="text-right">Actiune</div>
        </div>

        {currentTickets.length > 0 ? (
          <>
              {currentTickets.map((ticket) => (
                <TicketItem key={ticket._id} ticket={ticket} />
              ))}
              
              {totalPages > 1 && (
                  <div className="w-full flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/5">
                      <button 
                          onClick={() => paginate(currentPage - 1)} 
                          disabled={currentPage === 1}
                          className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/50 disabled:text-white/20 text-white p-3 rounded-xl transition-colors"
                      >
                          <FaChevronLeft />
                      </button>
                      
                      <div className="flex gap-2">
                          {[...Array(totalPages)].map((_, index) => (
                              <button 
                                  key={index} 
                                  onClick={() => paginate(index + 1)}
                                  className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === index + 1 ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800/50 text-white/50 hover:bg-slate-700'}`}
                              >
                                  {index + 1}
                              </button>
                          ))}
                      </div>

                      <button 
                          onClick={() => paginate(currentPage + 1)} 
                          disabled={currentPage === totalPages}
                          className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/50 disabled:text-white/20 text-white p-3 rounded-xl transition-colors"
                      >
                          <FaChevronRight />
                      </button>
                  </div>
              )}
          </>
        ) : (
          <div className="w-full bg-white/5 backdrop-blur-sm border border-white/5 rounded-[2.5rem] py-24 text-center">
            <p className="text-blue-200/30 text-xl italic font-medium tracking-tight">Niciun tichet nu a fost gasit conform criteriilor selectate.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tickets