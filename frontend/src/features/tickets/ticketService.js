import axios from 'axios'

// Folosim calea relativa pentru a lasa config-ul de proxy sa preia adresa absoluta pe medii de dev
const API_URL = '/api/tickets/' 

// Initializeaza o instanta noua de incident
const createTicket = async (ticketData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, ticketData, config)

  return response.data
}

// Interogare bulk pentru maparea tabelelor
const getTickets = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data
}

// Extragerea topologiei unui document izolat
const getTicket = async (ticketId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL + ticketId, config)

  return response.data
}

// Comutarea statului final al obiectului la 'Closed'
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

// Actiune de preluare/asumare (Assignation flow)
const assignTicket = async (ticketId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.put(API_URL + ticketId + '/assign', {}, config)
  return response.data
}

// Inghetarea target-ului SLA 
const suspendTicket = async (ticketId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.put(API_URL + ticketId + '/suspend', {}, config)
  return response.data
}

// Postarea ratingului in sistemul CSAT legat de ID
const addFeedback = async (ticketId, feedbackData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(
    API_URL + ticketId + '/feedback',
    feedbackData,
    config
  )

  return response.data
}

// Functie de transfer autoritate (Tier 1 spre Tier 2 support)
const escalateTicket = async (ticketId, escalateData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  const response = await axios.put(API_URL + ticketId + '/escalate', escalateData, config)
  return response.data
}

const ticketService = {
  createTicket,
  getTickets,
  getTicket,
  closeTicket,
  assignTicket,
  suspendTicket, 
  addFeedback, 
  escalateTicket
}

export default ticketService