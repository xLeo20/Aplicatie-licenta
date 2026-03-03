import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset } from '../features/auth/authSlice'

// View extern ne-protejat - Form de inrolare a utilizatorilor
function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })

  const { name, email, password, passwordConfirm } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    // Efectuam push-ul catre dashboard automat pe mount daca datele au fost acceptate si tokenul emis
    if (isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  // Mapare unificata de onChange pentru a retine state-urile tuturor campurilor de input intr-un singur handler
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    // Oprim requestul catre API daca payload-ul este invalid client-side
    if (password !== passwordConfirm) {
      toast.error('Date de intrare incorecte: Potrivire sir parola ratata.')
    } else {
      const userData = {
        name,
        email,
        password,
      }
      // Trimitem dispeceratul Redux catre thunk-ul de login
      dispatch(register(userData))
    }
  }

  if (isLoading) {
    return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Establishing secure connection...</h1>
  }

  return (
    <>
      <section className='heading' style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FaUser /> Sign Up Procedure
        </h1>
        <p style={{ color: '#828282', fontSize: '1.2rem' }}>Definire cont domeniu intern</p>
      </section>

      <section className='form' style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={onSubmit}>
          <div className='form-group' style={{ marginBottom: '10px' }}>
            <input
              type='text'
              className='form-control'
              id='name'
              name='name'
              value={name}
              placeholder='Setare Identitate completa'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group' style={{ marginBottom: '10px' }}>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              placeholder='Sintaxa adresare e-mail'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group' style={{ marginBottom: '10px' }}>
            <input
              type='password'
              className='form-control'
              id='password'
              name='password'
              value={password}
              placeholder='Set Key'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group' style={{ marginBottom: '10px' }}>
            <input
              type='password'
              className='form-control'
              id='passwordConfirm'
              name='passwordConfirm'
              value={passwordConfirm}
              placeholder='Verify Key'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group'>
            <button type='submit' className='btn btn-block' style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '5px', background: '#000', color: '#fff', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              Finalizare Proces
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default Register