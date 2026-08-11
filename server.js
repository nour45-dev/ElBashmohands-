import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';

// AWS SDK v3 for Cloudflare R2
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// CORS configuration matching your frontend url
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Database configuration
const dbType = process.env.DATABASE_TYPE || 'local'; // 'local' or 'mongodb'
const mongoUri = process.env.MONGO_URI;
const localDbPath = path.join(__dirname, 'db.json');

// JWT Secret Key
const ACTIVE_JWT_SECRET = process.env.JWT_SECRET || 'manara_secret_key_2026';

let db = null;
let client = null;

// Initialize Database connection
async function initDb() {
  if (dbType === 'mongodb') {
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }
    try {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db('manara_platform');
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    }
  } else {
    console.log('Using local JSON file database:', localDbPath);
    if (!fs.existsSync(localDbPath)) {
      const initialData = {
        students: [],
        lessons: [],
        quizzes: [],
        coupons: [],
        payments: [],
        questions: [],
        notifications: [],
        exams: []
      };
      fs.writeFileSync(localDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }
}
await initDb();

// Helper functions for local database
function getLocalData() {
  if (!fs.existsSync(localDbPath)) return {};
  const content = fs.readFileSync(localDbPath, 'utf-8');
  return JSON.parse(content);
}

function writeLocalData(data) {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// R2 S3 Client Initialization
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'elbashmohands-bucket';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-dbe9f40fb807406bbd61ea234a334559.r2.dev';

// Admin / Teacher Accounts Setup
const TEACHER_ACCOUNTS = [
  {
    identity: 'eng_nour',
    name: 'مهندس نور',
    phone: '01099887766',
    email: 'nour@manara.com',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'nour2026', 10)
  },
  {
    identity: 'mr_sayed',
    name: 'مستر سيد عبد العاطي',
    phone: '01055443322',
    email: 'sayed@manara.com',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'sayed2026', 10)
  }
];

// Helper to normalize phone numbers
const normalizePhone = (p) => {
  if (!p) return '';
  const clean = p.replace(/\s+/g, '');
  if (clean.startsWith('+20')) return '0' + clean.substring(3);
  if (clean.startsWith('20') && clean.length > 10) return '0' + clean.substring(2);
  if (clean.startsWith('+2')) return '0' + clean.substring(2);
  return clean;
};

// Middleware: Verify Token
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'غير مصرح بالدخول.' });

  try {
    const decoded = jwt.decode(token, ACTIVE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة.' });
  }
}

