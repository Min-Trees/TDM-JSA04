// ========== UTILITIES ==========
const esc = text => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Hàm chuẩn hóa dữ liệu - hỗ trợ nhiều cấu trúc
const normalizeData = raw => {
    // Nếu là mảng phẳng thì return luôn
    if (Array.isArray(raw) && raw[0]?.name) return raw;
    
    // Cấu trúc giáo viên: { departments: [ { teachers: [...] } ] }
    if (raw.departments && Array.isArray(raw.departments)) {
        const teachers = [];
        raw.departments.forEach(dept => {
            if (dept.teachers && Array.isArray(dept.teachers)) {
                dept.teachers.forEach(teacher => {
                    teachers.push({
                        ...teacher,
                        department: teacher.department || dept.name
                    });
                });
            }
        });
        return teachers;
    }
    
    // Cấu trúc học sinh: [ { grade, classes: [ { students: [...] } ] } ]
    if (Array.isArray(raw) && raw[0]?.grade && raw[0]?.classes) {
        const students = [];
        raw.forEach(gradeObj => {
            const grade = gradeObj.grade;
            gradeObj.classes.forEach(classObj => {
                classObj.students.forEach(student => {
                    students.push({
                        ...student,
                        grade: grade
                    });
                });
            });
        });
        return students;
    }
    
    // Kiểm tra các key phổ biến
    const keys = ['students', 'hocsinh', 'data', 'danhsach', 'teachers', 'giaovien'];
    for (const k of keys) {
        if (raw[k] && Array.isArray(raw[k])) return raw[k];
    }
    
    return [];
};

// ========== DATA MANAGER ==========
class Manager {
    constructor(path, tbody, search, page) {
        this.path = path;
        this.tbody = document.getElementById(tbody);
        this.search = document.getElementById(search);
        this.page = page;
        this.data = [];
        this.timer = null;
        this.pagination = null;
    }

    async load() {
        if (!this.tbody) return;
        
        try {
            const res = await fetch(this.path);
            if (!res.ok) throw new Error('Không tìm thấy file JSON');
            
            const raw = await res.json();
            this.data = normalizeData(raw);
            
            if (this.pagination) {
                this.pagination.update(this.data);
            } else {
                this.render(this.data);
            }
            
            return Promise.resolve();
            
        } catch (e) {
            console.error('Lỗi khi load dữ liệu:', e);
            this.showError(e.message);
            return Promise.reject(e);
        }
    }

    render(arr) {
        if (!arr?.length) {
            this.tbody.innerHTML = `
                <tr><td colspan="7" style="text-align:center;padding:30px;color:#888">
                    Không có dữ liệu
                </td></tr>`;
            return;
        }

        this.tbody.innerHTML = arr.map(item => `<tr>${this.row(item)}</tr>`).join('');
    }

    showError(msg) {
        this.tbody.innerHTML = `
            <tr><td colspan="7" style="color:red;text-align:center;padding:30px">
                LỖI: ${esc(msg)}
            </td></tr>`;
    }

    setupSearch() {
        if (!this.search) return;
        this.search.addEventListener('input', () => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                const kw = this.search.value.trim().toLowerCase();
                const result = kw
                    ? this.data.filter(x =>
                        (x.name || '').toLowerCase().includes(kw)
                    )
                    : this.data;
                
                if (this.pagination) {
                    this.pagination.update(result);
                } else {
                    this.render(result);
                }
            }, 300);
        });
    }

    find(id) {
        return this.data.find(x => x.id === id);
    }

    view(id) {
        const item = this.find(id);
        if (!item) return alert('Không tìm thấy!');
        localStorage.setItem('detail', JSON.stringify(item));
        window.location.href = this.page;
    }
}

// ========== PAGINATION MANAGER ==========
class PaginationManager {
    constructor(manager) {
        this.manager = manager;
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.currentData = [];
        
        this.btnFirst = document.getElementById('btn-first');
        this.btnPrev = document.getElementById('btn-prev');
        this.btnNext = document.getElementById('btn-next');
        this.btnLast = document.getElementById('btn-last');
        this.pageNumbers = document.getElementById('page-numbers');
        this.pageSizeSelect = document.getElementById('page-size');
        this.showingStart = document.getElementById('showing-start');
        this.showingEnd = document.getElementById('showing-end');
        this.totalStudents = document.getElementById('total-students');
        
        this.init();
    }

