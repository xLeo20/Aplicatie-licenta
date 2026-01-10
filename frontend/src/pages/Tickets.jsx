import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getTickets, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import { FaArrowCircleLeft, FaFilter, FaSortAmountDown } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import TicketItem from '../components/TicketItem'

function Tickets() {
  const { tickets, isLoading, isSuccess } = useSelector(
    (state) => state.tickets
  )

  const [statusFilter, setStatusFilter] = useState('all')
  const [sortType, setSortType] = useState('newest')
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

  useEffect(() => {
    let tempTickets = [...tickets]

    // Filtrare Status
    if (statusFilter !== 'all') {
      tempTickets = tempTickets.filter((ticket) => ticket.status === statusFilter)
    }

    // Sortare
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
  }, [tickets, statusFilter, sortType])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <Link to='/' className='btn btn-reverse' style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', textDecoration: 'none', color: '#000', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
         <FaArrowCircleLeft /> Înapoi
      </Link>

      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Tichetele Mele</h1>

      <div className='ticket-filters' style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
            <FaFilter /> Filtrează după Status:
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="all">Toate Tichetele</option>
            <option value="new">Noi (New)</option>
            <option value="open">În Lucru (Open)</option>
            <option value="closed">Închise (Closed)</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', fontWeight: 'bold' }}>
            <FaSortAmountDown /> Sortează după:
          </label>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="newest">Cele mai noi primele</option>
            <option value="oldest">Cele mai vechi primele</option>
            <option value="priority">Prioritate (Mare - Mică)</option>
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
          <p style={{textAlign: 'center', marginTop: '20px', color: '#888'}}>Nu există tichete care să corespundă filtrului.</p>
        )}
      </div>
    </>
  )
}

export default Tickets