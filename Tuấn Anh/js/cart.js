// ===============================================
// SHOPPING CART PAGE - JavaScript
// ===============================================

// ===== 1. BIẾN TOÀN CỤC =====
let cart = [];
let appliedCoupon = null;

// Danh sách mã giảm giá
const COUPONS = {
    'WELCOME10': { discount: 10, type: 'percent', description: 'Giảm 10%' },
    'SAVE20K': { discount: 20000, type: 'fixed', description: 'Giảm 20.000đ' },
    'FREESHIP': { discount: 30000, type: 'shipping', description: 'Miễn phí vận chuyển' },
    'VIP50': { discount: 50, type: 'percent', description: 'Giảm 50%' }
};

// Phí vận chuyển cố định
const SHIPPING_FEE = 30000;

// Mapping category names
const CATEGORY_NAMES = {
    'candy': 'Kẹo',
    'snack': 'Bánh',
    'drink': 'Nước ngọt'
};

// ===== 2. LOAD GIỎ HÀNG TỪ LOCALSTORAGE =====
function loadCart() {
    const cartData = localStorage.getItem('cart');
    cart = cartData ? JSON.parse(cartData) : [];
    displayCart();
    updateCartBadge();
}

// ===== 3. LƯU GIỎ HÀNG VÀO LOCALSTORAGE =====
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// ===== 4. HIỂN THỊ GIỎ HÀNG =====
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'grid';

    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        cartItems.appendChild(cartItem);
    });

    updateSummary();
}

// ===== 5. TẠO CART ITEM HTML =====
function createCartItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    const categoryName = CATEGORY_NAMES[item.category] || 'Sản phẩm';

    itemDiv.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <span class="item-category">${categoryName}</span>
            <div class="item-price">${formatPrice(item.price)}</div>
            <div class="item-subtotal">
                Tổng: ${formatPrice(item.price * item.quantity)}
            </div>
        </div>
        
        <div class="item-actions">
            <button class="btn-remove" data-index="${index}">×</button>
            
            <div class="quantity-controls">
                <button class="qty-btn minus" data-index="${index}">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn plus" data-index="${index}">+</button>
            </div>
        </div>
    `;

    // Thêm sự kiện
    setupItemEvents(itemDiv, index);

    return itemDiv;
}

// ===== 6. SETUP SỰ KIỆN CHO CART ITEM =====
function setupItemEvents(itemDiv, index) {
    // Nút xóa
    const removeBtn = itemDiv.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => {
        showConfirmModal(
            'Xóa sản phẩm',
            'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
            () => removeItem(index)
        );
    });

    // Nút giảm số lượng
    const minusBtn = itemDiv.querySelector('.qty-btn.minus');
    minusBtn.addEventListener('click', () => {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
            saveCart();
            displayCart();
        } else {
            showConfirmModal(
                'Xóa sản phẩm',
                'Số lượng tối thiểu là 1. Bạn có muốn xóa sản phẩm này?',
                () => removeItem(index)
            );
        }
    });

    // Nút tăng số lượng
    const plusBtn = itemDiv.querySelector('.qty-btn.plus');
    plusBtn.addEventListener('click', () => {
        if (cart[index].quantity < 99) {
            cart[index].quantity++;
            saveCart();
            displayCart();
        } else {
            showToast('Số lượng tối đa là 99', 'error');
        }
    });
}

// ===== 7. XÓA SẢN PHẨM =====
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    displayCart();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
}

// ===== 8. XÓA TẤT CẢ GIỎ HÀNG =====
function clearCart() {
    showConfirmModal(
        'Xóa tất cả',
        'Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?',
        () => {
            cart = [];
            appliedCoupon = null;
            saveCart();
            displayCart();
            showToast('Đã xóa tất cả sản phẩm', 'success');
        }
    );
}

// ===== 9. TÍNH TOÁN VÀ CẬP NHẬT SUMMARY =====
function updateSummary() {
    // Tính tạm tính
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Phí vận chuyển
    let shipping = SHIPPING_FEE;

    // Giảm giá
    let discount = 0;
    if (appliedCoupon) {
        const coupon = COUPONS[appliedCoupon];
        if (coupon.type === 'percent') {
            discount = (subtotal * coupon.discount) / 100;
        } else if (coupon.type === 'fixed') {
            discount = coupon.discount;
        } else if (coupon.type === 'shipping') {
            shipping = 0;
            discount = SHIPPING_FEE;
        }
    }

    // Tổng cộng
    const total = Math.max(0, subtotal + shipping - discount);

    // Hiển thị
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('discount').textContent = discount > 0 ? '-' + formatPrice(discount) : formatPrice(0);
    document.getElementById('total').textContent = formatPrice(total);
}

// ===== 10. ÁP DỤNG MÃ GIẢM GIÁ =====
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponCode = couponInput.value.trim().toUpperCase();
    const couponMessage = document.getElementById('couponMessage');

    if (!couponCode) {
        showCouponMessage('Vui lòng nhập mã giảm giá', 'error');
        return;
    }

    if (COUPONS[couponCode]) {
        appliedCoupon = couponCode;
        const coupon = COUPONS[couponCode];
        showCouponMessage(`✓ Đã áp dụng mã: ${coupon.description}`, 'success');
        couponInput.value = '';
        updateSummary();
        showToast('Áp dụng mã giảm giá thành công!', 'success');
    } else {
        showCouponMessage('Mã giảm giá không hợp lệ', 'error');
        showToast('Mã giảm giá không hợp lệ', 'error');
    }
}

// ===== 11. HIỂN THỊ THÔNG BÁO MÃ GIẢM GIÁ =====
function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    couponMessage.textContent = message;
    couponMessage.className = `coupon-message ${type}`;
}

// ===== 12. THANH TOÁN =====
function checkout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống', 'error');
        return;
    }

    showConfirmModal(
        'Xác nhận thanh toán',
        `Tổng tiền: ${document.getElementById('total').textContent}. Bạn có chắc muốn thanh toán?`,
        () => {
            // Simulate checkout
            showToast('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.', 'success');
            
            // Clear cart sau 2 giây
            setTimeout(() => {
                cart = [];
                appliedCoupon = null;
                saveCart();
                displayCart();
            }, 2000);
        }
    );
}

// ===== 13. FORMAT GIÁ TIỀN =====
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// ===== 14. CẬP NHẬT BADGE GIỎ HÀNG =====
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
}

// ===== 15. HIỂN THỊ TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== 16. HIỂN THỊ CONFIRM MODAL =====
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modal.classList.add('show');

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Add new listeners
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        modal.classList.remove('show');
    });

    newCancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ===== 17. SETUP SỰ KIỆN =====
function setupEvents() {
    // Nút xóa tất cả
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Nút áp dụng mã giảm giá
    document.getElementById('applyCouponBtn').addEventListener('click', applyCoupon);

    // Enter key cho coupon input
    document.getElementById('couponInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });

    // Nút thanh toán
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
}

// ===== 18. KHỞI TẠO KHI TRANG LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupEvents();
});

// ===============================================
// HƯỚNG DẪN SỬ DỤNG:
// ===============================================
// Mã giảm giá có sẵn:
// - WELCOME10: Giảm 10%
// - SAVE20K: Giảm 20.000đ
// - FREESHIP: Miễn phí vận chuyển
// - VIP50: Giảm 50%
//
// Phí vận chuyển: 30.000đ
//
// Để thêm mã giảm giá mới, chỉnh sửa object COUPONS
// ===============================================