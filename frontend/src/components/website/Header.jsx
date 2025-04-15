import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import Logo from '../common/Logo';
import Button from '../common/Button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu when clicking a nav link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">
            <Logo size="medium" />
          </Link>
        </div>
        
        <nav className={`${styles.navigation} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="#features" onClick={closeMobileMenu} className={styles.navLink}>Features</a>
            </li>
            <li className={styles.navItem}>
              <a href="#how-it-works" onClick={closeMobileMenu} className={styles.navLink}>How It Works</a>
            </li>
            <li className={styles.navItem}>
              <a href="#pricing" onClick={closeMobileMenu} className={styles.navLink}>Pricing</a>
            </li>
            <li className={styles.navItem}>
              <a href="#contact" onClick={closeMobileMenu} className={styles.navLink}>Contact</a>
            </li>
          </ul>
        </nav>
        
        <div className={styles.actions}>
          <Button 
            variant="outline"
            size="small"
            onClick={() => window.location.href = "#download"}
          >
            Download
          </Button>
          
          <Button 
            variant="primary"
            size="small"
            onClick={() => window.location.href = "#login"}
          >
            Log In
          </Button>
          
          <button 
            className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.open : ''}`}
            aria-label="Toggle mobile menu"
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;