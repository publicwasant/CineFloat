

(function () {
  'use strict';

  function initPipButton() {
    // 1. ค้นหา <video> ตัวหลัก
    const videos = Array.from(document.querySelectorAll('video'));
    const activeVideo = videos.find(v => v.readyState >= 1 && v.videoWidth > 0) || 
                        videos.find(v => v.readyState >= 1);

    if (!activeVideo) return;

    // 2. ปลดล็อกตัวบล็อก PiP
    activeVideo.removeAttribute('disablepictureinpicture');
    activeVideo.disablePictureInPicture = false;

    // 3. หา Video Container
    const videoContainer = activeVideo.parentElement || document.body;
    if (window.getComputedStyle(videoContainer).position === 'static') {
      videoContainer.style.position = 'relative';
    }

    // ถ้าใน Container นี้มีปุ่มอยู่แล้ว ไม่ต้องสร้างซ้ำ
    if (videoContainer.querySelector('#minimal-pip-btn')) return;

    // 4. สร้างไอคอน PiP
    const btn = document.createElement('button');
    btn.id = 'minimal-pip-btn';
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <rect x="11" y="9" width="9" height="6" rx="1" fill="currentColor" fill-opacity="0.5"></rect>
      </svg>
    `;

    btn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: transparent;
      border: none;
      outline: none;
      padding: 6px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
      transition: all 0.2s ease;
      user-select: none;
    `;

    btn.onmouseover = () => {
      btn.style.color = '#ffffff';
      btn.style.transform = 'scale(1.15)';
    };

    btn.onmouseout = () => {
      btn.style.color = 'rgba(255, 255, 255, 0.7)';
      btn.style.transform = 'scale(1)';
    };

    // 5. สั่งเปิด PiP
    btn.onclick = async (e) => {
      e.stopPropagation();
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await activeVideo.requestPictureInPicture();
          btn.style.display = 'none';
        }
      } catch (err) {
        console.error("PiP error:", err);
      }
    };

    // 6. ดักปิด PiP -> คืนปุ่ม + เล่นต่อ
    const handleLeavePiP = () => {
      btn.style.display = 'flex';
      setTimeout(async () => {
        activeVideo.dispatchEvent(new Event('pause', { bubbles: true }));
        try {
          await activeVideo.play();
        } catch (err) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', keyCode: 32, bubbles: true }));
        }
        activeVideo.dispatchEvent(new Event('play', { bubbles: true }));
        activeVideo.dispatchEvent(new Event('playing', { bubbles: true }));
      }, 200);
    };

    if (activeVideo._pipHandler) {
      activeVideo.removeEventListener('leavepictureinpicture', activeVideo._pipHandler);
    }
    activeVideo._pipHandler = handleLeavePiP;
    activeVideo.addEventListener('leavepictureinpicture', handleLeavePiP);

    videoContainer.appendChild(btn);
  }

  // ใช้ polling เฝ้าตรวจจับ Element <video> กรณีเปลี่ยนหน้า/เปลี่ยนตอนหนัง
  setInterval(initPipButton, 1000);
})();