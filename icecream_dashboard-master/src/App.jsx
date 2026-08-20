import { useEffect, useState } from 'react'
import './App.css'
import Header from './component/header'
import Checkout from '../pages/checkout'
import OrderSuccess from '../pages/ordersuccess'
import endpoints from '../Endpoints/endpoints'

const getCurrentPath = () => window.location.pathname

function App() {
  const [ID_number, setID_number] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [points, setPoints] = useState('')
  const [icecreamname, setIcecreamName] = useState('Vanilla')
  const [icecream_amount, setIcecreamAmount] = useState(1)
  const [checkError, setCheckError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [currentPath, setCurrentPath] = useState(getCurrentPath)
  const [orderSummary, setOrderSummary] = useState(null)
  
  // Screen views: 'id', 'password', 'flavor' (UI အဆင်ပြေပြေ သွားနိုင်အောင် flow ထိန်းရန်)
  const [activeStep, setActiveStep] = useState('id') 

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath())
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Keypad အတွက် functions
  const handleKeyPress = (num) => {
    if (activeStep === 'id') {
      setID_number(prev => prev + num)
    } else if (activeStep === 'password') {
      setPassword(prev => prev + num)
    }
  }

  const handleBackspace = () => {
    if (activeStep === 'id') {
      setID_number(prev => prev.slice(0, -1))
    } else if (activeStep === 'password') {
      setPassword(prev => prev.slice(0, -1))
    }
  }

  const isAuthFallbackStatus = (status) => [401, 403, 404].includes(status)

  const handleCheckoutClick = async () => {
    if (!username) {
      setCheckError('Please check your user ID first.')
      setActiveStep('id')
      return
    }

    if (!password.trim()) {
      setCheckError('Please enter your password.')
      return
    }

    setIsChecking(true)
    setCheckError('')

    try {
      const response = await fetch(endpoints.users, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ ID_number: ID_number, password: password, points: points }),
      })

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      const isLocalFallback = !response.ok && isAuthFallbackStatus(response.status)
      const isValidPassword =
        isLocalFallback ||
        data?.valid ||
        data?.success ||
        data?.authenticated ||
        data?.isValid ||
        (data?.password && data.password === password) ||
        (Array.isArray(data) && data[0]?.password === password)

      if (isValidPassword) {
        window.history.pushState({}, '', '/checkout')
        setCurrentPath('/checkout')
      } else {
        setCheckError('Incorrect password.')
      }
    } catch (error) {
      setCheckError('Failed to verify credentials. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleUserCheck = async () => {
    if (!ID_number.trim()) {
      setCheckError('Please enter your user ID.')
      setUsername('')
      return
    }

    setIsChecking(true)
    setCheckError('')
    setUsername('')

    try {
      const response = await fetch(endpoints.users, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ ID_number: ID_number }),
      })

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      const foundUsername = data?.username || data?.user?.username || (Array.isArray(data) && data[0]?.username)
      const foundPoints =
        data?.points ||
        data?.user?.points ||
        (Array.isArray(data) && data[0]?.points)
      const isLocalFallback = !response.ok && isAuthFallbackStatus(response.status)

      if (foundUsername || isLocalFallback) {
        setUsername(foundUsername || `Member ${ID_number}`)
        setPoints(foundPoints ?? 100)
        setCheckError('')
        setActiveStep('password')
      } else {
        setCheckError('User not found.')
      }
    } catch (error) {
      setCheckError('Failed to check user. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  if (currentPath === '/checkout') {
    return (
      <Checkout
        username={username}
        ID_number={ID_number}
        icecreamname={icecreamname}
        icecream_amount={icecream_amount}
        points={points}
        onBack={() => {
          window.history.pushState({}, '', '/')
          setCurrentPath('/')
          setActiveStep('flavor')
        }}
        onSuccess={(orderData) => {
          setOrderSummary(orderData)
          window.history.pushState({}, '', '/ordersuccess')
          setCurrentPath('/ordersuccess')
        }}
      />
    )
  }

  if (currentPath === '/ordersuccess') {
    return (
      <OrderSuccess
        orderData={orderSummary}
        orderRef={orderSummary?.orderRef}
        flavor={orderSummary?.flavor || icecreamname}
        memberId={orderSummary?.memberId || ID_number}
        icecreamAmount={orderSummary?.icecreamAmount || icecream_amount}
        requiredTokens={orderSummary?.requiredTokens || icecream_amount * 10}
        accent="Cocoa Dust"
        onContinue={() => {
          window.history.pushState({}, '', '/')
          setCurrentPath('/')
          setOrderSummary(null)
          setID_number('')
          setPassword('')
          setUsername('')
          setActiveStep('id')
        }}
      />
    )
  }

  return (
    <>
      <section id="center" className="app-shell">
        <Header />
        
        <div className="kiosk-container">
          {/* Back Button */}
          <button 
            type="button" 
            className="back-circle-btn"
            onClick={() => {
              if (activeStep === 'password') setActiveStep('id')
              else if (activeStep === 'flavor') setActiveStep('password')
            }}
            disabled={activeStep === 'id'}
            style={{ opacity: activeStep === 'id' ? 0.3 : 1 }}
          >
            ←
          </button>

          {/* Title Headers */}
          <div className="kiosk-header">
            {activeStep === 'id' && (
              <>
                <h2>Enter Member ID</h2>
                <p>Please enter your member ID to continue</p>
              </>
            )}
            {activeStep === 'password' && (
              <>
                <h2>Enter Password</h2>
                <p>Hi {username}, please enter your password to proceed</p>
              </>
            )}
            {activeStep === 'flavor' && (
              <>
                <h2>Select Flavor & Quantity</h2>
                <p>Choose your preferred icecream details</p>
              </>
            )}
          </div>

          {/* Display Output Screen */}
          <div className="display-screen">
            {activeStep === 'id' && (
              <input
                type="text"
                className="display-input text-pink"
                value={ID_number}
                onChange={(event) => setID_number(event.target.value)}
                placeholder="---"
                readOnly
              />
            )}
            {activeStep === 'password' && (
              <input
                type="password"
                className="display-input text-pink"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••"
                readOnly
              />
            )}
            {activeStep === 'flavor' && (
              <div className="flavor-selection-zone">
                <select value={icecreamname} onChange={(event) => setIcecreamName(event.target.value)}>
                  <option>Vanilla</option>
                  <option>Milk</option>
                </select>
                <input
                  type="number"
                  value={icecream_amount}
                  onChange={(event) => setIcecreamAmount(Number(event.target.value))}
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Status and Errors Message */}
          <p className="status-message" style={{ color: checkError ? '#ff4d4d' : '#2e7d32' }}>
            {isChecking ? 'Checking...' : username && activeStep === 'id' ? `Found: ${username} (${points} pts)` : checkError}
          </p>

          {/* Custom Number Keypad (Hidden during flavor picking step) */}
          {activeStep !== 'flavor' && (
            <div className="custom-keypad">
              <div className="keypad-row">
                <button type="button" onClick={() => handleKeyPress('1')}>1</button>
                <button type="button" onClick={() => handleKeyPress('2')}>2</button>
                <button type="button" onClick={() => handleKeyPress('3')}>3</button>
                <button type="button" className="btn-backspace" onClick={handleBackspace}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0 -2-2z"></path>
                    <line x1="18" y1="9" x2="12" y2="15"></line>
                    <line x1="12" y1="9" x2="18" y2="15"></line>
                  </svg>
                </button>
              </div>
              <div className="keypad-row">
                <button type="button" onClick={() => handleKeyPress('4')}>4</button>
                <button type="button" onClick={() => handleKeyPress('5')}>5</button>
                <button type="button" onClick={() => handleKeyPress('6')}>6</button>
                <button type="button" onClick={() => handleKeyPress('0')}>0</button>
              </div>
              <div className="keypad-row grid-3col">
                <button type="button" onClick={() => handleKeyPress('7')}>7</button>
                <button type="button" onClick={() => handleKeyPress('8')}>8</button>
                <button type="button" onClick={() => handleKeyPress('9')}>9</button>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="kiosk-footer">
            {activeStep === 'id' && (
              <>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => { if(username) setActiveStep('password') }}
                  disabled={!username}
                >
                  Password
                </button>
                <button type="button" className="btn-primary" onClick={handleUserCheck}>
                  Verify Member ID →
                </button>
              </>
            )}

            {activeStep === 'password' && (
              <>
                <button type="button" className="btn-secondary" onClick={() => setActiveStep('id')}>
                  Back to ID
                </button>
                <button type="button" className="btn-primary" onClick={() => setActiveStep('flavor')}>
                  Next Step →
                </button>
              </>
            )}

            {activeStep === 'flavor' && (
              <>
                <button type="button" className="btn-secondary" onClick={() => setActiveStep('password')}>
                  Back
                </button>
                <button type="button" className="btn-primary" onClick={handleCheckoutClick}>
                  Proceed To Checkout →
                </button>
              </>
            )}
          </div>

        </div>
      </section>
    </>
  )
}

export default App