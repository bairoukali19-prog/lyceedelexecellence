 /********************
 * UTIL & STORAGE - MODIFIED FOR LOCAL STORAGE ONLY
 ********************/
const LS_KEY = 'lx-data-v4';
const ADMIN = { user: 'admin7', pass: 'ali7800' };

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

// دالة لإظهار الإشعارات
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    // إضافة أنماط CSS إذا لم تكن موجودة
    if (!$('.notification-style')) {
        const style = document.createElement('style');
        style.className = 'notification-style';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification.success { background-color: #27ae60; }
            .notification.error { background-color: #e74c3c; }
            .notification.warning { background-color: #f39c12; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// دالة للحصول على البيانات
const getData = () => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
        const demo = {
            students: [
                {id: uid(), fullname:'Ahmed Amine', username:'ahmed.amine', password:'1234', code:'P-2024-001', classroom:'2ème Bac SP'},
                {id: uid(), fullname:'Sara El', username:'sara.el', password:'abcd', code:'P-2024-002', classroom:'2ème Bac SP'}
            ],
            grades: {},
            dictionary: [
                {id: uid(), ar: 'الطاقة', fr: 'Énergie', def: 'Capacité d\'un système à produire un travail.'},
                {id: uid(), ar: 'السرعة', fr: 'Vitesse', def: 'Distance parcourue par unité de temps.'},
                {id: uid(), ar: 'التسارع', fr: 'Accélération', def: 'Taux de changement de la vitesse.'},
                {id: uid(), ar: 'القوة', fr: 'Force', def: 'Action mécanique modifiant le mouvement.'}
            ],
            quiz: [],
            exams: [],
            exercises: [],
            lessons: [],
            announcement: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة",
            announcementImage: "",
            revisionRequests: [],
            quizResults: {},
            lastUpdated: new Date().toISOString()
        };
        
        // إنشاء بيانات نموذجية للطلاب
        demo.grades[demo.students[0].id] = [
            {id: uid(), date:'2024-10-15', subject:'Mécanique', title:'Contrôle 1', score:16.5, note:'Très bien'},
            {id: uid(), date:'2024-11-22', subject:'Électricité', title:'Contrôle 2', score:14, note:'Bon travail'}
        ];
        
        demo.grades[demo.students[1].id] = [
            {id: uid(), date:'2024-10-15', subject:'Mécanique', title:'Contrôle 1', score:15, note:'Bon travail'},
            {id: uid(), date:'2024-11-22', subject:'Électricité', title:'Contrôle 2', score:17, note:'Excellent'}
        ];
        
        localStorage.setItem(LS_KEY, JSON.stringify(demo));
        return demo;
    }
    
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.removeItem(LS_KEY);
        return getData();
    }
};

// دالة لحفظ البيانات
const setData = (data) => {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    showNotification('تم حفظ البيانات بنجاح');
    return Promise.resolve();
};

// تهيئة البيانات
let DB = getData();
let currentStudent = null;
let currentQuiz = null;
let quizTimer = null;
let currentQuestionIndex = 0;
let studentAnswers = {};

/********************
 * NAVIGATION
 ********************/
function showSection(id) {
    $$('.page-section').forEach(s => s.classList.remove('active'));
    if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
}

// إضافة مستمعي الأحداث لعناصر التنقل
document.addEventListener('DOMContentLoaded', function() {
    $$('.nav-link, .feature-card').forEach(item => {
        item.addEventListener('click', function () {
            const id = this.getAttribute('data-section');
            if (id) showSection(id);
        });
    });

    // إغلاق النماذج
    $$('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.modal').forEach(modal => modal.style.display = 'none');
        });
    });
});

/********************
 * STUDENT AREA
 ********************/
