import { useState, useEffect } from 'react';
import { FaClock, FaExclamationCircle, FaPause, FaCheckCircle } from 'react-icons/fa';

const SLACountdown = ({ deadline, createdAt, status }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [progress, setProgress] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    // Daca tichetul e inchis sau suspendat, nu mai calculam in timp real
    if (status === 'closed' || status === 'suspended' || !deadline) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const start = new Date(createdAt).getTime();
      
      const distance = end - now;
      const totalDuration = end - start;

      // Calculam progresul (Cat % din timp a trecut)
      // Daca totalDuration e 0 sau invalid, evitam impartirea la 0
      const elapsedTime = now - start;
      let percentage = (elapsedTime / totalDuration) * 100;
      
      if (percentage > 100) percentage = 100;
      if (percentage < 0) percentage = 0;
      
      setProgress(percentage);

      if (distance < 0) {
        setIsOverdue(true);
        // Putem opri timerul daca a expirat, sau il lasam sa arate cat a trecut peste
        // clearInterval(timer); 
      } else {
        setIsOverdue(false);
      }

      // Calculam zile, ore, minute, secunde
      // Folosim Math.abs pentru a arata timpul pozitiv chiar daca a expirat (cat timp a trecut peste)
      const absDistance = Math.abs(distance);
      
      setTimeLeft({
        days: Math.floor(absDistance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((absDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((absDistance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((absDistance % (1000 * 60)) / 1000),
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, createdAt, status]);

  // --- RENDERIZARE CONDITIONATA ---

  if (status === 'closed') {
    return (
      <div className="sla-badge" style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
        <FaCheckCircle /> Rezolvat la timp
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="sla-badge" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
        <FaPause /> SLA Înghețat (Suspendat)
      </div>
    );
  }

  // Culori dinamice in functie de progres
  let progressColor = '#28a745'; // Verde
  if (progress > 50) progressColor = '#ffc107'; // Galben
  if (progress > 85) progressColor = '#dc3545'; // Rosu

  return (
    <div className="sla-container" style={{ width: '100%', maxWidth: '400px' }}>
      
      {/* TEXTUL CU TIMPUL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: isOverdue ? '#dc3545' : '#333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isOverdue ? <FaExclamationCircle /> : <FaClock />}
            {isOverdue ? 'SLA DEPĂȘIT CU:' : 'Timp Rămas:'}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {timeLeft.days > 0 && `${timeLeft.days}z `}
            {timeLeft.hours !== undefined ? String(timeLeft.hours).padStart(2, '0') : '00'}h : 
            {timeLeft.minutes !== undefined ? String(timeLeft.minutes).padStart(2, '0') : '00'}m : 
            {timeLeft.seconds !== undefined ? String(timeLeft.seconds).padStart(2, '0') : '00'}s
        </div>
      </div>

      {/* BARA DE PROGRES */}
      <div style={{ height: '8px', width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
            style={{ 
                height: '100%', 
                width: `${progress}%`, 
                backgroundColor: isOverdue ? '#dc3545' : progressColor,
                transition: 'width 1s linear, background-color 0.5s ease' // Animatie lina
            }} 
        ></div>
      </div>
      
      {/* Data Deadline-ului mica sub bara */}
      <div style={{ fontSize: '10px', color: '#888', marginTop: '3px', textAlign: 'right' }}>
        Limită: {new Date(deadline).toLocaleString('ro-RO')}
      </div>

    </div>
  );
};

export default SLACountdown;