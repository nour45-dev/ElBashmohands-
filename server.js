import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Active Secrets and Environment Configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (isProd && !JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required in production!');
  process.exit(1);
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'dev-secret-key-change-in-production-12345';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

// Arabic Normalization Helper
const normalizeArabic = (text) => {
  if (!text) return '';
  return text
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
};

// Phone Normalization Helper
const normalizePhone = (phone) => {
  if (!phone) return '';
  let p = phone.replace(/[^0-9]/g, '');
  if (p.startsWith('20') && p.length > 10) {
    p = p.substring(2);
  }
  if (p.startsWith('0')) {
    p = p.substring(1);
  }
  return p;
};

// Database state
let db = null;
let mongoClient = null;
let dbType = 'json';
const jsonDbFilePath = path.join(__dirname, 'database.json');

// Default Seed Data
const initialData = {
  students: [
    {
      id: 'std_3003',
      code: '3003',
      name: 'محمد أحمد علي',
      email: 'student3003@elm.com',
      phone: '01040581954',
      parentPhone: '01040581954',
      password: '$2b$10$6RHR0cZASLRzQYF2VoGbkuoM4IVRAw88uvImfCmTb/.UNixkoDWYS',
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (ثانوية عامة)',
      avatar: null,
      walletBalance: 150,
      subscriptionStatus: 'active',
      subscriptionType: 'شهري',
      monthlyCreditsLeft: 8,
      points: 250,
      streakDays: 7,
      rank: 1,
      badges: [{ id: 'b1', name: 'عضو متميز 🚀', icon: '🚀', desc: 'انضم لمنصة عِلم' }]
    },
    {
      id: 'std_1001',
      code: '1001',
      name: 'أحمد محمود علي',
      email: 'ahmed@elm.com',
      phone: '01002169889',
      parentPhone: '01002169889',
      password: '$2b$10$6RHR0cZASLRzQYF2VoGbkuoM4IVRAw88uvImfCmTb/.UNixkoDWYS',
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (ثانوية عامة)',
      avatar: null,
      walletBalance: 100,
      subscriptionStatus: 'active',
      subscriptionType: 'شهري',
      monthlyCreditsLeft: 8,
      points: 120,
      streakDays: 5,
      rank: 2,
      badges: [{ id: 'b1', name: 'عضو جديد 💻', icon: '💻', desc: 'انضم لمنصة عِلم' }]
    }
  ],
  lessons: [
    {
      id: 'les_demo_1',
      title: 'مقدمة البرمجة وأساسيات لغة Python',
      subject: 'برمجة وعلوم الحاسب',
      grade: '3sec',
      duration: '45 دقيقة',
      price: 0,
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      description: 'تعلم أساسيات البرمجة، المتغيرات، والجمل الشرطية بطريقة تفاعلية وممتعة مع التطبيق العملي.',
      attachmentType: 'pdf',
      attachmentPdf: 'ملخص_بايثون_الدرس_الاول.pdf',
      attachmentFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'les_demo_2',
      title: 'شرح درس كان وأخواتها وكاد وأخواتها بالتفصيل',
      subject: 'اللغة العربية',
      grade: '3sec',
      duration: '55 دقيقة',
      price: 25,
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
      description: 'شرح مبسط لقواعد الأفعال الناسخة وحالات تقدم الخبر وأهم تكات الامتحان الوزاري.',
      attachmentType: 'pdf',
      attachmentPdf: 'مذكرة_النحو_الافعال_الناسخة.pdf',
      attachmentFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ],
  coupons: [
    { code: 'ELM2026', type: 'fixed', value: 50, targetGrade: 'all', maxUses: 100, usedCount: 0 }
  ],
  payments: [],
  questions: [],
  notifications: [
    { id: 'n1', title: 'مرحباً بك في منصة عِلم التعليمية! 💻', body: 'التطبيق جاهز ومحمي بالكامل 100%.', time: 'الآن', unread: true }
  ],
  exams: [],
  liveSessions: [
    {
      id: 'live_demo_1',
      title: 'المراجعة النهائية الشاملة: فرع النحو وأسرار امتحان الثانوية العامة 🔴',
      instructor: 'أ / سيد عبد العاطي',
      instructorId: 'mr_sayed',
      subject: 'اللغة العربية',
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (ثانوية عامة)',
      status: 'live',
      scheduledAt: '2026-08-19T20:00:00',
      description: 'بث مباشر تفاعلي لحل 150 فكرة امتحانية في النحو التراكمي وتدريبات البلاغة مع استقبال أسئلة الطلاب لحظة بلحظة.',
      streamType: 'youtube_live',
      streamUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
      viewersCount: 342,
      likesCount: 189,
      chatMessages: [
        {
          id: 'c1',
          senderName: 'أ / سيد عبد العاطي',
          senderRole: 'teacher',
          text: 'أهلاً بكم يا أبطال دفعة 2026! جهزوا كشكول الملاحظات سنبدأ بحل أصعب شواهد النحو الآن 🚀',
          timestamp: 'منذ دقيقة',
          isPinned: true
        },
        {
          id: 'c2',
          senderName: 'محمد أحمد علي',
          senderRole: 'student',
          text: 'مستعدين يا مستر والصوت والصورة جودتهم ممتازة جداً ما شاء الله 🔥',
          timestamp: 'منذ دقيقة'
        },
        {
          id: 'c3',
          senderName: 'أحمد محمود علي',
          senderRole: 'student',
          text: 'يا مستر ممكن توضيح الفرق بين لا النافية للجنس ولا العاطفة؟',
          timestamp: 'الآن'
        }
      ],
      polls: [
        {
          id: 'poll_1',
          question: 'ما نوع (لا) في جملة: «لا طالبَ علمٍ مهملٌ»؟',
          options: ['نافية للجنس عاملة', 'نافية مهملة', 'عاطفة', 'ناهية جازمة'],
          correctIndex: 0,
          votes: { '0': 24, '1': 3, '2': 1, '3': 0 },
          totalVotes: 28,
          isActive: true,
          createdAt: 'منذ 5 دقائق'
        }
      ],
      handRaises: [
        {
          id: 'hr_1',
          studentId: 'std_3003',
          studentName: 'محمد أحمد علي',
          studentCode: '3003',
          requestedAt: 'الآن',
          status: 'pending'
        }
      ],
      recordingUrl: null
    },
    {
      id: 'live_demo_2',
      title: 'ورشة عمل مباشرة: بناء تطبيق ذكاء اصطناعي تفاعلي بلغة Python 💻',
      instructor: 'م / نور الدين',
      instructorId: 'eng_nour',
      subject: 'برمجة وعلوم الحاسب',
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (ثانوية عامة)',
      status: 'scheduled',
      scheduledAt: '2026-08-20T19:00:00',
      description: 'بث تدريبي عملي لكتابة كود حقيقي وبناء نموذج ذكاء اصطناعي متكامل خطوة بخطوة وتصحيح الأخطاء مباشرة.',
      streamType: 'youtube_live',
      streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      viewersCount: 0,
      likesCount: 95,
      chatMessages: [],
      polls: [],
      handRaises: [],
      recordingUrl: null
    }
  ]
};

// Database Connection Helper
const MONGODB_URI = process.env.MONGODB_URI;

const initializeDatabase = async () => {
  if (MONGODB_URI) {
    try {
      console.log('Connecting to MongoDB database...');
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      db = mongoClient.db();
      dbType = 'mongodb';
      console.log('Successfully connected to MongoDB!');

      const seedCollectionIfEmpty = async (colName, seedData) => {
        const col = db.collection(colName);
        const count = await col.countDocuments();
        if (count === 0 && seedData && seedData.length > 0) {
          console.log(`Seeding empty collection: ${colName}...`);
          await col.insertMany(seedData);
        }
      };

      await seedCollectionIfEmpty('students', initialData.students);
      await seedCollectionIfEmpty('lessons', initialData.lessons);
      await seedCollectionIfEmpty('coupons', initialData.coupons);
      await seedCollectionIfEmpty('payments', initialData.payments);
      await seedCollectionIfEmpty('questions', initialData.questions);
      await seedCollectionIfEmpty('notifications', initialData.notifications);
      await seedCollectionIfEmpty('liveSessions', initialData.liveSessions);
      console.log('MongoDB initialization and seeding check completed.');
    } catch (err) {
      console.error('Failed to connect to MongoDB! Falling back to local JSON...');
      setupLocalJsonDB();
    }
  } else {
    console.log('Setting up local JSON database...');
    setupLocalJsonDB();
  }
};

const setupLocalJsonDB = () => {
  dbType = 'json';
  if (!fs.existsSync(jsonDbFilePath)) {
    fs.writeFileSync(jsonDbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

const getLocalData = () => {
  try {
    const raw = fs.readFileSync(jsonDbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
};

const writeLocalData = (data) => {
  fs.writeFileSync(jsonDbFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Auth Middlewares
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' });
  }

  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.' });
  }
};

const requireAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول.' });
  }
  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الصفحة مخصصة لإدارة المنصة فقط.' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'جلسة غير صالحة.' });
  }
};

// ═══ AUTHENTICATION ROUTES ═══

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.json({ role: 'admin', identity: decoded.identity, name: decoded.name });
    }

    let user = null;
    if (dbType === 'mongodb') {
      user = await db.collection('students').findOne({ id: decoded.id });
    } else {
      const data = getLocalData();
      user = (data.students || []).find(s => s.id === decoded.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json({ role: 'student', user: userWithoutPassword });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { role, code, password, phone, parentPhone, secretCode } = req.body;

  if (role === 'admin') {
    if (secretCode === 'bashmohandis') {
      const adminIdentity = code === 'sayed' ? 'mr_sayed' : 'eng_nour';
      const token = jwt.sign(
        { role: 'admin', identity: adminIdentity, name: adminIdentity === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين' },
        ACTIVE_JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.json({ success: true, message: 'مرحباً بك يا أستاذنا في لوحة تحكم عِلم! 🌟', role: 'admin', identity: adminIdentity });
    }
    return res.status(401).json({ error: 'كود الإدارة السري غير صحيح.' });
  }

  if (role === 'parent') {
    const cleanParentPhone = normalizePhone(parentPhone || phone);
    let student = null;
    if (dbType === 'mongodb') {
      student = await db.collection('students').findOne({
        code: code?.trim(),
        $or: [
          { parentPhone: cleanParentPhone },
          { phone: cleanParentPhone }
        ]
      });
    } else {
      const data = getLocalData();
      student = (data.students || []).find(s => 
        s.code === code?.trim() && 
        (normalizePhone(s.parentPhone) === cleanParentPhone || normalizePhone(s.phone) === cleanParentPhone)
      );
    }

    if (!student) {
      return res.status(401).json({ error: 'بيانات ولي الأمر أو كود الطالب غير مطابقة.' });
    }

    const { password: _, ...userClean } = student;
    return res.json({ success: true, role: 'parent', user: userClean, message: `مرحباً بك يا ولي أمر الطالب ${student.name} 🎓` });
  }

  // Student Login
  const cleanPhone = normalizePhone(phone);
  let student = null;
  if (dbType === 'mongodb') {
    student = await db.collection('students').findOne({
      $or: [
        { code: code?.trim() },
        { phone: cleanPhone }
      ]
    });
  } else {
    const data = getLocalData();
    student = (data.students || []).find(s => 
      s.code === code?.trim() || normalizePhone(s.phone) === cleanPhone
    );
  }

  if (!student) {
    return res.status(401).json({ error: 'كود الطالب أو رقم الهاتف غير مسجل بالمنصة.' });
  }

  const validPassword = await bcrypt.compare(password, student.password);
  if (!validPassword && password !== student.password) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة.' });
  }

  const token = jwt.sign(
    { id: student.id, code: student.code, role: 'student' },
    ACTIVE_JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
  const { password: _, ...userWithoutPass } = student;
  return res.json({ success: true, message: `مرحباً بك يا ${student.name} في منصة عِلم 🚀`, role: 'student', user: userWithoutPass });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, phone, parentPhone, password, grade, gradeName } = req.body;

  if (!name || !phone || !password || !grade) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة' });
  }

  const cleanPhone = normalizePhone(phone);
  const cleanParentPhone = normalizePhone(parentPhone || phone);

  let existing = null;
  if (dbType === 'mongodb') {
    existing = await db.collection('students').findOne({ phone: cleanPhone });
  } else {
    const data = getLocalData();
    existing = (data.students || []).find(s => normalizePhone(s.phone) === cleanPhone);
  }

  if (existing) {
    return res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل في المنصة.' });
  }

  const studentCode = Math.floor(1000 + Math.random() * 9000).toString();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newStudent = {
    id: `std_${Date.now()}`,
    code: studentCode,
    name: name.trim(),
    email: `student${studentCode}@elm.com`,
    phone: cleanPhone,
    parentPhone: cleanParentPhone,
    password: hashedPassword,
    grade,
    gradeName: gradeName || (grade === '3sec' ? 'الصف الثالث الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الأول الثانوي'),
    walletBalance: 0,
    subscriptionStatus: 'inactive',
    points: 50,
    streakDays: 1,
    rank: 10,
    badges: [{ id: 'b1', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة عِلم' }],
    unlockedLessons: [],
    createdAt: new Date().toISOString()
  };

  if (dbType === 'mongodb') {
    await db.collection('students').insertOne(newStudent);
  } else {
    const data = getLocalData();
    if (!data.students) data.students = [];
    data.students.push(newStudent);
    writeLocalData(data);
  }

  const token = jwt.sign(
    { id: newStudent.id, code: newStudent.code, role: 'student' },
    ACTIVE_JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
  const { password: _, ...userClean } = newStudent;
  return res.json({ success: true, message: `تم إنشاء حسابك بنجاح! كودك هو (${studentCode})`, user: userClean });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
});

// ═══ LESSONS & DATA ROUTES ═══

app.get('/api/lessons', async (req, res) => {
  let lessons = [];
  if (dbType === 'mongodb') {
    lessons = await db.collection('lessons').find({}).toArray();
  } else {
    lessons = getLocalData().lessons || [];
  }
  return res.json(lessons);
});

app.post('/api/lessons', requireAdmin, async (req, res) => {
  const newLesson = { id: `les_${Date.now()}`, ...req.body };
  if (dbType === 'mongodb') {
    await db.collection('lessons').insertOne(newLesson);
  } else {
    const data = getLocalData();
    if (!data.lessons) data.lessons = [];
    data.lessons.unshift(newLesson);
    writeLocalData(data);
  }
  return res.json(newLesson);
});

app.patch('/api/lessons/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('lessons').updateOne({ id }, { $set: req.body });
  } else {
    const data = getLocalData();
    const idx = (data.lessons || []).findIndex(l => l.id === id);
    if (idx !== -1) {
      data.lessons[idx] = { ...data.lessons[idx], ...req.body };
      writeLocalData(data);
    }
  }
  return res.json({ success: true });
});

app.delete('/api/lessons/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('lessons').deleteOne({ id });
  } else {
    const data = getLocalData();
    data.lessons = (data.lessons || []).filter(l => l.id !== id);
    writeLocalData(data);
  }
  return res.json({ success: true });
});

// ═══ STUDENTS MANAGEMENT (Admin) ═══

app.get('/api/students', requireAdmin, async (req, res) => {
  let students = [];
  if (dbType === 'mongodb') {
    students = await db.collection('students').find({}).toArray();
  } else {
    students = getLocalData().students || [];
  }
  return res.json(students);
});

app.patch('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('students').updateOne({ id }, { $set: req.body });
  } else {
    const data = getLocalData();
    const idx = (data.students || []).findIndex(s => s.id === id);
    if (idx !== -1) {
      data.students[idx] = { ...data.students[idx], ...req.body };
      writeLocalData(data);
    }
  }
  return res.json({ success: true });
});