function fillGradesFor(student) {
    const tbody = $('#gradesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const list = (DB.grades[student.id] || []).slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
    if (!list.length) {
        $('#noGradesMsg').style.display = 'block';
    } else {
        $('#noGradesMsg').style.display = 'none';
    }
    
    list.forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${g.date || ''}</td><td>${g.subject || ''}</td><td>${g.title || ''}</td><td><strong>${Number(g.score).toFixed(2)}</strong></td><td>${g.note || ''}</td>`;
        tbody.appendChild(tr);
    });
    
    $('#studentInfo').innerHTML = `<div class="inline"><span class="chip"><i class="fa-solid fa-user"></i> ${student.fullname}</span><span class="chip"><i class="fa-solid fa-id-card"></i> ${student.code}</span><span class="chip"><i class="fa-solid fa-school"></i> ${student.classroom || ''}</span></div>`;
    $('#gradesResults').style.display = 'block';
    showSection('grades');
}

// البحث عن طريق كود المسار
$('#btnSearchByCode').addEventListener('click', () => {
    const code = ($('#searchCode').value || '').trim();
    const st = DB.students.find(s => s.code.toLowerCase() === code.toLowerCase());
    if (!st) {
        showNotification('كود المسار غير موجود', 'error');
        return;
    }
    fillGradesFor(st);
});

// فتح وإغلاق نافذة دخول الطالب
$('#studentLoginBtn').addEventListener('click', () => $('#studentLoginModal').style.display = 'flex');
$('#cancelStudentLogin').addEventListener('click', () => $('#studentLoginModal').style.display = 'none');

window.addEventListener('click', (e) => {
    if (e.target === $('#studentLoginModal')) $('#studentLoginModal').style.display = 'none';
    if (e.target === $('#loginModal')) $('#loginModal').style.display = 'none';
});

// تسجيل دخول الطالب
$('#submitStudentLogin').addEventListener('click', () => {
    const u = ($('#studentUsername').value || '').trim();
    const p = ($('#studentPassword').value || '').trim();
    const st = DB.students.find(s => s.username === u && s.password === p);
    
    if (!st) {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        return;
    }
    
    $('#studentLoginModal').style.display = 'none';
    
    // تعيين الطالب الحالي
    currentStudent = st;
    
    // عرض لوحة تحكم الطالب
    $('#studentWelcome').textContent = `مرحباً، ${st.fullname}`;
    $('#student-dashboard').style.display = 'block';
    showSection('student-dashboard');
    
    // تحميل موارد الطالب
    loadStudentResources();
    populateRevisionForm();
    loadStudentRevisionRequests();
    loadStudentQuizzes();
});

// تسجيل خروج الطالب
$('#studentLogoutBtn').addEventListener('click', () => {
    $('#student-dashboard').style.display = 'none';
    currentStudent = null;
    showSection('home');
});

// ملء نموذج المراجعة بدرجات الطالب
function populateRevisionForm() {
    if (!currentStudent) return;
    const grades = DB.grades[currentStudent.id] || [];
    const select = $('#revisionExam');
    select.innerHTML = '<option value="">اختر التقييم</option>';
    
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.id;
        option.textContent = `${grade.title} - ${grade.subject} (${grade.score}/20)`;
        select.appendChild(option);
    });
}

// معالجة إرسال طلب المراجعة
$('#revisionRequestForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentStudent) return;

    const gradeId = $('#revisionExam').value;
    const message = $('#revisionMessage').value;

    if (!gradeId || !message) {
        showNotification('يرجى اختيار اختبار وكتابة رسالة', 'error');
        return;
    }

    DB.revisionRequests = DB.revisionRequests || [];
    DB.revisionRequests.push({
        id: uid(),
        studentId: currentStudent.id,
        gradeId,
        message,
        date: new Date().toISOString().slice(0, 10),
        status: 'pending'
    });

    setData(DB);
    showNotification('تم إرسال طلبك بنجاح');
    this.reset();
    loadStudentRevisionRequests();
});

// تحميل طلبات مراجعة الطالب
function loadStudentRevisionRequests() {
    if (!currentStudent) return;
    const container = $('#studentRevisionRequests');
    container.innerHTML = '';
    
    const requests = (DB.revisionRequests || []).filter(req => req.studentId === currentStudent.id);
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="muted">لم تقم بإرسال أي طلبات مراجعة بعد.</p>';
        return;
    }
    
    requests.forEach(req => {
        const grade = (DB.grades[currentStudent.id] || []).find(g => g.id === req.gradeId);
        if (!grade) return;
        
        const statusColors = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'accent'
        };
        
        const item = document.createElement('div');
        item.className = 'revision-request-item';
        item.style.padding = '10px';
        item.style.border = '1px solid #eee';
        item.style.borderRadius = '5px';
        item.style.marginBottom = '10px';
        item.innerHTML = `
            <strong>${grade.title} - ${grade.subject}</strong>
            <p>${req.message}</p>
            <div class="inline">
                <span class="chip">التاريخ: ${req.date}</span>
                <span class="btn btn-${statusColors[req.status]}">الحالة: ${req.status}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

/********************
 * QUIZ FUNCTIONALITY
 ********************/
function loadStudentQuizzes() {
    if (!currentStudent) return;
    
    const container = $('#studentQuizList');
    container.innerHTML = '';
    
    if (DB.quiz.length === 0) {
        container.innerHTML = '<p class="muted">لا توجد مسابقات متاحة حالياً.</p>';
        return;
    }
    
    DB.quiz.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'content-card';
        quizCard.innerHTML = `
            <div class="card-content">
                <h3>مسابقة الفيزياء</h3>
                <p>هذه المسابقة تحتوي على ${DB.quiz.length} أسئلة. المدة: 30 دقيقة.</p>
                <button class="btn btn-primary start-quiz" data-quiz-id="general">بدء المسابقة</button>
            </div>
        `;
        container.appendChild(quizCard);
    });
    
    // إضافة مستمعي الأحداث لأزرار بدء المسابقة
    $$('.start-quiz').forEach(btn => {
        btn.addEventListener('click', function () {
            startQuiz();
        });
    });
    
    // تحميل نتائج المسابقة
    loadQuizResults();
}

