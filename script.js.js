// بيانات المقررات (يمكن استبدالها ببيانات حقيقية من قاعدة بيانات)
const courses = [
    {
        id: 1,
        title: "الرياضيات المتقدمة",
        description: "مقرر شامل لأسس الرياضيات العليا",
        image: "https://via.placeholder.com/300x180?text=الرياضيات",
        professor: "د. أحمد محمد"
    },
    {
        id: 2,
        title: "الفيزياء الحديثة",
        description: "دراسة مفاهيم الفيزياء في القرن الحادي والعشرين",
        image: "https://via.placeholder.com/300x180?text=الفيزياء",
        professor: "د. سارة عبدالله"
    },
    {
        id: 3,
        title: "البرمجة بلغة Python",
        description: "تعلم أساسيات البرمجة باستخدام بايثون",
        image: "https://via.placeholder.com/300x180?text=برمجة",
        professor: "د. خالد حسين"
    }
];

// بيانات الاختبارات (يمكن استبدالها ببيانات حقيقية من قاعدة بيانات)
const exams = [
    {
        id: 1,
        title: "اختبار الرياضيات النهائي",
        course: "الرياضيات المتقدمة",
        duration: "60 دقيقة",
        questions: 20,
        available: true
    },
    {
        id: 2,
        title: "اختبار الفيزياء النصفي",
        course: "الفيزياء الحديثة",
        duration: "45 دقيقة",
        questions: 15,
        available: true
    },
    {
        id: 3,
        title: "مشروع البرمجة",
        course: "البرمجة بلغة Python",
        duration: "7 أيام",
        questions: 5,
        available: false
    }
];

// متغيرات التطبيق
let currentUser = null;
let userRole = null; // 'student' أو 'professor'

// عناصر DOM
const authBtn = document.getElementById('authBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const startLearningBtn = document.getElementById('startLearningBtn');
const studentBtn = document.getElementById('studentBtn');
const professorBtn = document.getElementById('professorBtn');
const courseGrid = document.querySelector('.course-grid');
const examGrid = document.querySelector('.exam-grid');

// عرض المقررات
function displayCourses() {
    courseGrid.innerHTML = '';
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <img src="${course.image}" alt="${course.title}">
            <div class="course-info">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>الأستاذ:</strong> ${course.professor}</p>
                ${userRole === 'student' ? '<button class="enroll-btn">التسجيل</button>' : ''}
            </div>
        `;
        courseGrid.appendChild(courseCard);
    });
}

// عرض الاختبارات
function displayExams() {
    examGrid.innerHTML = '';
    exams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
            <img src="https://via.placeholder.com/300x180?text=${exam.title.replace(/ /g, '+')}" alt="${exam.title}">
            <div class="exam-info">
                <h3>${exam.title}</h3>
                <p><strong>المقرر:</strong> ${exam.course}</p>
                <p><strong>المدة:</strong> ${exam.duration}</p>
                <p><strong>عدد الأسئلة:</strong> ${exam.questions}</p>
                ${exam.available ? 
                    (userRole === 'student' ? 
                        '<button class="take-exam-btn">بدء الاختبار</button>' : 
                        (userRole === 'professor' ? 
                            '<button class="edit-exam-btn">تعديل الاختبار</button>' : '')) : 
                    '<button class="disabled-btn" disabled>غير متاح</button>'}
            </div>
        `;
        examGrid.appendChild(examCard);
    });
}

// معالجة تسجيل الدخول بجوجل
function handleGoogleSignIn(response) {
    console.log('Google sign-in response:', response);
    
    // هنا يجب إرسال بيانات المستخدم إلى الخادم للتحقق منها
    // هذا مثال فقط للعرض
    currentUser = {
        name: response.credential.name,
        email: response.credential.email,
        picture: response.credential.picture
    };
    
    document.getElementById('authBtn').innerHTML = `<a href="#">${currentUser.name}</a>`;
    loginModal.style.display = 'none';
    
    // عرض واجهة المستخدم حسب الدور
    if (userRole === 'professor') {
        // عرض أدوات الأستاذ
        alert(`مرحبًا أستاذ ${currentUser.name}! يمكنك الآن إدارة المقررات والاختبارات.`);
    } else {
        // عرض واجهة الطالب
        alert(`مرحبًا ${currentUser.name}! يمكنك الآن تصفح المقررات وأداء الاختبارات.`);
    }
    
    // تحديث عرض المقررات والاختبارات حسب الدور
    displayCourses();
    displayExams();
}

// أحداث DOM
document.addEventListener('DOMContentLoaded', () => {
    displayCourses();
    displayExams();
});

authBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        // عرض قائمة المستخدم (تسجيل الخروج، إلخ)
        alert(`مرحبًا ${currentUser.name}!`);
    } else {
        loginModal.style.display = 'block';
    }
});

closeBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

startLearningBtn.addEventListener('click', () => {
    if (!currentUser) {
        loginModal.style.display = 'block';
    } else {
        alert('يمكنك البدء في تصفح المقررات الآن!');
    }
});

studentBtn.addEventListener('click', () => {
    userRole = 'student';
    document.querySelector('.role-selection').innerHTML = '<p>تم اختيارك كطالب. يمكنك الآن تسجيل الدخول.</p>';
});

professorBtn.addEventListener('click', () => {
    userRole = 'professor';
    document.querySelector('.role-selection').innerHTML = '<p>تم اختيارك كأستاذ. يمكنك الآن تسجيل الدخول.</p>';
});

// وظيفة تسجيل الخروج
function signOut() {
    currentUser = null;
    userRole = null;
    document.getElementById('authBtn').innerHTML = '<a href="#">تسجيل الدخول</a>';
    alert('تم تسجيل الخروج بنجاح.');
}