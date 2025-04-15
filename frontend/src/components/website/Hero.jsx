import React from 'react';
import styles from './Hero.module.css';
import Button from '../common/Button';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Find Related <span className={styles.highlight}>Jira Tickets</span> Instantly
          </h1>
          <p className={styles.subtitle}>
            ContextSearch Assist is a powerful browser extension that helps development teams
            find related tickets in Jira, saving hours of manual searching every week.
          </p>
          
          <div className={styles.actions}>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => window.location.href = "#pricing"}
            >
              Get Started
            </Button>
            
            <Button 
              variant="secondary" 
              size="large"
              onClick={() => window.location.href = "#how-it-works"}
            >
              How It Works
            </Button>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>85%</div>
              <div className={styles.statText}>Time Saved</div>
            </div>
            
            <div className={styles.stat}>
              <div className={styles.statNumber}>10k+</div>
              <div className={styles.statText}>Active Users</div>
            </div>
            
            <div className={styles.stat}>
              <div className={styles.statNumber}>4.8/5</div>
              <div className={styles.statText}>User Rating</div>
            </div>
          </div>
        </div>
        
        <div className={styles.imageWrapper}>
          <div className={styles.image}>
            <div className={styles.browserMockup}>
              <div className={styles.browserHeader}>
                <div className={styles.browserControls}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.browserAddressBar}>
                  jira.company.com
                </div>
              </div>
              
              <div className={styles.browserContent}>
                <div className={styles.jiraMockup}>
                  <div className={styles.jiraHeader}>
                    <div className={styles.jiraTicketId}>PROJ-1234</div>
                    <div className={styles.jiraTicketTitle}>Fix authentication flow in login page</div>
                  </div>
                  
                  <div className={styles.jiraBody}>
                    <div className={styles.jiraText}>
                      <div className={styles.textLine}></div>
                      <div className={styles.textLine} style={{ width: '85%' }}></div>
                      <div className={styles.textLine} style={{ width: '90%' }}></div>
                      <div className={styles.textHighlight}>Authentication is failing when users try to log in with SSO</div>
                      <div className={styles.textLine} style={{ width: '80%' }}></div>
                      <div className={styles.textLine} style={{ width: '75%' }}></div>
                    </div>
                    
                    <div className={styles.jiraSidebar}>
                      <div className={styles.sidebarHeader}>Related Tickets</div>
                      <div className={styles.sidebarResults}>
                        <div className={styles.sidebarTicket}>
                          <div className={styles.ticketId}>PROJ-982</div>
                          <div className={styles.ticketTitle}>SSO integration returns incorrect user data</div>
                        </div>
                        <div className={styles.sidebarTicket}>
                          <div className={styles.ticketId}>PROJ-721</div>
                          <div className={styles.ticketTitle}>Implement OAuth2 authentication flow</div>
                        </div>
                        <div className={styles.sidebarTicket}>
                          <div className={styles.ticketId}>PROJ-1142</div>
                          <div className={styles.ticketTitle}>Login page UI redesign</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;