// ========================================
// PRODUCTS-LOADER.JS - Load Products from Admin
// ========================================

// Function to load products from localStorage
function loadProductsFromStorage(categoryKey, gridId) {
    console.log('Loading products for:', categoryKey, 'into grid:', gridId);
    
    // Get all products
    const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
    console.log('Total products in storage:', allProducts.length);
    
    // Map category keys to actual category values
    const categoryMap = {
        'geatsProducts': 'kamenrider-geats',
        'gotchardProducts': 'kamenrider-gotchard',
        'burstProducts': 'beyblade-burst',
        'xProducts': 'beyblade-x',
        'mosProducts': 'ninjago-mos',
        'drProducts': 'ninjago-dr'
    };
    
    // Filter products by category
    const actualCategory = categoryMap[categoryKey];
    const products = allProducts.filter(p => p.category === actualCategory);
    
    console.log('Filtered products for', actualCategory, ':', products.length);
    
    // Display products
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.error('Grid not found:', gridId);
        return;
    }
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px; grid-column: 1/-1;">Chưa có sản phẩm nào</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const price = typeof product.price === 'string' ? 
            parseInt(product.price.replace(/\./g, '')).toLocaleString('vi-VN') : 
            parseInt(product.price).toLocaleString('vi-VN');
        
        const imageUrl = product.image || product.sizeImage || 'https://via.placeholder.com/300x300/667eea/ffffff?text=No+Image';
            
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/300x300/667eea/ffffff?text=No+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${price} đ</p>
                    <button class="btn-add-cart" onclick="addToCartFromLoader('${product.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Thêm vào giỏ
                    </button>
                    <button class="btn-view-detail" onclick="viewProductDetailFromLoader('${product.id}')">
                        Xem chi tiết
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Products rendered successfully');
}

// Function to add product to cart
function addToCartFromLoader(productId) {
    const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || product.sizeImage,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadgeFromLoader();
    
    // Show notification
    showNotificationFromLoader('Đã thêm vào giỏ hàng!');
}

// Function to view product details
function viewProductDetailFromLoader(productId) {
    const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const product = allProducts.find(p => p.id === productId);
    
    if (product) {
        // Store product detail and redirect
        localStorage.setItem('currentProduct', JSON.stringify(product));
        window.location.href = 'detail.html';
    }
}

// Update cart badge
function updateCartBadgeFromLoader() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.style.display = 'flex';
        }
    }
}

// Show notification
function showNotificationFromLoader(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.custom-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInNotif 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutNotif 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animation styles
if (!document.getElementById('notification-styles-loader')) {
    const style = document.createElement('style');
    style.id = 'notification-styles-loader';
    style.textContent = `
        @keyframes slideInNotif {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutNotif {
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
}

// Listen for storage changes to update products in real-time
window.addEventListener('storage', function(e) {
    console.log('Storage changed:', e.key);
    if (e.key === 'allProducts') {
        console.log('Products updated, reloading...');
        // Reload the current page's products
        if (typeof reloadCurrentPageProducts === 'function') {
            reloadCurrentPageProducts();
        }
    }
});

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadgeFromLoader();
    console.log('Products loader initialized');
});