import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import Logo from '../common/Logo';
import Button from '../common/Button';

// SVG icons for sidebar navigation
const FeatureIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3v18M19 9v12M12 3v18M19 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PricingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ContactIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('features');
  
  // Handle scroll effect and active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Detect current section based on scroll position
      const sections = ['features', 'how-it-works', 'pricing', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Close sidebar when clicking a nav link
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <>
      {/* Mobile Header */}
      <header className={`${styles.mobileHeader} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.mobileContainer}>
          <button 
            className={`${styles.sidebarToggle} ${isSidebarOpen ? styles.open : ''}`}
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={styles.mobileLogo}>
            <Link to="/">
              <Logo size="medium" />
            </Link>
          </div>
          
          <div className={styles.mobileActions}>
            <Button 
              variant="primary"
              size="small"
              onClick={() => window.location.href = "#login"}
            >
              Log In
            </Button>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" onClick={closeSidebar}>
            <Logo size="large" />
          </Link>
          
          <button 
            className={styles.sidebarClose}
            aria-label="Close sidebar"
            onClick={closeSidebar}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a 
                href="#features" 
                onClick={closeSidebar} 
                className={`${styles.navLink} ${activeSection === 'features' ? styles.active : ''}`}
              >
                <FeatureIcon />
                <span>Features</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#how-it-works" 
                onClick={closeSidebar} 
                className={`${styles.navLink} ${activeSection === 'how-it-works' ? styles.active : ''}`}
              >
                <HowIcon />
                <span>How It Works</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#pricing" 
                onClick={closeSidebar} 
                className={`${styles.navLink} ${activeSection === 'pricing' ? styles.active : ''}`}
              >
                <PricingIcon />
                <span>Pricing</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a 
                href="#contact" 
                onClick={closeSidebar} 
                className={`${styles.navLink} ${activeSection === 'contact' ? styles.active : ''}`}
              >
                <ContactIcon />
                <span>Contact</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className={styles.sidebarActions}>
          <Button 
            variant="outline"
            size="medium"
            fullWidth
            onClick={() => {
              window.location.href = "#download";
              closeSidebar();
            }}
          >
            Download Extension
          </Button>
          
          <Button 
            variant="primary"
            size="medium"
            fullWidth
            onClick={() => {
              window.location.href = "#login";
              closeSidebar();
            }}
          >
            Log In
          </Button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
        onClick={closeSidebar}
      ></div>
    </>
  );
};

export default Header;