function loadQuizResults() {
    if (!currentStudent) return;
    
    const container = $('#studentQuizResults');
    container.innerHTML = '';
    
    const results = DB.quizResults && DB.quizResults[currentStudent.id] ? DB.quizResults[currentStudent.id] : [];
    
    if (results.length === 0) {
        container.innerHTML = '<p class="muted">لا توجد نتائج للمسابقة حتى الآن.</p>';
        return;
    }
    
    results.forEach(result => {
        const resultCard = document.createElement('div');
        resultCard.className = 'content-card';
        resultCard.innerHTML = `
            <div class="card-content">
                <h3>مسابقة ${result.date}</h3>
                <p>النتيجة: ${result.score}/${result.total} (${Math.round((result.score / result.total) * 100)}%)</p>
                <p>الوقت المستغرق: ${result.timeUsed}</p>
            </div>
        `;
        container.appendChild(resultCard);
    });
}

function startQuiz() {
    if (!currentStudent) return;
    
    // إخفاء قائمة المسابقات وإظهار حاوية المسابقة
    $('#studentQuizList').style.display = 'none';
    $('#quizContainer').style.display = 'block';
    
    currentQuiz = DB.quiz;
    currentQuestionIndex = 0;
    studentAnswers = {};
    
    // بدء المؤقت (30 دقيقة)
    startTimer(30 * 60);
    
    // تحميل السؤال الأول
    loadQuestion(0);
}

