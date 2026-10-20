# منصة عِلم التعليمية | ELM E-Learning Platform

منصة تعليمية متكاملة (Full-Stack LMS) لإدارة الدروس المصورة، المحافظ الإلكترونية للطلاب، الكوبونات، والمذكرات الدراسية مع نظام تحفيزي (Gamification & Leaderboards).

🔗 **النسخة الحية (Live Demo):** [https://elm.up.railway.app/](https://elm.up.railway.app/)

---

## ✨ المميزات الرئيسية (Key Features)

- **إدارة المحتوى التعليمي حسب الصف الدراسي:** عرض الدروس المصورة (Video Lessons) والمرفقات بصيغة PDF مخصصة لكل مرحلة دراسية.
- **نظام المحفظة الإلكترونية والكوبونات (Student Wallet & Coupons):** شحن الرصيد، شراء الحصص، وتفعيل أكواد الخصم والاشتراكات الشهرية.
- **نظام التحفيز والنقاط (Gamification):** حساب أيام الانتظام (Streaks)، نقاط التميز، الشارات (Badges)، ولوحة الشرف (Leaderboard).
- **حماية وأمان الحسابات:** تشفير كلمات المرور باستخدام `bcryptjs` وإدارة الجلسات.
- **دعم التخزين السحابي:** تكامل مع `AWS S3 SDK` لإدارة الملفات والمرفقات.
- **جاهزية النشر السحابي:** مُعد بالكامل للنشر عبر **Docker** و **Railway**.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend:** React, Vite, Tailwind CSS v4
- **Backend:** Node.js (`server.js`), RESTful APIs
- **Security & Cloud:** `bcryptjs`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **DevOps & Deployment:** Docker (`Dockerfile`), Railway (`railway.toml`), Oxlint

---

## 🚀 طريقة التشغيل محلياً (Run Locally)

1. **استنساخ المستودع (Clone):**
   ```bash
   git clone https://github.com/nour45-dev/ElBashmohands-.git
   cd ElBashmohands-
   ```

2. **تثبيت الحزم (Install Dependencies):**
   ```bash
   npm install
   ```

3. **تشغيل بيئة التطوير (Development):**
   ```bash
   npm run dev
   ```

4. **بناء وتشغيل نسخة الإنتاج (Production):**
   ```bash
   npm run build
   npm start
   ```

---

## 👨‍💻 المطور (Author)
**Nour Eldin Ahmed**  
- [GitHub](https://github.com/nour45-dev) · [LinkedIn](https://linkedin.com/in/nour-eldin-ahmed-hussien-509a0b1a4/) · [YouTube](https://www.youtube.com/@NourTech-AI)