app.delete('/api/students/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('students').deleteOne({ id });
  } else {
    const data = getLocalData();
    data.students = (data.students || []).filter(s => s.id !== id);
    writeLocalData(data);
  }
  return res.json({ success: true });
});

// ═══ PAYMENTS, COUPONS & NOTIFICATIONS ═══

app.get('/api/payments', requireAdmin, async (req, res) => {
  let payments = [];
  if (dbType === 'mongodb') {
    payments = await db.collection('payments').find({}).toArray();
  } else {
    payments = getLocalData().payments || [];
  }
  return res.json(payments);
});

app.post('/api/payments', async (req, res) => {
  const payment = { id: `pay_${Date.now()}`, ...req.body, status: 'pending', date: new Date().toLocaleDateString('ar-EG') };
  if (dbType === 'mongodb') {
    await db.collection('payments').insertOne(payment);
  } else {
    const data = getLocalData();
    if (!data.payments) data.payments = [];
    data.payments.unshift(payment);
    writeLocalData(data);
  }
  return res.json({ success: true, payment, message: 'تم إرسال طلب الشحن بنجاح! سيتم مراجعته وتأكيده.' });
});

app.post('/api/payments/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  let payment = null;
  if (dbType === 'mongodb') {
    payment = await db.collection('payments').findOne({ id });
    if (payment) {
      await db.collection('payments').updateOne({ id }, { $set: { status: 'approved' } });
      await db.collection('students').updateOne({ id: payment.studentId }, { $inc: { walletBalance: Number(payment.amount) } });
    }
  } else {
    const data = getLocalData();
    const pIdx = (data.payments || []).findIndex(p => p.id === id);
    if (pIdx !== -1) {
      data.payments[pIdx].status = 'approved';
      payment = data.payments[pIdx];
      const sIdx = (data.students || []).findIndex(s => s.id === payment.studentId);
      if (sIdx !== -1) {
        data.students[sIdx].walletBalance = (data.students[sIdx].walletBalance || 0) + Number(payment.amount);
      }
      writeLocalData(data);
    }
  }
  return res.json({ success: true, message: 'تمت الموافقة على الشحن وإضافة الرصيد لمحفظة الطالب.' });
});

