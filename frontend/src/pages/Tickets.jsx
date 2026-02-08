import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import { FaArrowCircleLeft, FaFilter, FaSortAmountDown, FaSearch } from 'react-icons/fa' // Am adaugat FaSearch
import { Link } from 'react-router-dom'
import TicketItem from '../components/TicketItem'
import TicketStats from '../components/TicketStats' 

function Tickets() {
  const { tickets, isLoading, isSuccess } = useSelector(
    (state) => state.tickets
  )

  // --- STATE-URI ---
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortType, setSortType] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('') // <--- STATE NOU PENTRU CAUTARE
  const [filteredTickets, setFilteredTickets] = useState([])

  const dispatch = useDispatch()

  useEffect(() => {
    return () => {
      if (isSuccess) {
        dispatch(reset())
      }
    }
  }, [dispatch, isSuccess])

  useEffect(() => {
    dispatch(getTickets())
  }, [dispatch])

  // --- LOGICA PRINCIPALA DE FILTRARE ---
  useEffect(() => {
    let tempTickets = [...tickets]

    // 1. Filtrare dupa Status
    if (statusFilter !== 'all') {
      tempTickets = tempTickets.filter((ticket) => ticket.status === statusFilter)
    }

    // 2. Filtrare dupa Cautare (Text) - CAUTAM IN DESCRIERE, PRODUS sau ID
    if (searchTerm !== '') {
      const lowerTerm = searchTerm.toLowerCase()
      tempTickets = tempTickets.filter((ticket) => 
        ticket.description.toLowerCase().includes(lowerTerm) || 
        ticket.product.toLowerCase().includes(lowerTerm) ||
        ticket._id.toLowerCase().includes(lowerTerm)
      )
    }

    // 3. Sortare
    tempTickets.sort((a, b) => {
      if (sortType === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } 
      else if (sortType === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } 
      else if (sortType === 'priority') {
        const priorityVal = { 'Mare': 3, 'Medie': 2, 'Mica': 1 }
        const valA = priorityVal[a.priority] || 0
        const valB = priorityVal[b.priority] || 0
        return valB - valA
      }
      return 0
    })

    setFilteredTickets(tempTickets)
  }, [tickets, statusFilter, sortType, searchTerm]) // Adaugam searchTerm la dependinte

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <Link to='/' className='btn btn-reverse' style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', textDecoration: 'none', color: '#000', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
         <FaArrowCircleLeft /> Înapoi
      </Link>

      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Tichetele Mele</h1>

      {/* Statistici */}
      {tickets.length > 0 && <TicketStats tickets={tickets} />}

      {/* --- ZONA DE CONTROL (CAUTARE + FILTRE) --- */}
      <div className='ticket-filters' style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        
        {/* INPUT CAUTARE */}
        <div style={{ flex: 2, minWidth: '250px' }}>
           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
            <FaSearch /> Caută tichet:
          </label>
          <input 
            type="text" 
            placeholder="Caută după descriere, produs sau ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Dropdown Status */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
            <FaFilter /> Status:
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="all">Toate</option>
            <option value="new">Noi</option>
            <option value="open">În Lucru</option>
            <option value="closed">Închise</option>
          </select>
        </div>

        {/* Dropdown Sortare */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
            <FaSortAmountDown /> Sortare:
          </label>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="newest">Cele mai noi</option>
            <option value="oldest">Cele mai vechi</option>
            <option value="priority">Prioritate</option>
          </select>
        </div>
      </div>

      <div className='tickets' style={{ width: '100%' }}>
        <div className='ticket-headings' style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '20px', padding: '10px 15px', fontWeight: 'bold', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
          <div>Data</div>
          <div>Produs</div>
          <div>Prioritate</div>
          <div>Status</div>
          <div>Acțiune</div>
        </div>

        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketItem key={ticket._id} ticket={ticket} />
          ))
        ) : (
          <div style={{textAlign: 'center', marginTop: '40px', color: '#888'}}>
            <h3>Nu am găsit niciun tichet.</h3>
            <p>Încearcă să modifici filtrele sau termenul de căutare.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default Tickets