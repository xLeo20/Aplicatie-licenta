import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTicket, reset } from '../features/tickets/ticketSlice'
import { FaArrowCircleLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner' // Asigura-te ca ai importat Spinner

function NewTicket() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.tickets
  )

  // --- MODIFICARE: Folosim ?. (optional chaining) si valoare default '' ---
  const [name] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [product, setProduct] = useState('IT')
  const [priority, setPriority] = useState('Mica')
  const [description, setDescription] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      dispatch(reset())
      navigate('/tickets')
    }

    dispatch(reset())
  }, [dispatch, isError, isSuccess, navigate, message])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createTicket({ product, description, priority }))
  }

  // Daca userul nu e incarcat inca, aratam un Spinner in loc sa crape pagina
  if (!user) {
      return <Spinner />
  }

  if (isLoading) {
      return <Spinner />
  }

  return (
    <>
      <Link to='/' className='btn btn-reverse' style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', textDecoration: 'none', color: '#000', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
         <FaArrowCircleLeft /> Înapoi
      </Link>

      <section className='heading' style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem' }}>Creează un Tichet Nou</h1>
        <p style={{ color: '#828282' }}>Completează formularul de mai jos</p>
      </section>

      <section className='form' style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <div className='form-group' style={{ marginBottom: '15px' }}>
          <label htmlFor='name' style={{ display: 'block', marginBottom: '5px' }}>Nume Client</label>
          <input type='text' className='form-control' value={name} disabled style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }} />
        </div>
        
        <div className='form-group' style={{ marginBottom: '15px' }}>
          <label htmlFor='email' style={{ display: 'block', marginBottom: '5px' }}>Email Client</label>
          <input type='text' className='form-control' value={email} disabled style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }} />
        </div>

        <form onSubmit={onSubmit}>
          <div className='form-group' style={{ marginBottom: '15px' }}>
            <label htmlFor='product' style={{ display: 'block', marginBottom: '5px' }}>Selectează Produsul/Departamentul</label>
            <select 
              name='product' 
              id='product' 
              value={product} 
              onChange={(e) => setProduct(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            >
              <option value='IT'>IT</option>
              <option value='HR'>HR</option>
              <option value='Financiar'>Financiar</option>
              <option value='iPhone'>iPhone</option>
              <option value='Macbook'>Macbook</option>
              <option value='iMac'>iMac</option>
              <option value='iPad'>iPad</option>
            </select>
          </div>

          <div className='form-group' style={{ marginBottom: '15px' }}>
            <label htmlFor='priority'>Nivel Prioritate</label>
            <select 
              name='priority' 
              id='priority' 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            >
              <option value='Mica'>Mică</option>
              <option value='Medie'>Medie</option>
              <option value='Mare'>Mare</option>
            </select>
          </div>

          <div className='form-group' style={{ marginBottom: '15px' }}>
            <label htmlFor='description' style={{ display: 'block', marginBottom: '5px' }}>Descrierea Problemei</label>
            <textarea 
              name='description' 
              id='description' 
              className='form-control' 
              placeholder='Descrie problema aici...' 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '100px', fontFamily: 'inherit' }}
            ></textarea>
          </div>

          <div className='form-group'>
            <button className='btn btn-block' style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
              Trimite Tichetul
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default NewTicket