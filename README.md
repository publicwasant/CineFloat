# CineFloat 🎬✨

**CineFloat** is a lightweight, modern browser extension (Manifest V3) designed to bring seamless **Picture-in-Picture (PiP)** functionality to **Disney+**. 

Enjoy your favorite movies and series in a floating window while multitasking, without dealing with annoying playback restrictions or missing native PiP buttons!

---

## ✨ Features

- **Automatic PiP Button Injection:** Detects active Disney+ video players and automatically adds a sleek PiP button directly onto the video player overlay.
- **Zero-Friction Toggle:** Easily enter and exit floating window mode with a single click.
- **Smart Auto-Resume:** Automatically resumes video playback when you exit PiP mode.
- **SPA & Episode Navigation Support:** Continuous polling ensures the PiP button persists even when navigating between episodes or switching pages.
- **Manifest V3:** Built on the latest secure and high-performance browser extension standard.

---

## 🚀 Installation Guide

To install **CineFloat** locally in your browser (Chrome, Edge, Brave, etc.):

1. **Clone or Download** this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/CineFloat.git
   ```
2. Open your browser and navigate to the extensions management page:
   - **Chrome / Brave / Edge:** `chrome://extensions/`
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `privatewasant-disneyplus-pip` (or `CineFloat`) folder.
6. Open [Disney+](https://www.disneyplus.com/), play any video, and click the CineFloat PiP icon in the top right of the video player!

---

## 📂 Project Structure

```text
CineFloat/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Injected script for video detection and PiP controls
├── icon16.png          # 16x16 icon (Anti-aliased)
├── icon48.png          # 48x48 icon (Anti-aliased)
├── icon128.png         # 128x128 icon (Anti-aliased)
├── generate_icons.py   # Python utility script for generating high-res PNG icons
└── README.md           # Project documentation
```

---

## 💻 Tech Stack

- **JavaScript (Vanilla ES6+)**
- **HTML5 Video & Picture-in-Picture API**
- **Chrome Extensions API (Manifest V3)**

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
