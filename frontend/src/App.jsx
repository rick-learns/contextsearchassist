import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Website components
import Header from './components/website/Header';
import Footer from './components/website/Footer';
import Hero from './components/website/Hero';
import Features from './components/website/Features';
import HowItWorks from './components/website/HowItWorks';
import Trust from './components/website/Trust';
import Pricing from './components/website/Pricing';
import CallToAction from './components/website/CallToAction';

// Extension components for development/testing
import Sidebar from './components/extension/Sidebar';
import BrowserAction from './components/extension/BrowserAction';

function App() {
  return (
    <Router>
      <Routes>
        {/* Website Routes */}
        <Route path="/" element={
          <>
            <Header />
            <main>
              <Hero />
              <Features />
              <HowItWorks />
              <Trust />
              <Pricing />
              <CallToAction />
            </main>
            <Footer />
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