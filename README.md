# Accessibility Suite – Extension & website!

## Overview

This project provides a **dual-solution accessibility platform** designed to make the web more inclusive and user-friendly for individuals with disabilities such as dyslexia, vision impairment, blindness, and motor limitations.

It consists of:

1. **ReadEase_ext** – A **Chrome Extension** for real-time voice-based navigation and web accessibility.
2. **ReadEase website** – A **web-based toolkit** offering assistive AI-powered features for content consumption and understanding.

---
## Getting Started

### Chrome Extension:
1. Download the extension from - https://drive.google.com/uc?export=download&id=1T07Qo02ct654bOWOGK_r2ApDz0U3ulyZ
2. Unzip the folder.
3. Go to `chrome://extensions` and enable **Developer Mode**.
4. Click **Load Unpacked** and select the `ReadEase_ext` folder.
5. Pin the Extension for easy use

### Eye Control:
1. install dependencies using `pip install opencv-python mediapipe pyautogui SpeechRecognition pyaudio pipwin` in cmd
2. download the python script from: https://drive.google.com/uc?export=download&id=18CzaoW-MCZ_EWHI_jtxi5zcj-jSRKI83
3. run the file, Say start to start eye tracking.

### Web Platform is deployed at: https://read-ease-pro.vercel.app/
---

## Chrome Extension

### Features:
-  **Voice Navigation** – Control tabs, scroll, click links, and interact with pages using voice commands.
- **Speech to Text** – Voice typing for input fields.
- **Text to Speech on Hover** – Reads out content under the cursor.
- **Accessibility Toggles** – Enable dyslexia-friendly font, dark mode, and high contrast.
- **AI Assistant** – Ask questions or summarize current web pages using LLM integration (LLaMA3-70B).

---
## Eye Control

### Features:
- Eye-controlled mouse movement
- Detects blinks using facial landmarks and triggers a left mouse click.
- "start" → Activates eye control, "stop" → Deactivates eye control
- Real-time camera feedback

---

## Website

### Features:
-  **PDF Reader** – Extract and read content from uploaded PDF documents.
-  **Image to Text (OCR)** – Recognize and extract text from image files.
-  **Spell Checker** – Detect and correct spelling errors in typed text.
-  **Text to Speech** – Convert text into natural-sounding speech.
-  **Video Summarization** – Generate AI summaries of uploaded video content.

