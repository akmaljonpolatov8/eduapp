<div align="center">

# 🎓 EduCenter
### AI-Powered O'quv Markazi Boshqaruv Platformasi

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs)](https://nodejs.org)
[![Claude AI](https://img.shields.io/badge/Claude-AI-7C3AED)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](#)

*O'quv markazlari uchun AI yordamida uy vazifalarini tekshirish, davomat nazorati va to'lov boshqaruvi*

[📱 Screenshots](#screenshots) • [🚀 Quick Start](#quick-start) • [📖 Docs](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## 📋 Loyiha haqida

EduCenter — o'quv markazlari uchun to'liq boshqaruv tizimi. 3 ta foydalanuvchi roli, AI yordamida homework tekshiruv, davomat va to'lov nazorati.

### ✨ Asosiy xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| 🤖 **AI Tekshiruv** | Rasm va PDF ko'rinishidagi uy vazifalarini Claude AI tekshiradi |
| 📊 **Ball tizimi** | Avtomatik 0-100 ball va A/B/C/D/F baho |
| 💬 **Ko'p tilli feedback** | O'zbek, Rus, Ingliz tillarida batafsil izoh |
| 📸 **Handwriting OCR** | Qo'lda yozilgan vazifalarni ham o'qiydi |
| 📅 **Davomat** | Real-time davomat belgilash va nazorat |
| 💰 **To'lov nazorat** | Kechikkan to'lovlarda ota-onaga SMS |
| 📱 **SMS xabar** | textup.uz orqali avtomatik xabarlar |
| 📝 **Quick Test** | AI yordamida tezkor test yaratish |
| 🏆 **Reyting** | O'quvchi reytingi va statistikasi |
| 👥 **Modullar** | Har bir o'quvchi uchun individual fan tanlash |

### 👥 Foydalanuvchi rollari

```
Manager  →  Guruh yaratish, narx belgilash, o'qituvchi/o'quvchi biriktirish,
            billing nazorat, davomat hisoboti, to'lov ko'rish

O'qituvchi → Homework yuklash, davomat belgilash, quick test yaratish,
             AI feedback ko'rish, o'quvchi reytingi

O'quvchi  →  Homework ko'rish va yuklash, AI feedback olish,
             modullar va reyting ko'rish
```

---

## 🏗️ Arxitektura

```
educenter/
├── 📱 mobile/          # Flutter app (iOS + Android)
├── ⚙️  backend/         # Node.js REST API
├── 🌐 web/             # React web panel (super-admin)
├── 📚 docs/            # Hujjatlar
└── 🔧 scripts/         # Deploy va utility skriptlar
```

**Tech Stack:**
- **Mobile:** Flutter 3.x, Riverpod, Dio, Go Router
- **Backend:** Node.js, Express, PostgreSQL, Redis, JWT
- **AI:** Anthropic Claude claude-sonnet-4-20250514 (homework), claude-haiku-4-5 (test/SMS)
- **SMS:** textup.uz API
- **Storage:** AWS S3 / Cloudflare R2
- **Deploy:** Docker, Railway / Render

---

## 🚀 Quick Start

### Talablar
- Flutter SDK 3.x
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### O'rnatish

```bash
# 1. Repo klonlash
git clone https://github.com/YOUR_ORG/educenter.git
cd educenter

# 2. Backend sozlash
cd backend
cp .env.example .env        # .env faylni to'ldiring
npm install
npm run db:migrate
npm run dev

# 3. Flutter sozlash
cd ../mobile
flutter pub get
cp lib/config/env.example.dart lib/config/env.dart
flutter run
```

---

## 📁 Repo tuzilmasi

```
educenter/
│
├── 📱 mobile/                    # Flutter ilovasi
│   ├── lib/
│   │   ├── core/
│   │   │   ├── constants/        # Ranglar, o'lchamlar, API endpoints
│   │   │   ├── theme/            # App theme
│   │   │   ├── utils/            # Helper funksiyalar
│   │   │   └── widgets/          # Umumiy widgetlar
│   │   ├── features/
│   │   │   ├── auth/             # Login / rol tanlash
│   │   │   ├── manager/          # Manager panel
│   │   │   ├── teacher/          # O'qituvchi panel
│   │   │   ├── student/          # O'quvchi panel
│   │   │   ├── homework/         # Homework yuklash va ko'rish
│   │   │   ├── ai_check/         # AI tekshiruv natijasi
│   │   │   ├── attendance/       # Davomat
│   │   │   ├── payments/         # To'lov
│   │   │   └── notifications/    # SMS va push
│   │   ├── data/
│   │   │   ├── models/           # Data modellar
│   │   │   ├── repositories/     # Repository pattern
│   │   │   └── services/         # API chaqiruvlar
│   │   └── main.dart
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   └── pubspec.yaml
│
├── ⚙️  backend/                   # Node.js API
│   ├── src/
│   │   ├── config/               # DB, Redis, env config
│   │   ├── middleware/           # Auth, validation, rate limit
│   │   ├── modules/
│   │   │   ├── auth/             # JWT login/register
│   │   │   ├── users/            # Manager/Teacher/Student CRUD
│   │   │   ├── groups/           # Guruh boshqaruvi
│   │   │   ├── homework/         # Homework CRUD
│   │   │   ├── ai/               # Claude AI integratsiya
│   │   │   ├── attendance/       # Davomat
│   │   │   ├── payments/         # To'lov
│   │   │   ├── sms/              # textup.uz
│   │   │   └── reports/          # Hisobotlar
│   │   ├── jobs/                 # Cron joblar (SMS trigger)
│   │   └── app.js
│   ├── prisma/                   # DB schema (Prisma ORM)
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
│
├── 🌐 web/                       # Super-admin panel
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Centers/          # Barcha markazlar
│   │   │   ├── Billing/          # To'lovlar
│   │   │   └── Analytics/
│   │   └── components/
│   └── package.json
│
├── 📚 docs/
│   ├── api.md                    # API hujjati
│   ├── ai-prompts.md             # AI prompt hujjati
│   ├── deployment.md             # Deploy qo'llanma
│   └── database-schema.md       # DB schema
│
├── 🔧 scripts/
│   ├── deploy.sh                 # Production deploy
│   ├── backup-db.sh              # DB backup
│   └── seed-demo.sh              # Demo data
│
├── .github/
│   ├── workflows/
│   │   ├── flutter-ci.yml        # Flutter test & build
│   │   └── backend-ci.yml        # Backend test & deploy
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── .gitignore
├── docker-compose.yml            # Local dev environment
└── README.md
```

---

## 🌿 Branch strategiyasi

```
main          →  Production (himoyalangan, faqat PR orqali)
develop       →  Asosiy ishchi branch
│
├── feature/homework-ai-check      (yangi xususiyat)
├── feature/attendance-module
├── fix/login-crash                (xato tuzatish)
├── fix/sms-encoding
└── hotfix/payment-bug             (tez tuzatish, main'ga to'g'ridan)
```

**Qoidalar:**
- `main` ga to'g'ridan push **taqiqlangan**
- Har bir feature alohida branch
- PR kamida 1 review kerak
- Commit message: `feat:`, `fix:`, `docs:`, `refactor:`

---

## 🤝 Jamoa

| Ism | Rol | Mas'uliyat |
|-----|-----|------------|
| **Sen** | Backend Dev | Node.js API, AI, SMS, DB |
| **Shukrullo** | Flutter Dev | Mobil ilova (iOS/Android) |
| **Siroj** | Web Dev | Super-admin panel, landing |

---

## 📄 Litsenziya

Proprietary — Barcha huquqlar himoyalangan © 2026 EduCenter Team
