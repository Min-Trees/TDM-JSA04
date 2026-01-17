// Regex patterns
const patterns = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^.{6,}$/ // Tối thiểu 6 ký tự cho đăng nhập
};

// Lấy các elements
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const successMessage = document.getElementById('successMessage');
const togglePasswordBtn = document.getElementById('togglePassword');

// Xử lý hiển thị/ẩn mật khẩu
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type');
    
    if (type === 'password') {
        passwordInput.setAttribute('type', 'text');
        this.classList.add('active');
    } else {
        passwordInput.setAttribute('type', 'password');
        this.classList.remove('active');
    }
});

// Hàm validate email
function validateEmail() {
    const email = emailInput.value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (email === '') {
        errorElement.textContent = 'Email không được để trống';
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
        return false;
    } else if (!patterns.email.test(email)) {
        errorElement.textContent = 'Email không hợp lệ (vd: example@email.com)';
        emailInput.classList.add('invalid');
        emailInput.classList.remove('valid');
        return false;
    } else {
        errorElement.textContent = '';
        emailInput.classList.remove('invalid');
        emailInput.classList.add('valid');
        return true;
    }
}

// Hàm validate password
function validatePassword() {
    const password = passwordInput.value;
    const errorElement = document.getElementById('passwordError');
    
    if (password === '') {
        errorElement.textContent = 'Mật khẩu không được để trống';
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
        return false;
    } else if (!patterns.password.test(password)) {
        errorElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
        return false;
    } else {
        errorElement.textContent = '';
        passwordInput.classList.remove('invalid');
        passwordInput.classList.add('valid');
        return true;
    }
}

// Thêm event listeners cho real-time validation
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);

emailInput.addEventListener('input', function() {
    if (this.classList.contains('invalid')) {
        validateEmail();
    }
});

passwordInput.addEventListener('input', function() {
    if (this.classList.contains('invalid')) {
        validatePassword();
    }
});

// Xử lý submit form
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate tất cả các fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    // Kiểm tra nếu tất cả đều hợp lệ
    if (isEmailValid && isPasswordValid) {
        // Thêm loading state
        const submitBtn = form.querySelector('.btn-login');
        submitBtn.classList.add('loading');
        
        // Giả lập đăng nhập (thực tế sẽ gọi API)
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            
            // Hiển thị thông báo thành công
            const email = emailInput.value;
            successMessage.textContent = `✓ Đăng nhập thành công! Chào mừng ${email}`;
            successMessage.classList.add('show');
            
            // Xử lý ghi nhớ đăng nhập
            if (rememberMeCheckbox.checked) {
                console.log('Đã chọn ghi nhớ đăng nhập');
                // Lưu vào localStorage hoặc cookie
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userEmail', email);
            }
            
            // Redirect sau 2 giây (ví dụ)
            setTimeout(() => {
                window.location.href = 'main.html';
                console.log('Chuyển hướng đến trang chủ...');
            }, 2000);
            
        }, 1500);
    } else {
        successMessage.classList.remove('show');
    }
});

// Xử lý nút đăng nhập với Google
const googleBtn = document.querySelector('.btn-google');
googleBtn.addEventListener('click', function() {
    console.log('Đăng nhập với Google');
    // Thực hiện OAuth Google
    alert('Chức năng đăng nhập với Google (cần tích hợp OAuth)');
});

// Xử lý nút đăng nhập với Facebook
const facebookBtn = document.querySelector('.btn-facebook');
facebookBtn.addEventListener('click', function() {
    console.log('Đăng nhập với Facebook');
    // Thực hiện OAuth Facebook
    alert('Chức năng đăng nhập với Facebook (cần tích hợp OAuth)');
});

// Xử lý link quên mật khẩu
const forgotPasswordLink = document.querySelector('.forgot-password');
forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Quên mật khẩu');
    alert('Chức năng quên mật khẩu (sẽ chuyển đến trang reset password)');
});

// Kiểm tra nếu đã có thông tin ghi nhớ
window.addEventListener('load', function() {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (rememberMe === 'true' && savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
        validateEmail();
    }
});

// Xử lý Enter key
emailInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
    }
});