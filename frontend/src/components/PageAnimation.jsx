import { motion } from 'framer-motion'

// Declararea obiectelor statice de stare Framer Motion pentru eficienta memoriei.
// Asigura o tranzitie vizuala fluida prin efectul de "fade-in & slide-up" pe mounting.
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

// Parametrii interpolarii Tween
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
}

// Wrapper component ce intercepteaza elementele copil (react-router children) pentru orchestrarea animatiei intre view-uri
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