function startTimer(duration) {
    let timer = duration;
    clearInterval(quizTimer);
    
    quizTimer = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        
        $('#quizTimer').textContent = `الوقت المتبقي: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (--timer < 0) {
            clearInterval(quizTimer);
            submitQuiz();
        }
    }, 1000);
}

function loadQuestion(index) {
    if (index < 0 || index >= currentQuiz.length) return;
    
    currentQuestionIndex = index;
    const question = currentQuiz[index];
    
    const container = $('#quizQuestionsContainer');
    container.innerHTML = '';
    
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question-slider active';
    questionEl.innerHTML = `
        <div class="quiz-question-number">السؤال ${index + 1} من ${currentQuiz.length}</div>
        <h3>${question.question}</h3>
        ${question.image ? `<img src="${question.image}" alt="صورة السؤال">` : ''}
        <div class="quiz-options">
            ${question.options.map((option, i) => `
                <div class="quiz-option" data-option="${i + 1}">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;
    
    container.appendChild(questionEl);
    
    // تحديث عداد الأسئلة
    $('#questionCounter').textContent = `السؤال ${index + 1} من ${currentQuiz.length}`;
    
    // إعداد اختيار الخيارات
    $$('.quiz-option').forEach(option => {
        option.addEventListener('click', function () {
            // إزالة class المحدد من جميع الخيارات
            $$('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            
            // إضافة class المحدد للخيار الذي تم النقر عليه
            this.classList.add('selected');
            
            // تخزين الإجابة
            studentAnswers[index] = this.getAttribute('data-option');
        });
    });
    
    // استعادة الإجابة السابقة إذا كانت موجودة
    if (studentAnswers[index]) {
        $(`.quiz-option[data-option="${studentAnswers[index]}"]`).classList.add('selected');
    }
    
    // إعداد أزرار التنقل
    $('#prevQuestion').style.display = index === 0 ? 'none' : 'block';
    $('#nextQuestion').style.display = index === currentQuiz.length - 1 ? 'none' : 'block';
    $('#submitQuiz').style.display = index === currentQuiz.length - 1 ? 'block' : 'none';
}

// التنقل بين الأسئلة
$('#prevQuestion').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
});

$('#nextQuestion').addEventListener('click', () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    }
});

// إرسال المسابقة
$('#submitQuiz').addEventListener('click', submitQuiz);

function submitQuiz() {
    clearInterval(quizTimer);
    
    // حساب النتيجة
    let score = 0;
    for (let i = 0; i < currentQuiz.length; i++) {
        if (studentAnswers[i] == currentQuiz[i].correct) {
            score++;
        }
    }
    
    // حفظ النتائج
    DB.quizResults = DB.quizResults || {};
    DB.quizResults[currentStudent.id] = DB.quizResults[currentStudent.id] || [];
    
    const timeUsed = calculateTimeUsed();
    
    DB.quizResults[currentStudent.id].push({
        date: new Date().toLocaleDateString(),
        score: score,
        total: currentQuiz.length,
        timeUsed: timeUsed
    });
    
    setData(DB);
    
    // عرض النتائج
    $('#quizContainer').style.display = 'none';
    $('#quizResultsContainer').style.display = 'block';
    
    $('#quizResultsContent').innerHTML = `
        <h4>نتائج المسابقة</h4>
        <p>لقد حصلت على ${score} من ${currentQuiz.length} (${Math.round((score / currentQuiz.length) * 100)}%)</p>
        <p>الوقت المستغرق: ${timeUsed}</p>
        <button class="btn btn-primary" id="backToQuizzes">العودة إلى المسابقات</button>
    `;
    
    $('#backToQuizzes').addEventListener('click', () => {
        $('#quizResultsContainer').style.display = 'none';
        $('#studentQuizList').style.display = 'block';
        loadQuizResults();
    });
}

function calculateTimeUsed() {
    // هذا سيتم حسابه عادة بناءً على الوقت الفعلي المستغرق
    // للتبسيط، سنعيد قيمة افتراضية
    return "25:30";
}

/********************
 * ADMIN AUTH
 ********************/
$('#loginBtn').addEventListener('click', () => $('#loginModal').style.display = 'flex');
$('#cancelLogin').addEventListener('click', () => $('#loginModal').style.display = 'none');

$('#submitLogin').addEventListener('click', () => {
    const u = $('#username').value.trim();
    const p = $('#password').value.trim();
    
    if (u === ADMIN.user && p === ADMIN.pass) {
        $('#loginModal').style.display = 'none';
        document.body.classList.add('admin-mode');
        $('#admin-panel').style.display = 'block';
        showSection('admin-panel');
        renderStudentsTable();
        populateStudentSelects();
        renderAdminGradesTable();
        updateDashboardStats();
        renderAdminDictionaryList();
        renderAdminQuizList();
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
});

$('#logoutBtn').addEventListener('click', () => {
    document.body.classList.remove('admin-mode');
    $('#admin-panel').style.display = 'none';
    showSection('home');
});

/********************
 * DASHBOARD STATS
 ********************/
function updateDashboardStats() {
    $('#stats-students').textContent = DB.students.length;
    $('#stats-quiz').textContent = DB.quiz.length;
    $('#stats-dictionary').textContent = DB.dictionary.length;
    
    // حساب إجمالي الدرجات
    let totalGrades = 0;
    for (const studentId in DB.grades) {
        totalGrades += DB.grades[studentId].length;
    }
    $('#stats-grades').textContent = totalGrades;
    
    // تحميل النشاط الحديث
    const activityContainer = $('#recent-activity');
    activityContainer.innerHTML = '';
    
    // إضافة بعض الأنشطة النموذجية
    const activities = [
        { action: 'طالب جديد مسجل', details: 'Ahmed Amine', time: 'منذ ساعتين' },
        { action: 'تمت إضافة درجة', details: 'اختبار 1 - الميكانيك', time: 'منذ 5 ساعات' },
        { action: 'تمت إضافة سؤال مسابقة', details: 'سؤال جديد حول الكهرباء', time: 'أمس' }
    ];
    
    if (activities.length === 0) {
        activityContainer.innerHTML = '<p class="muted">لا يوجد نشاط حديث.</p>';
        return;
    }
    
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.style.padding = '10px';
        activityEl.style.borderBottom = '1px solid #eee';
        activityEl.innerHTML = `
            <div><strong>${activity.action}</strong>: ${activity.details}</div>
            <div class="muted" style="font-size: 0.9rem;">${activity.time}</div>
        `;
        activityContainer.appendChild(activityEl);
    });
}

/********************
 * STUDENTS MANAGEMENT
 ********************/
function renderStudentsTable() {
    const tbody = $('#studentsTable tbody');
    tbody.innerHTML = '';
    
    DB.students.forEach(st => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${st.fullname}</td>
            <td>${st.username}</td>
            <td>${st.code}</td>
            <td>${st.classroom || ''}</td>
            <td>
                <button class="btn btn-ghost btn-sm edit-student" data-id="${st.id}"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-accent btn-sm delete-student" data-id="${st.id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إضافة مستمعي الأحداث
    $$('.edit-student').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const st = DB.students.find(s => s.id === id);
            
            if (st) {
                $('#stId').value = st.id;
                $('#stFullname').value = st.fullname;
                $('#stUsername').value = st.username;
                $('#stPassword').value = st.password;
                $('#stCode').value = st.code;
                $('#stClassroom').value = st.classroom || '';
            }
        });
    });
    
    $$('.delete-student').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطالب؟')) {
                DB.students = DB.students.filter(s => s.id !== id);
                delete DB.grades[id];
                setData(DB);
                renderStudentsTable();
                populateStudentSelects();
            }
        });
    });
    
    // تصفية الطلاب
    $('#filterStudents').addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        $$('#studentsTable tbody tr').forEach(tr => {
            const text = tr.textContent.toLowerCase();
            tr.style.display = text.includes(filter) ? '' : 'none';
        });
    });
}

// ملء اختيارات الطلاب في النماذج
function populateStudentSelects() {
    const studentSelects = ['#grStudent', '#grFilterStudent'];
    
    studentSelects.forEach(sel => {
        const select = $(sel);
        if (select) {
            select.innerHTML = '';
            
            DB.students.forEach(st => {
                const option = document.createElement('option');
                option.value = st.id;
                option.textContent = `${st.fullname} (${st.code})`;
                select.appendChild(option);
            });
        }
    });
}

// حفظ الطالب
$('#btnSaveStudent').addEventListener('click', () => {
    const id = $('#stId').value;
    const fullname = $('#stFullname').value.trim();
    const username = $('#stUsername').value.trim();
    const password = $('#stPassword').value.trim();
    const code = $('#stCode').value.trim();
    const classroom = $('#stClassroom').value.trim();
    
    if (!fullname || !username || !password || !code) {
        showNotification('يرجى ملء جميع الحقول الإلزامية', 'error');
        return;
    }
    
    if (id) {
        // تحديث الطالب الحالي
        const index = DB.students.findIndex(s => s.id === id);
        
        if (index !== -1) {
            DB.students[index] = { ...DB.students[index], fullname, username, password, code, classroom };
        }
    } else {
        // إضافة طالب جديد
        const newStudent = { id: uid(), fullname, username, password, code, classroom };
        DB.students.push(newStudent);
    }
    
    setData(DB);
    renderStudentsTable();
    populateStudentSelects();
    $('#btnResetStudent').click();
});

// إعادة تعيين نموذج الطالب
$('#btnResetStudent').addEventListener('click', () => {
    $('#stId').value = '';
    $('#stFullname').value = '';
    $('#stUsername').value = '';
    $('#stPassword').value = '';
    $('#stCode').value = '';
    $('#stClassroom').value = '';
});

/********************
 * GRADES MANAGEMENT
 ********************/
function renderAdminGradesTable() {
    const tbody = $('#gradesAdminTable tbody');
    tbody.innerHTML = '';
    
    const studentId = $('#grFilterStudent').value;
    let grades = [];
    
    if (studentId) {
        grades = DB.grades[studentId] || [];
    } else {
        // عرض جميع الدرجات
        for (const id in DB.grades) {
            if (Array.isArray(DB.grades[id])) {
                grades = grades.concat(DB.grades[id]);
            }
        }
    }
    
    if (grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">لا توجد درجات متاحة</td></tr>';
        return;
    }
    
    grades.forEach(grade => {
        const student = DB.students.find(s => {
            const studentGrades = DB.grades[s.id] || [];
            return studentGrades.some(g => g.id === grade.id);
        });
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student ? student.fullname : 'غير معروف'}</td>
            <td>${grade.date || ''}</td>
            <td>${grade.subject || ''}</td>
            <td>${grade.title || ''}</td>
            <td><strong>${Number(grade.score).toFixed(2)}</strong></td>
            <td>${grade.note || ''}</td>
            <td>
                <button class="btn btn-ghost btn-sm edit-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-accent btn-sm delete-grade" data-id="${grade.id}" data-student="${student ? student.id : ''}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إضافة مستمعي الأحداث
    $$('.edit-grade').forEach(btn => {
        btn.addEventListener('click', function () {
            const gradeId = this.getAttribute('data-id');
            const studentId = this.getAttribute('data-student');
            const grades = DB.grades[studentId] || [];
            const grade = grades.find(g => g.id === gradeId);
            
            if (grade) {
                $('#grId').value = grade.id;
                $('#grStudent').value = studentId;
                $('#grSubject').value = grade.subject || '';
                $('#grTitle').value = grade.title || '';
                $('#grDate').value = grade.date || '';
                $('#grScore').value = grade.score || '';
                $('#grNote').value = grade.note || '';
            }
        });
    });
    
    $$('.delete-grade').forEach(btn => {
        btn.addEventListener('click', function () {
            const gradeId = this.getAttribute('data-id');
            const studentId = this.getAttribute('data-student');
            
            if (confirm('هل أنت متأكد من رغبتك في حذف هذه الدرجة؟')) {
                if (DB.grades[studentId]) {
                    DB.grades[studentId] = DB.grades[studentId].filter(g => g.id !== gradeId);
                    setData(DB);
                    renderAdminGradesTable();
                }
            }
        });
    });
}

// تصفية الدرجات حسب الطالب
$('#grFilterStudent').addEventListener('change', renderAdminGradesTable);

// حفظ الدرجة
$('#btnSaveGrade').addEventListener('click', () => {
    const id = $('#grId').value;
    const studentId = $('#grStudent').value;
    const subject = $('#grSubject').value.trim();
    const title = $('#grTitle').value.trim();
    const date = $('#grDate').value;
    const score = parseFloat($('#grScore').value);
    const note = $('#grNote').value.trim();
    
    if (!studentId || !subject || !title || !date || isNaN(score)) {
        showNotification('يرجى ملء جميع الحقول الإلزامية', 'error');
        return;
    }
    
    if (!DB.grades[studentId]) {
        DB.grades[studentId] = [];
    }
    
    if (id) {
        // تحديث الدرجة الحالية
        const index = DB.grades[studentId].findIndex(g => g.id === id);
        
        if (index !== -1) {
            DB.grades[studentId][index] = { ...DB.grades[studentId][index], subject, title, date, score, note };
        }
    } else {
        // إضافة درجة جديدة
        const newGrade = { id: uid(), subject, title, date, score, note };
        DB.grades[studentId].push(newGrade);
    }
    
    setData(DB);
    renderAdminGradesTable();
    $('#btnResetGrade').click();
});

// إعادة تعيين نموذج الدرجة
$('#btnResetGrade').addEventListener('click', () => {
    $('#grId').value = '';
    $('#grStudent').value = '';
    $('#grSubject').value = '';
    $('#grTitle').value = '';
    $('#grDate').value = '';
    $('#grScore').value = '';
    $('#grNote').value = '';
});

/********************
 * DICTIONARY MANAGEMENT
 ********************/
function renderAdminDictionaryList() {
    const container = $('#dictionaryTermsList');
    container.innerHTML = '';
    
    if (DB.dictionary.length === 0) {
        container.innerHTML = '<p class="muted">لا توجد مصطلحات حتى الآن.</p>';
        return;
    }
    
    DB.dictionary.forEach(term => {
        const termEl = document.createElement('div');
        termEl.className = 'dictionary-term';
        termEl.style.padding = '10px';
        termEl.style.borderBottom = '1px solid #eee';
        termEl.innerHTML = `
            <div><strong>${term.ar}</strong> → ${term.fr}</div>
            <div class="muted">${term.def}</div>
            <div class="mt-1">
                <button class="btn btn-ghost btn-sm edit-dict" data-id="${term.id}"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-accent btn-sm delete-dict" data-id="${term.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(termEl);
    });
    
    // إضافة مستمعي الأحداث
    $$('.edit-dict').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const term = DB.dictionary.find(t => t.id === id);
            
            if (term) {
                $('#adminDictAr').value = term.ar;
                $('#adminDictFr').value = term.fr;
                $('#adminDictDef').value = term.def;
                // تخزين المعرف للتحديث
                $('#adminDictAr').setAttribute('data-id', id);
            }
        });
    });
    
    $$('.delete-dict').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا المصطلح؟')) {
                DB.dictionary = DB.dictionary.filter(t => t.id !== id);
                setData(DB);
                renderAdminDictionaryList();
            }
        });
    });
}

