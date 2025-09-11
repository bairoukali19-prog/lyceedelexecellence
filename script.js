/********************
 * INITIALIZATION AND DATA MANAGEMENT
 ********************/
const LS_KEY = 'lyceeExcellenceData';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

// عناصر DOM الأساسية
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// توليد معرف فريد
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// بيانات التطبيق
let appData = {
    students: [],
    grades: [],
    quizQuestions: [],
    dictionary: [],
    lessons: [],
    exercises: [],
    exams: [],
    messages: [],
    latexContents: [],
    currentUser: null,
    isAdmin: false,
    announcement: {
        text: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة",
        image: null
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // الانتظار حتى يتم تحميل DOM بالكامل
    setTimeout(() => {
        loadData();
        initUI();
        loadInitialContent();
        setupEventHandlers();
        initLatexEditor();
    }, 100);
});

// تحميل البيانات من localStorage
function loadData() {
    const savedData = localStorage.getItem(LS_KEY);
    if (savedData) {
        try {
            appData = {...appData, ...JSON.parse(savedData)};
        } catch (e) {
            console.error("Error loading data:", e);
            // إنشاء بيانات جديدة إذا كان هناك خطأ
            initializeDefaultData();
        }
    } else {
        initializeDefaultData();
    }
}

// تهيئة البيانات الافتراضية
function initializeDefaultData() {
    appData = {
        students: [
            {id: generateId(), fullname:'Ahmed Amine', username:'ahmed.amine', password:'1234', code:'P-2024-001', classroom:'2ème Bac SP'},
            {id: generateId(), fullname:'Sara El', username:'sara.el', password:'abcd', code:'P-2024-002', classroom:'2ème Bac SP'}
        ],
        grades: [
            {id: generateId(), studentId: 'id-1', subject:'Mécanique', title:'Contrôle 1', date:'2024-10-15', score:16.5, note:'Très bien'},
            {id: generateId(), studentId: 'id-1', subject:'Électricité', title:'Contrôle 2', date:'2024-11-22', score:14, note:'Bon travail'},
            {id: generateId(), studentId: 'id-2', subject:'Mécanique', title:'Contrôle 1', date:'2024-10-15', score:15, note:'Bon travail'},
            {id: generateId(), studentId: 'id-2', subject:'Électricité', title:'Contrôle 2', date:'2024-11-22', score:17, note:'Excellent'}
        ],
        quizQuestions: [],
        dictionary: [
            {id: generateId(), ar: 'الطاقة', fr: 'Énergie', definition: 'Capacité d\'un système à produire un travail.'},
            {id: generateId(), ar: 'السرعة', fr: 'Vitesse', definition: 'Distance parcourue par unité de temps.'},
            {id: generateId(), ar: 'التسارع', fr: 'Accélération', definition: 'Taux de changement de la vitesse.'},
            {id: generateId(), ar: 'القوة', fr: 'Force', definition: 'Action mécanique modifiant le mouvement.'}
        ],
        lessons: [],
        exercises: [],
        exams: [],
        messages: [],
        latexContents: [],
        currentUser: null,
        isAdmin: false,
        announcement: {
            text: "ستبدأ الدراسة الفعلية يوم 16/09/2025 نتمنى لتلاميذ والتلميذات سنة دراسية مليئة بالجد ومثمرة",
            image: null
        }
    };
    saveData();
}

// حفظ البيانات إلى localStorage
function saveData() {
    localStorage.setItem(LS_KEY, JSON.stringify(appData));
}

// تهيئة واجهة المستخدم
function initUI() {
    updateStats();
    updateAnnouncement();
    populateStudentSelects();
}

// تحميل المحتوى الأولي
function loadInitialContent() {
    if (appData.dictionary.length > 0) {
        renderDictionary();
    }
    
    if (appData.quizQuestions.length > 0) {
        renderQuiz();
    }
    
    if (appData.lessons.length > 0) {
        renderLessons();
    }
    
    if (appData.exercises.length > 0) {
        renderExercises();
    }
    
    if (appData.exams.length > 0) {
        renderExams();
    }
}

