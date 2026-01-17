// Lấy các elements
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignup');
const showSigninBtn = document.getElementById('showSignin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Chuyển đổi giữa form đăng nhập và đăng ký
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signinForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearAllErrors();
});

showSigninBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    signinForm.classList.remove('hidden');
    clearAllErrors();
});

// Hàm hiển thị lỗi cho từng input
function showInputError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    input.classList.add('error');
    errorElement.textContent = message;
}

// Hàm xóa lỗi của input
function clearInputError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    input.classList.remove('error');
    errorElement.textContent = '';
}

// Hàm xóa tất cả lỗi
function clearAllErrors() {
    const errorInputs = document.querySelectorAll('.error');
    const errorTexts = document.querySelectorAll('.error-text');
    
    errorInputs.forEach(input => input.classList.remove('error'));
    errorTexts.forEach(error => error.textContent = '');
}

// Hàm hiển thị thông báo
function showMessage(type, message, formElement) {
    const oldMessage = formElement.querySelector('.success-message, .error-message');
    if (oldMessage) {
        oldMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    formElement.insertBefore(messageDiv, formElement.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Validation functions
function validateUsername(username) {
    if (username.length < 6 || username.length > 18) {
        return 'Username must be 6-18 characters';
    }
    return null;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

function validatePassword(password) {
    if (password.length < 8 || password.length > 20) {
        return 'Password must be 8-20 characters';
    }
    return null;
}

function validateConfirmPassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
}

// Real-time validation cho các input
document.getElementById('signupUsername')?.addEventListener('blur', function() {
    const error = validateUsername(this.value);
    if (error) {
        showInputError('signupUsername', 'usernameError', error);
    } else {
        clearInputError('signupUsername', 'usernameError');
    }
});

document.getElementById('signupEmail')?.addEventListener('blur', function() {
    const error = validateEmail(this.value);
    if (error) {
        showInputError('signupEmail', 'emailError', error);
    } else {
        clearInputError('signupEmail', 'emailError');
    }
});

document.getElementById('signupPassword')?.addEventListener('blur', function() {
    const error = validatePassword(this.value);
    if (error) {
        showInputError('signupPassword', 'passwordError', error);
    } else {
        clearInputError('signupPassword', 'passwordError');
    }
});

document.getElementById('confirmPassword')?.addEventListener('blur', function() {
    const password = document.getElementById('signupPassword').value;
    const error = validateConfirmPassword(password, this.value);
    if (error) {
        showInputError('confirmPassword', 'confirmError', error);
    } else {
        clearInputError('confirmPassword', 'confirmError');
    }
});

// Xử lý đăng ký
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let hasError = false;
    
    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
        showInputError('signupUsername', 'usernameError', usernameError);
        hasError = true;
    }
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
        showInputError('signupEmail', 'emailError', emailError);
        hasError = true;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        showInputError('signupPassword', 'passwordError', passwordError);
        hasError = true;
    }
    
    // Validate confirm password
    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) {
        showInputError('confirmPassword', 'confirmError', confirmError);
        hasError = true;
    }
    
    // Nếu có lỗi thì dừng lại
    if (hasError) {
        return;
    }
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = localStorage.getItem(`user_${username}`);
    if (existingUser) {
        showInputError('signupUsername', 'usernameError', 'Username already exists');
        return;
    }
    
    // Kiểm tra email đã tồn tại chưa
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    const emailExists = allUsers.some(key => {
        const user = JSON.parse(localStorage.getItem(key));
        return user.email === email;
    });
    
    if (emailExists) {
        showInputError('signupEmail', 'emailError', 'Email already registered');
        return;
    }
    
    // Lưu thông tin người dùng vào localStorage
    const userData = {
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`user_${username}`, JSON.stringify(userData));
    
    showMessage('success', 'Registration successful! Please sign in.', signupForm);
    
    // Reset form và chuyển về trang đăng nhập sau 2 giây
    setTimeout(() => {
        registerForm.reset();
        clearAllErrors();
        signupForm.classList.add('hidden');
        signinForm.classList.remove('hidden');
    }, 2000);
});

// Xử lý đăng nhập
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Lấy thông tin người dùng từ localStorage
    const storedUser = localStorage.getItem(`user_${username}`);
    
    if (!storedUser) {
        showMessage('error', 'Username not found!', signinForm);
        return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Kiểm tra mật khẩu
    if (userData.password !== password) {
        showMessage('error', 'Incorrect password!', signinForm);
        return;
    }
    
    // Đăng nhập thành công
    showMessage('success', 'Login successful! Welcome back!', signinForm);
    
    // Lưu trạng thái đăng nhập nếu chọn "Remember me"
    if (rememberMe) {
        localStorage.setItem('currentUser', username);
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('isLoggedIn', 'true');
    }
    
    // Chuyển hướng hoặc xử lý sau khi đăng nhập thành công
    setTimeout(() => {
        console.log('Logged in as:', username);
        window.location.href = 'home.html';
    }, 1500);
});

// Kiểm tra trạng thái đăng nhập khi load trang
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (isLoggedIn === 'true' && currentUser) {
        console.log('User already logged in:', currentUser);
        window.location.href = 'home.html';
    }
});

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    window.location.reload();
}

window.logout = logout;