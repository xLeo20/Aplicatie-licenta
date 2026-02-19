import axios from 'axios'

const API_URL = '/api/faqs/'

// Obține toate articolele
const getFaqs = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.get(API_URL, config)
  return response.data
}

// Creează un articol nou
const createFaq = async (faqData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.post(API_URL, faqData, config)
  return response.data
}

// Șterge un articol
const deleteFaq = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } }
  const response = await axios.delete(API_URL + id, config)
  return response.data
}

const faqService = {
  getFaqs,
  createFaq,
  deleteFaq,
}

export default faqService