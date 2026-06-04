# EduCenter Backend

Node.js + Express + Prisma asosidagi backend API.

## Boshlash

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

## Muhim endpointlar

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/users`
- `GET /api/users`
- `POST /api/groups`
- `GET /api/groups`

## Eslatma

Hozirgi kod baza core auth/users/groups qatlamini ishga tushiradi. Homework, attendance, payments, AI va SMS modullari keyingi bosqichda shu pattern bo'yicha kengaytiriladi.