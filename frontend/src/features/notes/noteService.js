import axios from 'axios'

// Stratul de retea pentru extragerea log-ului de mesaje (timeline)
const getNotes = async (ticketId, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  const response = await axios.get(`/api/tickets/${ticketId}/notes`, config)
  return response.data
}

// Stratul de retea pentru injectarea unui comentariu nou in ticket
const createNote = async (noteData, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  
  // Impachetam atat sirul de text cat si referinta URI a fisierului incarcat
  const response = await axios.post(
    `/api/tickets/${noteData.ticketId}/notes`,
    {
      text: noteData.noteText,
      attachment: noteData.attachment 
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