// إعداد معالجي الأحداث
function setupEventHandlers() {
    // التنقل بين الأقسام
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // التنقل عبر بطاقات الميزات
    $$('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // تسجيل دخول الطالب
    $('#studentLoginBtn').addEventListener('click', function() {
        $('#studentLoginModal').style.display = 'flex';
    });

    $('#cancelStudentLogin').addEventListener('click', function() {
        $('#studentLoginModal').style.display = 'none';
    });

    $('#submitStudentLogin').addEventListener('click', function() {
        const username = $('#studentUsername').value;
        const password = $('#studentPassword').value;
        loginStudent(username, password);
    });

    // تسجيل دخول المدير
    $('#loginBtn').addEventListener('click', function() {
        $('#loginModal').style.display = 'flex';
    });

    $('#cancelLogin').addEventListener('click', function() {
        $('#loginModal').style.display = 'none';
    });

    $('#submitLogin').addEventListener('click', function() {
        const username = $('#username').value;
        const password = $('#password').value;
        loginAdmin(username, password);
    });

    // تسجيل الخروج
    $('#studentLogoutBtn').addEventListener('click', function() {
        logout();
    });

    $('#logoutBtn').addEventListener('click', function() {
        logout();
    });

    // علامات التبويب للطالب
    $$('.student-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchStudentTab(tabName);
        });
    });

    // علامات التبويب للمدير
    $$('.admin-tab-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchAdminTab(tabName);
        });
    });

    // البحث عن النتائج بالكود
    $('#btnSearchByCode').addEventListener('click', function() {
        const code = $('#searchCode').value;
        searchGradesByCode(code);
    });

    // إدارة الطلاب
    $('#btnSaveStudent').addEventListener('click', function() {
        saveStudent();
    });

    $('#btnResetStudent').addEventListener('click', function() {
        resetStudentForm();
    });

    // إدارة الدرجات
    $('#btnSaveGrade').addEventListener('click', function() {
        saveGrade();
    });

    $('#btnResetGrade').addEventListener('click', function() {
        resetGradeForm();
    });

    // إدارة القاموس
    $('#adminBtnSaveDict').addEventListener('click', function() {
        saveDictionaryTerm();
    });

    $('#adminBtnResetDict').addEventListener('click', function() {
        resetDictionaryForm();
    });

    // إدارة الدروس (مع دعم روابط Google Drive)
    $('#adminBtnSaveLesson').addEventListener('click', function() {
        saveLesson();
    });

    // إدارة التمارين (مع دعم روابط Google Drive)
    $('#adminBtnSaveExercise').addEventListener('click', function() {
        saveExercise();
    });

    // إدارة الامتحانات (مع دعم روابط Google Drive)
    $('#adminBtnSaveExam').addEventListener('click', function() {
        saveExam();
    });

    // إدارة الإعلانات
    $('#btnSaveAnnouncement').addEventListener('click', function() {
        saveAnnouncement();
    });

    // طلبات المراجعة
    $('#revisionRequestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitRevisionRequest();
    });

    // إدارة محتوى LaTeX
    $('#btnSaveLatex').addEventListener('click', function() {
        saveLatexContent();
    });

    $('#btnResetLatex').addEventListener('click', function() {
        resetLatexForm();
    });

    // إغلاق النماذج بالنقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target === $('#studentLoginModal')) {
            $('#studentLoginModal').style.display = 'none';
        }
        if (e.target === $('#loginModal')) {
            $('#loginModal').style.display = 'none';
        }
    });

    // تصفية الطلاب
    $('#filterStudents').addEventListener('input', function() {
        filterStudents(this.value);
    });

    // تحديث قائمة الطلاب عند تغيير التصفية
    $('#grFilterStudent').addEventListener('change', function() {
        loadGradesTable();
    });
}

/********************
 * NAVIGATION FUNCTIONS
 ********************/
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    $$('.page-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إخفاء لوحة الطالب ولوحة المدير
    $('#student-dashboard').style.display = 'none';
    $('#admin-panel').style.display = 'none';
    
    // إظهار القسم المطلوب
    if (sectionId === 'home') {
        // الصفحة الرئيسية
    } else if (sectionId === 'grades' && appData.currentUser && !appData.isAdmin) {
        $('#student-dashboard').style.display = 'block';
        switchStudentTab('dashboard');
    } else {
        const section = $(`#${sectionId}`);
        if (section) {
            section.style.display = 'block';
        }
    }
    
    // تحميل محتوى القسم إذا لزم الأمر
    if (sectionId === 'dictionary') {
        renderDictionary();
    } else if (sectionId === 'quiz') {
        renderQuiz();
    } else if (sectionId === 'lessons') {
        renderLessons();
    } else if (sectionId === 'exercises') {
        renderExercises();
    } else if (sectionId === 'exams') {
        renderExams();
    }
}

