let isListening = false;

document.getElementById("toggleBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  }, () => {
    chrome.tabs.sendMessage(tab.id, { toggle: true });
    isListening = !isListening;
    document.getElementById("toggleBtn").textContent = isListening ? "Start/Stop Listening" : "Start/Stop Listening";
  });
});
