import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  return (
    <div className="app-container">
      <header className="app-header">
        <div 
          className="logo-section" 
          onClick={() => setCurrentView('landing')}
          style={{ cursor: 'pointer' }}
        >
          <h1>Hope<span className="highlight">Chain</span></h1>
        </div>
        <div className="wallet-section">
          <ConnectWallet />
        </div>
      </header>
      
      <main className="main-content">
        {currentView === 'landing' ? (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <h2>Empowering Change Through Transparency</h2>
                <p>
                  Join our mission to bring secure, confidential, and impactful donations to communities worldwide. Your contribution can change a life today.
                </p>
                <div className="hero-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => setCurrentView('dashboard')}
                  >
                    View Campaigns
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentView('dashboard')}>Start a Campaign</button>
                </div>
              </div>
              <div className="hero-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Children smiling - Charity" 
                  className="hero-image"
                />
              </div>
            </section>

            <section className="features-section">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Donations</h3>
                <p>Every transaction is backed by blockchain technology ensuring absolute security and traceability.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👁️</div>
                <h3>Total Transparency</h3>
                <p>Track where every penny goes. NGO accountability has never been this accessible.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3>Global Impact</h3>
                <p>Support causes across the globe without borders or exorbitant transaction fees.</p>
              </div>
            </section>
          </>
        ) : (
          <Dashboard />
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} HopeChain NGO. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