function switchStudentTab(tabName) {
    // إخفاء جميع محتويات علامات التبويب
    $$('.student-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // إلغاء تنشيط جميع علامات التبويب
    $$('.student-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // تفعيل علامة التبويب المحددة
    const activeTab = $(`.student-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // إظهار محتوى علامة التبويب المحددة
    const tabContent = $(`#student-${tabName}-tab`);
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    
    // تحميل محتوى علامة التبويب إذا لزم الأمر
    if (tabName === 'dashboard') {
        loadStudentDashboard();
    } else if (tabName === 'quiz') {
        loadStudentQuiz();
    } else if (tabName === 'exercises') {
        loadStudentExercises();
    } else if (tabName === 'dictionary') {
        loadStudentDictionary();
    } else if (tabName === 'messages') {
        loadStudentMessages();
    } else if (tabName === 'cours') {
        loadStudentCourses();
    }
}

function switchAdminTab(tabName) {
    // إخفاء جميع أقسام المدير
    $$('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إلغاء تنشيط جميع علامات التبويب
    $$('.admin-tab-link').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // تفعيل علامة التبويب المحددة
    const activeTab = $(`.admin-tab-link[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // إظهار قسم المدير المحدد
    const tabContent = $(`#${tabName}`);
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    
    // تحميل محتوى القسم إذا لزم الأمر
    if (tabName === 'tab-students') {
        loadStudentsTable();
    } else if (tabName === 'tab-grades') {
        loadGradesTable();
    } else if (tabName === 'tab-dictionary') {
        loadDictionaryTable();
    } else if (tabName === 'tab-lessons') {
        loadLessonsTable();
    } else if (tabName === 'tab-exercises') {
        loadExercisesTable();
    } else if (tabName === 'tab-exams') {
        loadExamsTable();
    } else if (tabName === 'tab-latex') {
        loadLatexTable();
    }
}

/********************
 * AUTHENTICATION FUNCTIONS
 ********************/
function loginStudent(username, password) {
    const student = appData.students.find(s => s.username === username && s.password === password);
    if (student) {
        appData.currentUser = student;
        appData.isAdmin = false;
        $('#studentLoginModal').style.display = 'none';
        $('#student-dashboard').style.display = 'block';
        $('#studentWelcome').textContent = `Bienvenue, ${student.fullname}`;
        switchStudentTab('dashboard');
        return true;
    } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect');
        return false;
    }
}

function loginAdmin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        appData.currentUser = { fullname: 'Administrateur', isAdmin: true };
        appData.isAdmin = true;
        $('#loginModal').style.display = 'none';
        $('#admin-panel').style.display = 'block';
        return true;
    } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect');
        return false;
    }
}

function logout() {
    appData.currentUser = null;
    appData.isAdmin = false;
    $('#student-dashboard').style.display = 'none';
    $('#admin-panel').style.display = 'none';
    saveData();
}

/********************
 * DATA RENDERING FUNCTIONS
 ********************/
function renderDictionary() {
    const dictionaryContent = $('#dictionaryContent');
    if (!dictionaryContent) return;
    
    dictionaryContent.innerHTML = '';
    
    if (appData.dictionary.length === 0) {
        dictionaryContent.innerHTML = '<p class="muted">Aucun terme dans le lexique pour le moment.</p>';
        return;
    }
    
    appData.dictionary.forEach(term => {
        const termCard = document.createElement('div');
        termCard.className = 'content-card';
        termCard.innerHTML = `
            <div class="card-content">
                <h3>${term.ar} - ${term.fr}</h3>
                <p>${term.definition}</p>
            </div>
        `;
        dictionaryContent.appendChild(termCard);
    });
}

function renderQuiz() {
    const quizContent = $('#quizContent');
    if (!quizContent) return;
    
    quizContent.innerHTML = '';
    
    if (appData.quizQuestions.length === 0) {
        quizContent.innerHTML = '<p class="muted">Aucun quiz disponible pour le moment.</p>';
        return;
    }
    
    const quizIntro = document.createElement('div');
    quizIntro.className = 'content-card';
    quizIntro.innerHTML = `
        <div class="card-content">
            <h3>Quiz de Physique</h3>
            <p>Testez vos connaissances avec nos quiz interactifs. Chaque quiz contient ${appData.quizQuestions.length} questions.</p>
            <button class="btn btn-primary" id="startQuiz">Commencer le quiz</button>
        </div>
    `;
    quizContent.appendChild(quizIntro);
    
    $('#startQuiz').addEventListener('click', function() {
        if (appData.currentUser) {
            switchStudentTab('quiz');
        } else {
            $('#studentLoginModal').style.display = 'flex';
        }
    });
}

function renderLessons() {
    const lessonsContent = $('#lessonsContent');
    if (!lessonsContent) return;
    
    lessonsContent.innerHTML = '';
    
    if (appData.lessons.length === 0) {
        lessonsContent.innerHTML = '<p class="muted">Aucune leçon disponible pour le moment.</p>';
        return;
    }
    
    appData.lessons.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'content-card';
        lessonCard.innerHTML = `
            <div class="card-content">
                <h3>${lesson.title}</h3>
                <p>${lesson.chapter}</p>
                ${lesson.driveLink ? `
                    <a href="${lesson.driveLink}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Voir la leçon
                    </a>
                ` : '<p class="muted">Lien non disponible</p>'}
            </div>
        `;
        lessonsContent.appendChild(lessonCard);
    });
}

function renderExercises() {
    const exercisesContent = $('#exercisesContent');
    if (!exercisesContent) return;
    
    exercisesContent.innerHTML = '';
    
    if (appData.exercises.length === 0) {
        exercisesContent.innerHTML = '<p class="muted">Aucun exercice disponible pour le moment.</p>';
        return;
    }
    
    appData.exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'content-card';
        exerciseCard.innerHTML = `
            <div class="card-content">
                <h3>${exercise.title}</h3>
                <p>${exercise.chapter}</p>
                ${exercise.driveLink ? `
                    <a href="${exercise.driveLink}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Voir l'exercice
                    </a>
                ` : '<p class="muted">Lien non disponible</p>'}
            </div>
        `;
        exercisesContent.appendChild(exerciseCard);
    });
}

function renderExams() {
    const examsContent = $('#examsContent');
    if (!examsContent) return;
    
    examsContent.innerHTML = '';
    
    if (appData.exams.length === 0) {
        examsContent.innerHTML = '<p class="muted">Aucun examen disponible pour le moment.</p>';
        return;
    }
    
    appData.exams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'content-card';
        examCard.innerHTML = `
            <div class="card-content">
                <h3>${exam.title}</h3>
                <p>${exam.series}</p>
                ${exam.driveLink ? `
                    <a href="${exam.driveLink}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Voir l'examen
                    </a>
                ` : '<p class="muted">Lien non disponible</p>'}
            </div>
        `;
        examsContent.appendChild(examCard);
    });
}

/********************
 * STUDENT DASHBOARD FUNCTIONS
 ********************/
function loadStudentDashboard() {
    loadStudentRecentGrades();
    loadStudentResources();
}

function loadStudentRecentGrades() {
    if (!appData.currentUser) return;
    
    const recentGradesContainer = $('#studentRecentGrades');
    if (!recentGradesContainer) return;
    
    recentGradesContainer.innerHTML = '';
    
    const studentGrades = appData.grades.filter(grade => grade.studentId === appData.currentUser.id);
    
    if (studentGrades.length === 0) {
        recentGradesContainer.innerHTML = '<p class="muted">Aucune note disponible pour le moment.</p>';
        return;
    }
    
    const recentGrades = studentGrades.slice(-5).reverse();
    
    recentGrades.forEach(grade => {
        const gradeItem = document.createElement('div');
        gradeItem.className = 'grade-item';
        gradeItem.innerHTML = `
            <strong>${grade.subject}</strong>: ${grade.score}/20 (${grade.title})
            <span class="muted">${new Date(grade.date).toLocaleDateString()}</span>
        `;
        recentGradesContainer.appendChild(gradeItem);
    });
}