app.post('/api/payments/:id/reject', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('payments').updateOne({ id }, { $set: { status: 'rejected' } });
  } else {
    const data = getLocalData();
    const pIdx = (data.payments || []).findIndex(p => p.id === id);
    if (pIdx !== -1) {
      data.payments[pIdx].status = 'rejected';
      writeLocalData(data);
    }
  }
  return res.json({ success: true, message: 'تم رفض طلب الشحن.' });
});

app.get('/api/coupons', requireAdmin, async (req, res) => {
  let coupons = [];
  if (dbType === 'mongodb') {
    coupons = await db.collection('coupons').find({}).toArray();
  } else {
    coupons = getLocalData().coupons || [];
  }
  return res.json(coupons);
});

app.post('/api/coupons', requireAdmin, async (req, res) => {
  const newCoupon = { ...req.body, usedCount: 0 };
  if (dbType === 'mongodb') {
    await db.collection('coupons').insertOne(newCoupon);
  } else {
    const data = getLocalData();
    if (!data.coupons) data.coupons = [];
    data.coupons.push(newCoupon);
    writeLocalData(data);
  }
  return res.json({ success: true, coupon: newCoupon, message: 'تم إنشاء الكوبون بنجاح!' });
});

app.delete('/api/coupons/:code', requireAdmin, async (req, res) => {
  const { code } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('coupons').deleteOne({ code });
  } else {
    const data = getLocalData();
    data.coupons = (data.coupons || []).filter(c => c.code !== code);
    writeLocalData(data);
  }
  return res.json({ success: true });
});

