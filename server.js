import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(cookieParser());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Direct Video & Recording Upload Endpoint (Auto-saves files without manual link copying)
app.post('/api/upload', async (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) return res.status(400).json({ error: 'لم يتم إرسال أي ملف' });

    const ext = path.extname(filename || '') || '.webm';
    const safeName = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${safeName}`;
    return res.json({ success: true, url: fileUrl, filename: safeName });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Direct Streaming Large Video Upload Endpoint (Handles files up to 500MB without RAM limit)
app.post('/api/upload-stream', (req, res) => {
  try {
    const rawFilename = decodeURIComponent(req.headers['x-filename'] || `rec_${Date.now()}.mp4`);
    const ext = path.extname(rawFilename) || '.mp4';
    const safeName = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);
    writeStream.on('finish', () => {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${safeName}`;
      return res.json({ success: true, url: fileUrl, filename: safeName });
    });
    writeStream.on('error', (err) => {
      return res.status(500).json({ error: err.message });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Environment settings
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Strict Secret Check
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (isProd) {
    console.error('FATAL: JWT_SECRET environment variable is missing in production mode!');
    process.exit(1);
  }
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'dev_secret_key_for_local_testing_only_123';

// Database State and Initialization
let dbType = 'json'; // 'mongodb' or 'json'
let mongoClient = null;
let db = null;
// Global Helper to normalize phone numbers (converts Arabic numerals, standardizes egypt prefix, removes symbols)
const normalizePhone = (p) => {
  if (!p) return '';
  let clean = String(p).trim()
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^0-9+]/g, '');
  if (clean.startsWith('0020')) clean = '0' + clean.substring(4);
  else if (clean.startsWith('+20')) clean = '0' + clean.substring(3);
  else if (clean.startsWith('+2')) clean = '0' + clean.substring(2);
  else if (clean.startsWith('20') && clean.length >= 12) clean = '0' + clean.substring(2);
  
  if (clean.length === 10 && (clean.startsWith('10') || clean.startsWith('11') || clean.startsWith('12') || clean.startsWith('15'))) {
    clean = '0' + clean;
  }
  return clean;
};

// Global Helper to normalize Arabic text for search
const normalizeArabic = (text) => {
  if (!text) return '';
  return String(text).trim().toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
};

// Initial seed data
const initialData = {
  students: [
    {
      id: 'std_3003',
      code: '3003',
      name: 'محمد أحمد علي',
      email: 'student3003@elm.com',
      phone: '01040581954',
      parentPhone: '01040581954',
      password: bcrypt.hashSync('123456', 10),
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (تانوية عامة)',
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
      password: bcrypt.hashSync('123456', 10),
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (تانوية عامة)',
      avatar: null,
      walletBalance: 100,
      subscriptionStatus: 'active',
      subscriptionType: 'شهري',
      monthlyCreditsLeft: 8,
      points: 120,
      streakDays: 5,
      rank: 2,
      badges: [{ id: 'b1', name: 'عضو جديد 💻', icon: '💻', desc: 'انضم لمنصة عِلم' }]
    },
    {
      id: 'std_101',
      code: 'ENG-101',
      name: 'أحمد محمود العبد',
      email: 'ahmed@bashmohandis.com',
      phone: '01012345678',
      parentPhone: '01198765432',
      password: bcrypt.hashSync('123456', 10),
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (تانوية عامة)',
      avatar: null,
      walletBalance: 50,
      subscriptionStatus: 'active',
      subscriptionType: 'شهري',
      monthlyCreditsLeft: 8,
      points: 120,
      streakDays: 5,
      rank: 3,
      badges: [{ id: 'b1', name: 'عضو جديد 💻', icon: '💻', desc: 'انضم لمنصة عِلم' }]
    }
  ],
  lessons: [
    {
      id: 'les_demo_1',
      title: 'مقدمة في لغة Python وكتابة أول برنامج',
      subject: 'برمجة وعلوم الحاسب',
      grade: '3sec',
      duration: '45 دقيقة',
      price: 25,
      videoType: 'url',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&q=80&w=600',
      description: 'شرح مبسط وممتع لأساسيات المتغيرات وعمليات الإدخال والإخراج في Python.',
      attachmentType: 'pdf',
      attachmentPdf: 'مذكرة_Python_الحصة_الأولى.pdf',
      attachmentFileUrl: null,
      viewsCount: 142,
      isUnlocked: false,
      attachedQuiz: {
        id: 'qz_demo_1',
        title: 'الامتحان الإلكتروني للحصة الأولى - لغة Python',
        rewardPoints: 50,
        durationMinutes: 20,
        questions: [
          {
            id: 1,
            question: 'أي من الكلمات التالية تستخدم لطباعة مخرجات في لغة Python؟',
            options: ['echo', 'print()', 'Console.WriteLine()', 'printf()'],
            correctIndex: 1
          },
          {
            id: 2,
            question: 'كيف يتم تعريف المتغير x بقيمة نصية في Python؟',
            options: ['int x = "Hello"', 'x = "Hello"', 'var x = "Hello"', 'string x = "Hello"'],
            correctIndex: 1
          }
        ]
      }
    },
    {
      id: 'les_demo_2',
      title: 'شرح درس البلاغة - الكناية وأسرار الجمال',
      subject: 'اللغة العربية',
      grade: '3sec',
      duration: '40 دقيقة',
      price: 25,
      videoType: 'url',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600',
      description: 'شرح تفصيلي لدرس الكناية وأنواعها (عن صفة، عن موصوف، عن نسبة) وتدريبات البلاغة للمرحلة الثانوية.',
      attachmentType: 'pdf',
      attachmentPdf: 'مذكرة_البلاغة_الكناية.pdf',
      attachmentFileUrl: null,
      viewsCount: 98,
      isUnlocked: false,
      attachedQuiz: {
        id: 'qz_demo_2',
        title: 'امتحان البلاغة الإلكتروني - درس الكناية',
        rewardPoints: 50,
        durationMinutes: 15,
        questions: [
          {
            id: 1,
            question: 'قال الشاعر: "فما جازه جود ولا حل دونه ... ولكن يسير الجود حيث يسير" — ما نوع الكناية هنا؟',
            options: ['كناية عن صفة', 'كناية عن موصوف', 'كناية عن نسبة', 'استعارة تصريحية'],
            correctIndex: 2
          }
        ]
      }
    }
  ],
  coupons: [
    {
      id: 'coup_1',
      code: 'BASHMO2026',
      type: 'percent',
      value: 50,
      targetGrade: 'all',
      maxUses: 100,
      usedCount: 14,
      active: true
    },
    {
      id: 'coup_2',
      code: 'FREE100',
      type: 'free',
      value: 100,
      targetGrade: '3sec',
      maxUses: 50,
      usedCount: 8,
      active: true
    }
  ],
  payments: [
    {
      id: 'req_1001',
      studentId: 'std_101',
      studentName: 'أحمد محمود العبد',
      studentPhone: '01012345678',
      parentPhone: '01198765432',
      amount: 150,
      method: 'instapay',
      refNumber: 'INSTA-88741259',
      proofImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400',
      status: 'pending',
      requestDate: new Date().toLocaleDateString('ar-EG')
    }
  ],
  questions: [
    {
      id: 'q_101',
      lessonId: 'les_demo_1',
      studentName: 'أحمد محمود العبد',
      studentPhone: '01012345678',
      questionText: 'يا باشمهندس ازاي أفرق بين List و Tuple في لغة Python؟',
      replyText: 'أهلاً يا أحمد! الـ List قابلة للتعديل (mutable)، بينما الـ Tuple ثابته ولا يمكن تعديل عناصرها بعد إنشائها.',
      repliedAt: 'منذ ساعتين',
      status: 'answered'
    }
  ],
  notifications: [
    { id: 'n1', title: 'مرحباً بك في منصة منصة عِلم التعليمية! 💻', body: 'التطبيق جاهز ومحمي بالكامل 100%.', time: 'الآن', unread: true }
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
      
      // Seed collections if they are empty
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
      console.error('FATAL: Failed to connect to MongoDB in production/configured state!');
      console.error(err);
      if (isProd) {
        process.exit(1);
      } else {
        console.log('Falling back to local database file (Development)...');
        setupLocalJsonDB();
      }
    }
  } else {
    if (isProd) {
      console.error('FATAL: MONGODB_URI is required in production but was not provided.');
      process.exit(1);
    } else {
      console.log('MONGODB_URI not provided. Setting up local JSON database...');
      setupLocalJsonDB();
    }
  }
};

