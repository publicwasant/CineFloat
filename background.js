// CineFloat Background Service Worker (Manifest V3)

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-pip') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle-pip' }).catch(() => {
          // Ignore tabs where content script is not loaded
        });
      }
    });
  }
});
