# CineFloat 🎬✨

**CineFloat** เป็น Browser Extension (Sideloaded Extension) อัจฉริยะที่ถูกออกแบบมาเพื่อเพิ่มปุ่ม **Picture-in-Picture (PiP)** แบบอัตโนมัติให้กับวิดีโอบนเว็บสตรีมมิ่งทุกแพลตฟอร์ม พร้อมปุ่ม **-10s / +10s**, **แถบ Slide Timeline** บนหน้าต่างลอย, **ระบบกดข้ามโฆษณา YouTube อัตโนมัติ** และ **คีย์ลัด Alt + P** ช่วยให้คุณรับชมวิดีโอได้อย่างอิสระโดยไม่ต้องพึ่งพาสโตร์!

---

## ✨ Features

- **Universal Web Video Support:** ตรวจจับและเพิ่มปุ่ม PiP ที่มุมขวาบนของเครื่องเล่นวิดีโอบนทุกเว็บไซต์โดยอัตโนมัติ (เช่น Disney+, YouTube, Netflix, Prime Video, Twitch, WeTV, iQIYI, Bilibili, เว็บบล็อกข่าว ฯลฯ)
- **⚡ YouTube Auto Skip Ad:** ระบบกดข้ามโฆษณาบน YouTube อัตโนมัติทันทีที่ปุ่มปรากฏ และเร่งความเร็วโฆษณาที่บังคับดูเป็น 16x พร้อมปิดเสียงโดยอัตโนมัติ
- **🎛️ Native PiP Controls & Timeline:** ปลดล็อกปุ่มควบคุมบนหน้าต่าง PiP ทั้งปุ่มย้อนหลัง (-10s), ข้ามไปข้างหน้า (+10s), แถบเลื่อนเวลา (Timeline Slider) และปุ่ม Play/Pause ผ่าน MediaSession API
- **⌨️ Keyboard Shortcut (Alt + P):** สลับเปิด/ปิดหน้าต่างลอย PiP ได้ทันทีผ่านคีย์ลัด `Alt + P` (หรือ `Option + P` บน Mac) โดยไม่ต้องใช้เมาส์คลิก
- **Shadow DOM & iFrame Compatible:** รองรับวิดีโอที่ฝังอยู่ใน iFrame และ Web Components (Shadow DOM)
- **Zero-Friction Toggle & Auto-Resume:** คลิกเดียวเพื่อเปิด/ปิดหน้าต่างลอย พร้อมเล่นวิดีโอต่อใหัตโนมัติเมื่อปิดหน้าต่าง PiP
- **Manifest V3 & Zero-Config:** ทำงานบนมาตรฐาน Extension ล่าสุดที่รวดเร็ว ไม่กินทรัพยากร และไม่ต้องตั้งค่าใดๆ ให้ยุ่งยาก

---

## 🛠️ วิธีติดตั้งแบบ Manual (Sideloading)

เนื่องจาก Extension นี้ไม่ได้วางจำหน่ายบน Chrome Web Store คุณสามารถติดตั้งแบบ Manual ได้ง่ายๆ ในไม่กี่ขั้นตอน:

### วิธีที่ 1: ดาวน์โหลดแบบ ZIP (ง่ายที่สุด ไม่ต้องใช้ Git)
1. กดที่ปุ่มเขียว **`< > Code`** ด้านบนของ GitHub repository นี้ แล้วเลือก **`Download ZIP`**
2. แตกไฟล์ ZIP (Extract) ลงในโฟลเดอร์ที่คุณต้องการ (เช่น หน้า Desktop หรือ Documents)

### วิธีที่ 2: โคลนผ่าน Git
หากคุณมี Git อยู่แล้ว สามารถโคลนโปรเจคมาไว้ที่เครื่องได้เลย:
```bash
git clone https://github.com/your-username/CineFloat.git
```

---

### 📦 ขั้นตอนการติดตั้งลงในเบราว์เซอร์ (Chrome, Edge, Brave, Opera)
เมื่อได้โฟลเดอร์โปรเจคมาแล้ว ให้ทำตามขั้นตอนเพื่อเปิดใช้งาน:

1. เปิดเบราว์เซอร์ของคุณขึ้นมา แล้วพิมพ์ลิงก์นี้ลงในแถบ URL:
   - **Chrome / Brave / Opera:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
2. ที่มุมขวาบนของหน้า Extensions ให้เปิดสวิตช์ **Developer mode (โหมดนักพัฒนาซอฟต์แวร์)** ให้เป็น **On (เปิด)**
3. ที่มุมซ้ายบน ให้คลิกปุ่ม **Load unpacked (โหลดส่วนขยายที่ไม่ได้บรรจุ)**
4. เลือกโฟลเดอร์โปรเจค `CineFloat` (โฟลเดอร์ที่มีไฟล์ `manifest.json`, `content.js`, `background.js` และโฟลเดอร์ `icons/`)
5. **สำเร็จ!** 🎉 ไอคอน **CineFloat** จะปรากฏขึ้นมาทันที
6. เปิดเว็บไซต์สตรีมมิ่งที่คุณต้องการ (เช่น Disney+, YouTube, Twitch ฯลฯ), เล่นวิดีโอ แล้วกดปุ่ม PiP หรือกดคีย์ลัด `Alt + P` ได้เลย!

---

## 📂 Project Structure

```text
CineFloat/
├── manifest.json       # ไฟล์คอนฟิก Extension (Manifest V3 & Keybindings)
├── background.js       # Service Worker สำหรับรับคำสั่งคีย์ลัด Alt + P
├── content.js          # สคริปต์หลักสำหรับตรวจจับวิดีโอ, Auto Skip Ad, จัดการ PiP และ MediaSession
├── icons/
│   ├── icon16.png      # ไอคอน 16x16 (Anti-aliased)
│   ├── icon48.png      # ไอคอน 48x48 (Anti-aliased)
│   ├── icon128.png     # ไอคอน 128x128 (Anti-aliased)
│   └── icon.svg        # ต้นฉบับเวกเตอร์ SVG
├── scripts/
│   └── generate_icons.py # สคริปต์ Python สำหรับสร้างไอคอน PNG
└── README.md           # คู่มือการใช้งานและติดตั้ง
```
