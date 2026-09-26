# CineFloat 🎬✨

**CineFloat** เป็น Extension ลับเฉพาะตัว (Sideloaded Browser Extension) ที่ถูกออกแบบมาเพื่อเพิ่มปุ่ม **Picture-in-Picture (PiP)** แบบอัตโนมัติให้กับ **Disney+** ช่วยให้คุณรับชมวิดีโอในหน้าต่างลอยได้อย่างอิสระโดยไม่ต้องง้อสโตร์!

---

## ✨ Features

- **Automatic PiP Button Injection:** ตรวจจับและเพิ่มปุ่ม PiP ที่มุมขวาบนของวิดีโอ Disney+ อัตโนมัติ
- **Zero-Friction Toggle:** คลิกเดียวเพื่อเปิด/ปิดหน้าต่างลอย
- **Smart Auto-Resume:** เล่นวิดีโอต่อโดยอัตโนมัติเมื่อปิดหน้าต่าง PiP
- **SPA & Episode Navigation Support:** รองรับการเปลี่ยนตอนและเปลี่ยนหน้าอย่างไร้รอยต่อด้วยระบบ Polling อัจฉริยะ
- **Manifest V3:** ทำงานบนมาตรฐาน Extension ล่าสุดที่รวดเร็วและปลอดภัย

---

## 🛠️ วิธีติดตั้งแบบ Manual (Sideloading / ของลับเฉพาะกิจ)

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
เมื่อได้โฟลเดอร์โปรเจคมาแล้ว ให้ทำตามขั้นตอนนี้เพื่อเปิดใช้งาน:

1. เปิดเบราว์เซอร์ของคุณขึ้นมา แล้วพิมพ์ลิงก์นี้ลงในแถบ URL:
   - **Chrome / Brave / Opera:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
2. ที่มุมขวาบนของหน้า Extensions ให้เปิดสวิตช์ **Developer mode (โหมดนักพัฒนาซอฟต์แวร์)** ให้เป็น **On (เปิด)**
3. ที่มุมซ้ายบน ให้คลิกปุ่ม **Load unpacked (โหลดส่วนขยายที่ไม่ได้บรรจุ)**
4. เลือกโฟลเดอร์โปรเจค `CineFloat` (โฟลเดอร์ที่มีไฟล์ `manifest.json`, `content.js` และโฟลเดอร์ `icons/`)
5. **สำเร็จ!** 🎉 ไอคอน **CineFloat** จะปรากฏขึ้นมาทันที
6. เปิดเว็บไซต์ [Disney+](https://www.disneyplus.com/), เล่นหนังหรือซีรีส์ แล้วกดปุ่ม PiP ที่มุมขวาบนของวิดีโอได้เลย!

---

## 📂 Project Structure

```text
CineFloat/
├── manifest.json       # ไฟล์คอนฟิก Extension (Manifest V3)
├── content.js          # สคริปต์หลักสำหรับดักจับวิดีโอและควบคุม PiP
├── icons/
│   ├── icon16.png      # ไอคอน 16x16 (Anti-aliased)
│   ├── icon48.png      # ไอคอน 48x48 (Anti-aliased)
│   ├── icon128.png     # ไอคอน 128x128 (Anti-aliased)
│   └── icon.svg        # ต้นฉบับเวกเตอร์ SVG
├── scripts/
│   └── generate_icons.py # สคริปต์ Python สำหรับสร้างไอคอน PNG
└── README.md           # คู่มือการใช้งานและติดตั้ง
```

---

## 📜 License

โปรเจคนี้เผยแพร่ภายใต้ [MIT License](LICENSE).
