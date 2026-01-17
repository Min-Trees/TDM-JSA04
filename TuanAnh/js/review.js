// ===============================================
// PRODUCT REVIEWS SYSTEM - review.js
// ===============================================

// ===== 1. BIẾN TOÀN CỤC =====
let currentRating = 0;
let reviews = [];

// ===== 2. KHỞI TẠO KHI LOAD TRANG =====
function initReviewSystem() {
    // Kiểm tra currentProduct đã được load chưa
    if (!currentProduct) {
        console.error('currentProduct is not defined. Make sure to call initReviewSystem() after loading product data.');
        return;
    }
    
    setupStarRating();
    setupFormValidation();
    setupSortingEvents();
    loadReviews();
    displayReviews();
    updateReviewsSummary();
    
    // Hiển thị phần reviews
    const reviewsSection = document.getElementById('productReviews');
    if (reviewsSection) {
        reviewsSection.style.display = 'block';
    }
}

// ===== 3. SETUP STAR RATING =====
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');
    
    const ratingLabels = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Rất tốt'
    };
    
    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
            ratingText.textContent = ratingLabels[rating];
        });
        
        // Click to select
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.rating);
            ratingValue.value = currentRating;
            highlightStars(currentRating);
            ratingText.textContent = ratingLabels[currentRating];
            ratingText.style.color = '#667eea';
            ratingText.style.fontWeight = '600';
        });
    });
    
    // Reset on mouse leave
    const starRating = document.getElementById('starRating');
    starRating.addEventListener('mouseleave', function() {
        if (currentRating === 0) {
            resetStars();
            ratingText.textContent = 'Chọn số sao';
            ratingText.style.color = '#6b7280';
            ratingText.style.fontWeight = '400';
        } else {
            highlightStars(currentRating);
        }
    });
}

// ===== 4. HIGHLIGHT STARS =====
function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// ===== 5. RESET STARS =====
function resetStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
}

// ===== 6. SETUP FORM VALIDATION =====
function setupFormValidation() {
    const form = document.getElementById('reviewForm');
    const nameInput = document.getElementById('reviewName');
    const contentTextarea = document.getElementById('reviewContent');
    const charCount = document.getElementById('charCount');
    
    // Kiểm tra elements tồn tại
    if (!form || !nameInput || !contentTextarea || !charCount) {
        console.error('Review form elements not found');
        return;
    }
    
    // Đếm ký tự
    contentTextarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = 500;
        }
    });
    
    // Submit form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReview();
    });
}

// ===== 7. SUBMIT REVIEW =====
function submitReview() {
    const name = document.getElementById('reviewName').value.trim();
    const content = document.getElementById('reviewContent').value.trim();
    const rating = currentRating;
    
    // Validate
    if (rating === 0) {
        showToast('Vui lòng chọn số sao đánh giá', 'error');
        return;
    }
    
    if (name === '') {
        showToast('Vui lòng nhập tên của bạn', 'error');
        return;
    }
    
    if (content === '') {
        showToast('Vui lòng nhập nội dung đánh giá', 'error');
        return;
    }
    
    if (content.length < 10) {
        showToast('Nội dung đánh giá phải có ít nhất 10 ký tự', 'error');
        return;
    }
    
    // Tạo review object
    const review = {
        id: Date.now(),
        productId: currentProduct.id,
        name: name,
        rating: rating,
        content: content,
        date: new Date().toISOString()
    };
    
    // Thêm vào danh sách
    reviews.unshift(review);
    
    // Lưu vào localStorage
    saveReviews();
    
    // Hiển thị lại
    displayReviews();
    updateReviewsSummary();
    
    // Reset form
    resetForm();
    
    // Thông báo thành công
    showToast('Đánh giá của bạn đã được gửi thành công!', 'success');
    
    // Scroll đến review vừa tạo
    setTimeout(() => {
        const reviewsItems = document.getElementById('reviewsItems');
        reviewsItems.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
}

// ===== 8. RESET FORM =====
function resetForm() {
    const form = document.getElementById('reviewForm');
    const ratingText = document.getElementById('ratingText');
    const charCount = document.getElementById('charCount');
    const ratingValue = document.getElementById('ratingValue');
    
    if (form) form.reset();
    
    currentRating = 0;
    resetStars();
    
    if (ratingValue) ratingValue.value = 0;
    
    if (ratingText) {
        ratingText.textContent = 'Chọn số sao';
        ratingText.style.color = '#6b7280';
        ratingText.style.fontWeight = '400';
    }
    
    if (charCount) charCount.textContent = '0';
}

// ===== 9. LOAD REVIEWS TỪ LOCALSTORAGE =====
function loadReviews() {
    if (!currentProduct) return;
    
    const storageKey = `reviews_${currentProduct.id}`;
    const savedReviews = localStorage.getItem(storageKey);
    
    if (savedReviews) {
        reviews = JSON.parse(savedReviews);
    } else {
        reviews = [];
    }
}

// ===== 10. LƯU REVIEWS VÀO LOCALSTORAGE =====
function saveReviews() {
    if (!currentProduct) return;
    
    const storageKey = `reviews_${currentProduct.id}`;
    localStorage.setItem(storageKey, JSON.stringify(reviews));
}

// ===== 11. HIỂN THỊ REVIEWS =====
function displayReviews() {
    const reviewsItems = document.getElementById('reviewsItems');
    const reviewsEmpty = document.getElementById('reviewsEmpty');
    
    // Kiểm tra elements tồn tại
    if (!reviewsItems || !reviewsEmpty) {
        console.error('Reviews display elements not found');
        return;
    }
    
    if (reviews.length === 0) {
        reviewsItems.style.display = 'none';
        reviewsEmpty.style.display = 'block';
        return;
    }
    
    reviewsItems.style.display = 'flex';
    reviewsEmpty.style.display = 'none';
    reviewsItems.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewItem = createReviewItem(review);
        reviewsItems.appendChild(reviewItem);
    });
}