// Middleware: Require Admin
function requireAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'غير مصرح بالدخول.' });

  try {
    const decoded = jwt.decode(token, ACTIVE_JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'هذه الصلاحية للأدمن فقط.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة.' });
  }
}

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, parentPhone, grade, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !parentPhone || !grade || !password || !confirmPassword) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة للتسجيل.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'كلمات المرور غير متطابقة.' });
  }

  const cleanPhone = normalizePhone(phone);
  const cleanParentPhone = normalizePhone(parentPhone);
  const cleanEmail = email.trim().toLowerCase();

  try {
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
        parentPhone: cleanParentPhone,
        grade,
        gradeName: grade === '3sec' ? 'الصف الثالث الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الأول الثانوي',
        walletBalance: 0,
        unlockedLessons: [],
        xp: 0,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        deviceId: null,
        pendingOtp: null
      };

      await db.collection('students').insertOne(newStudent);

      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, role: 'student', user: cleanUser, message: `أهلاً بك يا ${name}! كودك الدراسي هو: ${studentCode}` });
    } else {
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
        parentPhone: cleanParentPhone,
        grade,
        gradeName: grade === '3sec' ? 'الصف الثالث الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الأول الثانوي',
        walletBalance: 0,
        unlockedLessons: [],
        xp: 0,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        deviceId: null,
        pendingOtp: null
      };

      data.students.push(newStudent);
      writeLocalData(data);

      const token = jwt.sign({ id: uniqueId, role: 'student', name: newStudent.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

      const { password: _, ...cleanUser } = newStudent;
      return res.json({ success: true, role: 'student', user: cleanUser, message: `أهلاً بك يا ${name}! كودك الدراسي هو: ${studentCode}` });
    }
  } catch (err) {
    return res.status(500).json({ error: 'حدث خطأ أثناء التسجيل.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { role, credentials } = req.body;

  if (role === 'admin') {
    const { adminCode, adminIdentity } = credentials;
    const teacher = TEACHER_ACCOUNTS.find(t => t.identity === adminIdentity);
    if (!teacher) return res.status(404).json({ error: 'حساب المعلم غير موجود.' });

    const passMatch = bcrypt.compareSync(adminCode.trim(), teacher.passwordHash);
    if (passMatch) {
      const token = jwt.sign({ id: teacher.identity, role: 'admin', identity: teacher.identity }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
      return res.json({ success: true, role: 'admin', identity: teacher.identity, name: teacher.name });
    } else {
      return res.status(400).json({ error: 'رمز الدخول السري غير صحيح.' });
    }
  }

  if (role === 'parent') {
    const parentPhone = (credentials.parentPhone || '').trim();
    const studentSearch = (credentials.parentStudentCode || '').trim();

    if (!parentPhone) return res.status(400).json({ error: 'يرجى إدخال رقم هاتف ولي الأمر الخاص بك.' });
    if (!studentSearch) return res.status(400).json({ error: 'يرجى إدخال اسم الطالب أو كوده لمتابعة حسابه.' });

    const cleanParentPhone = normalizePhone(parentPhone);

    try {
      let matched = null;
      if (dbType === 'mongodb') {
        matched = await db.collection('students').findOne({
          parentPhone: cleanParentPhone,
          $or: [
            { code: studentSearch.toUpperCase() },
            { name: { $regex: studentSearch, $options: 'i' } }
          ]
        });
      } else {
        const data = getLocalData();
        matched = data.students.find(s => 
          normalizePhone(s.parentPhone) === cleanParentPhone &&
          (s.code === studentSearch.toUpperCase() || s.name.toLowerCase().includes(studentSearch.toLowerCase()))
        );
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
      return res.status(500).json({ error: 'خطأ في السيرفر.' });
    }
  }

  // Student Login
  const loginSearch = (credentials.phoneInput || credentials.studentCode || '').trim();
  const inputPass = (credentials.passInput || credentials.password || '').trim();

  if (!loginSearch || !inputPass) {
    return res.status(400).json({ error: 'يرجى إدخال كود الطالب/رقم الهاتف وكلمة المرور.' });
  }

  const cleanIdentifier = normalizePhone(loginSearch);

  try {
    let matched = null;
    
    // Quick Teacher bypass check from student login UI
    const isTeacherPhone = TEACHER_ACCOUNTS.find(
      t => normalizePhone(t.phone) === cleanIdentifier || t.email.toLowerCase() === loginSearch.toLowerCase()
    );
    if (isTeacherPhone) {
      if (bcrypt.compareSync(inputPass, isTeacherPhone.passwordHash)) {
        const token = jwt.sign({ id: isTeacherPhone.identity, role: 'admin', identity: isTeacherPhone.identity }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
        return res.json({ success: true, role: 'admin', identity: isTeacherPhone.identity, name: isTeacherPhone.name });
      }
    }

    if (dbType === 'mongodb') {
      matched = await db.collection('students').findOne({ $or: [{ code: loginSearch }, { phone: cleanIdentifier }] });
    } else {
      const data = getLocalData();
      matched = data.students.find(s => s.code === loginSearch || normalizePhone(s.phone) === cleanIdentifier);
    }

    if (!matched) {
      return res.status(404).json({ error: 'الحساب غير مسجل أو البيانات خاطئة.' });
    }

    const passMatch = await bcrypt.compare(inputPass, matched.password);
    if (!passMatch) {
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة.' });
    }

    const clientDeviceId = credentials.deviceId;
    if (clientDeviceId) {
      if (!matched.deviceId) {
        if (dbType === 'mongodb') {
          await db.collection('students').updateOne({ id: matched.id }, { $set: { deviceId: clientDeviceId } });
        } else {
          const data = getLocalData();
          const sIdx = data.students.findIndex(s => s.id === matched.id);
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

    const token = jwt.sign({ id: matched.id, role: 'student', name: matched.name }, ACTIVE_JWT_SECRET, { expiresIn: '1d' });
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

    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...cleanUser } = user;

    if (decoded.role === 'parent') {
      return res.json({ isAuthenticated: true, role: 'parent', matchedStudent: cleanUser });
    }
    return res.json({ isAuthenticated: true, role: 'student', user: cleanUser });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// ==========================================
// 🎓 STUDENTS ENDPOINTS (ADMIN ONLY)
// ==========================================

app.get('/api/students', requireAdmin, async (req, res) => {
  try {
    let list = [];
    if (dbType === 'mongodb') {
      list = await db.collection('students').find({}).toArray();
    } else {
      list = getLocalData().students;
    }
    const cleanList = list.map(({ password, ...u }) => u);
    return res.json(cleanList);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', requireAdmin, async (req, res) => {
  const studentId = req.params.id;
  const updates = req.body;

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password.trim(), 10);
  } else {
    delete updates.password;
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
      date: new Date().toLocaleDateString('ar-EG'),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    if (dbType === 'mongodb') {
      await db.collection('exams').insertOne(newRecord);
    } else {
      const data = getLocalData();
      data.exams.push(newRecord);
      writeLocalData(data);
    }
    return res.json(newRecord);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🎥 LESSONS & COURSES VIDEOS ROUTES
// ==========================================

app.get('/api/lessons', verifyToken, async (req, res) => {
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
  try {
    const newLesson = {
      ...lessonData,
      id: 'les_' + Date.now(),
      viewsCount: 0,
      createdAt: new Date().toISOString()
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

app.put('/api/lessons/:id', requireAdmin, async (req, res) => {
  const lessonId = req.params.id;
  const updates = req.body;
  try {
    if (dbType === 'mongodb') {
      await db.collection('lessons').updateOne({ id: lessonId }, { $set: updates });
      const updated = await db.collection('lessons').findOne({ id: lessonId });
      return res.json(updated);
    } else {
      const data = getLocalData();
      const idx = data.lessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
        data.lessons[idx] = { ...data.lessons[idx], ...updates };
        writeLocalData(data);
        return res.json(data.lessons[idx]);
      }
      return res.status(404).json({ error: 'الحصة غير موجودة.' });
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
// 🎟️ COUPONS ENDPOINTS
// ==========================================

app.get('/api/coupons', requireAdmin, async (req, res) => {
  try {
    let list = [];
    if (dbType === 'mongodb') {
      list = await db.collection('coupons').find({}).toArray();
    } else {
      list = getLocalData().coupons;
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', requireAdmin, async (req, res) => {
  const coupon = req.body;
  try {
    const newCoupon = {
      ...coupon,
      id: 'cp_' + Date.now(),
      createdAt: new Date().toISOString()
    };

    if (dbType === 'mongodb') {
      await db.collection('coupons').insertOne(newCoupon);
    } else {
      const data = getLocalData();
      data.coupons.unshift(newCoupon);
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
// 💳 PAYMENTS & WALLET ENDPOINTS
// ==========================================

app.get('/api/payments', requireAdmin, async (req, res) => {
  try {
    let list = [];
    if (dbType === 'mongodb') {
      list = await db.collection('payments').find({}).toArray();
    } else {
      list = getLocalData().payments;
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/request', verifyToken, async (req, res) => {
  const { studentId, studentName, amount, proofImage } = req.body;
  if (!studentId || !amount) return res.status(400).json({ error: 'البيانات غير مكتملة.' });

  try {
    const newRequest = {
      id: 'pay_' + Date.now(),
      studentId,
      studentName,
      amount: Number(amount),
      proofImage: proofImage || '',
      status: 'pending',
      createdAt: new Date().toISOString()
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

app.post('/api/payments/:id/approve', requireAdmin, async (req, res) => {
  const payId = req.params.id;
  try {
    let matchedPay = null;
    if (dbType === 'mongodb') {
      matchedPay = await db.collection('payments').findOne({ id: payId });
    } else {
      const data = getLocalData();
      matchedPay = data.payments.find(p => p.id === payId);
    }

    if (!matchedPay) return res.status(404).json({ error: 'طلب الدفع غير موجود.' });
    if (matchedPay.status !== 'pending') return res.status(400).json({ error: 'تمت معالجة هذا الطلب مسبقاً.' });

    // Update payment status
    if (dbType === 'mongodb') {
      await db.collection('payments').updateOne({ id: payId }, { $set: { status: 'approved' } });
      await db.collection('students').updateOne({ id: matchedPay.studentId }, { $inc: { walletBalance: matchedPay.amount } });
    } else {
      const data = getLocalData();
      const pIdx = data.payments.findIndex(p => p.id === payId);
      const sIdx = data.students.findIndex(s => s.id === matchedPay.studentId);
      if (pIdx !== -1 && sIdx !== -1) {
        data.payments[pIdx].status = 'approved';
        data.students[sIdx].walletBalance += matchedPay.amount;
        writeLocalData(data);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/:id/reject', requireAdmin, async (req, res) => {
  const payId = req.params.id;
  try {
    if (dbType === 'mongodb') {
      await db.collection('payments').updateOne({ id: payId }, { $set: { status: 'rejected' } });
    } else {
      const data = getLocalData();
      const pIdx = data.payments.findIndex(p => p.id === payId);
      if (pIdx !== -1) {
        data.payments[pIdx].status = 'rejected';
        writeLocalData(data);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ☁️ CLOUDFLARE R2 UPLOAD PRESIGNED URLS
// ==========================================

app.post('/api/upload/presign', requireAdmin, async (req, res) => {
  const { filename, filetype, folder } = req.body;
  if (!filename || !filetype) {
    return res.status(400).json({ error: 'اسم الملف ونوعه مطلوبان.' });
  }

  const allowedFolders = ['videos', 'attachments', 'thumbnails'];
  const targetFolder = allowedFolders.includes(folder) ? folder : 'misc';

  const fileKey = `${targetFolder}/${Date.now()}_${filename}`;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: filetype,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`;

    return res.json({
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      key: fileKey
    });
  } catch (err) {
    console.error('Failed to generate presigned R2 url:', err);
    return res.status(500).json({ error: 'فشل إنشاء رابط الرفع السحابي.' });
  }
});

// ==========================================
// 🚀 SERVER ROOT & STATIC ASSETS
// ==========================================

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is up and running in development mode.');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${isProd ? 'production' : 'development'} mode.`);
});
