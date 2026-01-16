// Chờ DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các biến
    const bookingForm = document.getElementById('bookingForm');
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const bookingSummary = document.getElementById('bookingSummary');
    const confirmBookingBtn = document.getElementById('confirmBooking');

    // Xử lý submit form đặt bàn
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Lấy dữ liệu từ form
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            guests: document.getElementById('guests').value,
            notes: document.getElementById('notes').value
        };

        // Hiển thị thông tin trong modal
        displayBookingSummary(formData);

        // Mở modal
        bookingModal.show();
    });

    // Hàm hiển thị tóm tắt đặt bàn
    function displayBookingSummary(data) {
        bookingSummary.innerHTML = `
            <p><strong>Họ và Tên:</strong> <span>${data.name}</span></p>
            <p><strong>Email:</strong> <span>${data.email}</span></p>
            <p><strong>Số Điện Thoại:</strong> <span>${data.phone}</span></p>
            <p><strong>Ngày:</strong> <span>${formatDate(data.date)}</span></p>
            <p><strong>Giờ:</strong> <span>${data.time}</span></p>
            <p><strong>Số Lượng Khách:</strong> <span>${data.guests}</span></p>
            ${data.notes ? `<p><strong>Ghi Chú:</strong> <span>${data.notes}</span></p>` : ''}
        `;
    }

    // Hàm format date sang định dạng DD/MM/YYYY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Xử lý khi xác nhận đặt bàn
    confirmBookingBtn.addEventListener('click', function() {
        alert('Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
        bookingModal.hide();
        bookingForm.reset();
    });

    // Smooth scrolling cho navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Đóng navbar khi click vào link trên mobile
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
});w