function loadStudentResources() {
    if (!appData.currentUser) return;
    
    const resourcesContainer = $('#studentResources');
    if (!resourcesContainer) return;
    
    resourcesContainer.innerHTML = '';
    
    const resources = [
        { title: 'Lexique', icon: 'book', section: 'dictionary' },
        { title: 'Quiz', icon: 'question-circle', section: 'quiz' },
        { title: 'Leçons', icon: 'graduation-cap', section: 'lessons' },
        { title: 'Exercices', icon: 'tasks', section: 'exercises' },
        { title: 'Examens', icon: 'file-alt', section: 'exams' }
    ];
    
    resources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'content-card';
        resourceCard.innerHTML = `
            <div class="card-content">
                <h3><i class="fas fa-${resource.icon}"></i> ${resource.title}</h3>
                <p>Accéder aux ${resource.title.toLowerCase()}</p>
                <button class="btn btn-outline" data-section="${resource.section}">Ouvrir</button>
            </div>
        `;
        resourcesContainer.appendChild(resourceCard);
    });
    
    resourcesContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

function loadStudentExercises() {
    if (!appData.currentUser) return;
    
    const exercisesContainer = $('#studentExercisesList');
    if (!exercisesContainer) return;
    
    exercisesContainer.innerHTML = '';
    
    if (appData.exercises.length === 0) {
        exercisesContainer.innerHTML = '<p class="muted">Aucun exercice disponible pour le moment.</p>';
        return;
    }
    
    appData.exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'content-card';
        exerciseCard.innerHTML = `
            <div class="card-content">
                <h3>${exercise.title}</h3>
                <p>${exercise.chapter}</p>
                ${exercise.driveLink ? `
                    <a href="${exercise.driveLink}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Voir l'exercice
                    </a>
                ` : '<p class="muted">Lien non disponible</p>'}
            </div>
        `;
        exercisesContainer.appendChild(exerciseCard);
    });
}

function loadStudentDictionary() {
    if (!appData.currentUser) return;
    
    const dictionaryContainer = $('#studentDictionaryContent');
    if (!dictionaryContainer) return;
    
    dictionaryContainer.innerHTML = '';
    
    if (appData.dictionary.length === 0) {
        dictionaryContainer.innerHTML = '<p class="muted">Aucun terme dans le lexique pour le moment.</p>';
        return;
    }
    
    appData.dictionary.forEach(term => {
        const termCard = document.createElement('div');
        termCard.className = 'content-card';
        termCard.innerHTML = `
            <div class="card-content">
                <h3>${term.ar} - ${term.fr}</h3>
                <p>${term.definition}</p>
            </div>
        `;
        dictionaryContainer.appendChild(termCard);
    });
}

function loadStudentQuiz() {
    // سيتم تنفيذ لاحقاً
}

function loadStudentMessages() {
    // سيتم تنفيذ لاحقاً
}

function loadStudentCourses() {
    // سيتم تنفيذ لاحقاً
}

/********************
 * ADMIN MANAGEMENT FUNCTIONS
 ********************/
function saveStudent() {
    const id = $('#stId').value;
    const fullname = $('#stFullname').value.trim();
    const username = $('#stUsername').value.trim();
    const password = $('#stPassword').value.trim();
    const code = $('#stCode').value.trim();
    const classroom = $('#stClassroom').value.trim();
    
    if (!fullname || !username || !password || !code) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (id) {
        // تحديث طالب موجود
        const index = appData.students.findIndex(s => s.id === id);
        if (index !== -1) {
            appData.students[index] = {
                ...appData.students[index],
                fullname,
                username,
                password,
                code,
                classroom
            };
        }
    } else {
        // إضافة طالب جديد
        const newStudent = {
            id: generateId(),
            fullname,
            username,
            password,
            code,
            classroom
        };
        appData.students.push(newStudent);
    }
    
    saveData();
    loadStudentsTable();
    resetStudentForm();
}

function resetStudentForm() {
    $('#stId').value = '';
    $('#stFullname').value = '';
    $('#stUsername').value = '';
    $('#stPassword').value = '';
    $('#stCode').value = '';
    $('#stClassroom').value = '';
}

function loadStudentsTable() {
    const studentsTable = $('#studentsTable');
    if (!studentsTable) return;
    
    const tbody = studentsTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    appData.students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.fullname}</td>
            <td>${student.username</td>
            <td>${student.code}</td>
            <td>${student.classroom}</td>
            <td>
                <button class="btn btn-ghost btn-sm edit-student" data-id="${student.id}">Modifier</button>
                <button class="btn btn-accent btn-sm delete-student" data-id="${student.id}">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-student').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const student = appData.students.find(s => s.id === id);
            
            if (student) {
                $('#stId').value = student.id;
                $('#stFullname').value = student.fullname;
                $('#stUsername').value = student.username;
                $('#stPassword').value = student.password;
                $('#stCode').value = student.code;
                $('#stClassroom').value = student.classroom;
            }
        });
    });
    
    $$('.delete-student').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
                appData.students = appData.students.filter(s => s.id !== id);
                saveData();
                loadStudentsTable();
            }
        });
    });
}

