const AdminApp = (() => {
    // State Management
    const state = {
        currentSection: 'dashboard',
        isDarkMode: localStorage.getItem('adminDarkMode') === 'true' || false,
        contests: [],
        students: [],
        eloRankings: [],
        reports: [],
        searchQuery: '',
        currentUser: {
            id: 'admin_001',
            name: 'Trần Quang Minh',
            email: 'admin@mathair.com',
            phone: '0912345678',
            joinedDate: '2024-01-01',
            role: 'Quản Trị Viên',
            avatar: 'ASSETS/images/avatars/nghenhin_xedoisong_mclaren-2.jpg',
            totalContests: 42,
            totalStudents: 250,
            totalReports: 15
        }
    };

    // Initialize
    function init() {
        setupDarkMode();
        attachEventListeners();
        loadData();
        renderSection('dashboard');
    }

    // =============================================
    // DARK MODE
    // =============================================

    function setupDarkMode() {
        if (state.isDarkMode) {
            document.body.classList.add('dark-mode');
            updateThemeIcon();
        }
        // Update admin name in sidebar
        document.getElementById('admin-profile-name').textContent = state.currentUser.name.split(' ')[state.currentUser.name.split(' ').length - 1];
    }

    function toggleTheme() {
        state.isDarkMode = !state.isDarkMode;
        localStorage.setItem('adminDarkMode', state.isDarkMode);
        document.body.classList.toggle('dark-mode');
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const icon = document.getElementById('theme-toggle').querySelector('i');
        if (state.isDarkMode) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================

    function attachEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                navigateSection(section);
            });
        });

        // Sidebar Toggle (Mobile)
        document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
        document.getElementById('sidebar-toggle-mobile').addEventListener('click', closeSidebar);

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Settings Menu
        document.getElementById('settings-btn').addEventListener('click', toggleSettingsMenu);
        document.getElementById('logout-btn').addEventListener('click', logout);

        // Profile Button
        document.getElementById('profile-btn').addEventListener('click', openAdminProfileModal);

        // Profile Button
        document.getElementById('profile-btn').addEventListener('click', openAdminProfileModal);

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            renderCurrentSection();
        });

        // Modal Close Buttons
        document.getElementById('contest-modal-close').addEventListener('click', closeContestModal);
        document.getElementById('contest-modal-cancel').addEventListener('click', closeContestModal);
        document.getElementById('user-action-modal-close').addEventListener('click', closeUserActionModal);
        document.getElementById('user-action-modal-cancel').addEventListener('click', closeUserActionModal);
        document.getElementById('report-details-modal-close').addEventListener('click', closeReportDetailsModal);
        document.getElementById('admin-profile-modal-close').addEventListener('click', closeAdminProfileModal);

        // Contest Form Submit
        document.getElementById('contest-form').addEventListener('submit', handleCreateContest);
        document.getElementById('user-action-form').addEventListener('submit', handleUserAction);

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-menu')) {
                document.getElementById('settings-dropdown').classList.remove('active');
            }
        });
    }

    // =============================================
    // NAVIGATION
    // =============================================

    function navigateSection(section) {
        state.currentSection = section;
        renderSection(section);
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Update section title
        const sectionTitles = {
            'dashboard': 'Dashboard',
            'contests': 'Tạo Cuộc Thi',
            'elo-ranking': 'Thống Kê ELO',
            'students': 'Quản Lý Học Viên',
            'reports': 'Báo Cáo & Ban'
        };
        document.getElementById('section-title').textContent = sectionTitles[section] || 'Dashboard';

        closeSidebar();
    }

    function renderSection(section) {
        const content = document.getElementById('admin-content');
        
        switch(section) {
            case 'dashboard':
                content.innerHTML = renderDashboard();
                break;
            case 'contests':
                content.innerHTML = renderContests();
                attachContestListeners();
                break;
            case 'elo-ranking':
                content.innerHTML = renderEloRanking();
                break;
            case 'students':
                content.innerHTML = renderStudents();
                attachStudentListeners();
                break;
            case 'reports':
                content.innerHTML = renderReports();
                attachReportListeners();
                break;
            default:
                content.innerHTML = renderDashboard();
        }
    }

    function renderCurrentSection() {
        renderSection(state.currentSection);
    }

    // =============================================
    // DATA LOADING
    // =============================================

    async function loadData() {
        try {
            // Load users
            const usersRes = await fetch('DATA/users.json');
            const usersData = await usersRes.json();
            state.students = usersData.users || [];

            // Load grades
            const gradesRes = await fetch('DATA/grades.json');
            const gradesData = await gradesRes.json();
            state.grades = gradesData.grades || [];

            // Load contests from ContestSystem
            await ContestSystem.init();

            initializeEloRankings();
            initializeContests();
            initializeReports();
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    function initializeEloRankings() {
        // Build SP Rankings from actual user data
        state.eloRankings = state.students
            .filter(u => u.role === 'user')
            .map((student) => ({
                id: student.id,
                username: student.username,
                fullName: student.fullName,
                avatar: student.avatar,
                studyingPoints: student.studyingPoints || 1000,
                completedContests: (student.completedContests || []).length
            }))
            .sort((a, b) => b.studyingPoints - a.studyingPoints);
    }

    function initializeContests() {
        // Contests are loaded from ContestSystem.init()
        state.contests = ContestSystem.contests || [];
    }

    function initializeReports() {
        state.reports = [
            {
                id: 'report_001',
                reportedUser: {
                    id: 'user_001',
                    username: 'minhpilot',
                    fullName: 'Phan Hồng Minh'
                },
                reporter: {
                    id: 'user_002',
                    username: 'testuser'
                },
                reason: 'Spam và hành vi không lịch sự',
                date: '2024-12-20T10:30:00',
                status: 'pending'
            }
        ];
    }

    // =============================================
    // DASHBOARD
    // =============================================

    function renderDashboard() {
        const totalUsers = state.students.length;
        const totalContests = state.contests.length;
        const totalReports = state.reports.length;
        
        // Calculate active users from lastLogin date
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = state.students.filter(u => {
            const lastLogin = new Date(u.lastLogin || 0);
            return lastLogin > oneWeekAgo;
        }).length;
        
        // Count upcoming contests
        const upcomingContests = state.contests.filter(c => {
            const startTime = new Date(c.startTime);
            return startTime > now;
        }).length;

        return `
            <div class="dashboard">
                <div class="stat-card">
                    <div class="stat-card-icon primary">
                        <i class="fas fa-users"></i>
                    </div>
                    <p class="stat-card-title">Tổng Học Viên</p>
                    <p class="stat-card-value">${totalUsers}</p>
                    <p class="stat-card-change">↑ ${totalUsers - 2} người tham gia</p>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon success">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <p class="stat-card-title">Cuộc Thi</p>
                    <p class="stat-card-value">${totalContests}</p>
                    <p class="stat-card-change">${upcomingContests} cuộc thi sắp tới</p>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon warning">
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="stat-card-title">Người Dùng Hoạt Động</p>
                    <p class="stat-card-value">${activeUsers}</p>
                    <p class="stat-card-change">${Math.round((activeUsers / totalUsers) * 100)}% tỉ lệ</p>
                </div>

                <div class="stat-card">
                    <div class="stat-card-icon danger">
                        <i class="fas fa-flag"></i>
                    </div>
                    <p class="stat-card-title">Báo Cáo Chờ Xử Lý</p>
                    <p class="stat-card-value">${totalReports}</p>
                    <p class="stat-card-change negative">Cần chú ý</p>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>Hoạt Động Gần Đây</h3>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Người Dùng</th>
                            <th>Hoạt Động</th>
                            <th>Thời Gian</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.students.slice(0, 5).map((student, idx) => `
                            <tr>
                                <td>
                                    <div class="user-cell">
                                        <img src="${student.avatar}" alt="${student.fullName}" class="user-avatar">
                                        <div>
                                            <p style="margin: 0; font-weight: 600;">${student.fullName}</p>
                                            <p style="margin: 0; font-size: 1.1rem; color: var(--admin-text-secondary);">@${student.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>Hoàn thành bài tập</td>
                                <td>2 giờ trước</td>
                                <td><span class="status-badge active">Hoạt động</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // =============================================
    // CONTESTS
    // =============================================

    function renderContests() {
        const filtered = ContestSystem.contests.filter(c => 
            c.title.toLowerCase().includes(state.searchQuery)
        );

        return `
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh Sách Cuộc Thi</h3>
                    <div class="table-header-actions">
                        <button class="btn-primary" id="btn-create-contest">
                            <i class="fas fa-plus"></i> Tạo Cuộc Thi
                        </button>
                    </div>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tên Cuộc Thi</th>
                            <th>Mô Tả</th>
                            <th>Câu Hỏi</th>
                            <th>Thời Gian</th>
                            <th>Người Tham Gia</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(contest => {
                            const startTime = new Date(contest.startTime);
                            const endTime = new Date(contest.endTime);
                            const now = new Date();
                            let status = 'Sắp diễn ra';
                            let statusClass = 'pending';
                            
                            if (now >= startTime && now <= endTime) {
                                status = 'Đang diễn ra';
                                statusClass = 'active';
                            } else if (now > endTime) {
                                status = 'Đã kết thúc';
                                statusClass = 'completed';
                            }
                            
                            return `
                            <tr>
                                <td>
                                    <strong>${contest.title}</strong>
                                </td>
                                <td>
                                    <p style="margin: 0; font-size: 1.1rem; color: var(--admin-text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                                        ${contest.description}
                                    </p>
                                </td>
                                <td><strong>${contest.totalQuestions}</strong> câu</td>
                                <td>
                                    <strong>${contest.duration}</strong> phút<br>
                                    <span style="font-size: 1rem; color: var(--admin-text-secondary);">
                                        ${startTime.toLocaleString('vi-VN')}
                                    </span>
                                </td>
                                <td><strong>${contest.participants.length}</strong> người</td>
                                <td>
                                    <span class="status-badge ${statusClass}">
                                        ${status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-primary btn-small" onclick="AdminApp.editContest('${contest.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-danger btn-small" onclick="AdminApp.deleteContest('${contest.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function attachContestListeners() {
        document.getElementById('btn-create-contest').addEventListener('click', openContestModal);
    }

    function openContestModal(contestId = null) {
        const form = document.getElementById('contest-form');
        const modal = document.getElementById('contest-modal');
        const modalTitle = modal.querySelector('.modal-header h3');
        
        if (contestId) {
            // Edit mode
            const contest = ContestSystem.getContestById(contestId);
            if (!contest) {
                showNotification('Cuộc thi không tồn tại!', 'error');
                return;
            }
            
            // Check if contest has participants
            if (contest.participants && contest.participants.length > 0) {
                showNotification('Không thể chỉnh sửa cuộc thi đã có người tham gia!', 'error');
                return;
            }
            
            // Set modal title
            modalTitle.textContent = 'Chỉnh Sửa Cuộc Thi';
            
            // Pre-fill form with contest data
            form.title.value = contest.title;
            form.description.value = contest.description;
            form.startTime.value = new Date(contest.startTime).toISOString().slice(0, 16);
            form.endTime.value = new Date(contest.endTime).toISOString().slice(0, 16);
            form.duration.value = contest.duration;
            form.totalQuestions.value = contest.totalQuestions;
            
            // Store contest ID for update
            form.dataset.contestId = contestId;
            form.dataset.isEdit = 'true';
        } else {
            // Create mode
            modalTitle.textContent = 'Tạo Cuộc Thi Mới';
            form.reset();
            delete form.dataset.contestId;
            form.dataset.isEdit = 'false';
        }
        
        modal.style.display = 'flex';
    }

    function closeContestModal() {
        document.getElementById('contest-modal').style.display = 'none';
        document.getElementById('contest-form').reset();
    }

    function handleCreateContest(e) {
        e.preventDefault();
        const form = e.target;
        
        // Client-side date validation
        const startTime = new Date(form.startTime.value);
        const endTime = new Date(form.endTime.value);
        
        const errorDiv = document.getElementById('contest-form-error');
        
        // Check if end time is after start time
        if (endTime <= startTime) {
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#f44336';
            errorDiv.textContent = 'Ngày kết thúc phải sau ngày bắt đầu!';
            return;
        }
        
        const contestData = {
            title: form.title.value,
            description: form.description.value,
            startTime: form.startTime.value,
            endTime: form.endTime.value,
            duration: form.duration.value,
            totalQuestions: form.totalQuestions.value,
            questionSource: form.questionSource.value || 'random'
        };
        
        const isEdit = form.dataset.isEdit === 'true';
        const contestId = form.dataset.contestId;
        
        let result;
        if (isEdit && contestId) {
            // Update existing contest
            result = ContestSystem.updateContest(contestId, contestData);
        } else {
            // Create new contest
            result = ContestSystem.createContest(contestData);
        }
        
        if (result.success) {
            errorDiv.style.display = 'none';
            closeContestModal();
            renderSection('contests');
            showNotification(result.message, 'success');
        } else {
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#f44336';
            errorDiv.textContent = result.message;
        }
    }

    // =============================================
    // ELO RANKING
    // =============================================

    function renderEloRanking() {
        const filtered = state.eloRankings.filter(r =>
            r.fullName.toLowerCase().includes(state.searchQuery) ||
            r.username.toLowerCase().includes(state.searchQuery)
        );

        return `
            <div class="table-container">
                <div class="table-header">
                    <h3>Bảng Xếp Hạng Studying Points (SP)</h3>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Hạng</th>
                            <th>Người Chơi</th>
                            <th>Studying Points</th>
                            <th>Cuộc Thi Hoàn Thành</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map((rank, idx) => {
                            return `
                                <tr>
                                    <td>
                                        <strong style="font-size: 1.6rem; color: var(--admin-primary);">
                                            ${idx + 1}
                                            ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                        </strong>
                                    </td>
                                    <td>
                                        <div class="user-cell">
                                            <img src="${rank.avatar}" alt="${rank.fullName}" class="user-avatar">
                                            <div>
                                                <p style="margin: 0; font-weight: 600;">${rank.fullName}</p>
                                                <p style="margin: 0; font-size: 1.1rem; color: var(--admin-text-secondary);">@${rank.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong style="font-size: 1.5rem; color: var(--admin-primary);">${rank.studyingPoints}</strong>
                                    </td>
                                    <td><strong>${rank.completedContests}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // =============================================
    // STUDENTS
    // =============================================

    function renderStudents() {
        const filtered = state.students.filter(s =>
            s.fullName.toLowerCase().includes(state.searchQuery) ||
            s.username.toLowerCase().includes(state.searchQuery) ||
            s.email.toLowerCase().includes(state.searchQuery)
        );

        return `
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh Sách Học Viên</h3>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tên Học Viên</th>
                            <th>Email</th>
                            <th>Trường</th>
                            <th>Lớp</th>
                            <th>Ngày Tham Gia</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(student => {
                            const createdDate = new Date(student.createdAt).toLocaleDateString('vi-VN');
                            return `
                                <tr>
                                    <td>
                                        <div class="user-cell">
                                            <img src="${student.avatar}" alt="${student.fullName}" class="user-avatar">
                                            <div>
                                                <p style="margin: 0; font-weight: 600;">${student.fullName}</p>
                                                <p style="margin: 0; font-size: 1.1rem; color: var(--admin-text-secondary);">@${student.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${student.email}</td>
                                    <td>${student.school}</td>
                                    <td>${student.grade}</td>
                                    <td>${createdDate}</td>
                                    <td><span class="status-badge active">Hoạt động</span></td>
                                    <td>
                                        <button class="btn-primary btn-small" onclick="AdminApp.openUserActionModal('${student.id}', '${student.fullName}')">
                                            <i class="fas fa-arrow-up"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function attachStudentListeners() {
        // Listeners will be attached dynamically through onclick attributes
    }

    // =============================================
    // REPORTS & BAN
    // =============================================

    function renderReports() {
        const filtered = state.reports.filter(r =>
            r.reportedUser.fullName.toLowerCase().includes(state.searchQuery) ||
            r.reason.toLowerCase().includes(state.searchQuery)
        );

        return `
            <div class="table-container">
                <div class="table-header">
                    <h3>Báo Cáo & Quản Lý Người Dùng</h3>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Người Bị Báo Cáo</th>
                            <th>Người Báo Cáo</th>
                            <th>Lý Do</th>
                            <th>Ngày</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(report => {
                            const reportDate = new Date(report.date).toLocaleDateString('vi-VN');
                            return `
                                <tr>
                                    <td>
                                        <strong>${report.reportedUser.fullName}</strong>
                                        <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem; color: var(--admin-text-secondary);">
                                            @${report.reportedUser.username}
                                        </p>
                                    </td>
                                    <td>
                                        <strong>@${report.reporter.username}</strong>
                                    </td>
                                    <td>${report.reason}</td>
                                    <td>${reportDate}</td>
                                    <td>
                                        <span class="status-badge ${report.status === 'pending' ? 'warning' : 'active'}">
                                            ${report.status === 'pending' ? 'Chờ xử lý' : 'Đã giải quyết'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-primary btn-small" onclick="AdminApp.openReportDetailsModal('${report.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function attachReportListeners() {
        // Listeners will be attached dynamically through onclick attributes
    }

    function openUserActionModal(userId, userName, isBan = false) {
        const modal = document.getElementById('user-action-modal');
        const title = document.getElementById('user-action-title');
        const statusSelect = document.getElementById('user-action-status');
        
        title.textContent = isBan ? `Ban Người Dùng: ${userName}` : `Quản Lý Người Dùng: ${userName}`;
        document.getElementById('user-action-id').value = userId;
        
        if (isBan) {
            statusSelect.value = 'banned';
        }
        
        modal.style.display = 'flex';
    }

    function closeUserActionModal() {
        document.getElementById('user-action-modal').style.display = 'none';
        document.getElementById('user-action-form').reset();
    }

    function handleUserAction(e) {
        e.preventDefault();
        const userId = document.getElementById('user-action-id').value;
        const rank = document.getElementById('user-action-status').value;

        const student = state.students.find(s => s.id === userId);
        if (student) {
            student.rank = rank;
        }

        closeUserActionModal();
        renderCurrentSection();
        showNotification('Rank học viên đã được cập nhật thành công!', 'success');
    }

    function openReportDetailsModal(reportId) {
        const report = state.reports.find(r => r.id === reportId);
        if (!report) return;

        const modal = document.getElementById('report-details-modal');
        const body = document.getElementById('report-details-body');

        body.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                    <img src="${report.reportedUser.avatar}" alt="${report.reportedUser.fullName}" class="user-avatar" style="width: 4rem; height: 4rem; margin-right: 1rem;">
                    <div>
                        <p style="margin: 0; font-weight: 600; font-size: 1.4rem;">${report.reportedUser.fullName}</p>
                        <p style="margin: 0; color: var(--admin-text-secondary);">@${report.reportedUser.username}</p>
                    </div>
                </div>

                <div style="background: var(--admin-hover); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin: 0 0 0.5rem 0; color: var(--admin-text-secondary); font-size: 1.1rem;">Lý do báo cáo:</p>
                    <p style="margin: 0; font-size: 1.3rem; line-height: 1.6;">"${report.reason}"</p>
                </div>

                <p style="color: var(--admin-text-secondary); font-size: 1.1rem; margin: 0 0 1.5rem 0;">
                    Báo cáo bởi: <strong>@${report.reporter.fullName}</strong> - ${new Date(report.date).toLocaleString('vi-VN')}
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <button class="btn-secondary" style="width: 100%;" onclick="AdminApp.rejectReport('${reportId}')">
                    <i class="fas fa-times"></i> Từ Chối
                </button>
                <button style="width: 100%; padding: 0.8rem 1.6rem; border: none; border-radius: 8px; font-size: 1.3rem; font-weight: 600; cursor: pointer; background: var(--admin-warning); color: white; transition: all 0.3s ease;" onclick="AdminApp.suspendUser('${report.reportedUser.id}')">
                    <i class="fas fa-pause-circle"></i> Tạm Dừng
                </button>
                <button class="btn-danger" style="width: 100%;" onclick="AdminApp.banUser('${report.reportedUser.id}', '${reportId}')">
                    <i class="fas fa-ban"></i> Cấm Tài Khoản
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    function closeReportDetailsModal() {
        document.getElementById('report-details-modal').style.display = 'none';
    }

    function rejectReport(reportId) {
        const report = state.reports.find(r => r.id === reportId);
        if (report) {
            report.status = 'resolved';
            closeReportDetailsModal();
            renderCurrentSection();
            showNotification('Báo cáo đã bị từ chối!', 'success');
        }
    }

    function suspendUser(userId) {
        const student = state.students.find(s => s.id === userId);
        if (student) {
            student.status = 'suspended';
            closeReportDetailsModal();
            renderCurrentSection();
            showNotification('Tài khoản người dùng đã bị tạm dừng!', 'success');
        }
    }

    function banUser(userId, reportId) {
        const student = state.students.find(s => s.id === userId);
        if (student) {
            student.status = 'banned';
        }
        const report = state.reports.find(r => r.id === reportId);
        if (report) {
            report.status = 'resolved';
        }
        closeReportDetailsModal();
        renderCurrentSection();
        showNotification('Tài khoản người dùng đã bị cấm!', 'success');
    }

    function openAdminProfileModal() {
        const modal = document.getElementById('admin-profile-modal');
        const body = document.getElementById('admin-profile-body');

        const joinedDate = new Date(state.currentUser.joinedDate).toLocaleDateString('vi-VN');

        body.innerHTML = `
            <div class="admin-profile-card">
                <img src="${state.currentUser.avatar}" alt="${state.currentUser.name}" class="user-avatar">
                <p class="user-name">${state.currentUser.name}</p>
                <p class="user-role">${state.currentUser.role}</p>
                <p style="color: var(--admin-text-secondary); font-size: 1.2rem; margin: 1rem 0 0 0;">
                    📧 ${state.currentUser.email}
                    <br>
                    📱 ${state.currentUser.phone}
                </p>
            </div>

            <div class="admin-stats">
                <div class="admin-stat-item">
                    <p><i class="fas fa-trophy"></i></p>
                    <p>Cuộc Thi</p>
                    <strong>${state.currentUser.totalContests}</strong>
                </div>
                <div class="admin-stat-item">
                    <p><i class="fas fa-users"></i></p>
                    <p>Học Viên</p>
                    <strong>${state.currentUser.totalStudents}</strong>
                </div>
                <div class="admin-stat-item">
                    <p><i class="fas fa-flag"></i></p>
                    <p>Báo Cáo</p>
                    <strong>${state.currentUser.totalReports}</strong>
                </div>
            </div>

            <div style="background: var(--admin-hover); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <p style="margin: 0 0 0.5rem 0; color: var(--admin-text-secondary); font-size: 1.1rem;">Tham gia từ:</p>
                <p style="margin: 0; font-size: 1.3rem;">${joinedDate}</p>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button class="btn-primary" style="flex: 1;" onclick="alert('Chức năng chỉnh sửa hồ sơ sẽ sớm có mặt')">
                    <i class="fas fa-edit"></i> Chỉnh Sửa Hồ Sơ
                </button>
                <button class="btn-secondary" style="flex: 1;" onclick="AdminApp.closeAdminProfileModal()">
                    Đóng
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    function closeAdminProfileModal() {
        document.getElementById('admin-profile-modal').style.display = 'none';
    }

    // =============================================
    // SIDEBAR & UI
    // =============================================

    function toggleSidebar() {
        document.getElementById('admin-sidebar').classList.toggle('active');
    }

    function closeSidebar() {
        document.getElementById('admin-sidebar').classList.remove('active');
    }

    function toggleSettingsMenu() {
        const dropdown = document.getElementById('settings-dropdown');
        dropdown.classList.toggle('active');
    }

    function logout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Call logout from parent window (main tab)
            if (window.opener && !window.opener.closed) {
                window.opener.Auth.logout();
            }
            // Close admin tab
            window.close();
        }
    }

    // =============================================
    // UTILITIES
    // =============================================

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1.5rem 2rem;
            background: ${type === 'success' ? 'var(--admin-success)' : type === 'error' ? 'var(--admin-danger)' : 'var(--admin-info)'};
            color: white;
            border-radius: 8px;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // =============================================
    // PUBLIC API
    // =============================================

    return {
        init,
        editContest: (id) => openContestModal(id),
        deleteContest: (id) => {
            if (confirm('Bạn có chắc muốn xóa cuộc thi này?')) {
                const result = ContestSystem.deleteContest(id);
                if (result.success) {
                    renderSection('contests');
                    showNotification(result.message, 'success');
                } else {
                    showNotification(result.message, 'error');
                }
            }
        },
        openUserActionModal,
        openReportDetailsModal,
        closeReportDetailsModal,
        rejectReport,
        suspendUser,
        banUser,
        closeAdminProfileModal
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', AdminApp.init);
