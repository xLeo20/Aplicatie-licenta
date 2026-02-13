import { FaArrowCircleLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const BackButton = ({ url }) => {
  return (
    <Link to={url} className='flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all'>
      <FaArrowCircleLeft /> Înapoi
    </Link>
  )
}

export default BackButton // Asigură-te că această linie există!