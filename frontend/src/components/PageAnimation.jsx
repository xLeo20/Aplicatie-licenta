import { motion } from 'framer-motion'

// Definim animatia: pagina apare usor (opacity 0 -> 1) si se misca putin in sus (y 20 -> 0)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, 
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
}

const PageAnimation = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

export default PageAnimation