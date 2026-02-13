import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTickets, reset } from '../features/tickets/ticketSlice';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Stilurile de baza
import Spinner from '../components/Spinner';
import TicketItem from '../components/TicketItem';
import { FaCalendarAlt } from 'react-icons/fa';

function TicketCalendar() {
  const { tickets, isLoading, isSuccess } = useSelector((state) => state.tickets);
  const dispatch = useDispatch();

  const [date, setDate] = useState(new Date());
  const [selectedTickets, setSelectedTickets] = useState([]);

  useEffect(() => {
    dispatch(getTickets());
    return () => {
      if (isSuccess) dispatch(reset());
    };
  }, [dispatch, isSuccess]);

  // Cand se schimba data sau tichetele, filtram ce afisam jos
  useEffect(() => {
    if (tickets) {
        const filtered = tickets.filter(ticket => {
            if (!ticket.deadline) return false;
            const tDate = new Date(ticket.deadline);
            return (
                tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
            );
        });
        setSelectedTickets(filtered);
    }
  }, [date, tickets]);

  // Functie pentru a pune un punct rosu pe zilele cu Deadline
  const tileContent = ({ date, view }) => {
    if (view === 'month' && tickets) {
        // Cautam daca exista vreun tichet cu deadline in aceasta zi
        const hasDeadline = tickets.some(ticket => {
            if (!ticket.deadline || ticket.status === 'closed') return false;
            const tDate = new Date(ticket.deadline);
            return (
                tDate.getDate() === date.getDate() &&
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
            );
        });

        if (hasDeadline) {
            return <div style={{ height: '8px', width: '8px', backgroundColor: '#dc3545', borderRadius: '50%', margin: '0 auto', marginTop: '5px' }}></div>;
        }
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
        <FaCalendarAlt size={30} />
        <h1 style={{margin: 0}}>Calendar Deadline-uri</h1>
      </div>

      <div className="calendar-container" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* ZONA CALENDAR */}
        <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Calendar 
                onChange={setDate} 
                value={date} 
                tileContent={tileContent}
                className="custom-calendar"
            />
            <p style={{marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'center'}}>
                * Punctele roșii indică zilele cu tichete scadente active.
            </p>
        </div>

        {/* ZONA LISTA TICHETE PE ZIUA ALEASA */}
        <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
                Tichete pentru: {date.toLocaleDateString('ro-RO')}
            </h3>
            
            {selectedTickets.length > 0 ? (
                selectedTickets.map(ticket => (
                    <TicketItem key={ticket._id} ticket={ticket} />
                ))
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <p>Niciun tichet cu termen limită în această zi.</p>
                </div>
            )}
        </div>

      </div>
      
      {/* STILIZARE CSS CUSTOM PENTRU CALENDAR (INLINE PENTRU SIMPLITATE) */}
      <style>{`
        .react-calendar {
            width: 100%;
            border: none;
            font-family: inherit;
        }
        .react-calendar__tile {
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 10px;
        }
        .react-calendar__tile--now {
            background: #e6f7ff;
            border-radius: 10px;
        }
        .react-calendar__tile--active {
            background: #333 !important;
            color: white;
            border-radius: 10px;
        }
        .react-calendar__navigation button {
            font-size: 1.2rem;
            font-weight: bold;
        }
      `}</style>
    </>
  );
}

export default TicketCalendar;