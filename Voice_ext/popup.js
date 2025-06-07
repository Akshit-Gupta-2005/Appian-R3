document.addEventListener('DOMContentLoaded', function () {
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

  recognition.onend = () => recognition.start();

  // ✅ Use only this one version to avoid double-tab issue
  document.getElementById('enableInputButton').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default navigation
    e.stopPropagation(); // Stop event from bubbling

    const voiceUrl = chrome.runtime.getURL('voice.html');

    // Optional: prevent duplicate tabs
    chrome.tabs.query({}, function (tabs) {
      const existing = tabs.find(t => t.url === voiceUrl);
      if (existing) {
        chrome.tabs.update(existing.id, { active: true });
      } else {
        chrome.tabs.create({
          url: voiceUrl,
          pinned: true
        });
      }
    });
  });

  document.getElementById('link-close')?.addEventListener('click', function () {
    window.close();
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const toggleSpeechBtn = document.getElementById("toggleSpeech");
  const toggleDyslexiaBtn = document.getElementById("toggleDyslexia");
  const toggleHoverReaderBtn = document.getElementById("toggleHoverReader");
  const contrastSelect = document.getElementById("contrastMode");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const origin = new URL(tab.url).origin;

  const keys = [`${origin}_isListening`, `${origin}_isDyslexiaEnabled`, `${origin}_hoverReaderEnabled`, `${origin}_contrastMode`];
  chrome.storage.local.get(keys, (result) => {
    toggleSpeechBtn.textContent = result[`${origin}_isListening`] ? "Stop Listening" : "Start Listening";
    toggleDyslexiaBtn.textContent = result[`${origin}_isDyslexiaEnabled`] ? "Remove Dyslexia Mode" : "Dyslexia Mode";
    toggleHoverReaderBtn.textContent = result[`${origin}_hoverReaderEnabled`] ? "Disable Hover Reader" : "Hover Reader";
    contrastSelect.value = result[`${origin}_contrastMode`] || "off";
  });

  toggleSpeechBtn.addEventListener("click", async () => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (!window.__speechRecognizer) {
          window.__speechRecognizer = {
            isListening: false,
            recognition: null,
            toggle() {
              if (!this.isListening) {
                this.recognition = new webkitSpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.lang = "en-US";
                this.recognition.onresult = (event) => {
                  const spokenText = event.results[event.results.length - 1][0].transcript;
                  const active = document.activeElement;
                  if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
                    active.value += spokenText;
                  }
                };
                this.recognition.onerror = (e) => console.error("Speech recognition error:", e.error);
                this.recognition.onend = () => { if (this.isListening) this.recognition.start(); };
                this.recognition.start();
                this.isListening = true;
              } else {
                this.recognition.stop();
                this.recognition = null;
                this.isListening = false;
              }
            }
          };
        }
        window.__speechRecognizer.toggle();
      }
    });

    const key = `${origin}_isListening`;
    const current = (await chrome.storage.local.get(key))[key];
    const newState = !current;
    chrome.storage.local.set({ [key]: newState });
    toggleSpeechBtn.textContent = newState ? "Stop Listening" : "Start Listening";
  });

  toggleDyslexiaBtn.addEventListener("click", async () => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const styleId = "__dyslexia_style_local";
        if (document.getElementById(styleId)) {
          document.getElementById(styleId).remove();
          return;
        }

        const style = document.createElement("style");
        style.id = styleId;

        const getFontUrl = (fileName) => chrome.runtime.getURL("fonts/" + fileName);

        style.textContent = `
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('${getFontUrl("OpenDyslexic-Regular.ttf")}') format('truetype');
            font-weight: normal;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('${getFontUrl("OpenDyslexic-Bold.ttf")}') format('truetype');
            font-weight: bold;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('${getFontUrl("OpenDyslexic-Italic.ttf")}') format('truetype');
            font-style: italic;
          }
          @font-face {
            font-family: 'OpenDyslexic';
            src: url('${getFontUrl("OpenDyslexic-BoldItalic.ttf")}') format('truetype');
            font-style: italic;
            font-weight: bold;
          }
          html, body, p, div, span, a, li, td, input, textarea, button, h1, h2, h3, h4, h5, h6 {
            font-family: 'OpenDyslexic', sans-serif !important;
            line-height: 1.6 !important;
            letter-spacing: 0.05em !important;
          }
        `;
        document.head.appendChild(style);
      }
    });

    const key = `${origin}_isDyslexiaEnabled`;
    const current = (await chrome.storage.local.get(key))[key];
    const newState = !current;
    chrome.storage.local.set({ [key]: newState });
    toggleDyslexiaBtn.textContent = newState ? "Remove Dyslexia Mode" : "Dyslexia Mode";
  });

  toggleHoverReaderBtn.addEventListener("click", async () => {
    const key = `${origin}_hoverReaderEnabled`;
    const current = (await chrome.storage.local.get(key))[key];
    const newState = !current;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (enabled) => {
        const listenerId = "__tts_hover_listener__";
        if (!enabled) {
          if (window[listenerId]) {
            document.removeEventListener("mouseover", window[listenerId]);
            delete window[listenerId];
          }
          if (window.speechSynthesis) speechSynthesis.cancel();
          return;
        }

        const hoverHandler = (e) => {
          const el = e.target;
          const text = el?.innerText || el?.value || "";
          const cleanText = text.trim();
          if (cleanText.length < 3) return;
          if (speechSynthesis.speaking) speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "en-US";
          speechSynthesis.speak(utterance);
        };

        window[listenerId] = hoverHandler;
        document.addEventListener("mouseover", hoverHandler);
      },
      args: [newState]
    });

    chrome.storage.local.set({ [key]: newState });
    toggleHoverReaderBtn.textContent = newState ? "Disable Hover Reader" : "Hover Reader";
  });

  contrastSelect.addEventListener("change", async (e) => {
    const selectedMode = e.target.value;
    const key = `${origin}_contrastMode`;
    chrome.storage.local.set({ [key]: selectedMode });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (mode) => {
        const styleId = "__contrast_style_local";
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
        if (mode === "off") return;

        const style = document.createElement("style");
        style.id = styleId;
        let textColor = "#FFFFFF";
        if (mode === "yellowOnBlack") textColor = "#FFFF00";

        style.textContent = `
          html, body {
            background-color: #000 !important;
            color: ${textColor} !important;
          }
          p, div, span, a, li, td, h1, h2, h3, h4, h5, h6, label {
            background-color: transparent !important;
            color: ${textColor} !important;
          }
          input[type="text"], input[type="search"], textarea {
            background-color: #222 !important;
            color: ${textColor} !important;
            border: 1px solid ${textColor} !important;
          }
          input[type="checkbox"], input[type="radio"] {
            filter: invert(100%);
          }
          ::placeholder {
            color: ${textColor}99 !important;
          }
          button, select {
            background-color: #222 !important;
            color: ${textColor} !important;
            border: 1px solid ${textColor} !important;
          }
          *:focus {
            outline: 2px solid ${textColor}AA !important;
          }
        `;
        document.head.appendChild(style);
      },
      args: [selectedMode]
    });
  });
});