function filterStudents(query) {
    const tbody = $('#studentsTable').querySelector('tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const username = row.cells[1].textContent.toLowerCase();
        const code = row.cells[2].textContent.toLowerCase();
        const classroom = row.cells[3].textContent.toLowerCase();
        
        const searchTerm = query.toLowerCase();
        
        if (name.includes(searchTerm) || username.includes(searchTerm) || code.includes(searchTerm) || classroom.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function saveGrade() {
    const id = $('#grId').value;
    const studentId = $('#grStudent').value;
    const subject = $('#grSubject').value.trim();
    const title = $('#grTitle').value.trim();
    const date = $('#grDate').value;
    const score = parseFloat($('#grScore').value);
    const note = $('#grNote').value.trim();
    
    if (!studentId || !subject || !title || !date || isNaN(score)) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (id) {
        // تحديث درجة موجودة
        const index = appData.grades.findIndex(g => g.id === id);
        if (index !== -1) {
            appData.grades[index] = {
                ...appData.grades[index],
                studentId,
                subject,
                title,
                date,
                score,
                note
            };
        }
    } else {
        // إضافة درجة جديدة
        const newGrade = {
            id: generateId(),
            studentId,
            subject,
            title,
            date,
            score,
            note
        };
        appData.grades.push(newGrade);
    }
    
    saveData();
    loadGradesTable();
    resetGradeForm();
}

function resetGradeForm() {
    $('#grId').value = '';
    $('#grStudent').value = '';
    $('#grSubject').value = '';
    $('#grTitle').value = '';
    $('#grDate').value = '';
    $('#grScore').value = '';
    $('#grNote').value = '';
}

function loadGradesTable() {
    const gradesTable = $('#gradesAdminTable');
    if (!gradesTable) return;
    
    const tbody = gradesTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const studentId = $('#grFilterStudent').value;
    let filteredGrades = appData.grades;
    
    if (studentId) {
        filteredGrades = appData.grades.filter(grade => grade.studentId === studentId);
    }
    
    filteredGrades.forEach(grade => {
        const student = appData.students.find(s => s.id === grade.studentId);
        const studentName = student ? student.fullname : 'Inconnu';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${studentName}</td>
            <td>${grade.date}</td>
            <td>${grade.subject}</td>
            <td>${grade.title}</td>
            <td>${grade.score}/20</td>
            <td>${grade.note || ''}</td>
            <td>
                <button class="btn btn-ghost btn-sm edit-grade" data-id="${grade.id}">Modifier</button>
                <button class="btn btn-accent btn-sm delete-grade" data-id="${grade.id}">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-grade').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const grade = appData.grades.find(g => g.id === id);
            
            if (grade) {
                $('#grId').value = grade.id;
                $('#grStudent').value = grade.studentId;
                $('#grSubject').value = grade.subject;
                $('#grTitle').value = grade.title;
                $('#grDate').value = grade.date;
                $('#grScore').value = grade.score;
                $('#grNote').value = grade.note || '';
            }
        });
    });
    
    $$('.delete-grade').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
                appData.grades = appData.grades.filter(g => g.id !== id);
                saveData();
                loadGradesTable();
            }
        });
    });
}

function populateStudentSelects() {
    const grStudent = $('#grStudent');
    const grFilterStudent = $('#grFilterStudent');
    
    if (grStudent) {
        grStudent.innerHTML = '<option value="">Sélectionner un étudiant</option>';
        appData.students.forEach(student => {
            grStudent.innerHTML += `<option value="${student.id}">${student.fullname}</option>`;
        });
    }
    
    if (grFilterStudent) {
        grFilterStudent.innerHTML = '<option value="">Tous les étudiants</option>';
        appData.students.forEach(student => {
            grFilterStudent.innerHTML += `<option value="${student.id}">${student.fullname}</option>`;
        });
    }
}

function saveDictionaryTerm() {
    const id = $('#adminDictAr').getAttribute('data-id');
    const ar = $('#adminDictAr').value.trim();
    const fr = $('#adminDictFr').value.trim();
    const def = $('#adminDictDef').value.trim();
    
    if (!ar || !fr) {
        alert('Veuillez remplir les champs arabe et français');
        return;
    }
    
    if (id) {
        // تحديث مصطلح موجود
        const index = appData.dictionary.findIndex(t => t.id === id);
        if (index !== -1) {
            appData.dictionary[index] = {
                ...appData.dictionary[index],
                ar,
                fr,
                def
            };
        }
    } else {
        // إضافة مصطلح جديد
        const newTerm = {
            id: generateId(),
            ar,
            fr,
            def
        };
        appData.dictionary.push(newTerm);
    }
    
    saveData();
    loadDictionaryTable();
    resetDictionaryForm();
}

function resetDictionaryForm() {
    $('#adminDictAr').value = '';
    $('#adminDictFr').value = '';
    $('#adminDictDef').value = '';
    $('#adminDictAr').removeAttribute('data-id');
}

function loadDictionaryTable() {
    const dictionaryList = $('#dictionaryTermsList');
    if (!dictionaryList) return;
    
    dictionaryList.innerHTML = '';
    
    if (appData.dictionary.length === 0) {
        dictionaryList.innerHTML = '<p class="muted">Aucun terme dans le lexique pour le moment.</p>';
        return;
    }
    
    appData.dictionary.forEach(term => {
        const termEl = document.createElement('div');
        termEl.className = 'content-card';
        termEl.innerHTML = `
            <div class="card-content">
                <h3>${term.ar} - ${term.fr}</h3>
                <p>${term.def}</p>
                <div class="flex right">
                    <button class="btn btn-ghost btn-sm edit-term" data-id="${term.id}">Modifier</button>
                    <button class="btn btn-accent btn-sm delete-term" data-id="${term.id}">Supprimer</button>
                </div>
            </div>
        `;
        dictionaryList.appendChild(termEl);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-term').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const term = appData.dictionary.find(t => t.id === id);
            
            if (term) {
                $('#adminDictAr').value = term.ar;
                $('#adminDictFr').value = term.fr;
                $('#adminDictDef').value = term.def;
                $('#adminDictAr').setAttribute('data-id', term.id);
            }
        });
    });
    
    $$('.delete-term').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer ce terme ?')) {
                appData.dictionary = appData.dictionary.filter(t => t.id !== id);
                saveData();
                loadDictionaryTable();
            }
        });
    });
}