app.post('/api/coupons/apply', async (req, res) => {
  const { code } = req.body;
  let coupon = null;
  if (dbType === 'mongodb') {
    coupon = await db.collection('coupons').findOne({ code: code?.trim().toUpperCase() });
  } else {
    const data = getLocalData();
    coupon = (data.coupons || []).find(c => c.code.toUpperCase() === code?.trim().toUpperCase());
  }

  if (!coupon) {
    return res.status(400).json({ error: 'كود الكوبون غير صحيح أو غير موجود.' });
  }

  return res.json({ success: true, value: coupon.value, message: `تم تفعيل الكوبون وإضافة ${coupon.value} ج.م لرصيدك!` });
});

app.get('/api/notifications', async (req, res) => {
  let notifs = [];
  if (dbType === 'mongodb') {
    notifs = await db.collection('notifications').find({}).sort({ _id: -1 }).toArray();
  } else {
    notifs = getLocalData().notifications || [];
  }
  return res.json(notifs);
});

app.post('/api/notifications', requireAdmin, async (req, res) => {
  const notif = { id: `n_${Date.now()}`, ...req.body, time: 'الآن', unread: true };
  if (dbType === 'mongodb') {
    await db.collection('notifications').insertOne(notif);
  } else {
    const data = getLocalData();
    if (!data.notifications) data.notifications = [];
    data.notifications.unshift(notif);
    writeLocalData(data);
  }
  return res.json({ success: true, notification: notif, message: 'تم إرسال الإشعار بنجاح!' });
});

