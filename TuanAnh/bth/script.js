// Regex patterns
const patterns = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^(0|\+84)[0-9]{9,10}$/
};

// Lấy các elements
const form = document.getElementById('registrationForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');
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
    } else if (password.length < 8) {
        errorElement.textContent = 'Mật khẩu phải có ít nhất 8 ký tự';
        passwordInput.classList.add('invalid');
        passwordInput.classList.remove('valid');
        return false;
    } else if (!patterns.password.test(password)) {
        errorElement.textContent = 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt';
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

// Hàm validate phone number
function validatePhone() {
    const phone = phoneInput.value.trim();
    const errorElement = document.getElementById('phoneError');
    
    if (phone === '') {
        errorElement.textContent = 'Số điện thoại không được để trống';
        phoneInput.classList.add('invalid');
        phoneInput.classList.remove('valid');
        return false;
    } else if (!patterns.phone.test(phone)) {
        errorElement.textContent = 'Số điện thoại không hợp lệ (vd: 0123456789 hoặc +84123456789)';
        phoneInput.classList.add('invalid');
        phoneInput.classList.remove('valid');
        return false;
    } else {
        errorElement.textContent = '';
        phoneInput.classList.remove('invalid');
        phoneInput.classList.add('valid');
        return true;
    }
}

// Thêm event listeners cho real-time validation
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);
phoneInput.addEventListener('blur', validatePhone);

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

phoneInput.addEventListener('input', function() {
    if (this.classList.contains('invalid')) {
        validatePhone();
    }
});

// Xử lý submit form
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate tất cả các fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPhoneValid = validatePhone();
    
    // Kiểm tra nếu tất cả đều hợp lệ
    if (isEmailValid && isPasswordValid && isPhoneValid) {
        successMessage.textContent = '✓ Đăng ký thành công! Tất cả thông tin đã được xác thực.';
        successMessage.classList.add('show');
        
        // Reset form sau 3 giây
        setTimeout(() => {
            form.reset();
            successMessage.classList.remove('show');
            document.querySelectorAll('.valid').forEach(el => {
                el.classList.remove('valid');
            });
        }, 3000);
    } else {
        successMessage.classList.remove('show');
    }
});