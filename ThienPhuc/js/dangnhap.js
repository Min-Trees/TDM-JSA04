// Thông tin đăng nhập
var CORRECT_EMAIL = 'anthienphuc164@gmail.com';
var CORRECT_PASSWORD = '123';

// Lấy elements
var form = document.getElementById('loginForm');
var emailInput = document.getElementById('email');
var passwordInput = document.getElementById('password');
var errorDiv = document.getElementById('error');

// Xử lý đăng nhập
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    
    // Kiểm tra
    if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
        // Lưu trạng thái đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // Chuyển trang
        window.location.href = 'lophoc.html';
    } else {
        // Hiện lỗi
        errorDiv.textContent = 'Email hoặc mật khẩu không đúng!';
        errorDiv.classList.add('show');
    }
});