    init() {
        if (!this.btnFirst) return;
        
        this.btnFirst.addEventListener('click', () => this.goToPage(1));
        this.btnPrev.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.btnNext.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.btnLast.addEventListener('click', () => this.goToPage(this.totalPages));
        
        if (this.pageSizeSelect) {
            this.pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.update(this.currentData);
            });
        }
    }

    update(data) {
        this.currentData = data;
        this.totalPages = Math.ceil(data.length / this.pageSize) || 1;
        
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        
        this.renderPage();
        this.updateControls();
        this.updateInfo();
    }

    renderPage() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.currentData.slice(start, end);
        
        this.manager.render(pageData);
    }

    updateControls() {
        if (this.btnFirst) this.btnFirst.disabled = this.currentPage === 1;
        if (this.btnPrev) this.btnPrev.disabled = this.currentPage === 1;
        if (this.btnNext) this.btnNext.disabled = this.currentPage === this.totalPages;
        if (this.btnLast) this.btnLast.disabled = this.currentPage === this.totalPages;
        
        this.renderPageNumbers();
    }

    renderPageNumbers() {
        if (!this.pageNumbers) return;
        
        this.pageNumbers.innerHTML = '';
        
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        if (startPage > 1) {
            this.addPageButton(1);
            if (startPage > 2) this.addDots();
        }
        
        for (let i = startPage; i <= endPage; i++) {
            this.addPageButton(i);
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) this.addDots();
            this.addPageButton(this.totalPages);
        }
    }

    addPageButton(page) {
        const btn = document.createElement('button');
        btn.className = 'page-number';
        btn.textContent = page;
        
        if (page === this.currentPage) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => this.goToPage(page));
        this.pageNumbers.appendChild(btn);
    }

    addDots() {
        const dots = document.createElement('span');
        dots.className = 'page-number dots';
        dots.textContent = '...';
        this.pageNumbers.appendChild(dots);
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        
        this.currentPage = page;
        this.renderPage();
        this.updateControls();
        this.updateInfo();
        
        const tableSection = document.querySelector('.table-section');
        if (tableSection) {
            tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    updateInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.currentData.length);
        
        if (this.showingStart) this.showingStart.textContent = this.currentData.length > 0 ? start : 0;
        if (this.showingEnd) this.showingEnd.textContent = end;
        if (this.totalStudents) this.totalStudents.textContent = this.currentData.length;
    }
}

// ========== FILTER MANAGER (HỌC SINH) ==========
class StudentFilterManager {
    constructor(manager) {
        this.manager = manager;
        this.gradeSelect = document.getElementById('filter-grade');
        this.classSelect = document.getElementById('filter-class');
        this.resetBtn = document.getElementById('btn-reset-filter');
        this.currentSort = '';
        this.init();
    }

    init() {
        if (!this.gradeSelect || !this.manager) return;
        
        this.populateGrades();
        this.populateClasses();
        
        this.gradeSelect.addEventListener('change', () => {
            this.populateClasses();
            this.applyFilters();
        });
        
        this.classSelect.addEventListener('change', () => this.applyFilters());
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    populateGrades() {
        const grades = [...new Set(this.manager.data.map(s => s.grade))].sort((a, b) => a - b);
        
        this.gradeSelect.innerHTML = '<option value="">-- Tất cả khối --</option>';
        grades.forEach(grade => {
            this.gradeSelect.innerHTML += `<option value="${grade}">Khối ${grade}</option>`;
        });
    }

    populateClasses() {
        const selectedGrade = this.gradeSelect.value;
        let classes;
        
        if (selectedGrade) {
            classes = [...new Set(
                this.manager.data
                    .filter(s => s.grade == selectedGrade)
                    .map(s => s.class)
            )].sort();
        } else {
            classes = [...new Set(this.manager.data.map(s => s.class))].sort();
        }
        
        this.classSelect.innerHTML = '<option value="">-- Tất cả lớp --</option>';
        classes.forEach(cls => {
            this.classSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
        });
    }

    applyFilters() {
        const grade = this.gradeSelect.value;
        const cls = this.classSelect.value;
        
        let filtered = [...this.manager.data];
        
        if (grade) {
            filtered = filtered.filter(s => s.grade == grade);
        }
        
        if (cls) {
            filtered = filtered.filter(s => s.class === cls);
        }
        
        if (this.currentSort) {
            filtered = this.sortData(filtered, this.currentSort);
        }
        
        if (this.manager.pagination) {
            this.manager.pagination.update(filtered);
        } else {
            this.manager.render(filtered);
        }
    }

    sortData(data, type) {
        return data.sort((a, b) => {
            const nameA = a.name.trim();
            const nameB = b.name.trim();
            return type === 'asc'
                ? nameA.localeCompare(nameB, 'vi')
                : nameB.localeCompare(nameA, 'vi');
        });
    }

    setSort(type) {
        this.currentSort = type;
        this.applyFilters();
    }

    resetFilters() {
        this.gradeSelect.value = '';
        this.classSelect.value = '';
        this.currentSort = '';
        this.populateClasses();
        
        const sortText = document.querySelector('.sort-text');
        if (sortText) sortText.textContent = 'Chọn thứ tự';
        
        if (this.manager.pagination) {
            this.manager.pagination.update(this.manager.data);
        } else {
            this.manager.render(this.manager.data);
        }
    }
}

// ========== FILTER MANAGER (GIÁO VIÊN) ==========
class TeacherFilterManager {
    constructor(manager) {
        this.manager = manager;
        this.subjectSelect = document.getElementById('filter-subject');
        this.homeroomSelect = document.getElementById('filter-homeroom');
        this.resetBtn = document.getElementById('btn-reset-filter');
        this.currentSort = '';
        this.init();
    }

