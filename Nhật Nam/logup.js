// Khởi tạo dữ liệu người dùng trong memory nếu chưa có
if (!window.usersDatabase) {
    window.usersDatabase = [];
}

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Reset messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    // Validation
    if (!email || !password || !confirmPassword) {
        errorMessage.textContent = 'Vui lòng điền đầy đủ thông tin!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Email không hợp lệ!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Mật khẩu không khớp!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Check if email already exists
    const existingUser = window.usersDatabase.find(user => user.email === email);
    
    if (existingUser) {
        errorMessage.textContent = 'Email này đã được đăng ký!';
        errorMessage.classList.add('show');
        return;
    }
    
    // Save user to database
    const userData = {
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    window.usersDatabase.push(userData);
    
    // Lưu vào localStorage nếu có thể
    try {
        localStorage.setItem('usersDatabase', JSON.stringify(window.usersDatabase));
    } catch (e) {
        console.log('LocalStorage not available, using memory only');
    }
    
    // Show success message
    successMessage.textContent = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';
    successMessage.classList.add('show');
    
    // Clear form
    document.getElementById('signupForm').reset();
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});

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