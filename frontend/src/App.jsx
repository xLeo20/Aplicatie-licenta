import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NewTicket from './pages/NewTicket'
import Tickets from './pages/Tickets' // <--- IMPORT NOU
import Ticket from './pages/Ticket'
import AdminUsers from './pages/AdminUsers'

function App() {
  return (
    <>
      <Router>
        <div className='container' style={{ width: '100%', maxWidth: '960px', margin: '0 auto', padding: '0 20px' }}>
          <Header />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            
            {/* Rute Protejate */}
            <Route path='/new-ticket' element={<PrivateRoute />}>
              <Route path='/new-ticket' element={<NewTicket />} />
            </Route>

            <Route path='/tickets' element={<PrivateRoute />}>
              <Route path='/tickets' element={<Tickets />} /> {/* <--- RUTA NOUA */}
            </Route>

            <Route path='/tickets' element={<PrivateRoute />}>
              <Route path='/tickets' element={<Tickets />} />
            </Route>

            {/* RUTA NOUA PENTRU DETALII TICHET - ATENTIE LA :ticketId */}
            <Route path='/ticket/:ticketId' element={<PrivateRoute />}>
              <Route path='/ticket/:ticketId' element={<Ticket />} />
            </Route>
            
            <Route path='/admin' element={<PrivateRoute />}>
            <Route path='/admin' element={<AdminUsers />} />
            </Route>
            
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App