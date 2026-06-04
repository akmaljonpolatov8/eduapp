# EduCenter API Hujjati

Base URL: `https://api.educenter.uz/v1`

## Auth
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Token yangilash |
| POST | `/auth/logout` | Chiqish |

## Homework
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/homework/:groupId` | Guruh homeworklari |
| POST | `/homework` | Yangi homework (o'qituvchi) |
| POST | `/homework/:id/submit` | Javob yuklash (o'quvchi) |
| GET | `/homework/:id/result` | AI natijasi |

## AI
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/ai/check-homework` | Homework tekshiruv |
| POST | `/ai/generate-test` | Test yaratish |

## Attendance
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/attendance` | Davomat belgilash |
| GET | `/attendance/:groupId` | Guruh davomati |

## Payments
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/payments/:centerId` | Barcha to'lovlar |
| PUT | `/payments/:id/confirm` | To'lovni tasdiqlash |
