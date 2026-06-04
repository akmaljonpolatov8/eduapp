#!/bin/bash
echo "🎓 EduCenter o'rnatilmoqda..."

echo "⚙️  Backend sozlanmoqda..."
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
echo "✅ Backend tayyor"

echo "📱 Flutter sozlanmoqda..."
cd ../mobile
cp lib/config/env.example.dart lib/config/env.dart
flutter pub get
echo "✅ Flutter tayyor"

echo ""
echo "🚀 Ishga tushirish:"
echo "   Backend: cd backend && npm run dev"
echo "   Flutter: cd mobile && flutter run"
