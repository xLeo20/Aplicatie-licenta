import axios from 'axios'

const API_URL = 'http://localhost:5000/api/tickets/'

// Creare tichet nou
const createTicket = async (ticketData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, ticketData, config)

  return response.data
}

// Obtine tichetele utilizatorului
const getTickets = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data
}

// ... importurile si codul existent ...

// Obtine un singur tichet
const getTicket = async (ticketId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL + ticketId, config)

  return response.data
}

// Inchide tichetul
const closeTicket = async (ticketId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.put(
    API_URL + ticketId,
    { status: 'closed' },
    config
  )

  return response.data
}

const assignTicket = async (ticketId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.put(API_URL + ticketId + '/assign', {}, config)
  return response.data
}

const ticketService = {
  createTicket,
  getTickets,
  getTicket,      // <--- Nou
  closeTicket,    // <--- Nou
  assignTicket,
}


export default ticketService