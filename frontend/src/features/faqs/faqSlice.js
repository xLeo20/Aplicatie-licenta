import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import faqService from './faqService'

const initialState = {
  faqs: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Obține articolele
export const getFaqs = createAsyncThunk('faqs/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token
    return await faqService.getFaqs(token)
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Creează articol
export const createFaq = createAsyncThunk('faqs/create', async (faqData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token
    return await faqService.createFaq(faqData, token)
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Șterge articol
export const deleteFaq = createAsyncThunk('faqs/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token
    return await faqService.deleteFaq(id, token)
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFaqs.pending, (state) => { state.isLoading = true })
      .addCase(getFaqs.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.faqs = action.payload
      })
      .addCase(getFaqs.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createFaq.pending, (state) => { state.isLoading = true })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.faqs.unshift(action.payload) // Adaugă noul articol la începutul listei
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter((faq) => faq._id !== action.payload.id)
      })
  },
})

export const { reset } = faqSlice.actions
export default faqSlice.reducer