// حفظ مصطلح القاموس
$('#adminBtnSaveDict').addEventListener('click', () => {
    const id = $('#adminDictAr').getAttribute('data-id');
    const ar = $('#adminDictAr').value.trim();
    const fr = $('#adminDictFr').value.trim();
    const def = $('#adminDictDef').value.trim();
    
    if (!ar || !fr) {
        showNotification('يرجى ملء الحقلين العربي والفرنسي', 'error');
        return;
    }
    
    if (id) {
        // تحديث المصطلح الحالي
        const index = DB.dictionary.findIndex(t => t.id === id);
        
        if (index !== -1) {
            DB.dictionary[index] = { ...DB.dictionary[index], ar, fr, def };
        }
    } else {
        // إضافة مصطلح جديد
        const newTerm = { id: uid(), ar, fr, def };
        DB.dictionary.push(newTerm);
    }
    
    setData(DB);
    renderAdminDictionaryList();
    $('#adminBtnResetDict').click();
});

// إعادة تعيين نموذج القاموس
$('#adminBtnResetDict').addEventListener('click', () => {
    $('#adminDictAr').value = '';
    $('#adminDictFr').value = '';
    $('#adminDictDef').value = '';
    $('#adminDictAr').removeAttribute('data-id');
});

/********************
 * QUIZ MANAGEMENT
 ********************/
