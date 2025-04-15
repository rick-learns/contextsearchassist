import React, { useState } from 'react';
import styles from './BrowserAction.module.css';
import Logo from '../common/Logo';
import Button from '../common/Button';

const BrowserAction = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jiraUrl, setJiraUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!jiraUrl || !username || !apiKey) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setJiraUrl('');
    setUsername('');
    setApiKey('');
  };

  return (
    <div className={styles.browserAction}>
      <div className={styles.header}>
        <Logo size="small" />
        {isLoggedIn && (
          <button className={styles.logoutButton} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        )}
      </div>
      
      <div className={styles.content}>
        {!isLoggedIn ? (
          <div className={styles.loginForm}>
            <h2 className={styles.title}>Connect to Jira</h2>
            <p className={styles.description}>
              To use ContextSearch Assist, please connect to your Jira instance.
            </p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label htmlFor="jiraUrl" className={styles.label}>Jira URL</label>
                <input
                  id="jiraUrl"
                  type="text"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://your-domain.atlassian.net"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>Email</label>
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                  placeholder="your.email@company.com"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="apiKey" className={styles.label}>API Token</label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={styles.input}
                  placeholder="Your Jira API token"
                />
                <a 
                  href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.helpLink}
                >
                  How to get an API token?
                </a>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect'}
              </Button>
            </form>
          </div>
        ) : (
          <div className={styles.dashboard}>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18456 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.statusInfo}>
                <h3 className={styles.statusTitle}>Connected to Jira</h3>
                <p className={styles.statusText}>{jiraUrl}</p>
              </div>
            </div>
            
            <div className={styles.instructions}>
              <h3 className={styles.instructionsTitle}>How to use</h3>
              <ol className={styles.instructionsList}>
                <li>Navigate to any Jira ticket</li>
                <li>Select text in the ticket</li>
                <li>Right-click and select "Find Related Tickets"</li>
                <li>View results in the sidebar</li>
              </ol>
            </div>
            
            <div className={styles.settings}>
              <h3 className={styles.settingsTitle}>Settings</h3>
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>Auto-search on text selection</div>
                <div className={styles.toggle}>
                  <input type="checkbox" id="autoSearch" className={styles.toggleInput} />
                  <label htmlFor="autoSearch" className={styles.toggleLabel}></label>
                </div>
              </div>
              
              <div className={styles.settingItem}>
                <div className={styles.settingLabel}>Maximum results to show</div>
                <select className={styles.settingSelect}>
                  <option value="5">5 results</option>
                  <option value="10" selected>10 results</option>
                  <option value="20">20 results</option>
                  <option value="50">50 results</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          ContextSearch Assist v1.0.0
        </p>
        <a href="https://contextsearch-assist.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          Help
        </a>
      </div>
    </div>
  );
};

export default BrowserAction;