function saveLesson() {
    const title = $('#adminLessonTitle').value.trim();
    const chapter = $('#adminLessonChapter').value.trim();
    const driveLink = $('#adminLessonDriveLink').value.trim();
    
    if (!title || !driveLink) {
        alert('Veuillez remplir le titre et le lien Google Drive');
        return;
    }
    
    const newLesson = {
        id: generateId(),
        title,
        chapter,
        driveLink,
        createdAt: new Date().toISOString()
    };
    
    appData.lessons.push(newLesson);
    saveData();
    renderLessons();
    loadLessonsTable();
    
    // إعادة تعيين النموذج
    $('#adminLessonTitle').value = '';
    $('#adminLessonChapter').value = '';
    $('#adminLessonDriveLink').value = '';
    
    alert('Leçon ajoutée avec succès');
}

function saveExercise() {
    const title = $('#adminExerciseTitle').value.trim();
    const chapter = $('#adminExerciseChapter').value.trim();
    const driveLink = $('#adminExerciseDriveLink').value.trim();
    
    if (!title || !driveLink) {
        alert('Veuillez remplir le titre et le lien Google Drive');
        return;
    }
    
    const newExercise = {
        id: generateId(),
        title,
        chapter,
        driveLink,
        createdAt: new Date().toISOString()
    };
    
    appData.exercises.push(newExercise);
    saveData();
    renderExercises();
    loadExercisesTable();
    
    // إعادة تعيين النموذج
    $('#adminExerciseTitle').value = '';
    $('#adminExerciseChapter').value = '';
    $('#adminExerciseDriveLink').value = '';
    
    alert('Exercice ajouté avec succès');
}

function saveExam() {
    const title = $('#adminExamTitle').value.trim();
    const series = $('#adminExamSeries').value.trim();
    const driveLink = $('#adminExamDriveLink').value.trim();
    
    if (!title || !driveLink) {
        alert('Veuillez remplir le titre et le lien Google Drive');
        return;
    }
    
    const newExam = {
        id: generateId(),
        title,
        series,
        driveLink,
        createdAt: new Date().toISOString()
    };
    
    appData.exams.push(newExam);
    saveData();
    renderExams();
    loadExamsTable();
    
    // إعادة تعيين النموذج
    $('#adminExamTitle').value = '';
    $('#adminExamSeries').value = '';
    $('#adminExamDriveLink').value = '';
    
    alert('Examen ajouté avec succès');
}

function loadLessonsTable() {
    const lessonsList = $('#lessonsAdminList');
    if (!lessonsList) return;
    
    lessonsList.innerHTML = '';
    
    if (appData.lessons.length === 0) {
        lessonsList.innerHTML = '<p class="muted">Aucune leçon pour le moment.</p>';
        return;
    }
    
    appData.lessons.forEach((lesson, index) => {
        const lessonEl = document.createElement('div');
        lessonEl.className = 'content-card';
        lessonEl.innerHTML = `
            <div class="card-content">
                <h3>${lesson.title}</h3>
                <p>${lesson.chapter}</p>
                ${lesson.driveLink ? `<p><a href="${lesson.driveLink}" target="_blank">Lien Google Drive</a></p>` : ''}
                <div class="flex right">
                    <button class="btn btn-ghost btn-sm edit-lesson" data-index="${index}">Modifier</button>
                    <button class="btn btn-accent btn-sm delete-lesson" data-index="${index}">Supprimer</button>
                </div>
            </div>
        `;
        lessonsList.appendChild(lessonEl);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const lesson = appData.lessons[index];
            
            $('#adminLessonTitle').value = lesson.title;
            $('#adminLessonChapter').value = lesson.chapter;
            $('#adminLessonDriveLink').value = lesson.driveLink;
        });
    });
    
    $$('.delete-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            if (confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
                appData.lessons.splice(index, 1);
                saveData();
                loadLessonsTable();
                renderLessons();
            }
        });
    });
}

function loadExercisesTable() {
    const exercisesList = $('#exercisesAdminList');
    if (!exercisesList) return;
    
    exercisesList.innerHTML = '';
    
    if (appData.exercises.length === 0) {
        exercisesList.innerHTML = '<p class="muted">Aucun exercice pour le moment.</p>';
        return;
    }
    
    appData.exercises.forEach((exercise, index) {
        const exerciseEl = document.createElement('div');
        exerciseEl.className = 'content-card';
        exerciseEl.innerHTML = `
            <div class="card-content">
                <h3>${exercise.title}</h3>
                <p>${exercise.chapter}</p>
                ${exercise.driveLink ? `<p><a href="${exercise.driveLink}" target="_blank">Lien Google Drive</a></p>` : ''}
                <div class="flex right">
                    <button class="btn btn-ghost btn-sm edit-exercise" data-index="${index}">Modifier</button>
                    <button class="btn btn-accent btn-sm delete-exercise" data-index="${index}">Supprimer</button>
                </div>
            </div>
        `;
        exercisesList.appendChild(exerciseEl);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-exercise').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const exercise = appData.exercises[index];
            
            $('#adminExerciseTitle').value = exercise.title;
            $('#adminExerciseChapter').value = exercise.chapter;
            $('#adminExerciseDriveLink').value = exercise.driveLink;
        });
    });
    
    $$('.delete-exercise').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
                appData.exercises.splice(index, 1);
                saveData();
                loadExercisesTable();
                renderExercises();
            }
        });
    });
}

