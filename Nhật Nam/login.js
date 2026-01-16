// Khởi tạo dữ liệu người dùng trong memory nếu chưa có
if (!window.usersDatabase) {
    window.usersDatabase = [];
}

// Thông tin admin cố định
const ADMIN_CREDENTIALS = {
    email: 'admin123@gmail.com',
    password: 'admin113'
};

// Load từ localStorage khi trang load
window.addEventListener('DOMContentLoaded', function() {
    try {
        const saved = localStorage.getItem('usersDatabase');
        if (saved) {
            window.usersDatabase = JSON.parse(saved);
        }
    } catch (e) {
        console.log('LocalStorage not available');
    }
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Reset messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    // Validation
    if (!email || !password) {
        errorMessage.textContent = 'Vui lòng điền đầy đủ thông tin!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Check if admin login
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        successMessage.textContent = 'Đăng nhập Admin thành công! Đang chuyển đến trang quản trị...';
        successMessage.classList.add('show');
        
        // Save admin session
        try {
            localStorage.setItem('currentUser', email);
            localStorage.setItem('isAdmin', 'true');
        } catch (e) {
            console.log('LocalStorage not available');
        }
        window.currentUser = email;
        window.isAdmin = true;
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        // Redirect to admin page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }
    
    // Find user
    const user = window.usersDatabase.find(u => u.email === email);
    
    if (!user) {
        errorMessage.textContent = 'Email không tồn tại!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Check password
    if (user.password !== password) {
        errorMessage.textContent = 'Mật khẩu không chính xác!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Login successful
    successMessage.textContent = 'Đăng nhập thành công! Đang chuyển đến trang chủ...';
    successMessage.classList.add('show');
    
    // Save current session
    try {
        localStorage.setItem('currentUser', email);
        localStorage.setItem('isAdmin', 'false');
    } catch (e) {
        console.log('LocalStorage not available');
    }
    window.currentUser = email;
    window.isAdmin = false;
    
    // Clear form
    document.getElementById('loginForm').reset();
    
    // Redirect to main page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'mainkamenrider.html';
    }, 1500);
});