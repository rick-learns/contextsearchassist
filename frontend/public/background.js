// This file runs in the background of the browser extension

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('ContextSearch Assist extension installed');
  
  // Create a context menu item that appears when text is selected
  chrome.contextMenus.create({
    id: 'findRelatedTickets',
    title: 'Find Related Tickets',
    contexts: ['selection']
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'findRelatedTickets' && info.selectionText) {
    // Send the selected text to our content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'searchForTickets',
      text: info.selectionText
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'searchJira') {
    // This would make an API call to our backend service
    // For now, we'll just simulate a response
    console.log('Searching Jira for:', request.query);
    
    // Simulate API call delay
    setTimeout(() => {
      sendResponse({
        success: true,
        results: [
          {
            id: 'JIRA-1234',
            title: 'Fix login page authentication flow',
            status: 'In Progress',
            priority: 'High',
            assignee: 'John Smith',
            relevanceScore: 0.95,
            type: 'Bug',
            lastUpdated: '2023-04-10'
          },
          {
            id: 'JIRA-982',
            title: 'Users are unable to reset their password through the login page',
            status: 'Open',
            priority: 'Critical',
            assignee: 'Sarah Johnson',
            relevanceScore: 0.87,
            type: 'Bug',
            lastUpdated: '2023-04-08'
          },
          {
            id: 'JIRA-721',
            title: 'Implement OAuth2 authentication for the login system',
            status: 'Done',
            priority: 'Medium',
            assignee: 'Alex Chen',
            relevanceScore: 0.78,
            type: 'Task',
            lastUpdated: '2023-03-28'
          }
        ]
      });
    }, 500);
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Check if we're on a Jira page
function isJiraPage(url) {
  return url.includes('atlassian.net') || 
         url.includes('jira.') ||
         url.includes('/jira/');
}

// Execute our content script when navigating to Jira
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && isJiraPage(tab.url)) {
    chrome.tabs.executeScript(tabId, { file: 'content.js' });
  }
});