// productdetail.js - Sử dụng localStorage để lưu giỏ hàng

// Lấy thông tin sản phẩm từ URL
function getProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category'),
        subcategory: params.get('subcategory'),
        id: parseInt(params.get('id'))
    };
}

// Lấy giỏ hàng từ localStorage
function getCartFromStorage() {
    try {
        const cartData = localStorage.getItem('mshop_cart');
        return cartData ? JSON.parse(cartData) : [];
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

// Load thông tin sản phẩm
async function loadProductDetail() {
    const { category, subcategory, id } = getProductFromURL();

    if (!category || !subcategory || !id) {
        showError("Không tìm thấy thông tin sản phẩm!");
        return;
    }

    try {
        let jsonFile;
        if (category === 'beyblade') {
            jsonFile = './beyblade.json';
        } else if (category === 'kamenrider') {
            jsonFile = './kamenrider.json';
        } else if (category === 'ninjago') {
            jsonFile = './ninjago.json';
        } else {
            throw new Error("Danh mục không hợp lệ!");
        }

        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu sản phẩm!");
        }

        const data = await response.json();
        const products = data[subcategory];
        
        if (!products) {
            throw new Error("Không tìm thấy danh mục sản phẩm!");
        }

        const product = products.find(p => p.id === id);
        if (!product) {
            throw new Error("Không tìm thấy sản phẩm!");
        }

        displayProductDetail(product, category);

    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
        showError(error.message);
    }
}

// Hiển thị chi tiết sản phẩm
function displayProductDetail(product, category) {
    document.getElementById('breadcrumb-category').textContent = getCategoryName(category);
    document.getElementById('breadcrumb-product').textContent = product.name;
    document.title = `${product.name} - MShop`;

    document.getElementById('product-title').textContent = product.name;
    
    // Chuyển đổi giá từ string sang number
    let priceNumber = product.price;
    if (typeof priceNumber === 'string') {
        priceNumber = parseInt(priceNumber.replace(/\./g, ''));
    }
    
    document.getElementById('product-price').textContent = `${priceNumber.toLocaleString('vi-VN')}₫`;
    document.getElementById('product-description').textContent = product.description;

    const mainImage = document.getElementById('main-product-image');
    mainImage.src = product.sizeImage;
    mainImage.alt = product.name;

    const thumbnailContainer = document.getElementById('thumbnail-container');
    thumbnailContainer.innerHTML = '';

    product.images.forEach((imageSrc, index) => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
        
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = imageSrc;
        thumbnailImg.alt = `${product.name} - Ảnh ${index + 1}`;
        
        thumbnailDiv.appendChild(thumbnailImg);
        
        thumbnailDiv.addEventListener('click', () => {
            mainImage.src = imageSrc;
            document.querySelectorAll('.thumbnail-item').forEach(item => {
                item.classList.remove('active');
            });
            thumbnailDiv.classList.add('active');
        });
        
        thumbnailContainer.appendChild(thumbnailDiv);
    });

    // Lưu sản phẩm vào biến toàn cục
    window.currentProduct = {
        id: product.id,
        name: product.name,
        price: priceNumber,
        image: product.sizeImage,
        description: product.description
    };
    
    console.log('Product displayed:', window.currentProduct);
    
    // Cập nhật badge
    updateCartBadge();
}

// Lấy tên danh mục
function getCategoryName(category) {
    const categoryNames = {
        'beyblade': 'Beyblade',
        'kamenrider': 'Kamen Rider',
        'ninjago': 'Ninjago'
    };
    return categoryNames[category] || 'Sản phẩm';
}

// Hiển thị thông báo lỗi
function showError(message) {
    const container = document.querySelector('.product-detail-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <h2 style="color: #dc2626; font-size: 28px; margin-bottom: 15px;">Lỗi!</h2>
            <p style="font-size: 18px; color: #666; margin-bottom: 25px;">${message}</p>
            <a href="main.html" style="display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Quay về trang chủ
            </a>
        </div>
    `;
}

// Xử lý nút tăng/giảm số lượng
function setupQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    const quantityInput = document.getElementById('quantity-input');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value) || 1;
            quantityInput.value = value + 1;
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value) || 1;
            if (value < 1) {
                quantityInput.value = 1;
            }
        });
    }
}

// Xử lý nút "Thêm vào giỏ hàng"
function setupAddToCart() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart();
        });
    }
}

// Hàm thêm vào giỏ hàng
function addToCart() {
    const quantity = parseInt(document.getElementById('quantity-input').value) || 1;
    const product = window.currentProduct;

    if (!product) {
        alert('Lỗi: Không tìm thấy thông tin sản phẩm!');
        return;
    }

    console.log('Adding to cart:', product, 'Quantity:', quantity);

    // Lấy giỏ hàng từ localStorage
    let cart = getCartFromStorage();
    console.log('Current cart from storage:', cart);

    // Tìm sản phẩm đã tồn tại trong giỏ
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Sản phẩm đã có - tăng số lượng
        cart[existingItemIndex].quantity += quantity;
        console.log('Updated existing item:', cart[existingItemIndex]);
    } else {
        // Sản phẩm chưa có - thêm mới
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            selected: true
        };
        cart.push(newItem);
        console.log('Added new item:', newItem);
    }

    // Lưu vào localStorage
    if (saveCartToStorage(cart)) {
        console.log('Cart saved successfully');
        showNotification('✓ Đã thêm sản phẩm vào giỏ hàng!');
        updateCartBadge();
    } else {
        alert('Lỗi khi lưu giỏ hàng!');
    }
}

// Xử lý nút "Mua ngay"
function setupBuyNow() {
    const buyNowBtn = document.getElementById('buy-now-btn');
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            addToCart();
            
            // Chuyển đến trang giỏ hàng
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 500);
        });
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
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
    
    console.log('Badge updated - Total items:', totalItems);
}

// Hiển thị thông báo
function showNotification(message) {
    const oldNotification = document.querySelector('.custom-notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-weight: 600;
        font-size: 15px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
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
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Khởi động khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Product Detail Page Loaded ===');
    console.log('Cart from localStorage:', getCartFromStorage());
    
    // Load sản phẩm
    loadProductDetail();
    
    // Setup các controls
    setupQuantityControls();
    setupAddToCart();
    setupBuyNow();
    
    // Cập nhật badge ban đầu
    updateCartBadge();
});