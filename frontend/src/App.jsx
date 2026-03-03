import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NewTicket from './pages/NewTicket'
import Tickets from './pages/Tickets'
import Ticket from './pages/Ticket'
import AdminUsers from './pages/AdminUsers'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import { AnimatePresence } from 'framer-motion'
import PageAnimation from './components/PageAnimation'
import TicketCalendar from './pages/TicketCalendar'
import KnowledgeBase from './pages/KnowledgeBase'

// Wrapper component ce expune logica de route-matching catre plugin-ul Framer Motion
// Asigura existenta hook-ului `useLocation` intr-un context valid.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // Folosim modul wait pentru a asigura unmount-ul componentei vechi inainte de a randa componenta noua (reduce flickerele vizuale)
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path='/' element={<PageAnimation><Home /></PageAnimation>} />
        <Route path='/login' element={<PageAnimation><Login /></PageAnimation>} />
        <Route path='/register' element={<PageAnimation><Register /></PageAnimation>} />
        
        {/* Layer-ul de protectie global pentru end-point-urile ce necesita validare JWT */}
        <Route element={<PrivateRoute />}>
            <Route path='/knowledge-base' element={<KnowledgeBase />} />
            <Route path='/dashboard' element={<PageAnimation><Dashboard /></PageAnimation>} />
            <Route path='/new-ticket' element={<PageAnimation><NewTicket /></PageAnimation>} />
            <Route path='/tickets' element={<PageAnimation><Tickets /></PageAnimation>} />
            <Route path='/ticket/:ticketId' element={<PageAnimation><Ticket /></PageAnimation>} />
            <Route path='/profile' element={<PageAnimation><Profile /></PageAnimation>} />
            <Route path='/admin' element={<PageAnimation><AdminUsers /></PageAnimation>} />
            <Route path='/calendar' element={<PageAnimation><TicketCalendar /></PageAnimation>} />
        </Route>
        
        {/* Ruta default de tip wildcard pentru handling-ul adreselor inexistente (404 HTTP Code) */}
        <Route path='*' element={<PageAnimation><NotFound /></PageAnimation>} />
      </Routes>
    </AnimatePresence>
  );
}

// Index-ul ierarhic al DOM-ului React (Main entry)
function App() {
  return (
    <>
      {/* Container static injectat peste body pt efecte vizuale asincrone */}
      <div className="tech-bg">
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
      </div>

      <Router>
        <div className='w-full min-h-screen flex flex-col items-center'>
          <Header />
          <main className='w-full flex justify-center'>
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
      <ToastContainer theme="dark" />
    </>
  )
}

export default App