chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const command = message.command;
  if (!command) return;

  console.log("Received command:", command);
  const lower = command.toLowerCase().trim();

  // --- Tab Commands ---
  if (lower.startsWith("new tab")) {
    chrome.tabs.create({});
  } else if (lower.startsWith("close tab")) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.remove(tabs[0].id);
    });
  } else if (lower.startsWith("reload tab") || lower === "reload") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.reload(tabs[0].id);
    });
  } else if (lower.startsWith("next tab")) {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
        let activeIndex = activeTabs[0].index;
        let nextIndex = (activeIndex + 1) % tabs.length;
        chrome.tabs.update(tabs[nextIndex].id, { active: true });
      });
    });
  } else if (lower.startsWith("previous tab") || lower.startsWith("prev tab")) {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
        let activeIndex = activeTabs[0].index;
        let prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        chrome.tabs.update(tabs[prevIndex].id, { active: true });
      });
    });
  } else if (lower.startsWith("go to tab") || lower.startsWith("tab")) {
    let tabNum = parseInt(lower.replace(/[^\d]/g, ""));
    if (!isNaN(tabNum)) {
      chrome.tabs.query({ currentWindow: true }, tabs => {
        if (tabNum > 0 && tabNum <= tabs.length) {
          chrome.tabs.update(tabs[tabNum - 1].id, { active: true });
        }
      });
    }
  } 

  // --- Navigation Commands ---
  else if (lower === "back" || lower === "go back") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => history.back()
      });
    });
  } else if (lower === "forward" || lower === "go forward") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => history.forward()
      });
    });
  }else if (lower.startsWith("go to ")) {
  let spoken = lower.replace("go to ", "").trim();

  // Optional: convert "dot" to "."
  spoken = spoken.replace(/\s+dot\s+/g, '.');

  // Remove all spaces (whether in domain name or before/after .com etc.)
  let domain = spoken.replace(/\s+/g, '');

  // Add .com if there's no dot at all
  if (!domain.includes('.')) {
    domain += '.com';
  }

  // Prepend https:// if not already present
  let url = domain.startsWith("http") ? domain : "https://" + domain;

  console.log("Navigating to:", url);  // For debugging

  chrome.tabs.update({ url });
}


  // --- Chrome Pages ---
  else if (lower === "extensions") {
    chrome.tabs.update({ url: "chrome://extensions" });
  } else if (lower === "history") {
    chrome.tabs.update({ url: "chrome://history" });
  } else if (lower === "downloads") {
    chrome.tabs.update({ url: "chrome://downloads" });
  }

  // --- Scrolling ---
  else if (lower === "scroll down") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.scrollBy(0, 400)
      });
    });
  } else if (lower === "scroll up") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.scrollBy(0, -400)
      });
    });
  }

  // --- Google Search ---
  else if (lower.startsWith("google ")) {
    const query = encodeURIComponent(lower.replace("google", "").trim());
    chrome.tabs.create({ url: `https://www.google.com/search?q=${query}` });
  }

  // --- Form Input & Submit ---
  else if (lower.startsWith("input ") || lower.startsWith("search ")) {
    const text = lower.replace(/^(input|search)/, "").trim();
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: value => {
          const input = document.querySelector("input[type='text'], input[type='search']");
          if (input) input.value = value;
        },
        args: [text]
      });
    });
  } else if (["submit", "search", "enter"].includes(lower)) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const form = document.querySelector("form");
          if (form) form.submit();
        }
      });
    });
  }

  // --- Media ---
  else if (lower === "play video") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const video = document.querySelector("video");
          if (video) video.play();
        }
      });
    });
  }

  // --- Close Chrome Window ---
  else if (lower === "close chrome") {
    chrome.windows.getCurrent(window => {
      chrome.windows.remove(window.id);
    });
  }

  // --- Stop Listening (Close Mic Tab) ---
  else if (lower === "stop listening") {
    chrome.tabs.query({ pinned: true }, tabs => {
      const micTab = tabs.find(tab =>
        tab.url.includes("voice.html")
      );
      if (micTab) chrome.tabs.remove(micTab.id);
    });
  }
 if (command.startsWith("chrome")) {
      const question = command.replace("chrome", "").trim();
      console.log("Parsed Groq question:", question);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs.length) {
          console.error("No active tab found.");
          return;
        }

        const tabId = tabs[0].id;
        console.log("Tab received:", tabs[0]);

        chrome.scripting.executeScript({
          target: { tabId },
          func: async (question) => {
            console.log("Injected Groq script running...");
            const pageContent = document.body.innerText.slice(0, 10000);
            console.log("Page content preview:", pageContent.slice(0, 200));

            try {
              const apiKey = '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';  // 🔑 Replace with your key
              const url = 'https://api.groq.com/openai/v1/chat/completions';

              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: "llama3-70b-8192",
                  messages: [
                    {
                      role: "system",
                      content: "You are a helpful assistant."
                    },
                    {
                      role: "user",
                      content: `Answer the question: "${question}" based only on this page content:\n\n${pageContent}`
                    }
                  ]
                })
              });

              const data = await response.json();
              console.log("Groq response:", data);

              const text = data.choices?.[0]?.message?.content || "No response from Groq.";

              // ✅ Speak it immediately
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'en-US';
              utterance.rate = 1.2;
              speechSynthesis.speak(utterance);

              // Optional: show alert *after* speaking
              setTimeout(() => {
                alert(text);
              }, 100); // Show alert slightly after TTS starts

            } catch (e) {
              console.error("Groq error:", e);
              alert("Groq API error: " + e.message);
            }
          },
          args: [question]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
          }
        });
      });
    }



});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'close_self_tab') {
    console.log("Close tab request received:", sender);
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    } else {
      // fallback if sender.tab is undefined
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) chrome.tabs.remove(tabs[0].id);
      });
    }
  }
});