function loadExamsTable() {
    const examsList = $('#examsAdminList');
    if (!examsList) return;
    
    examsList.innerHTML = '';
    
    if (appData.exams.length === 0) {
        examsList.innerHTML = '<p class="muted">Aucun examen pour le moment.</p>';
        return;
    }
    
    appData.exams.forEach((exam, index) {
        const examEl = document.createElement('div');
        examEl.className = 'content-card';
        examEl.innerHTML = `
            <div class="card-content">
                <h3>${exam.title}</h3>
                <p>${exam.series}</p>
                ${exam.driveLink ? `<p><a href="${exam.driveLink}" target="_blank">Lien Google Drive</a></p>` : ''}
                <div class="flex right">
                    <button class="btn btn-ghost btn-sm edit-exam" data-index="${index}">Modifier</button>
                    <button class="btn btn-accent btn-sm delete-exam" data-index="${index}">Supprimer</button>
                </div>
            </div>
        `;
        examsList.appendChild(examEl);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-exam').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const exam = appData.exams[index];
            
            $('#adminExamTitle').value = exam.title;
            $('#adminExamSeries').value = exam.series;
            $('#adminExamDriveLink').value = exam.driveLink;
        });
    });
    
    $$('.delete-exam').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
                appData.exams.splice(index, 1);
                saveData();
                loadExamsTable();
                renderExams();
            }
        });
    });
}

function saveAnnouncement() {
    const text = $('#announcementInput').value.trim();
    
    if (!text) {
        alert('Veuillez saisir une annonce');
        return;
    }
    
    appData.announcement.text = text;
    
    // معالجة صورة الإعلان إذا تم تحميلها
    const imageInput = $('#announcementImageInput');
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appData.announcement.image = e.target.result;
            saveData();
            updateAnnouncement();
            alert('Annonce enregistrée avec succès');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveData();
        updateAnnouncement();
        alert('Annonce enregistrée avec succès');
    }
}

function updateAnnouncement() {
    const announcementText = $('#announcementText');
    const announcementImage = $('#announcementImage');
    
    if (announcementText) {
        announcementText.textContent = appData.announcement.text;
    }
    
    if (announcementImage && appData.announcement.image) {
        announcementImage.src = appData.announcement.image;
        announcementImage.style.display = 'block';
    } else if (announcementImage) {
        announcementImage.style.display = 'none';
    }
}

function updateStats() {
    const statsStudents = $('#stats-students');
    const statsQuiz = $('#stats-quiz');
    const statsDictionary = $('#stats-dictionary');
    const statsGrades = $('#stats-grades');
    const statsMessages = $('#stats-messages');
    const statsLatex = $('#stats-latex');
    
    if (statsStudents) statsStudents.textContent = appData.students.length;
    if (statsQuiz) statsQuiz.textContent = appData.quizQuestions.length;
    if (statsDictionary) statsDictionary.textContent = appData.dictionary.length;
    if (statsGrades) statsGrades.textContent = appData.grades.length;
    if (statsMessages) statsMessages.textContent = appData.messages.length;
    if (statsLatex) statsLatex.textContent = appData.latexContents.length;
}