app.delete('/api/notifications/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (dbType === 'mongodb') {
    await db.collection('notifications').deleteOne({ id });
  } else {
    const data = getLocalData();
    data.notifications = (data.notifications || []).filter(n => n.id !== id);
    writeLocalData(data);
  }
  return res.json({ success: true });
});

app.get('/api/questions', async (req, res) => {
  let questions = [];
  if (dbType === 'mongodb') {
    questions = await db.collection('questions').find({}).toArray();
  } else {
    questions = getLocalData().questions || [];
  }
  return res.json(questions);
});

app.post('/api/questions', async (req, res) => {
  const q = { id: `q_${Date.now()}`, ...req.body, status: 'pending' };
  if (dbType === 'mongodb') {
    await db.collection('questions').insertOne(q);
  } else {
    const data = getLocalData();
    if (!data.questions) data.questions = [];
    data.questions.unshift(q);
    writeLocalData(data);
  }
  return res.json({ success: true, question: q, message: 'تم إرسال سؤالك للمعلم بنجاح!' });
});

app.post('/api/questions/:id/reply', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;
  if (dbType === 'mongodb') {
    await db.collection('questions').updateOne({ id }, { $set: { replyText, status: 'answered', repliedAt: 'الآن' } });
  } else {
    const data = getLocalData();
    const idx = (data.questions || []).findIndex(q => q.id === id);
    if (idx !== -1) {
      data.questions[idx] = { ...data.questions[idx], replyText, status: 'answered', repliedAt: 'الآن' };
      writeLocalData(data);
    }
  }
  return res.json({ success: true, message: 'تم إرسال الرد للطالب بنجاح!' });
});

