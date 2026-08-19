import React, { useState } from 'react'
import './checkout.css'
import endpoints from '../Endpoints/endpoints'

const Checkout = ({ username, ID_number, icecreamname, icecream_amount, points, onSuccess, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requiredTokens = Number(icecream_amount) * 10
  const numericPoints = Number(points) || 0
  const hasEnoughTokens = numericPoints >= requiredTokens

  const handlePlaceOrder = async () => {
    if (isSubmitting) return

    // Final check before submitting
    if (!hasEnoughTokens) {
      alert(`Insufficient tokens: you need ${requiredTokens} but have ${numericPoints}.`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(endpoints.order, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          ID_number,
          icecreamname,
          icecream_amount,
          points: Math.max(0, numericPoints - requiredTokens),
        }),
      })

      if (!response.ok) {
        throw new Error(`Network response was not ok (${response.status})`)
      }

      const data = await response.json()
      const normalizedOrder = {
        memberId: data?.memberId || data?.ID_number || ID_number,
        flavor: data?.flavor || data?.icecreamname || icecreamname,
        icecreamAmount: data?.icecreamAmount || data?.icecream_amount || icecream_amount,
        requiredTokens: data?.requiredTokens || data?.points || requiredTokens,
        orderRef: data?.orderRef || data?.order_id || data?.orderId || data?.id || `ORD-${Date.now()}`,
        status: data?.status || 'confirmed',
        message: data?.message || 'Order placed successfully',
      }

      onSuccess?.(normalizedOrder)
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      {/* Top back button icon */}
      <button className="top-back-btn" onClick={onBack}>
        <span className="arrow">←</span>
      </button>

      <h2 className="main-title">Confirm Your Order</h2>
      <p className="sub-title">Please review your order details</p>

      {/* Main Order Card */}
      <section className="checkout-card">
        <div className="card-content">
          
          {/* Left Side: Ice Cream Image Placeholder */}
          <div className="icecream-image-container">
            <img 
              src="src/assets/icecream.png" 
              alt={icecreamname} 
              className="icecream-img" 
            />
          </div>

          {/* Right Side: Order Details */}
          <div className="checkout-summary">
            <div className="summary-row">
              <span className="label">Flavor</span>
              <span className="value pink-text">{icecreamname}</span>
            </div>
            
            <div className="summary-row">
              <span className="label">Serving Size</span>
              <span className="value pink-text">Fixed Size({icecream_amount} Scoops)</span>
            </div>
            
            <div className="summary-row">
              <span className="label">Required Tokens</span>
              <span className="value pink-text">{icecream_amount * 10} Tokens</span>
            </div>

            <hr className="divider" />

            <div className="summary-row estimated-time-row">
              <span className="label font-bold">Estimated Time</span>
              <span className="value font-bold">30 - 45 sec</span>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Action Buttons */}
      <div className="button-group">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <button
          className="continue-button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting || !hasEnoughTokens}
          title={!hasEnoughTokens ? 'You do not have enough tokens' : undefined}
        >
          {isSubmitting ? 'Processing...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

export default Checkout