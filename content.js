(function () {
  'use strict';

  // Helper to recursively collect all <video> elements, including inside Shadow DOMs
  function getAllVideos(root = document) {
    let videos = [];
    try {
      videos = Array.from(root.querySelectorAll('video'));

      const allElements = root.querySelectorAll('*');
      for (const el of allElements) {
        if (el.shadowRoot) {
          videos = videos.concat(getAllVideos(el.shadowRoot));
        }
      }
    } catch (e) {
      // Catch cross-origin / root access restrictions if any
    }
    return videos;
  }

  function attachPipButtonToVideo(video) {
    if (!video) return;

    // 1. Unlock PiP block
    video.removeAttribute('disablepictureinpicture');
    video.disablePictureInPicture = false;

    // Check if button is already attached and present in DOM
    if (video._cineFloatBtn && document.contains(video._cineFloatBtn)) {
      return;
    }

    // 2. Identify Video Container
    let container = video.parentElement;
    if (!container) {
      const rootNode = video.getRootNode();
      if (rootNode && rootNode.host) {
        container = rootNode.host;
      } else {
        container = document.body;
      }
    }

    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // 3. Create PiP Button
    const btn = document.createElement('button');
    btn.className = 'cinefloat-pip-btn';
    btn.setAttribute('aria-label', 'Picture-in-Picture');
    btn.setAttribute('title', 'CineFloat Picture-in-Picture');

    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <rect x="11" y="9" width="9" height="6" rx="1" fill="currentColor" fill-opacity="0.5"></rect>
      </svg>
    `;

    btn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 8px;
      outline: none;
      padding: 6px;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      transition: all 0.2s ease;
      user-select: none;
    `;

    btn.onmouseover = () => {
      btn.style.color = '#ffffff';
      btn.style.background = 'rgba(0, 0, 0, 0.75)';
      btn.style.transform = 'scale(1.1)';
    };

    btn.onmouseout = () => {
      btn.style.color = 'rgba(255, 255, 255, 0.85)';
      btn.style.background = 'rgba(0, 0, 0, 0.45)';
      btn.style.transform = 'scale(1)';
    };

    // 4. Toggle PiP
    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        if (document.pictureInPictureElement === video) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
          btn.style.display = 'none';
        }
      } catch (err) {
        console.error("CineFloat PiP error:", err);
      }
    };

    // 5. Restore button and safely auto-resume on leaving PiP
    const handleLeavePiP = () => {
      btn.style.display = 'flex';
      setTimeout(async () => {
        try {
          if (video.paused) {
            await video.play();
          }
        } catch (err) {
          // Fallback event dispatch if standard play fails
          video.dispatchEvent(new Event('play', { bubbles: true }));
        }
      }, 150);
    };

    if (video._pipHandler) {
      video.removeEventListener('leavepictureinpicture', video._pipHandler);
    }
    video._pipHandler = handleLeavePiP;
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    // 6. Append button to container
    container.appendChild(btn);
    video._cineFloatBtn = btn;
  }

  function scanAndInit() {
    const videos = getAllVideos();
    for (const video of videos) {
      // Ignore tiny icons or non-video preview elements (< 50px)
      if (video.offsetWidth > 0 && video.offsetWidth < 50) continue;
      if (video.offsetHeight > 0 && video.offsetHeight < 50) continue;

      attachPipButtonToVideo(video);
    }
  }

  // Initial scan
  scanAndInit();

  // Periodic polling for dynamic SPA pages (YouTube, Disney+, Netflix, etc.)
  setInterval(scanAndInit, 1500);

  // Observe DOM additions for fast response
  if (document.body || document.documentElement) {
    const observer = new MutationObserver(() => scanAndInit());
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();
