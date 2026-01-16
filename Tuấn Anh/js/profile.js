// Menu Navigation
const menuItems = document.querySelectorAll('.menu-item:not(.logout)');
const contentSections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all menu items
        menuItems.forEach(menu => menu.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Hide all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const sectionId = this.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Avatar Upload
const avatarUploadBtn = document.getElementById('avatarUploadBtn');
const avatarInput = document.getElementById('avatarInput');
const avatarImage = document.getElementById('avatarImage');

avatarUploadBtn.addEventListener('click', () => {
    avatarInput.click();
});

avatarInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            avatarImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Personal Info Form
const personalInfoForm = document.getElementById('personalInfoForm');
personalInfoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const birthday = document.getElementById('birthday').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    
    // Update display name
    document.getElementById('displayName').textContent = fullName;
    document.getElementById('displayEmail').textContent = email;
    
    // Show success message
    showNotification('Cập nhật thông tin thành công!', 'success');
    
    console.log('Personal Info Updated:', {
        fullName, phone, email, birthday, gender
    });
});

// Change Password Form
const changePasswordForm = document.getElementById('changePasswordForm');
changePasswordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    // Reset form
    this.reset();
    showNotification('Đổi mật khẩu thành công!', 'success');
});

// Notification Function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #A0F0ED 0%, #7de5e0 100%)' : 'linear-gradient(135deg, #ff4d6d 0%, #ff6b8a 100%)'};
        color: #FFFFFF;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.4s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Logout
document.querySelector('.menu-item.logout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Clear localStorage
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
        
        showNotification('Đăng xuất thành công!', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
});