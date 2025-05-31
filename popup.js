document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const skipButton = document.getElementById('skipButton');
  const stopButton = document.getElementById('stopButton');

  startButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, { action: "startWatching" });
    });
  });

  skipButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "SkipVideo" });
  });

  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "StopWatching" });
  });
});