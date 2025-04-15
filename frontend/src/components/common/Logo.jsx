import React from 'react';
import styles from './Logo.module.css';

const Logo = ({ size = 'medium', className = '' }) => {
  const logoClasses = [
    styles.logo,
    styles[size],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={logoClasses}>
      <div className={styles.logoIcon}>
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className={styles.logoText}>
        <span className={styles.contextPart}>Context</span>
        <span className={styles.searchPart}>Search</span>
      </div>
    </div>
  );
};

export default Logo;