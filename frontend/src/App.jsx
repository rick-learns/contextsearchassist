import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Website components
import Header from './components/website/Header';
import Footer from './components/website/Footer';
import Hero from './components/website/Hero';
import Features from './components/website/Features';
import HowItWorks from './components/website/HowItWorks';
import Pricing from './components/website/Pricing';
import CallToAction from './components/website/CallToAction';

// Extension components for development/testing
import Sidebar from './components/extension/Sidebar';
import BrowserAction from './components/extension/BrowserAction';

// Style for the main content with sidebar
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Website Routes */}
        <Route path="/" element={
          <>
            <Header />
            <main className={styles.mainContent}>
              <div id="content" className={styles.contentContainer}>
                <div id="hero">
                  <Hero />
                </div>
                <div id="features">
                  <Features />
                </div>
                <div id="how-it-works">
                  <HowItWorks />
                </div>
                <div id="pricing">
                  <Pricing />
                </div>
                <div id="contact">
                  <CallToAction />
                </div>
                <Footer />
              </div>
            </main>
          </>
        } />
        
        {/* Extension Routes (for development only) */}
        <Route path="/extension/sidebar" element={<Sidebar />} />
        <Route path="/extension/popup" element={<BrowserAction />} />
        
        {/* Additional routes can be added here */}
      </Routes>
    </Router>
  );
}

export default App;