// ===== 12. TẠO REVIEW ITEM HTML =====
function createReviewItem(review) {
    const item = document.createElement('div');
    item.className = 'review-item';
    
    // Lấy chữ cái đầu của tên
    const initial = review.name.charAt(0).toUpperCase();
    
    // Tạo sao
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    // Format date
    const date = formatDate(review.date);
    
    item.innerHTML = `
        <div class="review-header">
            <div class="review-user-info">
                <div class="review-avatar">${initial}</div>
                <div class="review-user-details">
                    <div class="review-name">${escapeHtml(review.name)}</div>
                    <div class="review-date">${date}</div>
                </div>
            </div>
            <div class="review-rating">
                <div class="review-stars">${stars}</div>
                <div class="review-score">${review.rating}/5</div>
            </div>
        </div>
        <div class="review-content">${escapeHtml(review.content)}</div>
        <div class="review-actions">
            <button class="btn-delete-review" onclick="deleteReview(${review.id})">
                🗑️ Xóa
            </button>
        </div>
    `;
    
    return item;
}

// ===== 13. XÓA REVIEW =====
function deleteReview(reviewId) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) {
        return;
    }
    
    reviews = reviews.filter(r => r.id !== reviewId);
    saveReviews();
    displayReviews();
    updateReviewsSummary();
    showToast('Đã xóa đánh giá', 'success');
}

// ===== 14. CẬP NHẬT REVIEWS SUMMARY =====
function updateReviewsSummary() {
    const averageScore = document.getElementById('averageScore');
    const averageStars = document.getElementById('averageStars');
    const reviewsCount = document.getElementById('reviewsCount');
    const reviewsDistribution = document.getElementById('reviewsDistribution');
    
    if (reviews.length === 0) {
        averageScore.textContent = '0.0';
        averageStars.textContent = '☆☆☆☆☆';
        reviewsCount.textContent = '0 đánh giá';
        reviewsDistribution.innerHTML = '';
        return;
    }
    
    // Tính điểm trung bình
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = (totalRating / reviews.length).toFixed(1);
    
    averageScore.textContent = average;
    reviewsCount.textContent = `${reviews.length} đánh giá`;
    
    // Hiển thị sao
    const fullStars = Math.floor(average);
    const halfStar = average % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let starsHtml = '★'.repeat(fullStars);
    if (halfStar) starsHtml += '⯨';
    starsHtml += '☆'.repeat(emptyStars);
    
    averageStars.textContent = starsHtml;
    
    // Phân bố đánh giá
    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percentage = (count / reviews.length * 100).toFixed(0);
        return { star, count, percentage };
    });
    
    reviewsDistribution.innerHTML = distribution.map(d => `
        <div class="distribution-row">
            <div class="distribution-label">${d.star} sao</div>
            <div class="distribution-bar">
                <div class="distribution-fill" style="width: ${d.percentage}%"></div>
            </div>
            <div class="distribution-count">${d.count}</div>
        </div>
    `).join('');
}

// ===== 15. SETUP SORTING EVENTS =====
function setupSortingEvents() {
    const sortSelect = document.getElementById('sortReviews');
    
    sortSelect.addEventListener('change', function() {
        const sortType = this.value;
        sortReviews(sortType);
        displayReviews();
    });
}

// ===== 16. SẮP XẾP REVIEWS =====
function sortReviews(type) {
    switch(type) {
        case 'newest':
            reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'highest':
            reviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            reviews.sort((a, b) => a.rating - b.rating);
            break;
    }
}

// ===== 17. FORMAT DATE =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} phút trước`;
        }
        return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
        return 'Hôm qua';
    } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

// ===== 18. ESCAPE HTML =====
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== 19. SHOW TOAST (SỬ DỤNG TOAST CÓ SẴN) =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Kiểm tra element tồn tại
    if (!toast || !toastMessage || !toastIcon) {
        alert(message);
        return;
    }
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===============================================
// KẾT NỐI VỚI product.js
// ===============================================
// Thêm vào cuối file product.js, trong hàm loadProductData():
// Sau khi load xong sản phẩm, gọi:
// initReviewSystem();
// ===============================================