function searchGradesByCode(code) {
    const student = appData.students.find(s => s.code === code);
    if (!student) {
        alert('Code parcours non trouvé');
        return;
    }
    
    const grades = appData.grades.filter(grade => grade.studentId === student.id);
    const gradesResults = $('#gradesResults');
    const studentInfo = $('#studentInfo');
    const gradesTable = $('#gradesTable').querySelector('tbody');
    
    if (!gradesResults || !studentInfo || !gradesTable) return;
    
    gradesResults.style.display = 'block';
    studentInfo.innerHTML = `
        <div class="content-card">
            <div class="card-content">
                <h3>${student.fullname}</h3>
                <p>Classe: ${student.classroom}</p>
                <p>Code: ${student.code}</p>
            </div>
        </div>
    `;
    
    gradesTable.innerHTML = '';
    if (grades.length === 0) {
        $('#noGradesMsg').style.display = 'block';
    } else {
        $('#noGradesMsg').style.display = 'none';
        grades.forEach(grade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(grade.date).toLocaleDateString()}</td>
                <td>${grade.subject}</td>
                <td>${grade.title}</td>
                <td>${grade.score}/20</td>
                <td>${grade.note || ''}</td>
            `;
            gradesTable.appendChild(row);
        });
    }
}

function submitRevisionRequest() {
    if (!appData.currentUser) return;
    
    const examId = $('#revisionExam').value;
    const message = $('#revisionMessage').value;
    
    if (!examId || !message) {
        alert('Veuillez sélectionner un examen et saisir un message');
        return;
    }
    
    // إنشاء طلب المراجعة
    const revisionRequest = {
        id: generateId(),
        studentId: appData.currentUser.id,
        examId,
        message,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    // إضافة إلى البيانات (إذا كان هناك مجموعة لتخزين طلبات المراجعة)
    if (!appData.revisionRequests) {
        appData.revisionRequests = [];
    }
    appData.revisionRequests.push(revisionRequest);
    
    saveData();
    alert('Votre demande de révision a été soumise avec succès');
    $('#revisionRequestForm').reset();
}

/********************
 * LATEX EDITOR WITH LINE NUMBERS
 ********************/
function initLatexEditor() {
    const latexCodeTextarea = $('#latexCode');
    if (!latexCodeTextarea) return;
    
    // إنشاء محرر LaTeX مع أرقام الأسطر
    const editorContainer = document.createElement('div');
    editorContainer.className = 'latex-editor-container';
    editorContainer.style.display = 'flex';
    editorContainer.style.height = '400px';
    editorContainer.style.border = '1px solid #ddd';
    editorContainer.style.borderRadius = '5px';
    editorContainer.style.overflow = 'hidden';
    editorContainer.style.marginBottom = '10px';
    
    // منطقة أرقام الأسطر
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.style.width = '50px';
    lineNumbers.style.backgroundColor = '#f5f5f5';
    lineNumbers.style.padding = '10px';
    lineNumbers.style.fontFamily = 'monospace';
    lineNumbers.style.textAlign = 'right';
    lineNumbers.style.overflowY = 'auto';
    lineNumbers.style.borderRight = '1px solid #ddd';
    lineNumbers.style.userSelect = 'none';
    
    // منطقة النص
    const textArea = document.createElement('textarea');
    textArea.id = 'enhancedLatexCode';
    textArea.value = latexCodeTextarea.value;
    textArea.style.flex = '1';
    textArea.style.padding = '10px';
    textArea.style.border = 'none';
    textArea.style.fontFamily = 'monospace';
    textArea.style.resize = 'none';
    textArea.style.outline = 'none';
    textArea.placeholder = 'أدخل كود LaTeX هنا...';
    textArea.style.lineHeight = '1.5';
    
    // إضافة العناصر إلى المحرر
    editorContainer.appendChild(lineNumbers);
    editorContainer.appendChild(textArea);
    
    // استبدال حقل الإدخال القديم بالمحرر الجديد
    latexCodeTextarea.parentNode.insertBefore(editorContainer, latexCodeTextarea);
    latexCodeTextarea.style.display = 'none';
    
    // تحديث أرقام الأسطر
    function updateLineNumbers() {
        const lines = textArea.value.split('\n').length;
        lineNumbers.innerHTML = '';
        
        // إنشاء ما يصل إلى 2000 سطر
        const lineCount = Math.min(Math.max(lines, 20), 2000);
        
        for (let i = 1; i <= lineCount; i++) {
            const lineNum = document.createElement('div');
            lineNum.textContent = i;
            lineNum.style.height = '1.5em';
            lineNum.style.lineHeight = '1.5em';
            lineNumbers.appendChild(lineNum);
        }
    }
    
    // تحديث الحقل الأصلي عند التغيير
    textArea.addEventListener('input', function() {
        latexCodeTextarea.value = textArea.value;
        updateLineNumbers();
        updateLatexPreview();
    });
    
    // التمرير المتزامن
    textArea.addEventListener('scroll', function() {
        lineNumbers.scrollTop = textArea.scrollTop;
    });
    
    // التهيئة الأولية
    updateLineNumbers();
    
    // إذا كان هناك قيمة مسبقة، تحديث المحرر
    if (latexCodeTextarea.value) {
        textArea.value = latexCodeTextarea.value;
        updateLineNumbers();
    }
}

function updateLatexPreview() {
    const code = $('#latexCode').value;
    const preview = $('#latexPreview');
    
    if (preview) {
        preview.innerHTML = `<div class="latex-content">${code}</div>`;
        // يمكنك إضافة تصيير MathJax هنا إذا لزم الأمر
    }
}

function saveLatexContent() {
    const id = $('#latexId').value;
    const title = $('#latexTitle').value.trim();
    const latexCode = $('#latexCode').value.trim();
    const description = $('#latexDescription').value.trim();
    const category = $('#latexCategory').value.trim();
    
    if (!title || !latexCode) {
        alert('Veuillez remplir le titre et le code LaTeX');
        return;
    }
    
    if (id) {
        // تحديث محتوى موجود
        const index = appData.latexContents.findIndex(c => c.id === id);
        if (index !== -1) {
            appData.latexContents[index] = {
                ...appData.latexContents[index],
                title,
                latexCode,
                description,
                category
            };
        }
    } else {
        // إضافة محتوى جديد
        const newContent = {
            id: generateId(),
            title,
            latexCode,
            description,
            category,
            createdAt: new Date().toISOString()
        };
        appData.latexContents.push(newContent);
    }
    
    saveData();
    loadLatexTable();
    resetLatexForm();
}

function resetLatexForm() {
    $('#latexId').value = '';
    $('#latexTitle').value = '';
    $('#latexCode').value = '';
    $('#latexDescription').value = '';
    $('#latexCategory').value = '';
    
    // إعادة تعيين المحرر المحسّن أيضًا
    const enhancedEditor = $('#enhancedLatexCode');
    if (enhancedEditor) {
        enhancedEditor.value = '';
        const lineNumbers = $('.line-numbers');
        if (lineNumbers) {
            updateLineNumbers();
        }
    }
}

function loadLatexTable() {
    const latexList = $('#latexContentsList');
    if (!latexList) return;
    
    latexList.innerHTML = '';
    
    if (appData.latexContents.length === 0) {
        latexList.innerHTML = '<p class="muted">Aucun contenu LaTeX pour le moment.</p>';
        return;
    }
    
    appData.latexContents.forEach(content => {
        const contentEl = document.createElement('div');
        contentEl.className = 'content-card';
        contentEl.innerHTML = `
            <div class="card-content">
                <h3>${content.title}</h3>
                <p>${content.category} - ${new Date(content.createdAt).toLocaleDateString()}</p>
                <div class="latex-content">${content.latexCode}</div>
                <p>${content.description}</p>
                <div class="flex right">
                    <button class="btn btn-ghost btn-sm edit-latex" data-id="${content.id}">Modifier</button>
                    <button class="btn btn-accent btn-sm delete-latex" data-id="${content.id}">Supprimer</button>
                </div>
            </div>
        `;
        latexList.appendChild(contentEl);
    });
    
    // إضافة معالجي الأحداث للأزرار
    $$('.edit-latex').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const content = appData.latexContents.find(c => c.id === id);
            
            if (content) {
                $('#latexId').value = content.id;
                $('#latexTitle').value = content.title;
                $('#latexCode').value = content.latexCode;
                $('#latexDescription').value = content.description;
                $('#latexCategory').value = content.category;
                
                // تحديث المحرر المحسّن
                const enhancedEditor = $('#enhancedLatexCode');
                if (enhancedEditor) {
                    enhancedEditor.value = content.latexCode;
                    updateLineNumbers();
                }
            }
        });
    });
    
    $$('.delete-latex').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
                appData.latexContents = appData.latexContents.filter(c => c.id !== id);
                saveData();
                loadLatexTable();
            }
        });
    });
}