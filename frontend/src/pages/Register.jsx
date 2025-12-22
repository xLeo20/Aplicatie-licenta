import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset } from '../features/auth/authSlice'

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

    if (password !== passwordConfirm) {
      toast.error('Parolele nu se potrivesc!')
    } else {
      const userData = {
        name,
        email,
        password,
      }
      dispatch(register(userData))
    }
  }

  if (isLoading) {
    return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Se încarcă...</h1>
  }

  return (
    <>
      <section className='heading' style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FaUser /> Înregistrare
        </h1>
        <p style={{ color: '#828282', fontSize: '1.2rem' }}>Creează un cont nou</p>
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
              placeholder='Numele complet'
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
              placeholder='Adresa de email'
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
              placeholder='Parola'
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
              placeholder='Confirmă parola'
              onChange={onChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #e6e6e6', borderRadius: '5px' }}
            />
          </div>
          <div className='form-group'>
            <button type='submit' className='btn btn-block' style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '5px', background: '#000', color: '#fff', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
              Înregistrează-te
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default Register