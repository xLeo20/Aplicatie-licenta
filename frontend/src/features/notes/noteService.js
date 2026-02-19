import axios from 'axios'

// Get ticket notes
const getNotes = async (ticketId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  const response = await axios.get(`/api/tickets/${ticketId}/notes`, config)
  return response.data
}

// Create ticket note (AICI AM MODIFICAT)
const createNote = async (noteData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  // Acum trimitem si textul si attachment-ul către server!
  const response = await axios.post(
    `/api/tickets/${noteData.ticketId}/notes`,
    {
      text: noteData.noteText,
      attachment: noteData.attachment // <--- Aceasta este piesa lipsă!
    },
    config
  )
  return response.data
}

const noteService = {
  getNotes,
  createNote,
}

export default noteService