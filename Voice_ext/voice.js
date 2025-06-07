const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
recognition.start();

recognition.onresult = function (event) {
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      const command = event.results[i][0].transcript.trim().toLowerCase();
      console.log("Recognized command:", command);
      chrome.runtime.sendMessage({ command: command });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const closeLink = document.getElementById('closeTabLink');
  if (closeLink) {
    closeLink.addEventListener('click', () => {
      console.log("Close tab link clicked.");
      chrome.runtime.sendMessage({ action: 'close_self_tab' });
    });
  }
});

recognition.onend = () => recognition.start();