    init() {
        if (!this.subjectSelect || !this.manager) return;
        
        this.populateSubjects();
        
        this.subjectSelect.addEventListener('change', () => this.applyFilters());
        
        if (this.homeroomSelect) {
            this.homeroomSelect.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    populateSubjects() {
        const subjects = new Set();
        this.manager.data.forEach(t => {
            if (t.mainSubject) subjects.add(t.mainSubject);
            if (t.subjects && Array.isArray(t.subjects)) {
                t.subjects.forEach(s => subjects.add(s));
            }
        });
        
        const sortedSubjects = [...subjects].sort();
        
        this.subjectSelect.innerHTML = '<option value="">-- Tất cả môn --</option>';
        sortedSubjects.forEach(subject => {
            this.subjectSelect.innerHTML += `<option value="${subject}">${subject}</option>`;
        });
    }

    applyFilters() {
        const subject = this.subjectSelect.value;
        const homeroom = this.homeroomSelect ? this.homeroomSelect.value : '';
        
        let filtered = [...this.manager.data];
        
        if (subject) {
            filtered = filtered.filter(t => {
                if (t.mainSubject === subject) return true;
                if (t.subjects && t.subjects.includes(subject)) return true;
                return false;
            });
        }
        
        if (homeroom === 'yes') {
            filtered = filtered.filter(t => t.homeroom);
        } else if (homeroom === 'no') {
            filtered = filtered.filter(t => !t.homeroom);
        }
        
        if (this.currentSort) {
            filtered = this.sortData(filtered, this.currentSort);
        }
        
        if (this.manager.pagination) {
            this.manager.pagination.update(filtered);
        } else {
            this.manager.render(filtered);
        }
    }

    sortData(data, type) {
        return data.sort((a, b) => {
            const nameA = (a.name || '').trim();
            const nameB = (b.name || '').trim();
            return type === 'asc'
                ? nameA.localeCompare(nameB, 'vi')
                : nameB.localeCompare(nameA, 'vi');
        });
    }

    setSort(type) {
        this.currentSort = type;
        this.applyFilters();
    }

    resetFilters() {
        this.subjectSelect.value = '';
        if (this.homeroomSelect) this.homeroomSelect.value = '';
        this.currentSort = '';
        
        const sortText = document.querySelector('.sort-text');
        if (sortText) sortText.textContent = 'Chọn thứ tự';
        
        if (this.manager.pagination) {
            this.manager.pagination.update(this.manager.data);
        } else {
            this.manager.render(this.manager.data);
        }
    }
}
// ========== STUDENTS ==========
class Students extends Manager {
    row(s) {
        return `
            <td>${esc(s.name)}</td>
            <td>${esc(s.class)}</td>
            <td>${esc(s.phone)}</td>
            <td>${esc(s.gender)}</td>
            <td>${esc(s.birthday)}</td>
            <td>${esc(s.id)}</td>
            <td>
                <button class="btn-edit">Sửa</button>
                <button class="btn-delete">Xóa</button>
                <button class="btn-see" onclick="students.view('${s.id}')">Xem</button>
            </td>`;
    }
}

// ========== TEACHERS ==========
class Teachers extends Manager {
    row(t) {
        const id = t.id || '';
        const name = t.name || '';
        const dept = t.department || '';
        const mainSubject = t.mainSubject || '';
        const homeroom = t.homeroom || 'Không';
        const phone = t.phone || '';
        
        return `
            <td>${esc(name)}</td>
            <td>${esc(dept)}</td>
            <td>${esc(mainSubject)}</td>
            <td>${esc(homeroom)}</td>
            <td>${esc(phone)}</td>
            <td>${esc(id)}</td>
            <td>
                <button class="btn-edit">Sửa</button>
                <button class="btn-delete">Xóa</button>
                <button class="btn-see" onclick="teachers.view('${id}')">Xem</button>
            </td>`;
    }
}

// ========== CLASSES MANAGER ==========
class ClassesManager {
    constructor() {
        this.studentsData = [];
        this.teachersData = [];
        this.classesData = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.processClasses();
        this.renderStats();
        this.renderClasses();
        this.setupSearch();
        this.setupFilter();
    }

    async loadData() {
        try {
            // Load students
            const studentsRes = await fetch('data/hocsinh.json');
            if (studentsRes.ok) {
                const studentsRaw = await studentsRes.json();
                this.studentsData = normalizeData(studentsRaw);
            }

            // Load teachers
            const teachersRes = await fetch('data/giaovien.json');
            if (teachersRes.ok) {
                const teachersRaw = await teachersRes.json();
                this.teachersData = normalizeData(teachersRaw);
            }
        } catch (e) {
            console.error('Lỗi khi load dữ liệu:', e);
        }
    }

    processClasses() {
        // Nhóm học sinh theo lớp
        const classesMap = new Map();
        
        this.studentsData.forEach(student => {
            const className = student.class;
            if (!classesMap.has(className)) {
                classesMap.set(className, {
                    name: className,
                    grade: student.grade,
                    students: [],
                    teacher: null
                });
            }
            classesMap.get(className).students.push(student);
        });

        // Tìm giáo viên chủ nhiệm cho mỗi lớp
        this.teachersData.forEach(teacher => {
            if (teacher.homeroom) {
                const homeroom = teacher.homeroom;
                if (classesMap.has(homeroom)) {
                    classesMap.get(homeroom).teacher = teacher.name;
                }
            }
        });

        this.classesData = Array.from(classesMap.values()).sort((a, b) => {
            if (a.grade !== b.grade) return a.grade - b.grade;
            return a.name.localeCompare(b.name, 'vi');
        });
    }

    renderStats() {
        const totalStudents = this.studentsData.length;
        const totalTeachers = this.teachersData.length;
        const totalClasses = this.classesData.length;
        const avgStudents = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

        const elements = {
            'total-students': totalStudents,
            'total-teachers': totalTeachers,
            'total-classes': totalClasses,
            'avg-students': avgStudents
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }

    renderClasses(classes = this.classesData) {
        const grid = document.getElementById('classes-grid');
        if (!grid) return;

        if (!classes.length) {
            grid.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">Không tìm thấy lớp học nào</p>';
            return;
        }

        grid.innerHTML = classes.map(cls => `
            <div class="class-card" onclick="classesManager.viewClass('${cls.name}')">
                <div class="class-card-header">
                    <div class="class-name">${esc(cls.name)}</div>
                    <div class="class-grade">Khối ${cls.grade}</div>
                </div>
                <div class="class-info">
                    <div class="class-info-item">
                        <span><strong>GVCN:</strong> ${esc(cls.teacher || 'Chưa phân công')}</span>
                    </div>
                    <div class="class-info-item">
                        <span><strong>Sĩ số:</strong> ${cls.students.length} học sinh</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    viewClass(className) {
        const classData = this.classesData.find(c => c.name === className);
        if (!classData) return;

        localStorage.setItem('selectedClass', JSON.stringify(classData));
        window.location.href = 'phonghoc.html';
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        let timer;
        searchInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const keyword = searchInput.value.trim().toLowerCase();
                const filtered = keyword
                    ? this.classesData.filter(c => c.name.toLowerCase().includes(keyword))
                    : this.classesData;
                this.renderClasses(filtered);
            }, 300);
        });
    }

    setupFilter() {
        const gradeSelect = document.getElementById('filter-grade');
        const resetBtn = document.getElementById('btn-reset-filter');

        if (gradeSelect) {
            // Populate grades
            const grades = [...new Set(this.classesData.map(c => c.grade))].sort((a, b) => a - b);
            grades.forEach(grade => {
                gradeSelect.innerHTML += `<option value="${grade}">Khối ${grade}</option>`;
            });

            gradeSelect.addEventListener('change', () => {
                const grade = gradeSelect.value;
                const filtered = grade
                    ? this.classesData.filter(c => c.grade == grade)
                    : this.classesData;
                this.renderClasses(filtered);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (gradeSelect) gradeSelect.value = '';
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                this.renderClasses(this.classesData);
            });
        }
    }
}

// ========== CLASS DETAIL MANAGER ==========
class ClassDetailManager {
    constructor() {
        this.classData = null;
        this.init();
    }

    init() {
        this.loadClassData();
        this.renderClassDetail();
        this.setupBackButton();
    }

    loadClassData() {
        const stored = localStorage.getItem('selectedClass');
        if (!stored) {
            alert('Không tìm thấy thông tin lớp học!');
            window.location.href = 'lophoc.html';
            return;
        }
        this.classData = JSON.parse(stored);
    }

    renderClassDetail() {
        if (!this.classData) return;

        // Update header
        const classBadge = document.getElementById('class-badge');
        const className = document.getElementById('class-name');
        if (classBadge) classBadge.textContent = this.classData.name;
        if (className) className.textContent = `Lớp ${this.classData.name}`;

        // Update info cards
        const teacherName = document.getElementById('teacher-name');
        const classSize = document.getElementById('class-size');
        const presentCount = document.getElementById('present-count');
        const absentCount = document.getElementById('absent-count');

        if (teacherName) teacherName.textContent = this.classData.teacher || 'Chưa phân công';
        if (classSize) classSize.textContent = this.classData.students.length;
        if (presentCount) presentCount.textContent = this.classData.students.length; // Tạm thời
        if (absentCount) absentCount.textContent = 0; // Tạm thời

        // Render students list
        this.renderStudentsList();
    }

    renderStudentsList() {
        const tbody = document.getElementById('students-list');
        if (!tbody || !this.classData) return;

        if (!this.classData.students.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888">Không có học sinh</td></tr>';
            return;
        }

        tbody.innerHTML = this.classData.students.map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${esc(student.name)}</td>
                <td>${esc(student.gender)}</td>
                <td>${esc(student.birthday)}</td>
                <td>${esc(student.phone)}</td>
                <td>${esc(student.id)}</td>
                <td><span style="color:#10b981;font-weight:600;">✓ Có mặt</span></td>
            </tr>
        `).join('');
    }

    setupBackButton() {
        const btnBack = document.getElementById('btn-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                window.location.href = 'lophoc.html';
            });
        }
    }
}

// ========== UPDATE INIT SECTION ==========
// Thêm vào phần DOMContentLoaded hiện tại:

document.addEventListener('DOMContentLoaded', () => {
    // ... code hiện tại cho students và teachers ...

    // Khởi tạo Classes Manager
    if (document.getElementById('classes-grid')) {
        window.classesManager = new ClassesManager();
    }

    // Khởi tạo Class Detail Manager
    if (document.getElementById('students-list') && window.location.pathname.includes('phonghoc')) {
        window.classDetailManager = new ClassDetailManager();
    }
});

// ========== SORT FUNCTION ==========
function sortName(type) {
    if (!filterManager) return;
    
    filterManager.setSort(type);
    
    const sortText = document.querySelector('.sort-text');
    if (sortText) {
        sortText.textContent = type === 'asc' ? 'A → Z' : 'Z → A';
    }
    
    const sortButtons = document.getElementById('sort-buttons');
    const sortNameBtn = document.getElementById('sort-name');
    if (sortButtons) sortButtons.classList.remove('show');
    if (sortNameBtn) sortNameBtn.classList.remove('active');
}

// ========== BACK BUTTON HANDLER ==========
function setupBackButton() {
    const btnBack = document.getElementById("btn-back");
    if (btnBack) {
        btnBack.addEventListener("click", () => {
            window.history.back();
        });
    }
}

// ========== INIT ==========
let students, teachers, filterManager, paginationManager;

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Students
    if (document.getElementById('student-body')) {
        students = new Students(
            'data/hocsinh.json',
            'student-body',
            'searchInput',
            'hschitiet.html'
        );
        
        students.load().then(() => {
            paginationManager = new PaginationManager(students);
            students.pagination = paginationManager;
            paginationManager.update(students.data);
            
            filterManager = new StudentFilterManager(students);
            
            console.log('Đã load', students.data.length, 'học sinh');
        }).catch(err => {
            console.error('Lỗi load học sinh:', err);
        });
        
        students.setupSearch();
    }
    
    // Khởi tạo Teachers
    if (document.getElementById('teacher-body')) {
        teachers = new Teachers(
            'data/giaovien.json',
            'teacher-body',
            'searchInput',
            'gvchitiet.html'
        );
        
        teachers.load().then(() => {
            paginationManager = new PaginationManager(teachers);
            teachers.pagination = paginationManager;
            paginationManager.update(teachers.data);
            
            filterManager = new TeacherFilterManager(teachers);
            
            console.log('Đã load', teachers.data.length, 'giáo viên');
        }).catch(err => {
            console.error('Lỗi load giáo viên:', err);
        });
        
        teachers.setupSearch();
    }
    
});