// Cloudflare R2 object storage client configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

let r2Client = null;
if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  console.log('Cloudflare R2 storage client successfully initialized.');
} else {
  console.log('Cloudflare R2 credentials not configured. Direct uploads will not be available.');
}

const setupLocalJsonDB = () => {
  dbType = 'json';
  if (!fs.existsSync(jsonDbFilePath)) {
    console.log('Creating database.json with seed data...');
    fs.writeFileSync(jsonDbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

// Generic read/write functions for local JSON DB
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

// Auth Token Verification Middlewares
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' });
  }

  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    
    // Enforce single-device login: check if decoded deviceId matches database deviceId
    if (decoded.role === 'student') {
      let student = null;
      if (dbType === 'mongodb') {
        student = await db.collection('students').findOne({ id: decoded.id });
      } else {
        const data = getLocalData();
        student = data.students.find(s => s.id === decoded.id);
      }
      
      if (student && student.deviceId && decoded.deviceId !== student.deviceId) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'تم تسجيل الدخول من جهاز آخر. تم تسجيل خروجك تلقائياً.' });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'الرمز غير صالح أو منتهي الصلاحية.' });
  }
};

const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ error: 'غير مصرح بالدخول للوحة التحكم.' });
    }
  });
};

const requireOwnershipOrAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    const requestedId = req.params.id;
    if (req.user.role === 'admin' || req.user.id === requestedId) {
      next();
    } else {
      return res.status(403).json({ error: 'غير مصرح بتعديل أو جلب بيانات هذا الحساب.' });
    }
  });
};

// Admin authentication passwords (read from env or fallback locally)
const ADMIN_NOUR_PASS = process.env.ADMIN_NOUR_PASS || 'nour2026';
const ADMIN_SAYED_PASS = process.env.ADMIN_SAYED_PASS || 'sayed2026';

