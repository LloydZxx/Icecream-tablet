import React, { useState, useEffect } from 'react'
import './ordersuccess.css'

const OrderFlowContainer = ({ orderRef, flavor, accent, onContinue, memberId, icecreamAmount, requiredTokens, orderData }) => {
  // Steps: 'SUCCESS' -> 'PLACE_CUP' -> 'READY_START' -> 'DISPENSING' -> 'ENJOY'
  const [currentStep, setCurrentStep] = useState('SUCCESS')
  const resolvedOrderRef = orderData?.orderRef || orderRef || 'Pending'
  const resolvedFlavor = orderData?.flavor || flavor || 'Vanilla'
  const resolvedMemberId = orderData?.memberId || memberId || 'N/A'
  const resolvedIcecreamAmount = orderData?.icecreamAmount || icecreamAmount || 2
  const resolvedRequiredTokens = orderData?.requiredTokens || requiredTokens || 20
  const resolvedMessage = orderData?.message || 'Your order has been confirmed'
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(15)

  // Dispensing Progress Effect
  useEffect(() => {
    let interval
    if (currentStep === 'DISPENSING') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setCurrentStep('ENJOY') // 100% ပြည့်ရင် ENJOY page ကိုသွားမယ်
            return 100
          }
          return prev + 5 // Progress တက်မည့်နှုန်း
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentStep])

  // Enjoy Page Auto-countdown to Home Effect
  useEffect(() => {
    let timer
    if (currentStep === 'ENJOY' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      onContinue?.() // Countdown ပြီးရင် Home ပြန်မယ်
    }
    return () => clearInterval(timer)
  }, [currentStep, countdown, onContinue])

  // Handle Back Actions
  const handleBack = () => {
    if (currentStep === 'PLACE_CUP') setCurrentStep('SUCCESS')
    else if (currentStep === 'READY_START') setCurrentStep('PLACE_CUP')
  }

  return (
    <div className="flow-wrapper">
      {/* Top Back Button (DISPENSING နဲ့ ENJOY မှာ ဖျောက်ထားမယ်) */}
      {currentStep !== 'DISPENSING' && currentStep !== 'ENJOY' && (
        <button className="top-back-arrow" onClick={handleBack}>←</button>
      )}

      {/* =========================================================
          STEP 1: PAYMENT SUCCESSFUL PAGE
         ========================================================= */}
      {currentStep === 'SUCCESS' && (
        <div className="flow-container page-success">
          <div className="logo-area">
            <span className="scoopbot-logo">
              <img src="src/assets/Bot_logo.png" alt="ScoopBot Logo" />
            </span>
          </div>

          <h1 className="main-heading">Payment Successful</h1>
          <p className="sub-heading">{resolvedMessage}</p>

          <section className="info-box">
            <div className="info-item">
              <span>Order Ref</span>
              <span className="highlight-pink">{resolvedOrderRef}</span>
            </div>
            <div className="info-item">
              <span>Member ID</span>
              <span className="highlight-pink">{resolvedMemberId}</span>
            </div>
            <div className="info-item">
              <span>Flavor</span>
              <span className="highlight-pink">{resolvedFlavor}</span>
            </div>
            <div className="info-item">
              <span>Serving Size</span>
              <span className="highlight-pink">Fixed Size({resolvedIcecreamAmount} Scoops)</span>
            </div>
            <div className="info-item">
              <span>Required Tokens</span>
              <span className="highlight-pink">{resolvedRequiredTokens} Tokens</span>
            </div>
          </section>

          <button className="flow-action-btn pink-btn success-continue-btn" onClick={() => setCurrentStep('PLACE_CUP')}>
            Continue &nbsp; →
          </button>
        </div>
      )}

      {/* =========================================================
          STEP 2: PLACE YOUR CUP PAGE
         ========================================================= */}
      {currentStep === 'PLACE_CUP' && (
        <div className="page-place-cup-wrapper">
          <div className="content-main-layout">
            
            {/* Left Column: Text & Button Section together */}
            <div className="cup-text-block">
              <h1 className="cup-main-title">Place your cup</h1>
              <p className="cup-sub-title">
                Place your cup directly<br />below the dispenser
              </p>
              
              <div className="cup-action-inline">
                <button className="cup-ready-btn" onClick={() => setCurrentStep('READY_START')}>
                  I'm Ready &nbsp; <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Machine Image Section Only */}
            <div className="cup-image-block">
              <img 
                src="src/assets/Dispensing Icecream.png" 
                alt="Dispenser Machine" 
                className="cup-machine-img"
              />
            </div>

          </div>
        </div>
      )}

 {currentStep === 'READY_START' && (
  <div className="flow-container page-ready-start">
    <h1 className="main-heading">Ready!</h1>
    <p className="sub-heading">Press start when your cup is correctly positioned.</p>

    <div className="start-button-wrapper">
      <button 
        className="giant-start-btn" 
        onClick={(e) => {
          e.currentTarget.classList.add('is-clicked');
          
          // အန်နီမေးရှင်း ၃ စက္ကန့် (3000ms) ပြည့်မှ နောက်တစ်ဆင့်သွားမယ်
          setTimeout(() => {
            setCurrentStep('DISPENSING');
          }, 3000);
        }}
      >
        START
      </button>
    </div>

    <div className="warning-banner">
      ⚠️ Do not move the cup while dispensing
    </div>
  </div>
)}

      {/* =========================================================
          STEP 4: DISPENSING PROGRESS PAGE
         ========================================================= */}
      {currentStep === 'DISPENSING' && (
  <div className="flow-container page-dispensing-wrapper">
    
    {/* ထိပ်ဆုံးမှာ သီးသန့်ရှိနေမယ့် ခေါင်းစဉ် (ဒုတိယပုံစံအတိုင်း) */}
    <div className="dispensing-header-block">
      <h1 className="main-heading text-left">Dispensing...</h1>
      <p className="sub-heading text-left">Sit tight! Your icecream is on the way</p>
    </div>
    
    {/* အောက်ခြေ main Content ကို Split Layout ပုံစံခွဲမယ် */}
    <div className="dispensing-main-layout">
      
      {/* ဘယ်ဘက်ခြမ်း: စက်ရုပ်ပုံသီးသန့် (Container အဖြူမပါ) */}
      <div className="dispensing-image-column">
        <img 
          src="src/assets/Dispensing Icecream.png" 
          alt="Dispensing machine" 
          className="dispensing-machine-actual-img" 
        />
      </div>
      
      {/* ညာဘက်ခြမ်း: Progress Circle နဲ့ Estimate Badge */}
      <div className="dispensing-status-column">
        
        {/* ပိုမိုကြီးမားပြီး ရှင်းလင်းတဲ့ စက်ဝိုင်း Graphic */}
        <div className="giant-progress-circle-container">
          <svg className="progress-svg" viewBox="0 0 100 100">
            <circle className="progress-bg-circle" cx="50" cy="50" r="44" />
            <circle 
              className="progress-bar-circle" 
              cx="50" cy="50" r="44" 
              style={{ strokeDashoffset: 276 - (276 * progress) / 100 }} /* r=44 အတွက် dashoffset ညှိချက် */
            />
          </svg>
          <div className="progress-text-center">
            <h2>{progress}%</h2>
            <span>Complete</span>
          </div>
        </div>
        
        {/* ဒုတိယပုံထဲကအတိုင်း လှပတဲ့ ဘဲဥပုံစံ Badge */}
        <div className="premium-estimate-badge">
          <span className="badge-title">Estimate Time</span>
          <span className="badge-time">20 sec</span>
        </div>
        
      </div>

    </div>
  </div>
)}

      {/* =========================================================
          STEP 5: ENJOY YOUR ICE CREAM PAGE (FINISH)
         ========================================================= */}
      {currentStep === 'ENJOY' && (
        <div className="page-enjoy split-layout">
          {/* Left Column: Final Product Presentation */}
          <div className="layout-left">
            <img src="src/assets/Dispensing Icecream.png" alt="Final Ice Cream" className="mock-icecream-img" />
          </div>
          
          {/* Right Column: Typography & Confirmation info */}
          <div className="layout-right">
            <h1 className="main-heading text-left">Enjoy Your Ice cream</h1>
            <p className="sub-heading text-left">Thank You For Choosing Scoopbot</p>

            <section className="info-box-simple">
              <div className="info-item"><span>Order Ref</span><span className="highlight-pink">{resolvedOrderRef}</span></div>
              <div className="info-item"><span>Flavor</span><span className="highlight-pink">{resolvedFlavor}</span></div>
              <div className="info-item"><span>Serving Size</span><span className="highlight-pink">Fixed Size({resolvedIcecreamAmount} Scoops)</span></div>
            </section>

            <div className="footer-action-row">
              <div className="auto-return-text">
                <span>Returning to Home Screen</span>
                <strong>{countdown} sec</strong>
              </div>
              <button className="flow-action-btn pink-btn enjoy-finish-btn" onClick={onContinue}>
                Finish →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderFlowContainer;