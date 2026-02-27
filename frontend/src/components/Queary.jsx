import React from 'react'  
import '../styles/Queary.css';

const Question = () => {
  return (
     <div className={`faq-section`}>
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>Yes, cancel your subscription anytime with no cancellation fees. Your access continues until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>We offer a 7-day money-back guarantee if you're not satisfied with our service. No questions asked.</p>
          </div>
          <div className="faq-item">
            <h4>Can I upgrade mid-cycle?</h4>
            <p>Absolutely! Upgrade or downgrade your plan anytime. We'll prorate the charges to your account.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards, PayPal, and Apple Pay for your convenience.</p>
          </div>
        </div>
      </div>
  )
}

export default Question