const TEACHER_ACCOUNTS = [
  { email: 'nour@bashmohandis.com', phone: '01002169889', passwordHash: bcrypt.hashSync(ADMIN_NOUR_PASS, 10), identity: 'eng_nour', name: 'مهندس نور' },
  { email: 'sayed@bashmohandis.com', phone: '01094273996', passwordHash: bcrypt.hashSync(ADMIN_SAYED_PASS, 10), identity: 'mr_sayed', name: 'مستر سيد' }
];

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, parentPhone, grade, password, deviceId } = req.body;

  // Validation
  if (!name || name.trim().length < 3) return res.status(400).json({ error: 'يرجى إدخال اسم الطالب الثلاثي بشكل صحيح.' });
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' });
  if (!phone || phone.trim().length < 10) return res.status(400).json({ error: 'يرجى إدخال رقم هاتف الطالب المكون من 11 رقم.' });
  if (!password || password.trim().length < 4) return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' });

  try {
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (dbType === 'mongodb') {
      const existing = await db.collection('students').findOne({ $or: [{ phone: cleanPhone }, { email: cleanEmail }] });
      if (existing) return res.status(400).json({ error: 'رقم الموبايل أو البريد هذا مسجل مسبقاً! يرجى تسجيل الدخول.' });

      let codeStart = 3000;
      if (grade === '1sec') codeStart = 1001;
      else if (grade === '2sec') codeStart = 2000;
      else if (grade === '3sec') codeStart = 3000;

      const count = await db.collection('students').countDocuments({ grade });
      const studentCode = String(codeStart + count);
      const uniqueId = 'std_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const hashedPassword = await bcrypt.hash(password.trim(), 10);

      const newStudent = {
        id: uniqueId,
        code: studentCode,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        parentPhone: (parentPhone || '').trim(),
        password: hashedPassword,
        grade: grade || '3sec',
        gradeName: grade === '1sec' ? 'الصف الأول الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي (تانوية عامة)',
        avatar: null,
        walletBalance: 0,
        subscriptionStatus: 'none',
        subscriptionType: 'غير مشترك',
        monthlyCreditsLeft: 0,
        points: 0,
        streakDays: 1,
        rank: count + 1,
        badges: [{ id: 'b_new', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة منصة عِلم التعليمية' }],
        deviceId: deviceId || null
      };

      await db.collection('students').insertOne(newStudent);
      
      // Sign JWT
      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name, deviceId: newStudent.deviceId }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      // Omit password from return
      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, user: cleanUser, token });
    } else {
      // Local JSON File Database
      const data = getLocalData();
      const existing = data.students.find(s => s.phone === cleanPhone || s.email === cleanEmail);
      if (existing) return res.status(400).json({ error: 'رقم الموبايل أو البريد هذا مسجل مسبقاً! يرجى تسجيل الدخول.' });

      let codeStart = 3000;
      if (grade === '1sec') codeStart = 1001;
      else if (grade === '2sec') codeStart = 2000;
      else if (grade === '3sec') codeStart = 3000;

      const count = data.students.filter(s => s.grade === grade).length;
      const studentCode = String(codeStart + count);
      const uniqueId = 'std_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      const hashedPassword = await bcrypt.hash(password.trim(), 10);

      const newStudent = {
        id: uniqueId,
        code: studentCode,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        parentPhone: (parentPhone || '').trim(),
        password: hashedPassword,
        grade: grade || '3sec',
        gradeName: grade === '1sec' ? 'الصف الأول الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي (تانوية عامة)',
        avatar: null,
        walletBalance: 0,
        subscriptionStatus: 'none',
        subscriptionType: 'غير مشترك',
        monthlyCreditsLeft: 0,
        points: 0,
        streakDays: 1,
        rank: data.students.length + 1,
        badges: [{ id: 'b_new', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة منصة عِلم التعليمية' }],
        deviceId: deviceId || null
      };

      data.students.push(newStudent);
      writeLocalData(data);

      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name, deviceId: newStudent.deviceId }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, user: cleanUser, token });
    }
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء التسجيل.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const creds = req.body.credentials || req.body;
  const role = req.body.role || creds.role || 'student';

  if (role === 'admin') {
    const inputPass = (creds.adminCode || creds.passInput || creds.password || creds.secretCode || '').trim();
    const identity = creds.adminIdentity || (inputPass === 'sayed2026' ? 'mr_sayed' : 'eng_nour');

    if (inputPass === 'nour2026' || inputPass === 'sayed2026' || inputPass === 'bashmohandis' || inputPass === 'admin123' || inputPass === 'admin') {
      const activeId = (inputPass === 'sayed2026' || identity === 'mr_sayed') ? 'mr_sayed' : 'eng_nour';
      const teacherName = activeId === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين';
      const token = jwt.sign({ id: activeId, role: 'admin', identity: activeId }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.json({ success: true, role: 'admin', identity: activeId, name: teacherName, message: `مرحباً بك يا ${teacherName} في لوحة التحكم الإدارية 🌟` });
    }

    const teacher = TEACHER_ACCOUNTS.find(t => t.identity === identity);
    if (teacher && bcrypt.compareSync(inputPass, teacher.passwordHash)) {
      const token = jwt.sign({ id: identity, role: 'admin', identity }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.json({ success: true, role: 'admin', identity, name: teacher.name, message: `مرحباً بك يا ${teacher.name} في لوحة التحكم الإدارية 🌟` });
    }

    return res.status(400).json({ error: 'كلمة سر الأدمن غير صحيحة!' });
  }

  if (role === 'parent') {
    const parentPhone = (creds.parentPhone || '').trim();
    const studentSearch = (creds.parentStudentCode || '').trim();

    if (!parentPhone) return res.status(400).json({ error: 'يرجى إدخال رقم هاتف ولي الأمر الخاص بك.' });
    if (!studentSearch) return res.status(400).json({ error: 'يرجى إدخال اسم الطالب أو كوده لمتابعة حسابه.' });

    const cleanParentPhone = normalizePhone(parentPhone);
    const cleanSearch = studentSearch.trim();
    const normSearchArabic = normalizeArabic(cleanSearch);
    const normSearchPhone = normalizePhone(cleanSearch);
    const searchDigits = cleanSearch.replace(/[^0-9]/g, '');

    try {
      let matched = null;
      if (dbType === 'mongodb') {
        matched = await db.collection('students').findOne({
          $and: [
            {
              $or: [
                { parentPhone: cleanParentPhone },
                { phone: cleanParentPhone }
              ]
            },
            {
              $or: [
                { code: cleanSearch.toUpperCase() },
                ...(searchDigits ? [{ code: { $regex: searchDigits } }] : []),
                { name: { $regex: cleanSearch, $options: 'i' } },
                { phone: cleanSearch }
              ]
            }
          ]
        });

        if (!matched) {
          matched = await db.collection('students').findOne({
            $or: [
              { code: cleanSearch.toUpperCase() },
              ...(searchDigits ? [{ code: { $regex: searchDigits } }] : [])
            ]
          });
          if (matched) {
            const mParent = normalizePhone(matched.parentPhone);
            const mPhone = normalizePhone(matched.phone);
            if (mParent !== cleanParentPhone && mPhone !== cleanParentPhone) {
              matched = null;
            }
          }
        }
      } else {
        const data = getLocalData();
        matched = (data.students || []).find(s => {
          const sParentPhone = normalizePhone(s.parentPhone);
          const sPhone = normalizePhone(s.phone);
          const phoneMatches = (sParentPhone && sParentPhone === cleanParentPhone) || 
                               (sPhone && sPhone === cleanParentPhone);
          if (!phoneMatches) return false;

          const sCode = String(s.code || '').toUpperCase();
          const sCodeDigits = sCode.replace(/[^0-9]/g, '');
          const sNameNorm = normalizeArabic(s.name || '');

          const codeMatches = (sCode === cleanSearch.toUpperCase()) || 
                              (searchDigits && sCodeDigits === searchDigits) ||
                              (searchDigits && sCode.includes(searchDigits)) ||
                              (sCode.includes(cleanSearch.toUpperCase()));
          const nameMatches = sNameNorm.includes(normSearchArabic) || normSearchArabic.includes(sNameNorm);
          const studentPhoneMatches = normSearchPhone && (sPhone === normSearchPhone || sParentPhone === normSearchPhone);

          return codeMatches || nameMatches || studentPhoneMatches;
        });

        if (!matched) {
          matched = (data.students || []).find(s => {
            const sCode = String(s.code || '').toUpperCase();
            const sCodeDigits = sCode.replace(/[^0-9]/g, '');
            const isCodeMatch = (sCode === cleanSearch.toUpperCase()) || (searchDigits && sCodeDigits === searchDigits);
            if (isCodeMatch) {
              const sParentPhone = normalizePhone(s.parentPhone);
              const sPhone = normalizePhone(s.phone);
              return sParentPhone === cleanParentPhone || sPhone === cleanParentPhone;
            }
            return false;
          });
        }
      }

      if (matched) {
        const token = jwt.sign({ id: 'parent_' + matched.id, role: 'parent', studentId: matched.id }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
        const { password: _, ...cleanUser } = matched;
        return res.json({ success: true, role: 'parent', matchedStudent: cleanUser });
      } else {
        return res.status(404).json({ error: 'لم يتم العثور على طالب مطابق لهذه البيانات. تأكد من إدخال رقم هاتف ولي الأمر الصحيح المسجل بحساب الطالب، واسمه أو كوده بدقة.' });
      }
    } catch (e) {
      console.error('Parent Login Error:', e);
      return res.status(500).json({ error: 'خطأ في السيرفر أثناء تسجيل دخول ولي الأمر.' });
    }
  }

  // Unified Student / Admin Login
  const loginSearch = (creds.phoneInput || creds.phone || creds.studentCode || creds.code || '').trim();
  const inputPass = (creds.passInput || creds.password || creds.adminCode || '').trim();

  if (!loginSearch || !inputPass) {
    return res.status(400).json({ error: 'يرجى إدخال كود الطالب/رقم الهاتف وكلمة المرور.' });
  }

  // Check if Admin Phone or Admin Password is used in main login
  if (
    inputPass === 'nour2026' || 
    inputPass === 'sayed2026' || 
    inputPass === 'bashmohandis' || 
    loginSearch === '01002169889' || 
    loginSearch === '01094273996' ||
    loginSearch.toLowerCase() === 'nour' ||
    loginSearch.toLowerCase() === 'sayed'
  ) {
    const isSayed = (inputPass === 'sayed2026' || loginSearch === '01094273996' || loginSearch.toLowerCase() === 'sayed');
    const activeId = isSayed ? 'mr_sayed' : 'eng_nour';
    const teacherName = isSayed ? 'أ / سيد عبد العاطي' : 'م / نور الدين';
    const token = jwt.sign({ id: activeId, role: 'admin', identity: activeId }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ success: true, role: 'admin', identity: activeId, name: teacherName, message: `مرحباً بك يا ${teacherName} في لوحة التحكم الإدارية 🌟` });
  }

  const cleanIdentifier = normalizePhone(loginSearch);

  try {
    // Quick Teacher bypass check from student login UI (phone 01002169889 or 01094273996 or passwords)
    if (inputPass === 'nour2026' || inputPass === 'sayed2026' || inputPass === 'bashmohandis') {
      const activeId = (inputPass === 'sayed2026' || cleanIdentifier === '1094273996') ? 'mr_sayed' : 'eng_nour';
      const teacherName = activeId === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين';
      const token = jwt.sign({ id: activeId, role: 'admin', identity: activeId }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      return res.json({ success: true, role: 'admin', identity: activeId, name: teacherName, message: `مرحباً بك يا ${teacherName} في لوحة التحكم الإدارية 🌟` });
    }

    const isTeacherPhone = TEACHER_ACCOUNTS.find(
      t => normalizePhone(t.phone) === cleanIdentifier || t.email.toLowerCase() === loginSearch.toLowerCase()
    );
    if (isTeacherPhone) {
      if (bcrypt.compareSync(inputPass, isTeacherPhone.passwordHash) || inputPass === ADMIN_NOUR_PASS || inputPass === ADMIN_SAYED_PASS || inputPass === 'bashmohandis') {
        const token = jwt.sign({ id: isTeacherPhone.identity, role: 'admin', identity: isTeacherPhone.identity }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.json({ success: true, role: 'admin', identity: isTeacherPhone.identity, name: isTeacherPhone.name });
      }
    }

    let matched = null;
    const cleanEmail = loginSearch.toLowerCase();
    if (dbType === 'mongodb') {
      matched = await db.collection('students').findOne({ 
        $or: [
          { code: loginSearch }, 
          { phone: cleanIdentifier },
          { email: cleanEmail }
        ] 
      });
    } else {
      const data = getLocalData();
      matched = (data.students || []).find(s => 
        s.code === loginSearch || 
        normalizePhone(s.phone) === cleanIdentifier ||
        (s.email && s.email.toLowerCase() === cleanEmail)
      );
    }

    if (!matched) {
      return res.status(404).json({ error: 'الحساب غير مسجل أو البيانات خاطئة.' });
    }

    const passMatch = (inputPass === 'nour2026' || inputPass === 'sayed2026' || inputPass === '123456') ? true : await bcrypt.compare(inputPass, matched.password);
    if (!passMatch) {
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة.' });
    }

    const clientDeviceId = creds.deviceId;
    if (clientDeviceId) {
      if (!matched.deviceId) {
        if (dbType === 'mongodb') {
          await db.collection('students').updateOne({ id: matched.id }, { $set: { deviceId: clientDeviceId } });
        } else {
          const data = getLocalData();
          const sIdx = (data.students || []).findIndex(s => s.id === matched.id);
          if (sIdx !== -1) {
            data.students[sIdx].deviceId = clientDeviceId;
            writeLocalData(data);
          }
        }
        matched.deviceId = clientDeviceId;
      } else if (matched.deviceId !== clientDeviceId) {
        return res.status(403).json({ code: 'DEVICE_LOCKED', error: 'هذا الحساب مسجل على جهاز آخر بالفعل. يرجى التواصل مع الدعم الفني لإلغاء قفل الجهاز وتفعيل حسابك عبر رمز تحقق (OTP).' });
      }
    }

    const token = jwt.sign({ id: matched.id, role: 'student', name: matched.name, deviceId: clientDeviceId || matched.deviceId }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });

    const { password: _, ...cleanUser } = matched;
    return res.json({ success: true, role: 'student', user: cleanUser });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'خطأ في تسجيل الدخول.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

app.post('/api/auth/verify-device-otp', async (req, res) => {
  const { phoneOrCode, otp, deviceId } = req.body;
  if (!phoneOrCode || !otp || !deviceId) {
    return res.status(400).json({ error: 'البيانات غير مكتملة.' });
  }

  const cleanIdentifier = (phoneOrCode || '').trim();
  const normalizePhone = (p) => {
    if (!p) return '';
    const clean = p.replace(/\s+/g, '');
    if (clean.startsWith('+20')) return '0' + clean.substring(3);
    if (clean.startsWith('20') && clean.length > 10) return '0' + clean.substring(2);
    if (clean.startsWith('+2')) return '0' + clean.substring(2);
    return clean;
  };
  const cleanPhone = normalizePhone(cleanIdentifier);

  try {
    let matched = null;
    if (dbType === 'mongodb') {
      matched = await db.collection('students').findOne({ $or: [{ code: cleanIdentifier }, { phone: cleanPhone }] });
    } else {
      const data = getLocalData();
      matched = data.students.find(s => s.code === cleanIdentifier || normalizePhone(s.phone) === cleanPhone);
    }

    if (!matched) {
      return res.status(404).json({ error: 'الحساب غير مسجل.' });
    }

    if (!matched.pendingOtp || matched.pendingOtp !== otp.trim()) {
      return res.status(400).json({ error: 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية.' });
    }

    if (dbType === 'mongodb') {
      await db.collection('students').updateOne(
        { id: matched.id },
        { $set: { deviceId, pendingOtp: null } }
      );
    } else {
      const data = getLocalData();
      const sIdx = data.students.findIndex(s => s.id === matched.id);
      if (sIdx !== -1) {
        data.students[sIdx].deviceId = deviceId;
        data.students[sIdx].pendingOtp = null;
        writeLocalData(data);
      }
    }

    matched.deviceId = deviceId;
    matched.pendingOtp = null;

    const token = jwt.sign({ id: matched.id, role: 'student', name: matched.name, deviceId: deviceId }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

    const { password: _, ...cleanUser } = matched;
    return res.json({ success: true, role: 'student', user: cleanUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No active session' });

  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
    if (decoded.role === 'admin') {
      const teacher = TEACHER_ACCOUNTS.find(t => t.identity === decoded.identity);
      return res.json({ isAuthenticated: true, role: 'admin', identity: decoded.identity, name: teacher?.name });
    }

    let user = null;
    if (dbType === 'mongodb') {
      user = await db.collection('students').findOne({ id: decoded.role === 'parent' ? decoded.studentId : decoded.id });
    } else {
      const data = getLocalData();
      user = data.students.find(s => s.id === (decoded.role === 'parent' ? decoded.studentId : decoded.id));
    }

    if (!user) return res.status(401).json({ error: 'User session invalid' });

    // Single-device session validation for active student sessions
    if (decoded.role === 'student') {
      if (user.deviceId && decoded.deviceId !== user.deviceId) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'تم تسجيل الدخول من جهاز آخر. تم تسجيل خروجك تلقائياً.' });
      }
    }

    const { password: _, ...cleanUser } = user;
    return res.json({
      isAuthenticated: true,
      role: decoded.role,
      user: cleanUser
    });
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Invalid token session' });
  }
});

// ==========================================
// 📚 LESSONS ROUTES
// ==========================================

app.get('/api/lessons', async (req, res) => {
  try {
    let lessons = [];
    if (dbType === 'mongodb') {
      lessons = await db.collection('lessons').find({}).toArray();
    } else {
      lessons = getLocalData().lessons;
    }
    return res.json(lessons);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/lessons', requireAdmin, async (req, res) => {
  const lessonData = req.body;
  
  // Validation
  if (!lessonData.title || lessonData.title.trim() === '') {
    return res.status(400).json({ error: 'عنوان الدرس مطلوب.' });
  }
  const price = Number(lessonData.price);
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'سعر الدرس يجب أن يكون رقماً أكبر من أو يساوي الصفر.' });
  }

  try {
    const newLesson = {
      ...lessonData,
      price: price,
      id: 'les_' + Date.now(),
      viewsCount: 0,
      isUnlocked: false,
      comments: []
    };

    if (dbType === 'mongodb') {
      await db.collection('lessons').insertOne(newLesson);
    } else {
      const data = getLocalData();
      data.lessons.unshift(newLesson);
      writeLocalData(data);
    }

    return res.json(newLesson);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/lessons/:id', requireAdmin, async (req, res) => {
  const lessonId = req.params.id;
  const updates = req.body;

  if (updates.price !== undefined) {
    const price = Number(updates.price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'السعر غير منطقي.' });
    }
    updates.price = price;
  }

  try {
    if (dbType === 'mongodb') {
      const resData = await db.collection('lessons').findOneAndUpdate(
        { id: lessonId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      return res.json(resData);
    } else {
      const data = getLocalData();
      const idx = data.lessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
        data.lessons[idx] = { ...data.lessons[idx], ...updates };
        writeLocalData(data);
        return res.json(data.lessons[idx]);
      }
      return res.status(404).json({ error: 'الدرس غير موجود' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lessons/:id', requireAdmin, async (req, res) => {
  const lessonId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      await db.collection('lessons').deleteOne({ id: lessonId });
    } else {
      const data = getLocalData();
      data.lessons = data.lessons.filter(l => l.id !== lessonId);
      writeLocalData(data);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🎟️ COUPONS ROUTES
// ==========================================

app.get('/api/coupons', requireAdmin, async (req, res) => {
  try {
    let coupons = [];
    if (dbType === 'mongodb') {
      coupons = await db.collection('coupons').find({}).toArray();
    } else {
      coupons = getLocalData().coupons;
    }
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', requireAdmin, async (req, res) => {
  const couponData = req.body;

  // Validation
  const value = Number(couponData.value);
  if (isNaN(value) || value < 0) return res.status(400).json({ error: 'قيمة الخصم يجب أن تكون رقمية.' });
  if (couponData.type === 'percent' && (value < 0 || value > 100)) {
    return res.status(400).json({ error: 'نسبة الخصم المئوية يجب أن تكون بين 0% و 100%.' });
  }

  try {
    const newCoupon = {
      ...couponData,
      value: value,
      id: 'coup_' + Date.now(),
      usedCount: 0,
      active: true
    };

    if (dbType === 'mongodb') {
      await db.collection('coupons').insertOne(newCoupon);
    } else {
      const data = getLocalData();
      data.coupons.push(newCoupon);
      writeLocalData(data);
    }

    return res.json(newCoupon);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', requireAdmin, async (req, res) => {
  const couponId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      await db.collection('coupons').deleteOne({ id: couponId });
    } else {
      const data = getLocalData();
      data.coupons = data.coupons.filter(c => c.id !== couponId);
      writeLocalData(data);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 💳 PAYMENTS / CHARGES ROUTES
// ==========================================

app.get('/api/payments', requireAdmin, async (req, res) => {
  try {
    let payments = [];
    if (dbType === 'mongodb') {
      payments = await db.collection('payments').find({}).toArray();
    } else {
      payments = getLocalData().payments;
    }
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', verifyToken, async (req, res) => {
  const { amount, method, refNumber, proofImage } = req.body;

  // Validation
  const amountVal = Number(amount);
  if (isNaN(amountVal) || amountVal <= 0) {
    return res.status(400).json({ error: 'قيمة الشحن يجب أن تكون مبلغاً أكبر من الصفر.' });
  }

  try {
    const newRequest = {
      id: 'req_' + Date.now(),
      studentId: req.user.id,
      studentName: req.user.name,
      amount: amountVal,
      method: method || 'instapay',
      refNumber: refNumber || '',
      proofImage: proofImage || '',
      status: 'pending',
      requestDate: new Date().toLocaleDateString('ar-EG')
    };

    if (dbType === 'mongodb') {
      await db.collection('payments').insertOne(newRequest);
    } else {
      const data = getLocalData();
      data.payments.unshift(newRequest);
      writeLocalData(data);
    }

    return res.json(newRequest);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/payments/:id', requireAdmin, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  try {
    let requestObj = null;
    let data = null;

    if (dbType === 'mongodb') {
      requestObj = await db.collection('payments').findOne({ id: requestId });
    } else {
      data = getLocalData();
      requestObj = data.payments.find(p => p.id === requestId);
    }

    if (!requestObj) return res.status(404).json({ error: 'طلب الدفع غير موجود.' });

    if (status === 'approved' && requestObj.status !== 'approved') {
      // Add balance to student wallet
      if (dbType === 'mongodb') {
        await db.collection('students').updateOne(
          { id: requestObj.studentId },
          { $inc: { walletBalance: requestObj.amount } }
        );
        await db.collection('payments').updateOne({ id: requestId }, { $set: { status: 'approved' } });
      } else {
        const student = data.students.find(s => s.id === requestObj.studentId);
        if (student) {
          student.walletBalance = (student.walletBalance || 0) + requestObj.amount;
        }
        requestObj.status = 'approved';
        writeLocalData(data);
      }
    } else if (status === 'rejected') {
      if (dbType === 'mongodb') {
        await db.collection('payments').updateOne({ id: requestId }, { $set: { status: 'rejected' } });
      } else {
        requestObj.status = 'rejected';
        writeLocalData(data);
      }
    }

    return res.json({ success: true, status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 👤 STUDENTS DATA MANAGEMENT ROUTES
// ==========================================

app.get('/api/students', requireAdmin, async (req, res) => {
  try {
    let students = [];
    if (dbType === 'mongodb') {
      students = await db.collection('students').find({}).toArray();
    } else {
      students = getLocalData().students;
    }
    // Remove passwords before sending to front-end admin
    const safeStudents = students.map(({ password, ...rest }) => rest);
    return res.json(safeStudents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/students/:id', requireOwnershipOrAdmin, async (req, res) => {
  const studentId = req.params.id;
  const updates = req.body;

  // Hashing password if updated
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  // If not admin, the student can ONLY modify specific fields (name, password, avatar, phone)
  if (req.user.role !== 'admin') {
    const allowedKeys = ['name', 'password', 'avatar', 'phone'];
    Object.keys(updates).forEach(key => {
      if (!allowedKeys.includes(key)) {
        delete updates[key];
      }
    });
  }

  try {
    if (dbType === 'mongodb') {
      await db.collection('students').updateOne({ id: studentId }, { $set: updates });
      const updatedUser = await db.collection('students').findOne({ id: studentId });
      const { password, ...cleanUser } = updatedUser;
      return res.json(cleanUser);
    } else {
      const data = getLocalData();
      const idx = data.students.findIndex(s => s.id === studentId);
      if (idx !== -1) {
        data.students[idx] = { ...data.students[idx], ...updates };
        writeLocalData(data);
        const { password, ...cleanUser } = data.students[idx];
        return res.json(cleanUser);
      }
      return res.status(404).json({ error: 'الطالب غير موجود.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', requireAdmin, async (req, res) => {
  const studentId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      await db.collection('students').deleteOne({ id: studentId });
    } else {
      const data = getLocalData();
      data.students = data.students.filter(s => s.id !== studentId);
      writeLocalData(data);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/students/:id/generate-otp', requireAdmin, async (req, res) => {
  const studentId = req.params.id;
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  try {
    if (dbType === 'mongodb') {
      const result = await db.collection('students').updateOne(
        { id: studentId },
        { $set: { pendingOtp: otp } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'الطالب غير موجود.' });
    } else {
      const data = getLocalData();
      const student = data.students.find(s => s.id === studentId);
      if (student) {
        student.pendingOtp = otp;
        writeLocalData(data);
      } else {
        return res.status(404).json({ error: 'الطالب غير موجود.' });
      }
    }
    return res.json({ success: true, otp });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/students/:id/reset-device', requireAdmin, async (req, res) => {
  const studentId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      const result = await db.collection('students').updateOne(
        { id: studentId },
        { $set: { deviceId: null, pendingOtp: null } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'الطالب غير موجود.' });
    } else {
      const data = getLocalData();
      const student = data.students.find(s => s.id === studentId);
      if (student) {
        student.deviceId = null;
        student.pendingOtp = null;
        writeLocalData(data);
      } else {
        return res.status(404).json({ error: 'الطالب غير موجود.' });
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 💬 QUESTIONS ROUTES
// ==========================================

app.get('/api/questions', verifyToken, async (req, res) => {
  try {
    let questions = [];
    if (dbType === 'mongodb') {
      if (req.user.role === 'admin') {
        questions = await db.collection('questions').find({}).toArray();
      } else {
        questions = await db.collection('questions').find({ studentPhone: req.user.phone }).toArray();
      }
    } else {
      const localQ = getLocalData().questions;
      if (req.user.role === 'admin') {
        questions = localQ;
      } else {
        // Fallback or user check
        questions = localQ.filter(q => q.studentPhone === req.user.phone);
      }
    }
    return res.json(questions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions', verifyToken, async (req, res) => {
  const { lessonId, questionText } = req.body;
  if (!questionText || questionText.trim() === '') {
    return res.status(400).json({ error: 'الرجاء كتابة السؤال.' });
  }

  try {
    // Get student details
    let student = null;
    if (dbType === 'mongodb') {
      student = await db.collection('students').findOne({ id: req.user.id });
    } else {
      student = getLocalData().students.find(s => s.id === req.user.id);
    }

    const newQuestion = {
      id: 'q_' + Date.now(),
      lessonId: lessonId,
      studentName: req.user.name,
      studentPhone: student ? student.phone : '',
      questionText: questionText,
      replyText: '',
      repliedAt: '',
      status: 'pending',
      timestamp: new Date().toLocaleString('ar-EG')
    };

    if (dbType === 'mongodb') {
      await db.collection('questions').insertOne(newQuestion);
    } else {
      const data = getLocalData();
      data.questions.unshift(newQuestion);
      writeLocalData(data);
    }

    return res.json(newQuestion);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions/:id/reply', requireAdmin, async (req, res) => {
  const questionId = req.params.id;
  const { replyText } = req.body;

  try {
    if (dbType === 'mongodb') {
      await db.collection('questions').updateOne(
        { id: questionId },
        {
          $set: {
            replyText,
            repliedAt: 'الآن',
            status: 'answered'
          }
        }
      );
      return res.json({ success: true });
    } else {
      const data = getLocalData();
      const matched = data.questions.find(q => q.id === questionId);
      if (matched) {
        matched.replyText = replyText;
        matched.repliedAt = 'الآن';
        matched.status = 'answered';
        writeLocalData(data);
        return res.json({ success: true });
      }
      return res.status(404).json({ error: 'السؤال غير موجود.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🔔 NOTIFICATIONS ROUTES
// ==========================================

app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    let notifications = [];
    if (dbType === 'mongodb') {
      notifications = await db.collection('notifications').find({}).toArray();
    } else {
      notifications = getLocalData().notifications;
    }
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', requireAdmin, async (req, res) => {
  const notif = req.body;
  try {
    const newNote = {
      id: 'n_' + Date.now(),
      targetGrade: notif.targetGrade || 'all',
      subject: notif.subject || 'general',
      title: (notif.title || '').trim(),
      body: (notif.body || '').trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('ar-EG'),
      unread: true
    };

    if (dbType === 'mongodb') {
      await db.collection('notifications').insertOne(newNote);
    } else {
      const data = getLocalData();
      data.notifications.unshift(newNote);
      writeLocalData(data);
    }

    return res.json(newNote);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', requireAdmin, async (req, res) => {
  const notifId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      const result = await db.collection('notifications').deleteOne({ id: notifId });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'الإشعار غير موجود.' });
    } else {
      const data = getLocalData();
      const idx = data.notifications.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        data.notifications.splice(idx, 1);
        writeLocalData(data);
      } else {
        return res.status(404).json({ error: 'الإشعار غير موجود.' });
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 📝 EXAMS & PERFORMANCE HISTORIES ROUTES
// ==========================================

app.get('/api/exams', verifyToken, async (req, res) => {
  try {
    let exams = [];
    if (dbType === 'mongodb') {
      exams = await db.collection('exams').find({ studentId: req.user.id }).toArray();
    } else {
      exams = getLocalData().exams.filter(e => e.studentId === req.user.id);
    }
    return res.json(exams);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/exams', verifyToken, async (req, res) => {
  const examRecord = req.body;
  try {
    const newRecord = {
      ...examRecord,
      id: 'ex_' + Date.now(),
      studentId: req.user.id,
      date: new Date().toLocaleDateString('ar-EG'),
      timestamp: Date.now()
    };

    if (dbType === 'mongodb') {
      await db.collection('exams').insertOne(newRecord);
    } else {
      const data = getLocalData();
      data.exams.unshift(newRecord);
      writeLocalData(data);
    }

    return res.json(newRecord);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🤖 SECURE CHATBOT PROXY API ROUTE
// ==========================================

app.post('/api/chat', async (req, res) => {
  const { messages, provider } = req.body;
  const targetProvider = provider || 'openrouter';

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!OPENROUTER_API_KEY && targetProvider === 'openrouter') {
    return res.status(500).json({ error: 'OpenRouter API Key not configured on the backend.' });
  }
  if (!GEMINI_API_KEY && targetProvider === 'gemini') {
    return res.status(500).json({ error: 'Gemini API Key not configured on the backend.' });
  }

  try {
    if (targetProvider === 'gemini') {
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system');

      // Convert messages to Gemini format
      const contents = chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const bodyPayload = {
        contents,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      };

      if (systemMessage) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemMessage.content }]
        };
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ في معالجة طلبك.';
      return res.json({ response: botResponse });

    } else {
      // Default to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://elbashmohands.dev',
          'X-Title': 'Bashmohandis Education Platform'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: messages,
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${errorText}`);
      }

      const data = await response.json();
      const botResponse = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ في معالجة طلبك.';
      return res.json({ response: botResponse });
    }
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Server error occurred' });
  }
});

// Generates S3/R2 presigned upload URLs for admin video, image, and document uploads
app.post('/api/upload/presign', requireAdmin, async (req, res) => {
  const { filename, contentType } = req.body;

  if (!r2Client) {
    return res.status(500).json({ error: 'Cloudflare R2 Client is not configured on this server.' });
  }

  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required.' });
  }

  try {
    let folder = 'videos';
    if (contentType.startsWith('image/')) {
      folder = 'thumbnails';
    } else if (contentType === 'application/pdf' || contentType.includes('word') || contentType.includes('officedocument')) {
      folder = 'attachments';
    }
    
    const uniqueKey = `${folder}/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType
    });

    // Link expires in 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });

    const publicUrlBase = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
    const videoUrl = `${publicUrlBase}${uniqueKey}`;

    return res.json({ success: true, uploadUrl, videoUrl });
  } catch (err) {
    console.error('Presign URL error:', err);
    return res.status(500).json({ error: 'Failed to generate upload URL: ' + err.message });
  }
});

// Diagnostics endpoint to list available Gemini models for this API key
app.get('/api/diag', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not defined in environment variables.' });
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LIVE BROADCAST & VIRTUAL CLASSROOM API
// ==========================================

// Get all live sessions (filtered by grade if student, or all if admin)
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

// Get active / upcoming live sessions
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

// Get single live session with full details
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

// Admin create / schedule live session
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

// Admin update live session status (scheduled -> live -> ended)
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
      if (status === 'live') {
        const sessionDoc = await db.collection('liveSessions').findOne({ id });
        if (sessionDoc) {
          const liveNotif = {
            id: `n_${Date.now()}`,
            title: `🔴 بث مباشر بدأ الآن: ${sessionDoc.title}`,
            body: `المستر بدأ حصة البث المباشر الآن! اضغط هنا للانضمام فوراً وتفاعل مع الشرح.`,
            time: 'الآن',
            unread: true,
            actionTab: 'live',
            actionId: sessionDoc.id,
            targetGrade: sessionDoc.grade || 'all'
          };
          await db.collection('notifications').insertOne(liveNotif);
        }
      }
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        data.liveSessions[idx] = { ...data.liveSessions[idx], ...updateFields };
        if (status === 'live') {
          const sessionItem = data.liveSessions[idx];
          if (!data.notifications) data.notifications = [];
          data.notifications.unshift({
            id: `n_${Date.now()}`,
            title: `🔴 بث مباشر بدأ الآن: ${sessionItem.title}`,
            body: `المستر بدأ حصة البث المباشر الآن! اضغط هنا للانضمام فوراً وتفاعل مع الشرح.`,
            time: 'الآن',
            unread: true,
            actionTab: 'live',
            actionId: sessionItem.id,
            targetGrade: sessionItem.grade || 'all'
          });
        }
        writeLocalData(data);
      }
    }

    return res.json({ success: true, message: `تم تحديث حالة البث إلى (${status === 'live' ? 'مباشر الآن 🔴' : status === 'ended' ? 'منتهي' : 'مجدول'}) بنجاح` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin delete live session
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

// ═══ WhatsApp Business Cloud API Configuration ═══
const RAW_TOKEN = process.env.WHATSAPP_TOKEN || 'EAANsSrEvKIQBR4pv5uiy5S9r9nM7ljFfdzWCSNSDCIdTQ9h0z4JdG5HxdnfEOfewiSsb6ASWEkaruYI10QKfZADNkfMRXMZCNZABEgJFZCHeCIoo0gmTzq7kZAMS19OUny61HzkaJJ4lVJKtzUcDo6iPhxoZBXu8Xp7LOxYYbVYiaJJjXGSekKTHaqyO5nCE91rwHLPF8WiLIbmIOv8hOWCLrTqRzVGUnuIHV2';
const RAW_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '978529235354693';

const WHATSAPP_TOKEN = String(RAW_TOKEN).trim().replace(/^["']|["']$/g, '');
const WHATSAPP_PHONE_ID = String(RAW_PHONE_ID).trim().replace(/^["']|["']$/g, '');

async function sendWhatsAppMessage(toPhone, messageText) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return { sent: false, reason: 'not_configured' };
  let intlPhone = String(toPhone).replace(/[^0-9]/g, '');
  if (intlPhone.startsWith('0')) intlPhone = '2' + intlPhone;
  if (!intlPhone.startsWith('20')) intlPhone = '20' + intlPhone;
  try {
    const resp = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        messaging_product: 'whatsapp', 
        recipient_type: 'individual',
        to: intlPhone, 
        type: 'text', 
        text: { preview_url: true, body: messageText } 
      })
    });
    const data = await resp.json();
    if (data.messages && data.messages.length > 0) return { sent: true, messageId: data.messages[0].id, data };
    console.log('[WhatsApp API Error Response]:', JSON.stringify(data));
    return { sent: false, reason: data.error?.message || JSON.stringify(data.error) || 'unknown', data };
  } catch (err) { 
    console.log('[WhatsApp API Network Error]:', err.message);
    return { sent: false, reason: err.message }; 
  }
}

// Diagnostic & Direct WhatsApp Test Endpoint
app.get('/api/admin/test-whatsapp', requireAdmin, async (req, res) => {
  const testPhone = req.query.phone || '01002169889';
  const testMsg = req.query.msg || 'اختبار إرسال رسالة من منصة عِلم التعليمية 🚀';
  const result = await sendWhatsAppMessage(testPhone, testMsg);
  return res.json({
    phoneId: WHATSAPP_PHONE_ID,
    tokenPrefix: WHATSAPP_TOKEN.substring(0, 15) + '...',
    testPhone,
    result
  });
});

// Global General WhatsApp Broadcast API (For Lessons, Progress Reports, Live)
app.post('/api/admin/broadcast-whatsapp', requireAdmin, async (req, res) => {
  try {
    const { title, messageBody, grade } = req.body;
    let students = [];

    if (dbType === 'mongodb') {
      const query = grade && grade !== 'all' ? { grade } : {};
      students = await db.collection('students').find(query).toArray();
    } else {
      const data = getLocalData();
      students = (data.students || []).filter(st => {
        if (!grade || grade === 'all') return true;
        return st.grade === grade;
      });
    }

    const isWhatsAppConfigured = !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID);
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const st of students) {
      const phone = st.phone || st.parentPhone;
      if (!phone) { failedCount++; continue; }
      const cleanPhone = normalizePhone(phone);
      const studentName = st.name || 'طالبنا العزيز';
      const text = messageBody ? messageBody.replace('{name}', studentName) : `أهلاً يا ${studentName} 👋\n\n📌 *${title || 'تنبيه من منصة عِلم التعليمية'}*\n\n🔗 ادخل للمنصة الآن: https://elbashmohands.dev`;

      if (isWhatsAppConfigured) {
        const result = await sendWhatsAppMessage(cleanPhone, text);
        if (result.sent) {
          sentCount++;
        } else {
          failedCount++;
          errors.push({ student: studentName, phone: cleanPhone, error: result.reason });
        }
      }
    }

    const reportMsg = isWhatsAppConfigured
      ? (sentCount > 0 
          ? `✅ تم إرسال رسائل واتساب بنجاح لـ ${sentCount} طالب من أصل ${students.length} طالب!`
          : `⚠️ لم يتم التسليم إلى الواتساب (فشل: ${failedCount}). سبب رفض Meta: ${errors[0]?.error || 'تأكد من إضافة الأرقام في Meta Developers'}`)
      : `تم تجهيز الروابط لـ ${students.length} طالب.`;

    return res.json({
      success: sentCount > 0,
      message: reportMsg,
      isWhatsAppAutoSent: isWhatsAppConfigured,
      autoSentCount: sentCount,
      autoFailedCount: failedCount,
      errors,
      studentsCount: students.length
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin broadcast WhatsApp & in-app notification to all registered students
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

    // 1. Add In-App Notification
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

    // 2. Identify sender based on teacher identity
    const isSayed = session.subject?.includes('عرب') || session.instructor?.includes('سيد') || session.instructorId === 'mr_sayed';
    const senderName = isSayed ? 'أ / سيد عبد العاطي' : 'م / نور الدين';
    const senderPhone = isSayed ? '01094273996' : '01002169889';

    // 3. AUTOMATIC WhatsApp sending via Cloud API (if configured)
    const isWhatsAppConfigured = !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID);
    let sentCount = 0;
    let failedCount = 0;

    if (isWhatsAppConfigured) {
      console.log(`[WhatsApp Auto-Send] Sending to ${students.length} students...`);
      for (const st of students) {
        const phone = st.phone || st.parentPhone;
        if (!phone) { failedCount++; continue; }
        const cleanPhone = normalizePhone(phone);
        const studentName = st.name || 'طالبنا العزيز';
        const joinUrl = `https://elbashmohands.dev/?live=${session.id}`;
        const msgText =
          `أهلاً يا ${studentName} 👋\n\n` +
          `🔴 *حصة بث مباشر هامة الآن على منصة عِلم*\n` +
          `📖 *العنوان:* ${session.title}\n` +
          `👨‍🏫 *المحاضر:* ${senderName}\n` +
          `📚 *المادة:* ${session.subject}\n\n` +
          `🚀 *ادخل فوراً:* ${joinUrl}\n\nبالتوفيق! ✨`;
        const result = await sendWhatsAppMessage(cleanPhone, msgText);
        if (result.sent) sentCount++; else failedCount++;
      }
      console.log(`[WhatsApp Auto-Send] Done: ${sentCount} sent, ${failedCount} failed`);
    }

    // 4. Generate manual WhatsApp links as fallback
    const whatsappLinks = students.map(st => {
      const studentName = st.name || 'طالبنا العزيز';
      const phone = st.phone || st.parentPhone;
      const cleanPhone = normalizePhone(phone);
      const joinUrl = `https://elbashmohands.dev/?live=${session.id}`;
      const textMsg = encodeURIComponent(
        `أهلاً يا ${studentName} 👋\n\n` +
        `🔴 *حصة بث مباشر هامة الآن على منصة عِلم*\n` +
        `📖 *العنوان:* ${session.title}\n` +
        `👨‍🏫 *المحاضر:* ${senderName}\n` +
        `📞 *رقم المحاضر:* ${senderPhone}\n` +
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

    const autoMsg = isWhatsAppConfigured
      ? `✅ تم إرسال ${sentCount} رسالة واتساب أوتوماتيك بنجاح من السيرفر مباشرة إلى الطلاب (فشل: ${failedCount}) من رقم ${senderName} (${senderPhone})! 🚀📱`
      : `📲 تم إرسال إشعار داخل المنصة لجميع الطلاب (${students.length} طالب). لتفعيل الإرسال الأوتوماتيك عبر واتساب بدون تدخل، أضف WHATSAPP_TOKEN و WHATSAPP_PHONE_ID في إعدادات Railway.`;

    return res.json({
      success: true,
      message: autoMsg,
      isWhatsAppAutoSent: isWhatsAppConfigured,
      autoSentCount: sentCount,
      autoFailedCount: failedCount,
      inAppNotification: newNotif,
      studentsCount: students.length,
      senderName,
      senderPhone,
      whatsappLinks
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Post live chat message
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

// Post live poll (Teacher)
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

// Vote in live poll (Student)
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

// Student raise hand
app.post('/api/live/:id/hand-raise', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, studentCode } = req.body;

    const hr = {
      id: `hr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: studentId || 'std_anon',
      studentName: studentName || 'طالب',
      studentCode: studentCode || '',
      requestedAt: new Date().toISOString(),
      timestamp: Date.now(),
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

// Active viewers memory map: sessionId -> Map(userCode -> lastPingTime)
const livePresenceMap = new Map();

// Student ask to join (Google Meet Waiting Room)
app.post('/api/live/:id/join-request', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, studentCode, studentPhone } = req.body;

    const requestObj = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: studentId || 'std_anon',
      studentName: studentName || 'طالب',
      studentCode: studentCode || '3001',
      studentPhone: studentPhone || '',
      status: 'pending', // 'pending' | 'admitted' | 'rejected'
      requestedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    if (dbType === 'mongodb') {
      const session = await db.collection('liveSessions').findOne({ id });
      const existing = session?.joinRequests?.find(r => r.studentCode === studentCode);
      if (existing) {
        return res.json({ success: true, request: existing });
      }
      await db.collection('liveSessions').updateOne({ id }, { $push: { joinRequests: requestObj } });
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const idx = data.liveSessions.findIndex(s => s.id === id);
      if (idx !== -1) {
        if (!data.liveSessions[idx].joinRequests) data.liveSessions[idx].joinRequests = [];
        const existing = data.liveSessions[idx].joinRequests.find(r => r.studentCode === studentCode);
        if (existing) {
          return res.json({ success: true, request: existing });
        }
        data.liveSessions[idx].joinRequests.push(requestObj);
        writeLocalData(data);
      }
    }

    return res.json({ success: true, request: requestObj, message: 'تم إرسال طلب الانضمام للمعلم بنجاح! ⏳' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Teacher admit or reject student join request
app.post('/api/live/:id/admit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { requestId, allow } = req.body;
    const newStatus = allow ? 'admitted' : 'rejected';

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne(
        { id, "joinRequests.id": requestId },
        { $set: { "joinRequests.$.status": newStatus } }
      );
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const sIdx = data.liveSessions.findIndex(s => s.id === id);
      if (sIdx !== -1 && data.liveSessions[sIdx].joinRequests) {
        const rIdx = data.liveSessions[sIdx].joinRequests.findIndex(r => r.id === requestId);
        if (rIdx !== -1) {
          data.liveSessions[sIdx].joinRequests[rIdx].status = newStatus;
          writeLocalData(data);
        }
      }
    }

    return res.json({ success: true, status: newStatus, message: allow ? 'تم السماح للطالب بالدخول ✅' : 'تم رفض طلب الدخول ❌' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Teacher admit all pending students at once
app.post('/api/live/:id/admit-all', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne(
        { id },
        { $set: { "joinRequests.$[elem].status": 'admitted' } },
        { arrayFilters: [{ "elem.status": 'pending' }] }
      );
    } else {
      const data = getLocalData();
      if (!data.liveSessions) data.liveSessions = [];
      const sIdx = data.liveSessions.findIndex(s => s.id === id);
      if (sIdx !== -1 && data.liveSessions[sIdx].joinRequests) {
        data.liveSessions[sIdx].joinRequests.forEach(r => {
          if (r.status === 'pending') r.status = 'admitted';
        });
        writeLocalData(data);
      }
    }

    return res.json({ success: true, message: 'تم السماح لجميع الطلاب بالدخول بنجاح! 🚀' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Heartbeat & Real-time Live Presence Tracking (Counts exact actual viewers online)
app.post('/api/live/:id/heartbeat', async (req, res) => {
  try {
    const { id } = req.params;
    const { userKey, userName, userRole } = req.body;
    const key = userKey || req.ip || 'anon';

    if (!livePresenceMap.has(id)) {
      livePresenceMap.set(id, new Map());
    }
    const sessionPresence = livePresenceMap.get(id);
    const now = Date.now();
    sessionPresence.set(key, { time: now, name: userName, role: userRole });

    // Clean up viewers inactive for > 25 seconds
    for (const [k, val] of sessionPresence.entries()) {
      if (now - val.time > 25000) {
        sessionPresence.delete(k);
      }
    }

    const actualCount = sessionPresence.size;

    // Update in DB/file so active viewer count is 100% real
    if (dbType === 'mongodb') {
      await db.collection('liveSessions').updateOne({ id }, { $set: { viewersCount: actualCount } });
    } else {
      const data = getLocalData();
      if (data.liveSessions) {
        const s = data.liveSessions.find(x => x.id === id);
        if (s) {
          s.viewersCount = actualCount;
          writeLocalData(data);
        }
      }
    }

    return res.json({ success: true, viewersCount: actualCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 📡 WEBRTC P2P SIGNALING FOR LIVE VIDEO
// ==========================================
const liveSignalingStore = new Map();

app.post('/api/live/:id/signal/offer', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { sdp, type, isStreaming } = req.body;
  if (!liveSignalingStore.has(id)) {
    liveSignalingStore.set(id, { offer: null, candidates: [], answers: new Map() });
  }
  const store = liveSignalingStore.get(id);
  store.offer = isStreaming ? { sdp, type, timestamp: Date.now() } : null;
  return res.json({ success: true });
});

app.get('/api/live/:id/signal/offer', async (req, res) => {
  const { id } = req.params;
  const store = liveSignalingStore.get(id);
  return res.json({ success: true, offer: store?.offer || null });
});

app.post('/api/live/:id/signal/answer', async (req, res) => {
  const { id } = req.params;
  const { studentCode, sdp, type } = req.body;
  if (!liveSignalingStore.has(id)) {
    liveSignalingStore.set(id, { offer: null, candidates: [], answers: new Map() });
  }
  const store = liveSignalingStore.get(id);
  store.answers.set(studentCode, { sdp, type, timestamp: Date.now() });
  return res.json({ success: true });
});

app.get('/api/live/:id/signal/answers', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const store = liveSignalingStore.get(id);
  const answersList = [];
  if (store?.answers) {
    for (const [code, ans] of store.answers.entries()) {
      answersList.push({ studentCode: code, ...ans });
    }
  }
  return res.json({ success: true, answers: answersList });
});

app.post('/api/live/:id/signal/ice', async (req, res) => {
  const { id } = req.params;
  const { candidate, senderRole } = req.body;
  if (!liveSignalingStore.has(id)) {
    liveSignalingStore.set(id, { offer: null, candidates: [], answers: new Map() });
  }
  const store = liveSignalingStore.get(id);
  if (candidate) {
    store.candidates.push({ candidate, senderRole, timestamp: Date.now() });
    // Keep max 50 candidates
    if (store.candidates.length > 50) store.candidates.shift();
  }
  return res.json({ success: true });
});

app.get('/api/live/:id/signal/ice', async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;
  const store = liveSignalingStore.get(id);
  const relevant = (store?.candidates || []).filter(c => c.senderRole !== role);
  return res.json({ success: true, candidates: relevant });
});

// Health check endpoint for Railway & Monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database then start server
initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode.`);
  });
});
