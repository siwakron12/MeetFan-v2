# MeetFan

**MeetFan** คือแพลตฟอร์มที่ช่วยให้คนที่มีความสนใจคล้ายกันได้เจอกันผ่าน "อีเวนต์" ในชีวิตจริง — ไม่ว่าจะเป็นงานออกกำลังกาย นิทรรศการศิลปะ หรือแฮกกาธอน ผู้ใช้สามารถค้นหาอีเวนต์ใกล้ตัว, ปัดเลือกคนที่อยากรู้จัก (คล้าย swipe การ์ด), จับคู่กันเมื่อสนใจตรงกัน แล้วเริ่มแชทได้ทันที

> 🏆 **โปรเจคนี้เป็นผลงานที่ชนะเลิศ (Winner)** จากกิจกรรมแฮกกาธอนที่จัดโดย **[CreativeLab TH](https://www.facebook.com/CreativeLabTH)**

---

## ✨ ฟีเจอร์หลัก

- **สำรวจอีเวนต์ใกล้ตัว** — แสดงอีเวนต์บนแผนที่ (Leaflet) พร้อมค้นหาและกรองตามความสนใจ
- **ระบบจับคู่ตามความสนใจ (Interest Matching)** — คำนวณคะแนนความเข้ากันระหว่างความสนใจของผู้ใช้กับแท็กของอีเวนต์
- **ปัดเพื่อจับคู่ (Swipe & Match)** — เข้าร่วมอีเวนต์แล้วปัดทำความรู้จักผู้เข้าร่วมคนอื่น เมื่อถูกใจกันทั้งสองฝ่ายจะเกิดแมตช์
- **แชทระหว่างคู่แมตช์** — พูดคุยกับคนที่แมตช์กันได้โดยตรงในแอป
- **โปรไฟล์ผู้ใช้** — ตั้งค่าอายุ เขต อาชีพ ความสนใจ และเป้าหมายในการเข้าร่วมกิจกรรม
- **ระบบสมัคร/เข้าสู่ระบบ** — ยืนยันตัวตนด้วย session และเข้ารหัสรหัสผ่านด้วย bcrypt
- **โอกาส/กิจกรรมแนะนำ (Opportunities)** — แนะนำอีเวนต์ที่เหมาะกับผู้ใช้แต่ละคน

## 🛠️ เทคโนโลยีที่ใช้

| ส่วนประกอบ | เทคโนโลยี |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| ฐานข้อมูล / ORM | PostgreSQL + [Prisma](https://www.prisma.io/) |
| แผนที่ | Leaflet / React-Leaflet |
| ไอคอน | Lucide React |
| การยืนยันตัวตน | bcrypt + session-based auth |

## 📁 โครงสร้างโปรเจคโดยย่อ

```
src/
├── app/                 # หน้าเว็บและ API routes (App Router)
│   ├── (main)/          # หน้าแรก - สำรวจอีเวนต์ / แผนที่ / อีเวนต์ใกล้เคียง
│   ├── (Login)/         # หน้าล็อกอิน / สมัครสมาชิก
│   ├── chat/            # หน้าแชทของคู่แมตช์
│   ├── Event/            # รายละเอียดอีเวนต์
│   ├── opportunities/   # อีเวนต์/โอกาสแนะนำ
│   ├── profile/         # โปรไฟล์ผู้ใช้
│   └── api/             # REST API (auth, events, users, matches)
├── components/          # UI ที่ใช้ร่วมกัน (Bottom nav, Top bar, Auth provider)
├── services/            # Business logic (auth, event, match, interest-matching)
├── data/events/         # ข้อมูลอีเวนต์ตัวอย่างในรูปแบบ CSV
└── lib/                 # Prisma client, session helper, API response helper

prisma/
└── schema.prisma        # โมเดลข้อมูล: User, Event, EventParticipant, Swipe, Match, UserSession
```

## 🚀 เริ่มต้นใช้งาน

### สิ่งที่ต้องมีก่อน

- Node.js (แนะนำเวอร์ชันล่าสุด LTS)
- ฐานข้อมูล PostgreSQL

### ติดตั้งและรัน

```bash
# ติดตั้ง dependencies
npm install

# ตั้งค่าตัวแปรแวดล้อม (สร้างไฟล์ .env แล้วกำหนด DATABASE_URL ให้ชี้ไปยัง PostgreSQL ของคุณ)
DATABASE_URL="postgresql://user:password@localhost:5432/meetfan"

# สร้าง Prisma client และรัน migration
npm run prisma:generate
npm run prisma:migrate

# (ถ้าต้องการ) เติมข้อมูลตัวอย่างลงฐานข้อมูล
npm run prisma:seed

# รันเซิร์ฟเวอร์สำหรับพัฒนา
npm run dev
```

จากนั้นเปิด [http://localhost:3000](http://localhost:3000) เพื่อดูผลลัพธ์

### คำสั่งอื่นๆ ที่มีให้ใช้

```bash
npm run build     # build โปรเจคสำหรับ production
npm run start     # รันเซิร์ฟเวอร์ production
npm run lint      # ตรวจสอบโค้ดด้วย ESLint
```

## 🙏 ขอบคุณ

ขอบคุณ **[CreativeLab TH](https://www.facebook.com/CreativeLabTH)** ที่จัดกิจกรรมแฮกกาธอนดีๆ ให้ทีมได้เรียนรู้และสร้างสรรค์โปรเจคนี้ขึ้นมาจนคว้ารางวัลชนะเลิศ 🎉
