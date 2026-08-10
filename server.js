import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

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
let jsonDbFilePath = path.join(__dirname, 'database.json');

// Initial seed data
const initialData = {
  students: [
    {
      id: 'std_101',
      code: 'ENG-101',
      name: 'أحمد محمود العبد',
      email: 'ahmed@bashmohandis.com',
      phone: '01012345678',
      parentPhone: '01198765432',
      password: bcrypt.hashSync('123', 10), // Hashed Ahmed's password
      grade: '3sec',
      gradeName: 'الصف الثالث الثانوي (تانوية عامة)',
      avatar: null,
      walletBalance: 0,
      subscriptionStatus: 'active',
      subscriptionType: 'شهري',
      monthlyCreditsLeft: 8,
      points: 120,
      streakDays: 5,
      rank: 1,
      badges: [{ id: 'b1', name: 'عضو جديد 💻', icon: '💻', desc: 'انضم لمنصة الباشمهندس' }]
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
    { id: 'n1', title: 'مرحباً بك في منصة الباشمهندس للبرمجة! 💻', body: 'التطبيق جاهز ومحمي بالكامل 100%.', time: 'الآن', unread: true }
  ],
  exams: []
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
      const studentColl = db.collection('students');
      const count = await studentColl.countDocuments();
      if (count === 0) {
        console.log('Seeding MongoDB with initial data...');
        await db.collection('students').insertMany(initialData.students);
        await db.collection('lessons').insertMany(initialData.lessons);
        await db.collection('coupons').insertMany(initialData.coupons);
        await db.collection('payments').insertMany(initialData.payments);
        await db.collection('questions').insertMany(initialData.questions);
        await db.collection('notifications').insertMany(initialData.notifications);
        console.log('MongoDB Seeded successfully.');
      }
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
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' });
  }

  try {
    const decoded = jwt.verify(token, ACTIVE_JWT_SECRET);
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

// Admin authentication keys / profiles on the server-side
const TEACHER_ACCOUNTS = [
  { email: 'nour@bashmohandis.com', phone: '01002169889', passwordHash: bcrypt.hashSync('nour2026', 10), identity: 'eng_nour', name: 'مهندس نور' },
  { email: 'sayed@bashmohandis.com', phone: '01094273996', passwordHash: bcrypt.hashSync('sayed2026', 10), identity: 'mr_sayed', name: 'مستر سيد' }
];

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, parentPhone, grade, password } = req.body;

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

      const count = await db.collection('students').countDocuments();
      const codeNumber = count + 101;
      const studentCode = `ENG-${codeNumber}`;
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
        badges: [{ id: 'b_new', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة الباشمهندس للبرمجة' }]
      };

      await db.collection('students').insertOne(newStudent);
      
      // Sign JWT
      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      // Omit password from return
      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, user: cleanUser, token });
    } else {
      // Local JSON File Database
      const data = getLocalData();
      const existing = data.students.find(s => s.phone === cleanPhone || s.email === cleanEmail);
      if (existing) return res.status(400).json({ error: 'رقم الموبايل أو البريد هذا مسجل مسبقاً! يرجى تسجيل الدخول.' });

      const codeNumber = data.students.length + 101;
      const studentCode = `ENG-${codeNumber}`;
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
        badges: [{ id: 'b_new', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة الباشمهندس للبرمجة' }]
      };

      data.students.push(newStudent);
      writeLocalData(data);

      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, user: cleanUser, token });
    }
  } catch (error) {
    return res.status(500).json({ error: 'حدث خطأ أثناء التسجيل.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { role, credentials } = req.body;

  if (role === 'admin') {
    const inputPass = (credentials.adminCode || '').trim();
    const identity = credentials.adminIdentity || 'eng_nour';

    // Verify Admin Credentials
    const teacher = TEACHER_ACCOUNTS.find(t => t.identity === identity);
    if (!teacher) return res.status(400).json({ error: 'معرف الأستاذ غير موجود.' });

    // Compare Password (using master pass 0123456 or explicit hashed password)
    if (inputPass === '0123456' || bcrypt.compareSync(inputPass, teacher.passwordHash)) {
      const token = jwt.sign({ id: identity, role: 'admin', identity }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
      return res.json({ success: true, role: 'admin', identity, name: teacher.name });
    } else {
      return res.status(400).json({ error: 'كلمة سر الأدمن غير صحيحة!' });
    }
  }

  if (role === 'parent') {
    const search = (credentials.parentStudentCode || '').trim().toUpperCase();
    if (!search) return res.status(400).json({ error: 'يرجى إدخال كود الطالب لمتابعة حسابه.' });

    try {
      let matched = null;
      if (dbType === 'mongodb') {
        matched = await db.collection('students').findOne({ $or: [{ code: search }, { phone: search }] });
      } else {
        const data = getLocalData();
        matched = data.students.find(s => s.code === search || s.phone === search);
      }

      if (matched) {
        const token = jwt.sign({ id: 'parent_' + matched.id, role: 'parent', studentId: matched.id }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
        const { password: _, ...cleanUser } = matched;
        return res.json({ success: true, role: 'parent', matchedStudent: cleanUser });
      } else {
        return res.status(404).json({ error: 'لم يتم العثور على طالب بهذا الكود أو رقم الهاتف.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'خطأ في السيرفر.' });
    }
  }

  // Student Login
  const loginSearch = (credentials.studentCode || '').trim();
  const inputPass = (credentials.password || '').trim();

  if (!loginSearch || !inputPass) {
    return res.status(400).json({ error: 'يرجى إدخال كود الطالب/رقم الهاتف وكلمة المرور.' });
  }

  try {
    let matched = null;
    
    // Quick Teacher bypass check from student login UI
    const isTeacherPhone = TEACHER_ACCOUNTS.find(t => t.phone === loginSearch);
    if (isTeacherPhone) {
      if (bcrypt.compareSync(inputPass, isTeacherPhone.passwordHash) || inputPass === '0123456') {
        const token = jwt.sign({ id: isTeacherPhone.identity, role: 'admin', identity: isTeacherPhone.identity }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
        return res.json({ success: true, role: 'admin', identity: isTeacherPhone.identity, name: isTeacherPhone.name });
      }
    }

    if (dbType === 'mongodb') {
      matched = await db.collection('students').findOne({ $or: [{ code: loginSearch }, { phone: loginSearch }] });
    } else {
      const data = getLocalData();
      matched = data.students.find(s => s.code === loginSearch || s.phone === loginSearch);
    }

    if (!matched) {
      return res.status(404).json({ error: 'الحساب غير مسجل أو البيانات خاطئة.' });
    }

    const passMatch = await bcrypt.compare(inputPass, matched.password);
    if (!passMatch) {
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign({ id: matched.id, role: 'student', name: matched.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

    const { password: _, ...cleanUser } = matched;
    return res.json({ success: true, role: 'student', user: cleanUser });
  } catch (error) {
    return res.status(500).json({ error: 'خطأ في تسجيل الدخول.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
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

  // Prevent users from manually altering wallet balance without admin clearance
  if (updates.walletBalance !== undefined && req.user.role !== 'admin') {
    delete updates.walletBalance;
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

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
