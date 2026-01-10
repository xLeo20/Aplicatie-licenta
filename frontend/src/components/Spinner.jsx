function Spinner() {
  return (
    <div className='loadingSpinnerContainer' style={{ position: 'fixed', top: '0', right: '0', bottom: '0', left: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '5000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className='loadingSpinner' style={{ width: '64px', height: '64px', border: '8px solid', borderColor: '#000 transparent #555 transparent', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Spinner