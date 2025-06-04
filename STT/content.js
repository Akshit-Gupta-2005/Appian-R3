let recognition;
let isListening = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.toggle) {
    if (!isListening) {
      startRecognition();
    } else {
      stopRecognition();
    }
  }
});

function startRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    const spokenText = event.results[event.results.length - 1][0].transcript;
    const active = document.activeElement;
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
      active.value += spokenText;
    }
  };

  recognition.onerror = function (e) {
    console.error("Recognition error:", e.error);
  };

  recognition.onend = function () {
    if (isListening) recognition.start(); // restart if still in listening mode
  };

  recognition.start();
  isListening = true;
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  isListening = false;
}
