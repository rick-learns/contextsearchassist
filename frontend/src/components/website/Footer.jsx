import React from 'react';
import styles from './Footer.module.css';
import Logo from '../common/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo size="medium" />
            <p className={styles.description}>
              Jira contextual search extension that helps teams find related tickets instantly.
            </p>
          </div>
          
          <div className={styles.linkGroups}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Product</h4>
              <ul className={styles.linkList}>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#download">Download</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Company</h4>
              <ul className={styles.linkList}>
                <li><a href="/about">About Us</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Resources</h4>
              <ul className={styles.linkList}>
                <li><a href="https://docs.contextsearch-assist.com">Documentation</a></li>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/status">System Status</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.legal}>
            <p>&copy; {currentYear} ContextSearch Assist. All rights reserved.</p>
            <div className={styles.legalLinks}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
          
          <div className={styles.social}>
            <a href="https://twitter.com/contextsearch" aria-label="Twitter" className={styles.socialLink}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 4.01C21 4.5 20.02 4.69 19 5C18.39 4.41 17.59 4.01 16.7 4.01C15.46 4.01 14.36 4.56 13.69 5.63C13.01 6.7 12.91 8.01 13.38 9.35C9.83 9.15 6.72 7.51 4.64 4.68C4.14 5.5 3.97 6.47 4.2 7.4C4.44 8.33 5.05 9.11 5.89 9.58C5.21 9.56 4.55 9.38 3.97 9.05V9.1C3.97 10.3 4.3 11.45 4.96 12.34C5.61 13.24 6.55 13.81 7.59 13.95C7.22 14.05 6.82 14.1 6.42 14.1C6.14 14.1 5.86 14.07 5.59 14.01C5.87 15.06 6.47 15.97 7.33 16.63C8.19 17.29 9.26 17.65 10.34 17.66C8.46 19.3 6.18 20.19 3.73 20.19C3.47 20.19 3.21 20.18 2.95 20.16C5.44 21.85 8.35 22.77 11.29 22.77C16.69 22.77 21.73 17.68 21.73 11.29L21.73 10.73C22.69 9.83 23.42 8.76 23.95 7.61C23.03 8.01 22.05 8.26 21.06 8.35C22.08 7.56 22.86 6.4 23.22 5.02C22.24 5.72 21.15 6.2 19.96 6.51C19.08 5.56 17.79 5 16.41 5C13.78 5 11.65 7.13 11.65 9.76V10.76C8.44 10.76 5.5 8.99 3.53 6.04C2.55 7.82 3.07 10.11 4.8 11.29C4.12 11.26 3.46 11.06 2.88 10.72V10.78C2.88 13.17 4.55 15.14 6.87 15.55C6.5 15.65 6.12 15.7 5.73 15.7C5.45 15.7 5.17 15.68 4.9 15.63C5.47 17.56 7.25 18.95 9.32 18.99C7.65 20.29 5.6 21.04 3.46 21.04C3.21 21.04 2.97 21.03 2.73 21.01C4.85 22.36 7.29 23.14 9.86 23.14C16.35 23.14 21.36 17.16 21.36 10.66V10.09C22.4 9.25 23.25 8.2 23.95 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://github.com/contextsearch" aria-label="GitHub" className={styles.socialLink}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21V19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26V21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/contextsearch" aria-label="LinkedIn" className={styles.socialLink}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;