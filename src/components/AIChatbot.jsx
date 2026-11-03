import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2, RefreshCw, BookOpen, Code2, HelpCircle, MessageSquare } from 'lucide-react';

// Intelligent Educational Knowledge Base for offline / instant fallback
const getSmartResponse = (query) => {
  const q = query.toLowerCase().trim();

  // 1. Who teaches programming / Eng. Nour Eldin Ahmed & His CV
  if (
    q.includes('مين اللي بيشرح برمجة') || 
    q.includes('مين بيشرح برمجة') || 
    q.includes('مين مدرس البرمجة') || 
    q.includes('مدرس برمجة') || 
    q.includes('مين بيشرح حاسب') || 
    q.includes('مين بيشرح بايثون') || 
    q.includes('مين المهندس') || 
    q.includes('مين نور الدين') || 
    q.includes('نور الدين') || 
    q.includes('نورالدين') || 
    q.includes('بشمهندس') || 
    q.includes('cv') || 
    q.includes('سي في') || 
    q.includes('سيرة ذاتية') || 
    q.includes('خبرة المهندس') || 
    q.includes('مين مستر البرمجة')
  ) {
    return `### 💻 مدرس ومسؤول قسم البرمجة والذكاء الاصطناعي:

يقدم قسم البرمجة وعلوم الحاسب في المنصة **المهندس / نور الدين أحمد (Eng. Nour Eldin Ahmed)** 🚀

🎓 **المؤهل العلمي والتعليم الأكاديمي:**
• **بكالوريوس هندسة الحاسبات ونظم التحكم** - كلية الهندسة **جامعة عين شمس (Ain Shams University)** بتقدير عام **"امتياز مع مرتبة الشرف"** (Excellent grade).
• مشروع التخرج: تطبيق **Help Me See** لمساعدة المكفوفين وضعاف البصر بالذكاء الاصطناعي والرؤية الحاسوبية.
• خبرة عملية تزيد عن **6 سنوات** في تطوير البرمجيات وتدريب المبرمجين (منها 3+ سنوات احترافية).

🏆 **الخبرات التدريسية والمهنية:**
• **مطور مناهج ومدرس البرمجة والذكاء الاصطناعي** في **مدارس كامبريدج بالقاهرة (Cambridge School, Cairo)**، لتدريس لغة Python و Scratch وأساسيات التعلم الآلي (Machine Learning) لصفوف اللغات والمرحلة الإعدادية والثانوية.
• **محاضر ومدرب معتمد** لأكثر من **500 طالب** عبر منصتي **Udacity** العالمية (تطوير تطبيقات أندرويد المعمارية الحديثة) و **Udemy** (كورس أندرويد بالعربي بتقييم 4.8/5 ⭐).
• صاحب قناة اليوتيوب التعليمية الرسمية: **[@NourTech-AI](https://youtube.com/@NourTech-AI)**.
• محاضر ورش عمل لغة Java سابق بمركز **iHub بكلية الحاسبات والمعلومات جامعة عين شمس**.
• **مؤسس ومطور منصة "عِلم" التعليمية (ELM)** ومنظومة **Araij Manager Pro** المتكاملة لإدارة المراكز والمدارس التعليمية.
• مهندس صيانة أجهزة طبية دقيقة (Biomedical Equipment Maintenance Engineer).

🛠️ **ما يتعلمه الطالب مع المهندس نور الدين بالمنصة:**
1. **لغة Python:** من الصفر والأساسيات وحتى بناء مشاريع حقيقية وخوارزميات الذكاء الاصطناعي.
2. **تطوير الويب الكامل (Full-Stack Web):** HTML5, CSS3, JavaScript, React, Node.js, Databases.
3. **تطبيقات الموبايل (Android Apps):** Kotlin, Java, SQLite, Firebase.
4. **مهارات التفكير المنطقي وحل المشكلات (Problem Solving & Algorithms).**

📲 **بيانات التواصل والمتابعة:**
• **واتساب وموبايل:** \`01002169889\`
• **يوتيوب:** \`@NourTech-AI\`
• **حساب GitHub:** \`github.com/nour45-dev\`
• **البريد الإلكتروني:** \`noureldin.ahmed2001@gmail.com\``;
  }

  // 2. Who teaches Arabic / Mr. Sayed Abdelaty
  if (
    q.includes('مين بيشرح عربي') || 
    q.includes('مين اللي بيشرح عربي') || 
    q.includes('مين مدرس العربي') || 
    q.includes('مدرس عربي') || 
    q.includes('مين مستر سيد') || 
    q.includes('سيد عبد العاطي') || 
    q.includes('أستاذ سيد') || 
    q.includes('مستر سيد') || 
    q.includes('معلم العربي') || 
    q.includes('مدرس اللغة العربية')
  ) {
    return `### 📖 مدرس ومسؤول قسم اللغة العربية بالمنصة:

يقدم قسم اللغة العربية في المنصة **الأستاذ / سيد عبد العاطي (Mr. Sayed Abdelaty)** 🌟

🎓 **المكانة والخبرة التعليمية:**
• **كبير معلمي ومقدم مادة اللغة العربية للثانوية العامة** (الصف الأول والثاني والثالث الثانوي).
• سنوات طويلة من الخبرة في تدريس وإعداد أوائل الجمهورية في شهادة الثانوية العامة.

📚 **الفروع التي يشرحها أ / سيد عبد العاطي:**
• **النحو والصرف:** تفكيك وتبسيط القواعد النحوية وإعراب الجمل المعقدة بأسلوب شائق وسلس.
• **البلاغة العربية:** التشبيه، الاستعارة، الكناية، المجاز المرسل، والمحسنات البديعية وعلم المعاني.
• **الأدب وتاريخه:** الربط بين المدارس الأدبية والتطبيق المباشر على النصوص المتحررة.
• **النصوص والقراءة المتحررة والقصة والتعبير المقالي.**

💡 **طريقة الشرح والتدريب:**
تدريب مكثف على نماذج امتحانات الثانوية العامة والوزارة بنظام التابلت الحديث لضمان تفوق الطالب وتحقيق الدرجة النهائية!`;
  }

  // 3. Who are the teachers on the platform in general
  if (
    q.includes('مين المدرسين') || 
    q.includes('مين بيشرح هنا') || 
    q.includes('مين على المنصة') || 
    q.includes('مين المدرسين اللي بيشرحوا') || 
    q.includes('المدرسين اللي هنا') || 
    q.includes('مين المعلمين') || 
    q.includes('مين المدرس')
  ) {
    return `### 🌟 نخبة المعلمين في منصة عِلم ينتفع به:

تضم المنصة نخبة متخصصة من كبار الأساتذة والمهندسين:

1️⃣ **المهندس / نور الدين أحمد (قسم البرمجة وعلوم الحاسب والذكاء الاصطناعي):**
• خريج هندسة حاسبات جامعة عين شمس بتقدير **امتياز مع مرتبة الشرف**.
• مدرس البرمجة والذكاء الاصطناعي بمدارس كامبريدج، ومحاضر سابق بـ Udacity و Udemy وقناة @NourTech-AI.
• يشرح لغة Python، تطوير الويب، تطبيقات الأندرويد، وخوارزميات الذكاء الاصطناعي.

2️⃣ **الأستاذ / سيد عبد العاطي (قسم اللغة العربية والبلاغة للثانوية العامة):**
• كبير معلمي اللغة العربية ومعد أوائل الجمهورية في الثانوية العامة.
• يشرح فروع النحو، البلاغة، الأدب، والنصوص والقراءة المتحررة بنظام التقييم الحديث.

📌 يمكنك التبديل بين قسم البرمجة وقسم اللغة العربية من الصفحة الرئيسية أو من تبويب **"الحصص والدروس"**!`;
  }

  // 4. Who built/created the platform
  if (
    q.includes('مين عمل المنصة') || 
    q.includes('مين صاحب المنصة') || 
    q.includes('مين مؤسس المنصة') || 
    q.includes('مين طور المنصة') || 
    q.includes('مين عمل الموقع') || 
    q.includes('مؤسس الموقع') || 
    q.includes('صاحب الموقع')
  ) {
    return `### 🚀 مؤسس ومطور منصة "عِلم":

تم تصميم وبرمجة وتطوير المنصة بالكامل بواسطة **المهندس / نور الدين أحمد (Eng. Nour Eldin Ahmed)**.

💻 **عن المنصة تقنياً:**
• المنصة مبنية بأحدث تقنيات الويب السحابية: **React, Node.js, Express, WebSockets, Docker, Railway**.
• تشمل نظام حماية عالي لمشغل الفيديوهات، ومحفظة إلكترونية للطلاب، وبنك امتحانات ذكي يصحح تلقائياً، وغرف بث مباشر تفاعلي (Live Studio)، وإشعارات واتساب فورية لأولياء الأمور.

📞 للتواصل مع المطور أو الدعم: **01002169889**`;
  }

  // 5. Subscription & Payment
  if (q.includes('اشتراك') || q.includes('اشحن') || q.includes('محفظ') || q.includes('سعر') || q.includes('فلوس') || q.includes('دفع') || q.includes('انستاباي') || q.includes('instapay') || q.includes('كاش') || q.includes('فودافون')) {
    return `### 💳 باقات الاشتراك وطرق الدفع في منصة عِلم:

🌟 **الاشتراكات المتاحة:**
• **الاشتراك الشهري:** **150 ج.م** (يتيح لك اختيار 8 حصص شهرياً).
• **الاشتراك السنوي الشامل:** **350 ج.م** (فتح جميع الحصص والمراجعات والامتحانات طوال العام بلا حدود!).

📲 **طرق الدفع والشحن:**
1. **InstaPay (انستاباي):**
   • اسم الحساب: \`noureldinahmedh@instapay\`
   • أو بالرقم: \`01002169889\`
2. **Vodafone Cash (فودافون كاش):**
   • الرقم: \`01002169889\`

🚀 **طريقة التفعيل السريع:**
بعد التحويل، افتح تبويب **"المحفظة والرصيد"** من القائمة العلوية، واضغط **"طلب شحن المحفظة"**، وارفع صورة إيصال التحويل، وسيتم تفعيل حسابك فوراً!`;
  }

  // 6. Folders System
  if (q.includes('فولدر') || q.includes('مجلد') || q.includes('وحدات') || q.includes('وحدة') || q.includes('تقسيم الحصص')) {
    return `### 📁 نظام المجلدات والوحدات الذكي (VIP Folders):

في منصة عِلم، الحصص منظمة داخل **مجلدات ووحدات دراسية متكاملة** لسهولة دراستها ومتابعتها:
• كل مجلد يحتوي على غلاف مصمم خصيصاً وعدد الحصص بداخله.
• عند الضغط على أي مجلد من الصفحة الرئيسية، يفتح لك **مستعرض الوحدة (Folder Explorer)** لعرض جميع دروس الوحدة بالترتيب.
• كما تتوفر حصص مراجعة عامة ومستقلة تحت قسم الحصص المستقلة!`;
  }

  // 7. Live Broadcast (البث المباشر)
  if (q.includes('بث مباشر') || q.includes('لايف') || q.includes('live') || q.includes('مباشر') || q.includes('استوديو')) {
    return `### 🔴 قاعة البث المباشر التفاعلي (Live Studio):

تتيح لك منصة عِلم حضور حصص مباشرة ومباشرة مع المعلم:
• **صوت وصورة عاليي الجودة** مع مشاركة شاشة المعلم لشرح الأكواد والمسائل.
• **أسئلة تفاعلية فورية (Polls):** يطرح المعلم سؤالاً يظهر على شاشتك لتجيب عليه في نفس اللحظة وتعرف النتيجة فوراً!
• **خاصية رفع اليد ✋:** لطلب التحدث وسؤال المعلم مباشرة في القاعة.
• ستصلك رسالة وإشعار قبل بدء أي بث مباشر بوقت كافٍ!`;
  }

  // 8. Parent Follow-up & WhatsApp
  if (q.includes('ولي الأمر') || q.includes('ولي امر') || q.includes('درجات ابني') || q.includes('تقرير') || q.includes('متابعة')) {
    return `### 👨‍👦 نظام متابعة ولي الأمر الآلي:

حرصاً على تفوق الطالب، توفر المنصة نظام متابعة فوري لولي الأمر:
• فور انتهاء الطالب من أي امتحان تفاعلي، يقوم النظام تلقائياً بإرسال **تقرير تفصيلي لدرجة الطالب عبر رسالة واتساب و SMS** إلى رقم موبايل ولي الأمر المسجل.
• يمكن لولي الأمر الدخول لتبويب **"متابعة ولي الأمر"** برقم هاتفه للاطلاع على السجل الكامل لحضور ابنه، والامتحانات، والمحفظة، وعدد ساعات المذاكرة.`;
  }

  // 9. Python - Loops (for / while)
  if (q.includes('for') || q.includes('loop') || q.includes('تكرار') || q.includes('while')) {
    return `### 🐍 التكرار (Loops) في لغة بايثون:

التكرار في البرمجة بنستخدمه لما نحب ننفذ كود معين كذا مرة بدون ما نكرر كتابته.

#### 1️⃣ تكرار \`for\` (المحدد بعدد مرات أو عناصر):
\`\`\`python
# طباعة الأرقام من 1 إلى 5
for i in range(1, 6):
    print(f"الحصة رقم: {i}")

# المرور على عناصر قائمة (List)
students = ["أحمد", "محمد", "سارة"]
for student in students:
    print("أهلاً بك يا بطل:", student)
\`\`\`

#### 2️⃣ تكرار \`while\` (المعتمد على شرط):
\`\`\`python
count = 1
while count <= 3:
    print("المحاولة رقم:", count)
    count += 1
\`\`\`

💡 **نصيحة ذهبية من م / نور الدين:** استخدم \`for\` لما تكون عارف عدد المرات مسبقاً، واستخدم \`while\` لما تكون مستني شرط معين يتحقق!`;
  }

  // 10. Python - Functions (دوال)
  if (q.includes('دالة') || q.includes('function') || q.includes('def') || q.includes('دوال')) {
    return `### ⚙️ الدوال (Functions) في لغة Python:

الدالة عبارة عن بلوك كود منظم ومغلق، بنكتبه مرة واحدة ونقدر نستدعيه في أي وقت وبأي قيم!

\`\`\`python
# تعريف الدالة باستخدام def
def calculate_grade(score, total):
    percentage = (score / total) * 100
    if percentage >= 50:
        return f"مبروك ناجح بنسبة: {percentage:.1f}% 🚀"
    else:
        return "محتاج تشد حيلك شوية يا بطل! 💪"

# استدعاء الدالة
result = calculate_grade(85, 100)
print(result)
\`\`\`

✨ **مميزات استخدام الدوال:**
• تنظيم الكود ومنع التكرار (DRY: Don't Repeat Yourself).
• سهولة اكتشاف الأخطاء وتعديلها في مكان واحد.`;
  }

  // 11. Python - OOP & Classes
  if (q.includes('oop') || q.includes('class') || q.includes('كلاس') || q.includes('كائن') || q.includes('وراثة')) {
    return `### 🧱 البرمجة كائنية التوجه (OOP) في Python:

فكرة الـ OOP ببساطة هي محاكاة الواقع؛ بنعمل **قالب (Class)** وننشئ منه **كائنات حقيقية (Objects)**.

\`\`\`python
# تعريف كلاس الطالب
class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade
        self.points = 100

    def study(self, hours):
        self.points += hours * 10
        print(f"أحسنت يا {self.name}! نقاطك الآن: {self.points} ⭐")

# إنشاء كائن
student1 = Student("نور الدين", "3 ثانوي")
student1.study(3)
\`\`\`

💡 **أعمدة الـ OOP الأساسية:**
1. **Encapsulation (التغليف):** حماية البيانات داخل الكائن.
2. **Inheritance (الوراثة):** وراثة كلاس لكلاس آخر لتوفير كتابة الكود.
3. **Polymorphism (تعدد الأشكال):** نفس الدالة تتصرف بشكل مختلف حسب الكائن.`;
  }

  // 12. Web Development (HTML vs CSS vs JS)
  if (q.includes('html') || q.includes('css') || q.includes('javascript') || q.includes('ويب') || q.includes('موقع') || q.includes('frontend')) {
    return `### 🌐 الفرق بين HTML و CSS و JavaScript في بناء المواقع:

تخيل إننا بنبني **عمارة سكنية** 🏢:

1. **HTML (الهيكل الخرساني):**
   • مسؤولة عن بنية الصفحة الأساسية (العناوين، الفقرات، الصور، الأزرار).
   • كود: \`<button>اضغط هنا</button>\`

2. **CSS (التشطيب والديكور والألوان):**
   • مسؤولة عن الشكل الجمالي (الألوان، الخطوط، الخلفيات، التنسيق المتجاوب مع الموبايل).
   • كود: \`button { background: #3b82f6; color: white; border-radius: 8px; }\`

3. **JavaScript (الكهرباء والمصعد والذكاء):**
   • مسؤولة عن التفاعل والحركة (لما تدوس على الزرار يفتح نافذة أو يرسل بيانات السيرفر).
   • كود: \`button.addEventListener('click', () => alert('تم التسجيل!'));\``;
  }

  // 13. Arabic - Kana and Sisters (كان وأخواتها)
  if (q.includes('كان') || q.includes('نواسخ') || q.includes('أخوات كان') || q.includes('افعال ناسخة')) {
    return `### 📖 قاعدة "كان وأخواتها" (الأفعال الناسخة الناقصة) - مع أ / سيد عبد العاطي:

تدخل على **الجملة الاسمية** (المبتدأ والخبر):
• **ترفع المبتدأ** ويسمى اسمها.
• **تنصب الخبر** ويسمى خبرها.

✨ **أخوات كان:**
(كان - أصبح - أضحى - أمسى - ظل - بات - صار - ليس - ما زال - ما برح - ما انفك - ما فتئ - ما دام).

📝 **مثال إعرابي تطبيقي:**
\`\`\`text
الجملة الأصلية: العلمُ نافعٌ  (مبتدأ مرفوع، وخبر مرفوع)
بعد دخول كان:  كانَ العلمُ نافعاً

• كان: فعل ماضٍ ناسخ ناقص مبني على الفتح.
• العلمُ: اسم كان مرفوع وعلامة رفعه الضمة الظاهرة.
• نافعاً: خبر كان منصوب وعلامة نصبه الفتحة الظاهرة.
\`\`\`

💡 **سؤال امتحاني ذكي للثانوية العامة:** الخبر قد يأتي مفرداً أو جملة (اسمية/فعلية) أو شبه جملة!`;
  }

  // 14. Arabic - Inna and Sisters (إن وأخواتها)
  if (q.includes('إن') || q.includes('ان') || q.includes('حروف ناسخة') || q.includes('اخوات ان')) {
    return `### 📖 قاعدة "إن وأخواتها" (الحروف الناسخة) - مع أ / سيد عبد العاطي:

تدخل على **الجملة الاسمية** وتعمل **عكس عمل كان وأخواتها**:
• **تنصب المبتدأ** ويسمى اسمها.
• **ترفع الخبر** ويسمى خبرها.

✨ **الحروف الناسخة ومعانيها:**
• **إنّ / أنّ:** للتوكيد.
• **كأنّ:** للتشبيه.
• **لكنّ:** للاستدراك.
• **ليت:** للتمني (طلب المستحيل).
• **لعلّ:** للترجي والإشفاق (الممكن).

📝 **مثال إعرابي:**
\`\`\`text
إنّ الطالبَ متفوقٌ

• إنّ: حرف توكيد ونصب ناسخ مبني لا محل له من الإعراب.
• الطالبَ: اسم إنّ منصوب وعلامة نصبه الفتحة الظاهرة.
• متفوقٌ: خبر إنّ مرفوع وعلامة رفعه الضمة الظاهرة.
\`\`\``;
  }

  // 15. Arabic - Derivatives (المشتقات: اسم الفاعل واسم المفعول)
  if (q.includes('مشتقات') || q.includes('اسم فاعل') || q.includes('اسم مفعول') || q.includes('صيغ مبالغة')) {
    return `### 📖 المشتقات العاملة في اللغة العربية:

1. **اسم الفاعل:**
• من الثلاثي على وزن **فَاعِل** (كَتَبَ -> كَاتِب، قَرَأَ -> قَارِئ).
• من غير الثلاثي: نأتي بالمضارع، ونقلب حرف المضارعة **ميماً مضمومة ونكسر ما قبل الآخر** (انْطَلَقَ -> يَنْطَلِقُ -> مُنْطَلِق).

2. **اسم المفعول:**
• من الثلاثي على وزن **مَفْعُول** (فَهِمَ -> مَفْهُوم، شَرِبَ -> مَشْرُوب).
• من غير الثلاثي: نقلب حرف المضارعة **ميماً مضمومة ونفتح ما قبل الآخر** (اسْتَخْرَجَ -> مُسْتَخْرَج).

3. **صيغ المبالغة (5 أوزان مشهورة):**
(مِفْعَال - فَعُول - فَعِيل - فَعِل - فَعَّال) مثل: مِقْدام، غَفُور، رَحِيم، حَذِر، عَلّام.`;
  }

  // 16. Contact & Support
  if (q.includes('تواصل') || q.includes('رقم') || q.includes('دعم') || q.includes('مساعدة') || q.includes('مشكلة') || q.includes('فون')) {
    return `### 📞 خدمة الدعم الفني والتواصل المباشر:

فريق الدعم الفني وإدارة المنصة في خدمتك على مدار الساعة:
• **واتساب وموبايل الدعم:** **01002169889**
• **البريد الإلكتروني:** \`noureldin.ahmed2001@gmail.com\`
• يمكنك الضغط على زر الواتساب العائم في الشاشة لفتح محادثة فورية مع الإدارة! 💬`;
  }

  // 17. General Encouragement or Welcome
  if (q.includes('أهلا') || q.includes('اهلا') || q.includes('سلام') || q.includes('ازيك') || q.includes('مرحبا') || q.includes('صباح') || q.includes('مساء')) {
    return `أهلاً بيك يا بطل في **منصة عِلم ينتفع به**! 🌟
أنا مساعدك التعليمي والتقني الذكي. جاهز لمساعدتك في:
• التعرف على معلمي المنصة (**م / نور الدين أحمد** في البرمجة و **أ / سيد عبد العاطي** في العربي) 👨‍🏫
• شرح دروس وأكواد **البرمجة والحاسب والذكاء الاصطناعي** 💻
• تفصيل قواعد **اللغة العربية والنحو والبلاغة** 📖
• الإجابة عن كل استفسارات **الاشتراكات والامتحانات والمحفظة** 💳

اكتب سؤالك فوراً وهنحله سوا بأبسط طريقة!`;
  }

  // Default intelligent assistant fallback
  return `### 🤖 أهلاً بك يا بطل في منصة عِلم!

سؤالك بخصوص: **"${query}"**.

📌 **لتوجيهك بأفضل طريقة:**
1. **معلمو المنصة:**
   • قسم البرمجة والحاسب والذكاء الاصطناعي يقدمه **المهندس / نور الدين أحمد** (خريج هندسة عين شمس بامتياز، ومحاضر بمدارس كامبريدج و Udacity).
   • قسم اللغة العربية يقدمه **الأستاذ / سيد عبد العاطي** (كبير معلمي اللغة العربية للثانوية العامة).

2. **لأي استفسار برمجية أو نحوي:**
   • اكتب لي الكود أو الجملة النحوية وسأشرحها لك خطوة بخطوة مع أمثلة.

3. **لأي استفسار عن الاشتراكات والدعم:**
   • فريق الدعم متواجد على الواتساب على مدار الساعة: **01002169889**.

اكتب لي ما تحتاج شرحه بالتفصيل وسأساعدك فوراً! 🚀`;
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: `أهلاً بيك يا بطل في منصة عِلم ينتفع به! 🤖✨ 
أنا **مساعدك التعليمي والتقني الذكي VIP**. أنا جاهز أساعدك في أي وقت في:

• 👨‍🏫 **التعرف على معلمي المنصة (م / نور الدين في البرمجة و أ / سيد عبد العاطي في العربي)**
• 💻 **شرح وتصحيح أكواد البرمجة (Python, Web, Mobile, Algorithms)**
• 📖 **شرح قواعد النحو والبلاغة وإعراب الجمل للثانوية العامة**
• 💳 **استفسارات شحن المحفظة، الاشتراكات، والامتحانات التفاعلية**

اكتب سؤالك، أو اختر من الأسئلة السريعة بالأسفل! 🚀`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    '💻 مين اللي بيشرح البرمجة هنا؟',
    '📖 مين مدرس اللغة العربية بالمنصة؟',
    '💳 إزاي أشحن المحفظة وأفعل الاشتراك؟',
    '🐍 مثال على التكرار For Loop في Python',
    '📝 اشرحلي النواسخ (كان وأخواتها)'
  ];

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const textToProcess = (userText || input).trim();
    if (!textToProcess || isLoading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: textToProcess };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Try backend AI API first
    let botReply = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: textToProcess }],
          provider: 'gemini'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response && !data.error) {
          botReply = data.response;
        }
      }
    } catch (err) {
      // Backend not responding or no API key configured
    }

    // If API did not return response, use Smart Knowledge Engine
    if (!botReply) {
      await new Promise(r => setTimeout(r, 600)); // natural typing effect
      botReply = getSmartResponse(textToProcess);
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botReply
    }]);

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40" dir="rtl">

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-600 hover:to-amber-500 text-white p-3 md:p-3.5 rounded-full shadow-2xl flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-amber-400/30 group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md group-hover:rotate-12 transition-transform">
            🤖
          </div>
          <span className="text-xs font-black hidden sm:inline pl-1 text-white drop-shadow">مساعد عِلم الذكي ⚡</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-[92vw] sm:w-[420px] h-[550px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                🤖
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5 text-white">
                  <span>مساعد عِلم الذكي</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded border border-amber-400/30 font-mono">VIP</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>متصل وجاهز لمساعدتك</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-slate-50 dark:bg-[#0D1B2A] text-xs">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-bold'
                      : 'bg-white dark:bg-[#162534] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">{m.text}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  🤖
                </div>
                <div className="bg-white dark:bg-[#162534] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span>المساعد الذكي يجهز الإجابة لك...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-white dark:bg-[#111e2d] border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="اكتب سؤالك هنا.. (برمجة، نحو، أو اشتراكات)"
              disabled={isLoading}
              className="flex-1 bg-slate-50 dark:bg-[#162534] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4 transform rotate-180" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