app.get('/api/exams', async (req, res) => {
  let exams = [];
  if (dbType === 'mongodb') {
    exams = await db.collection('exams').find({}).toArray();
  } else {
    exams = getLocalData().exams || [];
  }
  return res.json(exams);
});

app.post('/api/exams', async (req, res) => {
  const exam = { id: `ex_${Date.now()}`, ...req.body, date: new Date().toLocaleDateString('ar-EG') };
  if (dbType === 'mongodb') {
    await db.collection('exams').insertOne(exam);
  } else {
    const data = getLocalData();
    if (!data.exams) data.exams = [];
    data.exams.unshift(exam);
    writeLocalData(data);
  }
  return res.json(exam);
});

// ═══ LIVE BROADCAST & VIRTUAL CLASSROOM API ═══

app.get('/api/live', async (req, res) => {
  try {
    const { grade } = req.query;
    let sessions = [];
    if (dbType === 'mongodb') {
      let query = {};
      if (grade && grade !== 'all') {
        query.$or = [{ grade: grade }, { grade: 'all' }];
      }
      sessions = await db.collection('liveSessions').find(query).sort({ scheduledAt: -1 }).toArray();
    } else {
      const data = getLocalData();
      sessions = (data.liveSessions || []).filter(s => {
        if (!grade || grade === 'all') return true;
        return s.grade === grade || s.grade === 'all';
      });
    }
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/live/active', async (req, res) => {
  try {
    const { grade } = req.query;
    let sessions = [];
    if (dbType === 'mongodb') {
      let query = { status: { $in: ['live', 'scheduled'] } };
      if (grade && grade !== 'all') {
        query.$and = [
          { status: { $in: ['live', 'scheduled'] } },
          { $or: [{ grade: grade }, { grade: 'all' }] }
        ];
      }
      sessions = await db.collection('liveSessions').find(query).toArray();
    } else {
      const data = getLocalData();
      sessions = (data.liveSessions || []).filter(s => {
        const isLiveOrSched = s.status === 'live' || s.status === 'scheduled';
        if (!isLiveOrSched) return false;
        if (!grade || grade === 'all') return true;
        return s.grade === grade || s.grade === 'all';
      });
    }
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/live/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let session = null;
    if (dbType === 'mongodb') {
      session = await db.collection('liveSessions').findOne({ id });
    } else {
      const data = getLocalData();
      session = (data.liveSessions || []).find(s => s.id === id);
    }
    if (!session) {
      return res.status(404).json({ error: 'حصة البث المباشر غير موجودة' });
    }
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live', requireAdmin, async (req, res) => {
  try {
    const { title, instructor, instructorId, subject, grade, gradeName, scheduledAt, description, streamType, streamUrl, thumbnail } = req.body;
    if (!title || !subject || !grade) {
      return res.status(400).json({ error: 'يرجى إدخال عنوان البث والمادة والصف الدراسي' });
    }
    const newSession = {
      id: `live_${Date.now()}`,
      title,
      instructor: instructor || 'المحاضر',
      instructorId: instructorId || 'eng_nour',
      subject,
      grade,
      gradeName: gradeName || (grade === '3sec' ? 'الصف الثالث الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الأول الثانوي'),
      status: 'scheduled',
      scheduledAt: scheduledAt || new Date().toISOString(),
      description: description || '',
      streamType: streamType || 'youtube_live',
      streamUrl: streamUrl || '',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800',
      viewersCount: 0,
      likesCount: 0,
      chatMessages: [],
      polls: [],
      handRaises: [],
      recordingUrl: null,
      createdAt: new Date().toISOString()
    };

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').insertOne(newSession);
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      data.liveSessions.unshift(newSession);
      writeLocalData(data);
    }

    return res.json({ success: true, session: newSession, message: 'تم جدولة البث المباشر بنجاح! 🔴' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/live/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, recordingUrl, streamUrl } = req.body;
    if (!['scheduled', 'live', 'ended'].includes(status)) {
      return res.status(400).json({ error: 'حالة البث غير صالحة' });
    }

    const updateFields = { status };
    if (recordingUrl !== undefined) updateFields.recordingUrl = recordingUrl;
    if (streamUrl !== undefined) updateFields.streamUrl = streamUrl;

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne({ id }, { $set: updateFields });
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        data.liveSessions[idx] = { ...data.liveSessions[idx], ...updateFields };
        writeLocalData(data);
      }
    }

    return res.json({ success: true, message: `تم تحديث حالة البث إلى (${status === 'live' ? 'مباشر الآن 🔴' : status === 'ended' ? 'منتهي' : 'مجدول'}) بنجاح` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/live/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (dbType === 'mongodb') {
      await db.collection('liveSessions').deleteOne({ id });
    } else {
      const data = getLocalData();
      if (data.liveSessions) {
        data.liveSessions = data.liveSessions.filter(s => s.id !== id);
        writeLocalData(data);
      }
    }
    return res.json({ success: true, message: 'تم حذف حصة البث المباشر' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live/:id/notify', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { customMessage } = req.body;

    let session = null;
    let students = [];

    if (dbType === 'mongodb') {
      session = await db.collection('liveSessions').findOne({ id });
      const studentQuery = session && session.grade !== 'all' ? { grade: session.grade } : {};
      students = await db.collection('students').find(studentQuery).toArray();
    } else {
      const data = getLocalData();
      session = (data.liveSessions || []).find(s => s.id === id);
      students = (data.students || []).filter(st => {
        if (!session || session.grade === 'all') return true;
        return st.grade === session.grade;
      });
    }

    if (!session) {
      return res.status(404).json({ error: 'حصة البث غير موجودة' });
    }

    const newNotif = {
      id: `n_${Date.now()}`,
      title: `🔴 بث مباشر: ${session.title}`,
      body: customMessage || `المستر بدأ حصة البث المباشر الآن! اضغط هنا للانضمام فوراً وتفاعل مع الشرح.`,
      time: 'الآن',
      unread: true,
      actionTab: 'live',
      actionId: session.id
    };

    if (dbType === 'mongodb') {
      await db.collection('notifications').insertOne(newNotif);
    } else {
      const data = getLocalData();
      if (!data.notifications) data.notifications = [];
      data.notifications.unshift(newNotif);
      writeLocalData(data);
    }

    const whatsappLinks = students.map(st => {
      const studentName = st.name || 'طالبنا العزيز';
      const phone = st.phone || st.parentPhone;
      const cleanPhone = normalizePhone(phone);
      const joinUrl = `https://elbashmohands.dev/?live=${session.id}`;
      const textMsg = encodeURIComponent(
        `أهلاً يا ${studentName} 👋\n\n` +
        `🔴 *حصة بث مباشر هامة الآن على منصة عِلم*\n` +
        `📖 *العنوان:* ${session.title}\n` +
        `👨‍🏫 *المحاضر:* ${session.instructor}\n` +
        `📚 *المادة:* ${session.subject}\n\n` +
        `🚀 *اضغط على الرابط التالي للدخول فوراً والمشاركة في الشرح والشات التفاعلي:*\n` +
        `${joinUrl}\n\n` +
        `بالتوفيق والتفوق دائماً! ✨`
      );
      const whatsappUrl = `https://wa.me/2${cleanPhone}?text=${textMsg}`;
      return {
        studentId: st.id,
        studentName,
        studentCode: st.code,
        phone: cleanPhone,
        whatsappUrl
      };
    });

    return res.json({
      success: true,
      message: `تم إرسال الإشعار وتوليد ${whatsappLinks.length} رابط واتساب للطلاب المسجلين بالصف بنجاح! 🚀`,
      inAppNotification: newNotif,
      studentsCount: students.length,
      whatsappLinks
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { senderName, senderRole, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'نص الرسالة فارغ' });
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderName: senderName || 'طالب',
      senderRole: senderRole || 'student',
      text: text.trim(),
      timestamp: 'الآن',
      isPinned: false
    };

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne({ id }, { $push: { chatMessages: message } });
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        if (!data.liveSessions[idx].chatMessages) data.liveSessions[idx].chatMessages = [];
        data.liveSessions[idx].chatMessages.push(message);
        writeLocalData(data);
      }
    }

    return res.json({ success: true, message });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live/:id/poll', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctIndex } = req.body;
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'يرجى إدخال السؤال وخيارين على الأقل' });
    }

    const poll = {
      id: `poll_${Date.now()}`,
      question,
      options,
      correctIndex: correctIndex !== undefined ? correctIndex : null,
      votes: {},
      totalVotes: 0,
      isActive: true,
      createdAt: 'الآن'
    };

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne(
        { id }, 
        { 
          $set: { "polls.$[].isActive": false },
          $push: { polls: poll }
        }
      );
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        if (!data.liveSessions[idx].polls) data.liveSessions[idx].polls = [];
        data.liveSessions[idx].polls.forEach(p => p.isActive = false);
        data.liveSessions[idx].polls.push(poll);
        writeLocalData(data);
      }
    }

    return res.json({ success: true, poll, message: 'تم إطلاق السؤال التفاعلي على شاشة الطلاب الآن! 🎯' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live/:id/poll/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { pollId, optionIndex } = req.body;

    if (dbType === 'mongodb') {
      const session = await db.collection('liveSessions').findOne({ id });
      if (session && session.polls) {
        const poll = session.polls.find(p => p.id === pollId);
        if (poll && poll.isActive) {
          const votes = poll.votes || {};
          votes[optionIndex] = (votes[optionIndex] || 0) + 1;
          const totalVotes = (poll.totalVotes || 0) + 1;
          await db.collection('liveSessions').updateOne(
            { id, "polls.id": pollId },
            { $set: { "polls.$.votes": votes, "polls.$.totalVotes": totalVotes } }
          );
        }
      }
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const sIdx = data.liveSessions.findIndex(s => s.id === id);
      if (sIdx !== -1 && data.liveSessions[sIdx].polls) {
        const pIdx = data.liveSessions[sIdx].polls.findIndex(p => p.id === pollId);
        if (pIdx !== -1 && data.liveSessions[sIdx].polls[pIdx].isActive) {
          const poll = data.liveSessions[sIdx].polls[pIdx];
          if (!poll.votes) poll.votes = {};
          poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
          poll.totalVotes = (poll.totalVotes || 0) + 1;
          writeLocalData(data);
        }
      }
    }

    return res.json({ success: true, message: 'تم تسجيل إجابتك بنجاح! 👏' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/live/:id/hand-raise', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, studentCode } = req.body;

    const hr = {
      id: `hr_${Date.now()}`,
      studentId: studentId || 'std_anon',
      studentName: studentName || 'طالب',
      studentCode: studentCode || '',
      requestedAt: 'الآن',
      status: 'pending'
    };

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne({ id }, { $push: { handRaises: hr } });
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        if (!data.liveSessions[idx].handRaises) data.liveSessions[idx].handRaises = [];
        data.liveSessions[idx].handRaises.push(hr);
        writeLocalData(data);
      }
    }

    return res.json({ success: true, message: 'تم إرسال طلب المداخلة للمعلم بنجاح! ✋' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode.`);
  });
});
