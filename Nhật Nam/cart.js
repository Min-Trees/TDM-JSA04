// cart.js - Quản lý giỏ hàng với localStorage

// Lấy giỏ hàng từ localStorage
function getCartFromStorage() {
    try {
        const cartData = localStorage.getItem('mshop_cart');
        const cart = cartData ? JSON.parse(cartData) : [];
        console.log('Cart loaded from localStorage:', cart);
        return cart;
    } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        return [];
    }
}

// Lưu giỏ hàng vào localStorage
function saveCartToStorage(cart) {
    try {
        localStorage.setItem('mshop_cart', JSON.stringify(cart));
        console.log('Cart saved to localStorage:', cart);
        return true;
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        return false;
    }
}

// Load và hiển thị giỏ hàng
function loadCart() {
    console.log('=== Loading Cart ===');
    
    const cart = getCartFromStorage();
    console.log('Cart length:', cart.length);
    
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const cartItemsContainer = document.getElementById('cart-items');

    if (cart.length === 0) {
        console.log('Cart is empty - showing empty message');
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
    } else {
        console.log('Cart has', cart.length, 'items - displaying cart');
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';

            cart.forEach((item, index) => {
                console.log(`Creating cart item ${index}:`, item);
                const cartItem = createCartItem(item, index);
                cartItemsContainer.appendChild(cartItem);
            });
        }

        updateCartSummary();
    }

    updateCartBadge();
}

// Tạo phần tử giỏ hàng
function createCartItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.dataset.index = index;

    // Đảm bảo item.selected có giá trị
    if (item.selected === undefined) {
        item.selected = true;
    }

    const itemTotal = item.price * item.quantity;

    itemDiv.innerHTML = `
        <div class="cart-item-checkbox">
            <input type="checkbox" class="item-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
        </div>
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
            <h3 class="cart-item-name">${item.name}</h3>
        </div>
        <div class="cart-item-price">
            <span class="price">${item.price.toLocaleString('vi-VN')}₫</span>
        </div>
        <div class="cart-item-quantity">
            <button class="quantity-btn decrease" data-index="${index}">-</button>
            <input type="number" class="quantity-value" value="${item.quantity}" min="1" data-index="${index}" readonly>
            <button class="quantity-btn increase" data-index="${index}">+</button>
        </div>
        <div class="cart-item-total">
            <span class="item-total-price">${itemTotal.toLocaleString('vi-VN')}₫</span>
        </div>
        <div class="cart-item-action">
            <button class="btn-delete" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Xóa
            </button>
        </div>
    `;

    return itemDiv;
}

// Cập nhật tổng giỏ hàng
function updateCartSummary() {
    const cart = getCartFromStorage();
    
    // Đếm tổng số sản phẩm
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Lọc sản phẩm được chọn
    const selectedItems = cart.filter(item => item.selected);
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Tính tổng tiền các sản phẩm được chọn
    const totalPrice = selectedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    console.log('Summary - Total:', totalItems, 'Selected:', selectedCount, 'Price:', totalPrice);

    // Cập nhật hiển thị
    const totalItemsEl = document.getElementById('total-items');
    const selectedItemsEl = document.getElementById('selected-items');
    const totalPriceEl = document.getElementById('total-price');

    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (selectedItemsEl) selectedItemsEl.textContent = selectedCount;
    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toLocaleString('vi-VN') + '₫';

    // Cập nhật checkbox "Chọn tất cả"
    const allCheckboxes = document.querySelectorAll('.item-checkbox');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const summarySelectAllCheckbox = document.getElementById('summary-select-all');
    
    if (allCheckboxes.length > 0) {
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
        if (summarySelectAllCheckbox) summarySelectAllCheckbox.checked = allChecked;
    }
}

// Cập nhật số lượng sản phẩm
function updateQuantity(index, change) {
    const cart = getCartFromStorage();
    
    if (!cart[index]) {
        console.error('Invalid index:', index);
        return;
    }
    
    cart[index].quantity += change;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    console.log('Quantity updated:', cart[index]);
    saveCartToStorage(cart);
    loadCart();
}

