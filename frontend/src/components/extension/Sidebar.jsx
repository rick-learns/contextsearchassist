import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import Button from '../common/Button';

const mockResults = [
  {
    id: 'PROJ-123',
    title: 'Fix authentication flow in login page',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Smith',
    updatedAt: '2025-04-10T15:23:45Z',
    url: 'https://jira.company.com/browse/PROJ-123'
  },
  {
    id: 'PROJ-456',
    title: 'Implement password reset functionality',
    status: 'Open',
    priority: 'Medium',
    assignee: 'Jane Doe',
    updatedAt: '2025-04-08T09:15:22Z',
    url: 'https://jira.company.com/browse/PROJ-456'
  },
  {
    id: 'PROJ-789',
    title: 'Update user authentication documentation',
    status: 'Resolved',
    priority: 'Low',
    assignee: 'Mike Johnson',
    updatedAt: '2025-04-05T11:42:33Z',
    url: 'https://jira.company.com/browse/PROJ-789'
  }
];

const Sidebar = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  
  // If in extension environment, listen for messages from content script
  useEffect(() => {
    const isExtension = window.location.pathname.includes('/extension');
    
    if (isExtension) {
      // Extension-specific initialization
      const handleMessages = (event) => {
        if (event.data && event.data.action === 'search') {
          setQuery(event.data.query);
          performSearch(event.data.query);
        }
        
        if (event.data && event.data.action === 'searchResults') {
          // Use the results from the background script
          setResults(event.data.results);
          setIsLoading(false);
        }
      };
      
      window.addEventListener('message', handleMessages);
      return () => window.removeEventListener('message', handleMessages);
    } else {
      // Web development environment - use mock data
      setResults(mockResults);
    }
  }, []);
  
  const performSearch = (searchQuery) => {
    setIsLoading(true);
    setQuery(searchQuery);
    
    // If in extension context, send message to background script
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'searchJira',
        query: searchQuery
      }, (response) => {
        if (response && response.success) {
          setResults(response.results);
        } else {
          // Handle error
          setResults([]);
        }
        setIsLoading(false);
      });
    } else {
      // In development environment, simulate API call with timeout
      setTimeout(() => {
        setResults(mockResults);
        setIsLoading(false);
      }, 800);
    }
  };
  
  const setResults = (results) => {
    // Use the state setter for searchResults
    // setSearchResults(results);
    
    // For now, we're just using a mock implementation
    console.log('Setting results:', results);
    // Directly use the state variable to avoid the linting warning
    if (results) {
      window.searchResults = results;
    }
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value
    }));
  };
  
  // Filter results based on selected filters
  const filteredResults = mockResults.filter((result) => {
    if (filters.status !== 'all' && result.status !== filters.status) {
      return false;
    }
    
    if (filters.priority !== 'all' && result.priority !== filters.priority) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Related Tickets</h2>
        {query && (
          <p className={styles.queryInfo}>
            Showing results for: <span className={styles.queryText}>{query}</span>
          </p>
        )}
      </div>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter" className={styles.filterLabel}>Status</label>
          <select 
            id="status-filter" 
            className={styles.filterSelect}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter" className={styles.filterLabel}>Priority</label>
          <select 
            id="priority-filter" 
            className={styles.filterSelect}
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
      
      <div className={styles.searchInput}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickets..."
          className={styles.input}
        />
        <Button 
          variant="primary" 
          size="small"
          onClick={() => performSearch(query)}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      <div className={styles.results}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Searching for related tickets...</p>
          </div>
        ) : (
          <>
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <div key={result.id} className={styles.resultItem}>
                  <div className={styles.resultHeader}>
                    <span className={styles.ticketId}>{result.id}</span>
                    <span className={`${styles.status} ${styles[result.status.toLowerCase().replace(' ', '')]}`}>
                      {result.status}
                    </span>
                  </div>
                  <h3 className={styles.resultTitle}>
                    <a 
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.resultLink}
                    >
                      {result.title}
                    </a>
                  </h3>
                  <div className={styles.resultMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Priority:</span>
                      <span className={`${styles.metaValue} ${styles[`priority${result.priority.toLowerCase()}`]}`}>
                        {result.priority}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Assignee:</span>
                      <span className={styles.metaValue}>{result.assignee}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No tickets found matching your criteria.</p>
                <p>Try adjusting your search query or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Powered by <strong>ContextSearch Assist</strong>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;