function renderAdminQuizList() {
    const container = $('#quizQuestionsList');
    container.innerHTML = '';
    
    if (DB.quiz.length === 0) {
        container.innerHTML = '<p class="muted">لا توجد أسئلة حتى الآن.</p>';
        return;
    }
    
    DB.quiz.forEach((question, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-question';
        questionEl.style.padding = '10px';
        questionEl.style.borderBottom = '1px solid #eee';
        questionEl.innerHTML = `
            <div><strong>السؤال ${index + 1}:</strong> ${question.question}</div>
            ${question.image ? `<div><img src="${question.image}" alt="صورة السؤال" style="max-width: 200px; max-height: 150px;"></div>` : ''}
            <div class="muted">
                الخيارات: 
                ${question.options.map((option, i) => `
                    ${i + 1}. ${option} ${i + 1 == question.correct ? '✓' : ''}
                `).join(' | ')}
            </div>
            <div class="mt-1">
                <button class="btn btn-ghost btn-sm edit-quiz" data-id="${question.id}"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-accent btn-sm delete-quiz" data-id="${question.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(questionEl);
    });
    
    // إضافة مستمعي الأحداث
    $$('.edit-quiz').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const question = DB.quiz.find(q => q.id === id);
            
            if (question) {
                $('#adminQuizQuestion').value = question.question;
                $('#adminOption1').value = question.options[0] || '';
                $('#adminOption2').value = question.options[1] || '';
                $('#adminOption3').value = question.options[2] || '';
                $('#adminOption4').value = question.options[3] || '';
                $('#adminQuizCorrect').value = question.correct;
                // تخزين المعرف للتحديث
                $('#adminQuizQuestion').setAttribute('data-id', id);
            }
        });
    });
    
    $$('.delete-quiz').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) {
                DB.quiz = DB.quiz.filter(q => q.id !== id);
                setData(DB);
                renderAdminQuizList();
            }
        });
    });
}

// حفظ سؤال المسابقة
$('#adminBtnSaveQuiz').addEventListener('click', () => {
    const id = $('#adminQuizQuestion').getAttribute('data-id');
    const question = $('#adminQuizQuestion').value.trim();
    const options = [
        $('#adminOption1').value.trim(),
        $('#adminOption2').value.trim(),
        $('#adminOption3').value.trim(),
        $('#adminOption4').value.trim()
    ];
    const correct = parseInt($('#adminQuizCorrect').value);
    
    if (!question || options.some(opt => !opt)) {
        showNotification('يرجى ملء السؤال وجميع الخيارات', 'error');
        return;
    }
    
    if (id) {
        // تحديث السؤال الحالي
        const index = DB.quiz.findIndex(q => q.id === id);
        
        if (index !== -1) {
            DB.quiz[index] = { ...DB.quiz[index], question, options, correct };
        }
    } else {
        // إضافة سؤال جديد
        const newQuestion = { id: uid(), question, options, correct };
        DB.quiz.push(newQuestion);
    }
    
    setData(DB);
    renderAdminQuizList();
    $('#adminBtnResetQuiz').click();
});

// إعادة تعيين نموذج المسابقة
$('#adminBtnResetQuiz').addEventListener('click', () => {
    $('#adminQuizQuestion').value = '';
    $('#adminOption1').value = '';
    $('#adminOption2').value = '';
    $('#adminOption3').value = '';
    $('#adminOption4').value = '';
    $('#adminQuizCorrect').value = '1';
    $('#adminQuizQuestion').removeAttribute('data-id');
});

/********************
 * ANNOUNCEMENT MANAGEMENT
 ********************/
$('#btnSaveAnnouncement').addEventListener('click', () => {
    const announcement = $('#announcementInput').value.trim();
    DB.announcement = announcement;
    
    // معالجة تحميل الصورة
    const imageInput = $('#announcementImageInput');
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            DB.announcementImage = e.target.result;
            setData(DB);
            updateAnnouncementDisplay();
            showNotification('تم حفظ الإعلان مع الصورة!');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        setData(DB);
        updateAnnouncementDisplay();
        showNotification('تم حفظ الإعلان!');
    }
});

function updateAnnouncementDisplay() {
    $('#announcementText').textContent = DB.announcement;
    
    if (DB.announcementImage) {
        $('#announcementImage').src = DB.announcementImage;
        $('#announcementImage').style.display = 'block';
    } else {
        $('#announcementImage').style.display = 'none';
    }
}

// معاينة الصورة للإعلان
$('#announcementImageInput').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#announcementImagePreview').src = e.target.result;
            $('#announcementImagePreview').style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
    }
});

/********************
 * REVISION REQUESTS MANAGEMENT
 ********************/
function renderRevisionRequests() {
    const container = $('#revisionRequestsList');
    container.innerHTML = '';
    
    if (!DB.revisionRequests || DB.revisionRequests.length === 0) {
        container.innerHTML = '<p class="muted">لا توجد طلبات مراجعة حتى الآن.</p>';
        return;
    }
    
    DB.revisionRequests.forEach(request => {
        const student = DB.students.find(s => s.id === request.studentId);
        const grade = student && DB.grades[student.id] ? DB.grades[student.id].find(g => g.id === request.gradeId) : null;
        
        if (!student || !grade) return;
        
        const statusColors = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'accent'
        };
        
        const requestEl = document.createElement('div');
        requestEl.className = 'revision-request';
        requestEl.style.padding = '15px';
        requestEl.style.border = '1px solid #eee';
        requestEl.style.borderRadius = '8px';
        requestEl.style.marginBottom = '10px';
        requestEl.innerHTML = `
            <div><strong>${student.fullname}</strong> - ${grade.title} (${grade.subject}) - النتيجة: ${grade.score}/20</div>
            <div class="muted">${request.date}</div>
            <div>${request.message}</div>
            <div class="mt-2">
                <span class="btn btn-${statusColors[request.status]}">الحالة: ${request.status}</span>
                ${request.status === 'pending' ? `
                    <button class="btn btn-success btn-sm approve-revision" data-id="${request.id}">موافقة</button>
                    <button class="btn btn-accent btn-sm reject-revision" data-id="${request.id}">رفض</button>
                ` : ''}
            </div>
        `;
        container.appendChild(requestEl);
    });
    
    // إضافة مستمعي الأحداث
    $$('.approve-revision').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const request = DB.revisionRequests.find(r => r.id === id);
            
            if (request) {
                request.status = 'approved';
                setData(DB);
                renderRevisionRequests();
            }
        });
    });
    
    $$('.reject-revision').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const request = DB.revisionRequests.find(r => r.id === id);
            
            if (request) {
                request.status = 'rejected';
                setData(DB);
                renderRevisionRequests();
            }
        });
    });
}

/********************
 * DATA IMPORT/EXPORT
 ********************/
$('#btnExport').addEventListener('click', () => {
    const dataStr = JSON.stringify(DB, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'lycee-excellence-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('تم تصدير البيانات بنجاح');
});

$('#importFile').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (confirm('هل أنت متأكد من رغبتك في استيراد هذه البيانات؟ سيتم استبدال جميع البيانات الحالية.')) {
                localStorage.setItem(LS_KEY, JSON.stringify(importedData));
                DB = getData();
                showNotification('تم استيراد البيانات بنجاح!');
                location.reload();
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء استيراد الملف. التنسيق غير صحيح.', 'error');
        }
    };
    reader.readAsText(file);
});

/********************
 * INITIALIZATION
 ********************/
document.addEventListener('DOMContentLoaded', function () {
    // تحميل موارد الطالب
    loadStudentResources();
    
    // إعداد وظائف المدير
    if (document.body.classList.contains('admin-mode')) {
        renderStudentsTable();
        populateStudentSelects();
        renderAdminGradesTable();
        updateDashboardStats();
        renderAdminDictionaryList();
        renderAdminQuizList();
    }
    
    // تحديث عرض الإعلان
    updateAnnouncementDisplay();
});

// تحميل موارد الطالب
function loadStudentResources() {
    if (!currentStudent) return;
    
    // تحميل الدرجات الحديثة
    const gradesContainer = $('#studentRecentGrades');
    
    if (gradesContainer) {
        gradesContainer.innerHTML = '';
        
        const grades = (DB.grades[currentStudent.id] || []).slice(-5).reverse();
        
        if (grades.length === 0) {
            gradesContainer.innerHTML = '<p class="muted">لا توجد درجات متاحة حالياً.</p>';
        } else {
            grades.forEach(grade => {
                const gradeEl = document.createElement('div');
                gradeEl.style.padding = '10px';
                gradeEl.style.borderBottom = '1px solid #eee';
                gradeEl.innerHTML = `
                    <div><strong>${grade.title}</strong> - ${grade.subject}</div>
                    <div>النتيجة: ${grade.score}/20 - ${grade.note}</div>
                    <div class="muted">${grade.date}</div>
                `;
                gradesContainer.appendChild(gradeEl);
            });
        }
    }
    
    // تحميل الموارد
    const resourcesContainer = $('#studentResources');
    
    if (resourcesContainer) {
        resourcesContainer.innerHTML = '';
        
        // إضافة بعض الموارد النموذجية
        const resources = [
            { type: 'lesson', title: 'مقدمة في الميكانيك', chapter: 'الميكانيك' },
            { type: 'exercise', title: 'تمارين في الكهرباء', chapter: 'الكهرباء' },
            { type: 'exam', title: 'امتحان تجريبي 2023', chapter: 'عام' }
        ];
        
        resources.forEach(resource => {
            const resourceEl = document.createElement('div');
            resourceEl.className = 'content-card';
            resourceEl.innerHTML = `
                <div class="card-content">
                    <h3>${resource.title}</h3>
                    <p>الفصل: ${resource.chapter}</p>
                    <button class="btn btn-outline">استعراض</button>
                </div>
            `;
            resourcesContainer.appendChild(resourceEl);
        });
    }
    
    // تحميل مصطلحات القاموس
    const dictionaryContainer = $('#studentDictionaryContent');
    
    if (dictionaryContainer) {
        dictionaryContainer.innerHTML = '';
        
        DB.dictionary.forEach(term => {
            const termEl = document.createElement('div');
            termEl.className = 'content-card';
            termEl.innerHTML = `
                <div class="card-content">
                    <h3>${term.ar} → ${term.fr}</h3>
                    <p>${term.def}</p>
                </div>
            `;
            dictionaryContainer.appendChild(termEl);
        });
    }
    
    // تحميل التمارين
    const exercisesContainer = $('#studentExercisesList');
    
    if (exercisesContainer) {
        exercisesContainer.innerHTML = '';
        
        // إضافة بعض التمارين النموذجية
        const exercises = [
            { title: 'تمارين على القوى', chapter: 'الميكانيك' },
            { title: 'مسائل في الكهرباء', chapter: 'الكهرباء' },
            { title: 'واجب منزلي', chapter: 'عام' }
        ];
        
        exercises.forEach(exercise => {
            const exerciseEl = document.createElement('div');
            exerciseEl.className = 'content-card';
            exerciseEl.innerHTML = `
                <div class="card-content">
                    <h3>${exercise.title}</h3>
                    <p>الفصل: ${exercise.chapter}</p>
                    <button class="btn btn-outline">تحميل</button>
                </div>
            `;
            exercisesContainer.appendChild(exerciseEl);
        });
    }
}
