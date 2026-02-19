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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rute Publice */}
        <Route path='/' element={<PageAnimation><Home /></PageAnimation>} />
        <Route path='/login' element={<PageAnimation><Login /></PageAnimation>} />
        <Route path='/register' element={<PageAnimation><Register /></PageAnimation>} />
        
        {/* Rute Protejate (Necesita Login) */}
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
        
        {/* Ruta 404 */}
        <Route path='*' element={<PageAnimation><NotFound /></PageAnimation>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      {/* NODURILE DE FUNDAL */}
      <div className="tech-bg">
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
        <div className="node"></div>
      </div>

      <Router>
        {/* 'w-full' - ocupă toată lățimea
            'flex flex-col items-center' - pune tot ce e în interior fix pe centru
        */}
        <div className='w-full min-h-screen flex flex-col items-center'>
          {/* Header-ul va fi și el centrat acum */}
          <Header />
          
          {/* AnimatedRoutes va conține paginile, care la rândul lor sunt centrate */}
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