/**
 * @file content.js
 * @description CineFloat Extension Content Script
 * 
 * สคริปต์หลักสำหรับทำงานบนหน้าเว็บสตรีมมิ่ง (เช่น YouTube, Disney+):
 * 1. ปลดล็อกและเปิดใช้งาน Picture-in-Picture (PiP) พร้อมปุ่มลอยควบคุม
 * 2. ฉีด (Inject) สคริปต์เข้า Main World เพื่อเปิดใช้งาน Native MediaSession Controls (-10s, +10s, Timeline Slider ในหน้าต่าง PiP)
 * 3. สแกนหาวิดีโอแบบทะลุผ่าน Shadow DOM
 * 4. ระบบกดข้ามโฆษณาอัตโนมัติ (Auto Skip Ad) สำหรับ YouTube
 * 
 * @author CineFloat Team
 * @version 1.1.0
 */

(function () {
  'use strict';

  /**
   * ฉีดสคริปต์เข้าไปยัง Main World (DOM Context หลักของหน้าเว็บ)
   * เพื่อตั้งค่า `navigator.mediaSession` ให้กับองค์ประกอบ `<video>`
   * ช่วยให้หน้าต่าง Picture-in-Picture ของ Chrome มีปุ่มกดย้อนหลัง/ข้าม และแถบ Timeline
   * 
   * @function injectMainWorldMediaSession
   * @returns {void}
   */
  function injectMainWorldMediaSession() {
    if (document._cineFloatInjected) return;
    document._cineFloatInjected = true;

    const scriptContent = `
      (function() {
        'use strict';

        /**
         * ตั้งค่า Event Handlers และ Position State ของ MediaSession ให้กับวิดีโอ
         * @param {HTMLVideoElement} video - Element วิดีโอที่ต้องการติดตั้ง MediaSession
         */
        function setupMediaSessionForVideo(video) {
          if (!video || video._cineFloatMediaInjected) return;
          video._cineFloatMediaInjected = true;

          /**
           * อัปเดตตำแหน่ง Timeline และระยะเวลาของวิดีโอไปยัง MediaSession
           */
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

          /**
           * ลงทะเบียน Action Handlers สำหรับปุ่มควบคุมในหน้าต่าง PiP (Play, Pause, Seek)
           */
          function ensureActionHandlers() {
            if (!('mediaSession' in navigator)) return;

            try {
              // ปุ่มย้อนหลัง (Default: -10 วินาที)
              navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skip = (details && details.seekOffset) ? details.seekOffset : 10;
                video.currentTime = Math.max(video.currentTime - skip, 0);
                updatePositionState();
              });

              // ปุ่มข้ามไปข้างหน้า (Default: +10 วินาที)
              navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skip = (details && details.seekOffset) ? details.seekOffset : 10;
                const maxDur = isFinite(video.duration) ? video.duration : video.currentTime + 10;
                video.currentTime = Math.min(video.currentTime + skip, maxDur);
                updatePositionState();
              });

              // แถบเลื่อนเวลา (Timeline Slider)
              navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details && details.seekTime !== undefined && isFinite(details.seekTime)) {
                  video.currentTime = details.seekTime;
                  updatePositionState();
                }
              });

              // ปุ่มเล่นวิดีโอ
              navigator.mediaSession.setActionHandler('play', () => {
                video.play().catch(() => {});
              });

              // ปุ่มหยุดวิดีโอชั่วคราว
              navigator.mediaSession.setActionHandler('pause', () => {
                video.pause();
              });
            } catch (e) {}
          }

          // คอยตรวจจับ Event ต่างๆ ของวิดีโอเพื่ออัปเดต MediaSession
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

        /**
         * สแกนหาวิดีโอทั้งหมดใน DOM เพื่อติดตั้ง MediaSession
         */
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
      // ป้องกันข้อผิดพลาดกรณีติด Content Security Policy (CSP) ของบางเว็บ
    }
  }

  // เรียกใช้งานการฉีดสคริปต์ MediaSession เข้า Main World
  injectMainWorldMediaSession();

  /**
   * ระบบกดข้ามโฆษณาอัตโนมัติบน YouTube (YouTube Auto Skip Ad)
   * ตรวจสอบเฉพาะหน้าเว็บ youtube.com และจะทำการคลิกปุ่ม Skip Ad ทันทีที่ปรากฏ
   * กรณีโฆษณาบังคับดู จะทำการปิดเสียงและเร่งความเร็ววิดีโอโฆษณาเป็น 16x
   * 
   * @function initYouTubeAutoSkip
   * @returns {void}
   */
  function initYouTubeAutoSkip() {
    if (!window.location.hostname.includes('youtube.com')) return;

    /**
     * ฟังก์ชันตรวจสอบและกดข้ามโฆษณา
     */
    const skipAd = () => {
      // รายชื่อ Selector ของปุ่ม Skip Ad ทั้งดีไซน์เก่าและใหม่ รวมถึงปุ่มปิดป้ายโฆษณา
      const skipBtnSelectors = [
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button-slot',
        '.ytp-ad-skip-button-container button',
        '.ytp-ad-overlay-close-button'
      ];

      // 1. ตรวจหาและคลิกปุ่ม Skip Ad
      for (const selector of skipBtnSelectors) {
        const btn = document.querySelector(selector);
        if (btn) {
          btn.click();
          console.log('[CineFloat] Auto-skipped YouTube Ad');
          break;
        }
      }

      // 2. จัดการกรณีโฆษณาที่ยังไม่มีปุ่มข้าม (Unskippable Ads)
      const isAdShowing = document.querySelector('.ad-showing, .ad-interrupting');
      if (isAdShowing) {
        const adVideo = document.querySelector('video');
        if (adVideo && !adVideo.muted) {
          adVideo.muted = true; // ปิดเสียงโฆษณา
        }
        if (adVideo && isFinite(adVideo.duration)) {
          adVideo.playbackRate = 16.0; // เร่งสปีด 16 เท่า
          adVideo.currentTime = adVideo.duration - 0.1; // ข้ามไปวิสุดท้าย
        }
      }
    };

    // รันการตรวจสอบโฆษณาเป็นประจำทุกๆ 500 มิลลิวินาที
    setInterval(skipAd, 500);
  }

  // เรียกใช้งานระบบ Auto Skip Ad
  initYouTubeAutoSkip();

  /**
   * ค้นหา Element `<video>` ทั้งหมดบนหน้าเว็บอย่างละเอียด
   * โดยรองรับการค้นหาแบบ Recursive เข้าไปใน Shadow DOM Tree
   * 
   * @function getAllVideos
   * @param {Document|ShadowRoot|Element} [root=document] - โหนดเริ่มต้นที่ใช้ในการค้นหา
   * @returns {HTMLVideoElement[]} อาร์เรย์ของ Element `<video>` ทั้งหมดที่พบ
   */
  function getAllVideos(root = document) {
    let videos = [];
    try {
      videos = Array.from(root.querySelectorAll('video'));

      // สแกนหา Element ที่มี Shadow Root และทำการค้นหาแบบสังฆทานเข้าไปข้างใน
      const allElements = root.querySelectorAll('*');
      for (const el of allElements) {
        if (el.shadowRoot) {
          videos = videos.concat(getAllVideos(el.shadowRoot));
        }
      }
    } catch (e) {}
    return videos;
  }

  /**
   * สร้างและผูกปุ่มลอย CineFloat PiP เข้ากับ Element วิดีโอ
   * รวมถึงปลดล็อก Attribute `disablepictureinpicture` บนตัววิดีโอ
   * 
   * @function attachPipButtonToVideo
   * @param {HTMLVideoElement} video - Element วิดีโอที่ต้องการติดตั้งปุ่ม PiP
   * @returns {void}
   */
  function attachPipButtonToVideo(video) {
    if (!video) return;

    // 1. ปลดล็อกข้อจำกัด PiP บนวิดีโอ
    video.removeAttribute('disablepictureinpicture');
    video.disablePictureInPicture = false;

    // ตรวจสอบว่าปุ่ม PiP ถูกติดตั้งไปแล้วและยังคงอยู่ใน DOM หรือไม่
    if (video._cineFloatBtn && document.contains(video._cineFloatBtn)) {
      return;
    }

    // 2. ระบุ Container ของวิดีโอสำหรับวางปุ่มลอย
    let container = video.parentElement;
    if (!container) {
      const rootNode = video.getRootNode();
      if (rootNode && rootNode.host) {
        container = rootNode.host;
      } else {
        container = document.body;
      }
    }

    // กำหนด position ให้ container ป้องกันไม่ให้ปุ่มลอยหลุดตำแหน่ง
    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // 3. สร้างและตั้งค่าปุ่ม PiP (DOM Element)
    const btn = document.createElement('button');
    btn.className = 'cinefloat-pip-btn';
    btn.setAttribute('aria-label', 'Picture-in-Picture');
    btn.setAttribute('title', 'CineFloat Picture-in-Picture (Alt + P)');

    // ไอคอน SVG รูปหน้าต่างลอย
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <rect x="11" y="9" width="9" height="6" rx="1" fill="currentColor"></rect>
      </svg>
    `;

    // สไตล์ของปุ่มลอย (วางไว้มุมขวาบนของวิดีโอ z-index สูงสุด)
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

    // Effect เมื่อนำเมาส์มาวางบนปุ่ม (Hover Effect)
    btn.onmouseover = () => {
      btn.style.color = '#ffffff';
      btn.style.transform = 'scale(1.15)';
    };

    btn.onmouseout = () => {
      if (document.pictureInPictureElement === video) {
        btn.style.color = '#38bdf8'; // สีฟ้าเมื่อกำลังเปิดใช้งาน PiP อยู่
      } else {
        btn.style.color = 'rgba(255, 255, 255, 0.7)';
      }
      btn.style.transform = 'scale(1)';
    };

    // 4. สลับสถานะ PiP เมื่อคลิกปุ่ม
    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await togglePip(video, btn);
    };

    // 5. อัปเดตสถานะของปุ่มตาม Event เข้า/ออกจาก PiP
    const handleEnterPiP = () => {
      btn.style.color = '#38bdf8';
      btn.setAttribute('title', 'Close Picture-in-Picture (Alt + P)');
    };

    const handleLeavePiP = () => {
      btn.style.color = 'rgba(255, 255, 255, 0.7)';
      btn.setAttribute('title', 'CineFloat Picture-in-Picture (Alt + P)');
      // ป้องกันวิดีโอหยุดเล่นเองเมื่อออกจาก PiP
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

    // ลบ Listener เก่าป้องกันการซ้ำซ้อน
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

    // 6. แปะปุ่มลงใน Container ของวิดีโอ
    container.appendChild(btn);
    video._cineFloatBtn = btn;
  }

  /**
   * สลับการทำงานโหมด Picture-in-Picture (เปิด <-> ปิด)
   * 
   * @async
   * @function togglePip
   * @param {HTMLVideoElement} video - Element วิดีโอที่ต้องการสลับโหมด PiP
   * @param {HTMLButtonElement} [btn] - ปุ่มควบคุม (สำหรับอัปเดตสไตล์ถ้าจำเป็น)
   * @returns {Promise<void>}
   */
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

  /**
   * ค้นหาวิดีโอที่กำลังเปิดเล่นอยู่บนหน้าเว็บหลัก
   * โดยคัดเลือกจากขนาดของ Element และสถานะการเล่นวิดีโอ
   * 
   * @function getActiveVideo
   * @returns {HTMLVideoElement|null} Element วิดีโอที่แอ็กทีฟอยู่ หรือ null หากไม่พบ
   */
  function getActiveVideo() {
    const videos = getAllVideos().filter(v => v.offsetWidth > 50 && v.offsetHeight > 50);
    if (!videos.length) return null;

    // ถ้ามีวิดีโอเปิดอยู่ในโหมด PiP ให้ส่งคืนวิดีโอนั้นก่อน
    if (document.pictureInPictureElement) {
      return document.pictureInPictureElement;
    }

    // เลือกวิดีโอที่ไม่ได้ Pause หรือเลือกวิดีโอที่มีขนาดพื้นที่ใหญ่ที่สุด
    return videos.find(v => !v.paused && v.readyState >= 1) ||
           videos.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
  }

  /**
   * สแกนหา Element วิดีโอในหน้าเว็บ และทำการติดตั้งปุ่ม CineFloat PiP
   * 
   * @function scanAndInit
   * @returns {void}
   */
  function scanAndInit() {
    const videos = getAllVideos();
    for (const video of videos) {
      // กรองวิดีโอที่มีขนาดเล็กเกินไปออก (เช่น โฆษณาป้ายเล็กๆ หรือ Tracker)
      if (video.offsetWidth > 0 && video.offsetWidth < 50) continue;
      if (video.offsetHeight > 0 && video.offsetHeight < 50) continue;

      attachPipButtonToVideo(video);
    }
  }

  /**
   * Event Listener สำหรับคีย์ลัดบนคีย์บอร์ด (Alt + P)
   * กดเพื่อเปิด/ปิดโหมด Picture-in-Picture บนวิดีโอที่เปิดอยู่อัตโนมัติ
   */
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      const video = getActiveVideo();
      if (video) {
        togglePip(video, video._cineFloatBtn);
      }
    }
  }, true);

  /**
   * Event Listener สำหรับรับข้อความจาก Background Service Worker
   * รองรับการสั่งเปิด/ปิด PiP ผ่าน Extension Command / Shortcut หลักของ Browser
   */
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

  // เริ่มการสแกนรอบแรกทันทีเมื่อโหลดสคริปต์
  scanAndInit();
  // สแกนซ้ำทุก 1.5 วินาที เพื่อรองรับ Single Page Application (SPA) ที่เปลี่ยนหน้าโดยไม่ Reload
  setInterval(scanAndInit, 1500);

  // สังเกตการณ์เปลี่ยนแปลงของ DOM (MutationObserver) เพื่อจับการเพิ่มวิดีโอใหม่ในหน้าเว็บ
  if (document.body || document.documentElement) {
    const observer = new MutationObserver(() => scanAndInit());
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();