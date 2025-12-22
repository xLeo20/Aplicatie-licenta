import { useState, useEffect } from 'react'
import { FaSignInAlt } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, reset } from '../features/auth/authSlice'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    // Daca suntem logati, ne trimite pe prima pagina
    if (isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const userData = {
      email,
      password,
    }

    dispatch(login(userData))
  }

  if (isLoading) {
    return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Se încarcă...</h1>
  }

  return (
    <>
      <section className='heading' style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FaSignInAlt /> Login
        </h1>
        <p style={{ color: '#828282', fontSize: '1.2rem' }}>Autentifică-te pentru a gestiona tichete</p>
      </section>

      <section className='form' style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={onSubmit}>
          <div className='form-group' style={{ marginBottom: '10px' }}>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              placeholder='Introduceți email-ul'
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
              placeholder='Introduceți parola'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group'>
            <button type='submit' className='btn btn-block' style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '5px', background: '#000', color: '#fff', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              Autentificare
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default Login