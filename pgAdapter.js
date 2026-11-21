import pg from 'pg';

const { Pool } = pg;

const TABLE_MAP = {
  tenants: 'tenants',
  students: 'students',
  lessons: 'lessons',
  folders: 'folders',
  coupons: 'coupons',
  payments: 'payments',
  questions: 'questions',
  notifications: 'notifications',
  exams: 'exams',
  liveSessions: 'live_sessions',
  live_sessions: 'live_sessions'
};

function matchesFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$and' && Array.isArray(cond)) {
      if (!cond.every(sub => matchesFilter(doc, sub))) return false;
      continue;
    }
    if (key === '$or' && Array.isArray(cond)) {
      if (!cond.some(sub => matchesFilter(doc, sub))) return false;
      continue;
    }

    const val = doc[key];

    if (cond !== null && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof RegExp)) {
      if ('$regex' in cond) {
        const flags = cond.$options || '';
        const re = new RegExp(cond.$regex, flags);
        if (val === undefined || val === null || !re.test(String(val))) return false;
      } else if ('$in' in cond && Array.isArray(cond.$in)) {
        if (!cond.$in.includes(val)) return false;
      } else if ('$exists' in cond) {
        const exists = val !== undefined && val !== null;
        if (Boolean(cond.$exists) !== exists) return false;
      } else if ('$ne' in cond) {
        if (val === cond.$ne) return false;
      } else {
        if (JSON.stringify(val) !== JSON.stringify(cond)) return false;
      }
    } else {
      if (val !== cond) return false;
    }
  }
  return true;
}

function applyUpdate(doc, update) {
  const next = { ...doc };
  if (update.$set) {
    Object.assign(next, update.$set);
  }
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      next[k] = (Number(next[k]) || 0) + Number(v);
    }
  }
  if (update.$push) {
    for (const [k, v] of Object.entries(update.$push)) {
      const arr = Array.isArray(next[k]) ? [...next[k]] : [];
      arr.push(v);
      next[k] = arr;
    }
  }
  return next;
}

function inferTeacherId(doc) {
  if (doc.teacherId) return doc.teacherId;
  if (doc.instructorId) return doc.instructorId;
  const subj = String(doc.subject || '');
  const inst = String(doc.instructor || '');
  if (subj.includes('عرب') || subj === 'arabic' || inst.includes('سيد')) {
    return 'mr_sayed';
  }
  return 'eng_nour';
}

