(function () {
  'use strict';

  // 1. Inject MediaSession script into page MAIN World to unlock native PiP controls (-10s, +10s, timeline slider)
  function injectMainWorldMediaSession() {
    if (document._cineFloatInjected) return;
    document._cineFloatInjected = true;

    const scriptContent = `
      (function() {
        'use strict';

        function setupMediaSessionForVideo(video) {
          if (!video || video._cineFloatMediaInjected) return;
          video._cineFloatMediaInjected = true;

          function updatePositionState() {
            if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && isFinite(video.duration) && video.duration > 0) {
              try {
                navigator.mediaSession.setPositionState({
                  duration: video.duration,
                  playbackRate: video.playbackRate || 1.0,
                  position: Math.min(Math.max(video.currentTime, 0), video.duration)
                });
              } catch (e) {}
            }
          }

          function ensureActionHandlers() {
            if (!('mediaSession' in navigator)) return;

            try {
              navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skip = (details && details.seekOffset) ? details.seekOffset : 10;
                video.currentTime = Math.max(video.currentTime - skip, 0);
                updatePositionState();
              });

              navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skip = (details && details.seekOffset) ? details.seekOffset : 10;
                const maxDur = isFinite(video.duration) ? video.duration : video.currentTime + 10;
                video.currentTime = Math.min(video.currentTime + skip, maxDur);
                updatePositionState();
              });

              navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details && details.seekTime !== undefined && isFinite(details.seekTime)) {
                  video.currentTime = details.seekTime;
                  updatePositionState();
                }
              });

              navigator.mediaSession.setActionHandler('play', () => {
                video.play().catch(() => {});
              });

              navigator.mediaSession.setActionHandler('pause', () => {
                video.pause();
              });
            } catch (e) {}
          }

          const events = ['timeupdate', 'seeking', 'seeked', 'play', 'pause', 'ratechange', 'loadedmetadata', 'enterpictureinpicture'];
          events.forEach(evt => {
            video.addEventListener(evt, () => {
              ensureActionHandlers();
              updatePositionState();
            });
          });

          ensureActionHandlers();
          updatePositionState();
        }

        function scanVideos() {
          const videos = Array.from(document.querySelectorAll('video'));
          videos.forEach(v => setupMediaSessionForVideo(v));
        }

        scanVideos();
        setInterval(scanVideos, 1000);
      })();
    `;

    try {
      const script = document.createElement('script');
      script.textContent = scriptContent;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      // Catch CSP restrictions if any
    }
  }

  injectMainWorldMediaSession();

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
    } catch (e) {}
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
    btn.setAttribute('title', 'CineFloat Picture-in-Picture (Alt + P)');

    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <rect x="11" y="9" width="9" height="6" rx="1" fill="currentColor"></rect>
      </svg>
    `;

    btn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: transparent;
      border: none;
      outline: none;
      padding: 4px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7));
      transition: all 0.2s ease;
      user-select: none;
    `;

    btn.onmouseover = () => {
      btn.style.color = '#ffffff';
      btn.style.transform = 'scale(1.15)';
    };

    btn.onmouseout = () => {
      if (document.pictureInPictureElement === video) {
        btn.style.color = '#38bdf8';
      } else {
        btn.style.color = 'rgba(255, 255, 255, 0.7)';
      }
      btn.style.transform = 'scale(1)';
    };

    // 4. Toggle PiP on Button Click
    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await togglePip(video, btn);
    };

    // 5. Update Button State on Enter/Leave PiP
    const handleEnterPiP = () => {
      btn.style.color = '#38bdf8';
      btn.setAttribute('title', 'Close Picture-in-Picture (Alt + P)');
    };

    const handleLeavePiP = () => {
      btn.style.color = 'rgba(255, 255, 255, 0.7)';
      btn.setAttribute('title', 'CineFloat Picture-in-Picture (Alt + P)');
      setTimeout(async () => {
        try {
          if (video.paused) {
            await video.play();
          }
        } catch (err) {
          video.dispatchEvent(new Event('play', { bubbles: true }));
        }
      }, 150);
    };

    if (video._pipEnterHandler) {
      video.removeEventListener('enterpictureinpicture', video._pipEnterHandler);
    }
    if (video._pipLeaveHandler) {
      video.removeEventListener('leavepictureinpicture', video._pipLeaveHandler);
    }

    video._pipEnterHandler = handleEnterPiP;
    video._pipLeaveHandler = handleLeavePiP;

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    // 6. Append button to container
    container.appendChild(btn);
    video._cineFloatBtn = btn;
  }

  async function togglePip(video, btn) {
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("CineFloat PiP error:", err);
    }
  }

  // Find active video
  function getActiveVideo() {
    const videos = getAllVideos().filter(v => v.offsetWidth > 50 && v.offsetHeight > 50);
    if (!videos.length) return null;

    if (document.pictureInPictureElement) {
      return document.pictureInPictureElement;
    }

    return videos.find(v => !v.paused && v.readyState >= 1) ||
           videos.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
  }

  function scanAndInit() {
    const videos = getAllVideos();
    for (const video of videos) {
      if (video.offsetWidth > 0 && video.offsetWidth < 50) continue;
      if (video.offsetHeight > 0 && video.offsetHeight < 50) continue;

      attachPipButtonToVideo(video);
    }
  }

  // Direct keyboard shortcut listener (Alt + P)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      const video = getActiveVideo();
      if (video) {
        togglePip(video, video._cineFloatBtn);
      }
    }
  }, true);

  // Background service worker shortcut listener
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message && message.action === 'toggle-pip') {
        const video = getActiveVideo();
        if (video) {
          togglePip(video, video._cineFloatBtn);
        }
      }
    });
  }

  // Initial scan & observation
  scanAndInit();
  setInterval(scanAndInit, 1500);

  if (document.body || document.documentElement) {
    const observer = new MutationObserver(() => scanAndInit());
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();
