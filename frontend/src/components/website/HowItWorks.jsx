import React from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    id: 1,
    title: 'Install the Extension',
    description: 'Download and install our browser extension from the Chrome, Firefox, or Edge store in just a few clicks.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.0799 20 6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V16Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M3.5 8H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 2,
    title: 'Select Text in Jira',
    description: 'When viewing a Jira ticket, select any text that you want to search for in related tickets.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6H18V14C18 15.1046 17.1046 16 16 16H8C6.89543 16 6 15.1046 6 14V6Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 20L12 16L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 3,
    title: 'Find Related Tickets',
    description: 'Right-click and select "Find Related Tickets" from the context menu to instantly see all relevant issues.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }
];

const HowItWorks = () => {
  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>
            Getting started with ContextSearch Assist is quick and easy. Follow these simple steps:
          </p>
        </div>
        
        <div className={styles.steps}>
          {steps.map((step) => (
            <div key={step.id} className={styles.step}>
              <div className={styles.stepNumber}>{step.id}</div>
              <div className={styles.iconWrapper}>
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className={styles.demo}>
          <div className={styles.demoVideo}>
            <div className={styles.videoBg}>
              <div className={styles.videoPlaceholder}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12L9 16.5V7.5L15 12Z" fill="currentColor"/>
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>Watch Demo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;