// Xóa sản phẩm
function deleteItem(index) {
    const cart = getCartFromStorage();
    
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        console.log('Deleting item at index:', index);
        cart.splice(index, 1);
        console.log('Cart after delete:', cart);
        saveCartToStorage(cart);
        loadCart();
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng!');
    }
}

// Xóa các sản phẩm được chọn
function deleteSelectedItems() {
    const cart = getCartFromStorage();
    const selectedItems = cart.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        alert('Vui lòng chọn sản phẩm để xóa!');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
        console.log('Deleting selected items');
        const newCart = cart.filter(item => !item.selected);
        console.log('Cart after delete selected:', newCart);
        saveCartToStorage(newCart);
        loadCart();
        showNotification('Đã xóa các sản phẩm đã chọn!');
    }
}

// Chọn/bỏ chọn sản phẩm
function toggleItemSelection(index, checked) {
    const cart = getCartFromStorage();
    
    if (!cart[index]) return;
    
    cart[index].selected = checked;
    console.log('Item selection toggled:', cart[index]);
    saveCartToStorage(cart);
    updateCartSummary();
}

// Chọn/bỏ chọn tất cả
function toggleSelectAll(checked) {
    const cart = getCartFromStorage();
    
    cart.forEach(item => {
        item.selected = checked;
    });
    
    console.log('Select all:', checked);
    saveCartToStorage(cart);
    loadCart();
}

// Thanh toán
function checkout() {
    const cart = getCartFromStorage();
    const selectedItems = cart.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        alert('Vui lòng chọn sản phẩm để thanh toán!');
        return;
    }
    
    const totalPrice = selectedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const itemsList = selectedItems.map(item => 
        `- ${item.name} x${item.quantity}: ${(item.price * item.quantity).toLocaleString('vi-VN')}₫`
    ).join('\n');
    
    const message = `Thanh toán ${selectedItems.length} sản phẩm:\n\n${itemsList}\n\nTổng cộng: ${totalPrice.toLocaleString('vi-VN')}₫\n\nXác nhận thanh toán?`;
    
    if (confirm(message)) {
        console.log('Checkout confirmed');
        // Xóa các sản phẩm đã thanh toán
        const remainingCart = cart.filter(item => !item.selected);
        console.log('Cart after checkout:', remainingCart);
        saveCartToStorage(remainingCart);
        loadCart();
        showNotification('✓ Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
    }
}

// Cập nhật badge giỏ hàng
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    
    if (!badge) return;
    
    const cart = getCartFromStorage();
    
    if (cart.length === 0) {
        badge.textContent = '0';
        badge.style.display = 'none';
        return;
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
    
    console.log('Badge updated - Total:', totalItems);
}

// Hiển thị thông báo
function showNotification(message) {
    const oldNotification = document.querySelector('.cart-notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Khởi tạo sự kiện
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Cart Page Loaded ===');
    console.log('localStorage cart:', getCartFromStorage());
    
    // Load giỏ hàng
    loadCart();

    // Sự kiện chọn tất cả (header)
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            toggleSelectAll(e.target.checked);
        });
    }

    // Sự kiện chọn tất cả (footer)
    const summarySelectAllCheckbox = document.getElementById('summary-select-all');
    if (summarySelectAllCheckbox) {
        summarySelectAllCheckbox.addEventListener('change', (e) => {
            toggleSelectAll(e.target.checked);
        });
    }

    // Sự kiện xóa các mục đã chọn
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedItems);
    }

    // Sự kiện thanh toán
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    // Sự kiện cho các nút trong giỏ hàng
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const index = parseInt(target.dataset.index);
            console.log('Button clicked, index:', index);

            if (target.classList.contains('decrease')) {
                updateQuantity(index, -1);
            } else if (target.classList.contains('increase')) {
                updateQuantity(index, 1);
            } else if (target.classList.contains('btn-delete')) {
                deleteItem(index);
            }
        });

        // Sự kiện checkbox từng sản phẩm
        cartItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                const index = parseInt(e.target.dataset.index);
                console.log('Checkbox changed, index:', index, 'checked:', e.target.checked);
                toggleItemSelection(index, e.target.checked);
            }
        });
    }
});