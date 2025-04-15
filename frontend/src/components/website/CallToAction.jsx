import React from 'react';
import styles from './CallToAction.module.css';
import Button from '../common/Button';

const CallToAction = () => {
  return (
    <section className={styles.cta} id="download">
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Ready to Level Up Your Jira Workflow?
          </h2>
          <p className={styles.description}>
            Download ContextSearch Assist now and start finding related tickets in seconds, not minutes.
            Available for Chrome, Firefox, and Edge browsers.
          </p>
          
          <div className={styles.buttons}>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
            >
              <div className={styles.buttonContent}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8L12.01 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Download for Chrome</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="large"
              onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/', '_blank')}
            >
              <div className={styles.buttonContent}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8L12.01 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Download for Firefox</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="large"
              onClick={() => window.open('https://microsoftedge.microsoft.com/addons', '_blank')}
            >
              <div className={styles.buttonContent}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8L12.01 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Download for Edge</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;