export async function createPostgresAdapter(databaseUrl) {
  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });

  await pool.query('SELECT 1');

  // Create structured tables with teacher_id column for multi-tenant isolation
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      subject TEXT,
      plan TEXT DEFAULT 'pro',
      active BOOLEAN DEFAULT true,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      code TEXT,
      phone TEXT,
      grade TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      subject TEXT,
      grade TEXT,
      folder_id TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      subject TEXT,
      grade TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      code TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      student_id TEXT,
      status TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      lesson_id TEXT,
      status TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      student_id TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS live_sessions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL DEFAULT 'eng_nour',
      status TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_folders_teacher ON folders(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_coupons_teacher ON coupons(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_payments_teacher ON payments(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_questions_teacher ON questions(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_teacher ON notifications(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_exams_teacher ON exams(teacher_id);`,
    `CREATE INDEX IF NOT EXISTS idx_live_teacher ON live_sessions(teacher_id);`
  ];

  for (const stmt of schemaStatements) {
    await pool.query(stmt);
  }

  const upsertRow = async (tableName, doc) => {
    const cleanDoc = { ...doc };
    delete cleanDoc._id;
    const id = String(cleanDoc.id || `${tableName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    cleanDoc.id = id;
    const teacherId = inferTeacherId(cleanDoc);
    if (!cleanDoc.teacherId && tableName !== 'tenants') {
      cleanDoc.teacherId = teacherId;
    }

    if (tableName === 'tenants') {
      await pool.query(
        `INSERT INTO tenants (id, name, phone, email, subject, plan, active, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           subject = EXCLUDED.subject,
           plan = EXCLUDED.plan,
           active = EXCLUDED.active,
           data = EXCLUDED.data`,
        [id, cleanDoc.name || id, cleanDoc.phone || '', cleanDoc.email || '', cleanDoc.subject || '', cleanDoc.plan || 'pro', cleanDoc.active !== false, JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'students') {
      await pool.query(
        `INSERT INTO students (id, teacher_id, code, phone, grade, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           code = EXCLUDED.code,
           phone = EXCLUDED.phone,
           grade = EXCLUDED.grade,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.code || '', cleanDoc.phone || '', cleanDoc.grade || '', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'lessons') {
      await pool.query(
        `INSERT INTO lessons (id, teacher_id, subject, grade, folder_id, data)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           subject = EXCLUDED.subject,
           grade = EXCLUDED.grade,
           folder_id = EXCLUDED.folder_id,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.subject || '', cleanDoc.grade || '', cleanDoc.folderId || null, JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'folders') {
      await pool.query(
        `INSERT INTO folders (id, teacher_id, subject, grade, data)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           subject = EXCLUDED.subject,
           grade = EXCLUDED.grade,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.subject || '', cleanDoc.grade || '', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'coupons') {
      await pool.query(
        `INSERT INTO coupons (id, teacher_id, code, data)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           code = EXCLUDED.code,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.code || '', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'payments') {
      await pool.query(
        `INSERT INTO payments (id, teacher_id, student_id, status, data)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           student_id = EXCLUDED.student_id,
           status = EXCLUDED.status,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.studentId || '', cleanDoc.status || 'pending', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'questions') {
      await pool.query(
        `INSERT INTO questions (id, teacher_id, lesson_id, status, data)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           lesson_id = EXCLUDED.lesson_id,
           status = EXCLUDED.status,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.lessonId || '', cleanDoc.status || 'pending', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'exams') {
      await pool.query(
        `INSERT INTO exams (id, teacher_id, student_id, data)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           student_id = EXCLUDED.student_id,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.studentId || '', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    if (tableName === 'live_sessions') {
      await pool.query(
        `INSERT INTO live_sessions (id, teacher_id, status, data)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           teacher_id = EXCLUDED.teacher_id,
           status = EXCLUDED.status,
           data = EXCLUDED.data`,
        [id, teacherId, cleanDoc.status || 'scheduled', JSON.stringify(cleanDoc)]
      );
      return cleanDoc;
    }

    await pool.query(
      `INSERT INTO ${tableName} (id, teacher_id, data)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         teacher_id = EXCLUDED.teacher_id,
         data = EXCLUDED.data`,
      [id, teacherId, JSON.stringify(cleanDoc)]
    );
    return cleanDoc;
  };

  const collection = (colName) => {
    const tableName = TABLE_MAP[colName] || colName;

    const getAllRows = async () => {
      const { rows } = await pool.query(`SELECT data FROM ${tableName} ORDER BY created_at DESC`);
      return rows.map(r => r.data);
    };

    return {
      async countDocuments(filter = {}) {
        if (!filter || Object.keys(filter).length === 0) {
          const { rows } = await pool.query(`SELECT COUNT(*)::int AS cnt FROM ${tableName}`);
          return rows[0].cnt;
        }
        const docs = await getAllRows();
        return docs.filter(d => matchesFilter(d, filter)).length;
      },

      find(filter = {}) {
        let sortSpec = null;
        const cursor = {
          sort(spec) {
            sortSpec = spec;
            return cursor;
          },
          async toArray() {
            let docs = await getAllRows();
            if (filter && Object.keys(filter).length > 0) {
              docs = docs.filter(d => matchesFilter(d, filter));
            }
            if (sortSpec) {
              const entries = Object.entries(sortSpec);
              docs.sort((a, b) => {
                for (const [k, dir] of entries) {
                  if (a[k] === b[k]) continue;
                  return (a[k] > b[k] ? 1 : -1) * (dir >= 0 ? 1 : -1);
                }
                return 0;
              });
            }
            return docs;
          }
        };
        return cursor;
      },

      async findOne(filter = {}) {
        if (filter && Object.keys(filter).length === 1 && typeof filter.id === 'string') {
          const { rows } = await pool.query(`SELECT data FROM ${tableName} WHERE id = $1 LIMIT 1`, [filter.id]);
          return rows[0]?.data || null;
        }
        const docs = await getAllRows();
        return docs.find(d => matchesFilter(d, filter)) || null;
      },

      async insertOne(doc) {
        const saved = await upsertRow(tableName, doc);
        return { acknowledged: true, insertedId: saved.id };
      },

      async insertMany(docs) {
        for (const doc of docs) {
          await upsertRow(tableName, doc);
        }
        return { acknowledged: true, insertedCount: docs.length };
      },

      async updateOne(filter, update) {
        const existing = await this.findOne(filter);
        if (!existing) return { matchedCount: 0, modifiedCount: 0 };
        const updated = applyUpdate(existing, update);
        await upsertRow(tableName, updated);
        return { matchedCount: 1, modifiedCount: 1 };
      },

      async findOneAndUpdate(filter, update) {
        const existing = await this.findOne(filter);
        if (!existing) return null;
        const updated = applyUpdate(existing, update);
        await upsertRow(tableName, updated);
        return updated;
      },

      async deleteOne(filter) {
        const existing = await this.findOne(filter);
        if (!existing) return { deletedCount: 0 };
        await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [existing.id]);
        return { deletedCount: 1 };
      }
    };
  };

  return { pool, collection };
}
