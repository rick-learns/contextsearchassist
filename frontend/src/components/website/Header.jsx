import React from 'react';
import styles from './Header.module.css';
import Logo from '../common/Logo';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Logo size="medium" />
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="https://docs.contextsearch-assist.com" target="_blank" rel="noopener noreferrer">Docs</a></li>
          </ul>
        </nav>
        <div className={styles.cta}>
          <a href="#download" className={styles.primaryButton}>
            Download Extension
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;