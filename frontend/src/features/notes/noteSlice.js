import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import noteService from './noteService'

const initialState = {
  notes: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Actiune asincrona pentru hidratarea timeline-ului din DB
export const getNotes = createAsyncThunk(
  'notes/getAll',
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await noteService.getNotes(ticketId, token)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Actiune asincrona ce face push noului mesaj in array-ul din frontend
export const createNote = createAsyncThunk(
  'notes/create',
  async (noteData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      // Transmitem intreg payload-ul pentru a acoperi si tratarea imaginilor
      return await noteService.createNote(noteData, token)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  // Managementul ciclului de viata (pending/fulfilled/rejected) pentru o tranzitie lina de stat
  extraReducers: (builder) => {
    builder
      .addCase(getNotes.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Safeguard: lista de note nu trebuie sa contina niciodata doua intrari cu acelasi _id.
        const seen = new Set()
        state.notes = (action.payload || []).filter((n) => {
          if (!n || seen.has(n._id)) return false
          seen.add(n._id)
          return true
        })
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Evitam necesitatea unui nou GET request prin mutarea state-ului local imediat.
        // Verificam intai sa nu existe deja: evenimentul socket 'noteAdded' poate declansa
        // un getNotes care aduce nota inainte sa soseasca raspunsul HTTP -> altfel ar aparea dublata.
        const exists = state.notes.some((n) => n._id === action.payload._id)
        if (!exists) {
          state.notes.push(action.payload)
        }
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = noteSlice.actions
export default noteSlice.reducer