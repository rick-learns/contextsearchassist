// This script runs in the context of web pages that match our criteria

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'searchForTickets') {
    // Highlight the text on the page
    highlightTextOnPage(request.text);
    
    // Show our sidebar with search results
    showSidebar(request.text);
  }
});

// Function to highlight text on the page
function highlightTextOnPage(text) {
  // First remove any existing highlights
  clearHighlights();
  
  // Get text nodes in the body
  const bodyElement = document.body;
  
  // Recursive function to search through all text nodes
  function searchAndHighlight(node) {
    // If this is a text node
    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.textContent;
      if (content.includes(text)) {
        // Create a highlight span
        const span = document.createElement('span');
        span.className = 'contextsearch-highlight';
        span.style.backgroundColor = '#ff8c00';
        span.style.color = 'black';
        
        // Replace the text with highlighted version
        const parts = content.split(text);
        if (parts.length > 1) {
          const fragment = document.createDocumentFragment();
          
          for (let i = 0; i < parts.length; i++) {
            fragment.appendChild(document.createTextNode(parts[i]));
            
            if (i < parts.length - 1) {
              const highlightSpan = span.cloneNode();
              highlightSpan.textContent = text;
              fragment.appendChild(highlightSpan);
            }
          }
          
          // Replace the text node with our fragment
          node.parentNode.replaceChild(fragment, node);
          return true;
        }
      }
    } else {
      // For element nodes, recurse through children
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style tags
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
          return false;
        }
        
        // Check all child nodes
        const childNodes = Array.from(node.childNodes);
        for (const child of childNodes) {
          searchAndHighlight(child);
        }
      }
    }
    return false;
  }
  
  // Start searching from the body
  searchAndHighlight(bodyElement);
}

// Function to clear existing highlights
function clearHighlights() {
  const highlights = document.querySelectorAll('.contextsearch-highlight');
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    parent.normalize();
  });
}

// Function to create and show our sidebar
function showSidebar(searchQuery) {
  // Check if our sidebar iframe already exists
  let sidebarFrame = document.getElementById('contextsearch-sidebar');
  if (!sidebarFrame) {
    // Create the sidebar iframe
    sidebarFrame = document.createElement('iframe');
    sidebarFrame.id = 'contextsearch-sidebar';
    sidebarFrame.src = chrome.runtime.getURL('sidebar.html');
    sidebarFrame.style.position = 'fixed';
    sidebarFrame.style.right = '0';
    sidebarFrame.style.top = '0';
    sidebarFrame.style.width = '350px';
    sidebarFrame.style.height = '100%';
    sidebarFrame.style.zIndex = '9999';
    sidebarFrame.style.border = 'none';
    sidebarFrame.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.2)';
    
    // Add sidebar to the page
    document.body.appendChild(sidebarFrame);
    
    // Add a class to the body to indicate sidebar is open
    document.body.classList.add('contextsearch-sidebar-open');
    
    // Optional: add some padding to the body to make room for the sidebar
    document.body.style.paddingRight = '350px';
  } else {
    // If it exists but is hidden, show it
    sidebarFrame.style.display = 'block';
    document.body.classList.add('contextsearch-sidebar-open');
    document.body.style.paddingRight = '350px';
  }
  
  // Wait for the iframe to load, then send the search query
  sidebarFrame.onload = function() {
    sidebarFrame.contentWindow.postMessage({
      action: 'search',
      query: searchQuery
    }, '*');
    
    // Forward the search to our background script
    chrome.runtime.sendMessage({
      action: 'searchJira',
      query: searchQuery
    }, function(response) {
      if (response && response.success) {
        // Send results to the sidebar
        sidebarFrame.contentWindow.postMessage({
          action: 'searchResults',
          results: response.results
        }, '*');
      }
    });
  };
}

// Function to initialize on Jira pages
function initializeOnJiraPage() {
  console.log('ContextSearch Assist initialized on Jira page');
  
  // Add a close button for the sidebar
  const style = document.createElement('style');
  style.textContent = `
    .contextsearch-highlight {
      background-color: #ff8c00;
      color: black;
      border-radius: 2px;
      padding: 0 2px;
    }
    
    #contextsearch-close-button {
      position: fixed;
      top: 10px;
      right: 360px;
      width: 30px;
      height: 30px;
      background-color: #ff8c00;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    body.contextsearch-sidebar-open #contextsearch-close-button {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  
  const closeButton = document.createElement('button');
  closeButton.id = 'contextsearch-close-button';
  closeButton.innerHTML = '✕';
  closeButton.title = 'Close ContextSearch sidebar';
  closeButton.onclick = function() {
    const sidebar = document.getElementById('contextsearch-sidebar');
    if (sidebar) {
      sidebar.style.display = 'none';
      document.body.classList.remove('contextsearch-sidebar-open');
      document.body.style.paddingRight = '0';
    }
  };
  document.body.appendChild(closeButton);
}

// Run our initialization
initializeOnJiraPage();