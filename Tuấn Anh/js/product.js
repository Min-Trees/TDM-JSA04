// ===============================================
// PRODUCT DETAIL PAGE - Hỗ trợ 3 loại sản phẩm
// ĐÃ SỬA: Ưu tiên đọc từ localStorage
// ===============================================

// ===== 1. BIẾN TOÀN CỤC =====
let currentProduct = null;
let allProducts = [];
let currentImageIndex = 0;
let currentCategory = null;

// ===== 2. CẤU HÌNH CÁC LOẠI SẢN PHẨM =====
const PRODUCT_CATEGORIES = {
    candy: {
        jsonFile: "data/candy.json",
        jsonKey: "Candy",
        displayName: "Kẹo",
        localStorageKey: "products_candy"
    },
    snack: {
        jsonFile: "data/snack.json",
        jsonKey: "Snack",
        displayName: "Bánh",
        localStorageKey: "products_snack"
    },
    drink: {
        jsonFile: "data/drink.json",
        jsonKey: "Soft_drink",
        displayName: "Nước ngọt",
        localStorageKey: "products_drink"
    }
};

// ===== 3. LẤY THÔNG TIN TỪ URL =====
function getParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: parseInt(urlParams.get('id')) || null,
        category: urlParams.get('category') || null
    };
}

// ===== 4. ✅ LOAD SẢN PHẨM TỪ LOCALSTORAGE TRƯỚC =====
async function loadProductsFromStorage(categoryKey) {
    const config = PRODUCT_CATEGORIES[categoryKey];
    if (!config) return null;

    // ✅ 1. ƯU TIÊN ĐỌC TỪ LOCALSTORAGE
    const savedProducts = localStorage.getItem(config.localStorageKey);
    if (savedProducts) {
        console.log(`✅ Đọc từ localStorage: ${config.localStorageKey}`);
        return JSON.parse(savedProducts);
    }

    // 2. Nếu không có, đọc từ JSON
    try {
        console.log(`📂 Đọc từ JSON: ${config.jsonFile}`);
        const response = await fetch(config.jsonFile);
        if (response.ok) {
            const data = await response.json();
            return data[config.jsonKey] || [];
        }
    } catch (error) {
        console.error(`Lỗi khi load ${categoryKey}:`, error);
    }

    return null;
}

// ===== 5. ✅ TỰ ĐỘNG PHÁT HIỆN SẢN PHẨM (CẢI TIẾN) =====
async function detectProductCategory(productId) {
    // Thử tìm trong từng category
    for (const [categoryKey, categoryConfig] of Object.entries(PRODUCT_CATEGORIES)) {
        // ✅ Đọc từ localStorage hoặc JSON
        const products = await loadProductsFromStorage(categoryKey);
        
        if (products) {
            const foundProduct = products.find(p => p.id === productId);
            if (foundProduct) {
                return {
                    category: categoryKey,
                    config: categoryConfig,
                    products: products,
                    product: foundProduct
                };
            }
        }
    }

    return null;
}

// ===== 6. ✅ LOAD DỮ LIỆU SẢN PHẨM (ĐÃ SỬA) =====
async function loadProductData() {
    try {
        showLoading();

        const params = getParamsFromURL();
        const productId = params.id;

        if (!productId) {
            showError();
            return;
        }

        let productData = null;

        // ✅ Nếu có category trong URL, load trực tiếp
        if (params.category && PRODUCT_CATEGORIES[params.category]) {
            const products = await loadProductsFromStorage(params.category);
            
            if (products) {
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    productData = {
                        category: params.category,
                        config: PRODUCT_CATEGORIES[params.category],
                        products: products,
                        product: product
                    };
                }
            }
        }

        // ✅ Nếu không tìm thấy, tự động phát hiện
        if (!productData) {
            productData = await detectProductCategory(productId);
        }

        if (!productData) {
            showError();
            return;
        }

        // Lưu thông tin
        currentProduct = productData.product;
        allProducts = productData.products;
        currentCategory = productData.category;

        // Hiển thị sản phẩm
        displayProduct(currentProduct, productData.config.displayName);

        // Hiển thị sản phẩm liên quan
        displayRelatedProducts(allProducts, productId, currentCategory);

        hideLoading();

        // Khởi tạo review system
        initReviewSystem();

    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
        showError();
    }
}

// ===== 7. HIỂN THỊ THÔNG TIN SẢN PHẨM =====
function displayProduct(product, categoryName) {
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
    if (breadcrumbLinks[1]) {
        breadcrumbLinks[1].textContent = categoryName;
    }
    document.getElementById('breadcrumbProduct').textContent = product.name;

    document.title = `${product.name} - Chi tiết sản phẩm`;

    document.getElementById('productName').textContent = product.name;

    document.getElementById('productPrice').textContent =
        product.price.toLocaleString('vi-VN') + 'đ';

    document.getElementById('productDescription').textContent = product.description;

    displayImages(product.images);

    document.getElementById('productDetail').style.display = 'grid';
}

// ===== 8. HIỂN THỊ HÌNH ẢNH VÀ SLIDER =====
function displayImages(images) {
    if (!images || images.length === 0) return;

    currentImageIndex = 0;

    const mainImage = document.getElementById('mainImage');
    mainImage.src = images[0];
    mainImage.alt = currentProduct.name;

    updateImageCounter(images.length);

    const thumbnailGallery = document.getElementById('thumbnailGallery');
    thumbnailGallery.innerHTML = '';

    images.forEach((imageSrc, index) => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `${currentProduct.name} - Ảnh ${index + 1}`;

        thumbnailDiv.appendChild(img);

        thumbnailDiv.addEventListener('click', () => {
            changeImage(index);
        });

        thumbnailGallery.appendChild(thumbnailDiv);
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

// ===== 9. THAY ĐỔI HÌNH ẢNH =====
function changeImage(index) {
    const images = currentProduct.images;

    if (index < 0 || index >= images.length) return;

    currentImageIndex = index;

    const mainImage = document.getElementById('mainImage');
    mainImage.style.opacity = '0';

    setTimeout(() => {
        mainImage.src = images[index];
        mainImage.style.opacity = '1';
    }, 150);

    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });

    updateImageCounter(images.length);
}

// ===== 10. CẬP NHẬT COUNTER ẢNH =====
function updateImageCounter(total) {
    const counter = document.getElementById('imageCounter');
    counter.textContent = `${currentImageIndex + 1} / ${total}`;
}

// ===== 11. ĐIỀU HƯỚNG HÌNH ẢNH (PREV/NEXT) =====
function setupImageNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.addEventListener('click', () => {
        const newIndex = currentImageIndex - 1;
        if (newIndex >= 0) {
            changeImage(newIndex);
        } else {
            changeImage(currentProduct.images.length - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        const newIndex = currentImageIndex + 1;
        if (newIndex < currentProduct.images.length) {
            changeImage(newIndex);
        } else {
            changeImage(0);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });
}

// ===== 12. XỬ LÝ SỐ LƯỢNG =====
function setupQuantityControls() {
    const qtyInput = document.getElementById('qtyInput');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');

    minusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty < 99) {
            qtyInput.value = currentQty + 1;
        }
    });

    qtyInput.addEventListener('input', () => {
        let value = parseInt(qtyInput.value);
        if (value < 1) qtyInput.value = 1;
        if (value > 99) qtyInput.value = 99;
    });
}

// ===== 13. THÊM VÀO GIỎ HÀNG =====
function addToCart() {
    const quantity = parseInt(document.getElementById('qtyInput').value);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItemIndex = cart.findIndex(item =>
        item.id === currentProduct.id && item.category === currentCategory
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            category: currentCategory,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.images[0],
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Đã thêm ${quantity} ${currentProduct.name} vào giỏ hàng!`);
    document.getElementById('qtyInput').value = 1;
}

// ===== 14. CẬP NHẬT BADGE GIỎ HÀNG =====
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }
}

// ===== 15. HIỂN THỊ TOAST NOTIFICATION =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== 16. MUA NGAY =====
function buyNow() {
    addToCart();
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// ===== 17. HIỂN THỊ SẢN PHẨM LIÊN QUAN =====
function displayRelatedProducts(products, currentId, category) {
    const relatedProducts = products.filter(p => p.id !== currentId);
    const shuffled = relatedProducts.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    if (selected.length === 0) {
        document.getElementById('relatedProducts').style.display = 'none';
        return;
    }

    const relatedGrid = document.getElementById('relatedGrid');
    relatedGrid.innerHTML = '';

    selected.forEach(product => {
        const card = createProductCard(product, category);
        relatedGrid.appendChild(card);
    });

    document.getElementById('relatedProducts').style.display = 'block';
}

// ===== 18. TẠO PRODUCT CARD =====
function createProductCard(product, category) {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.addEventListener('click', () => {
        window.location.href = `product.html?id=${product.id}&category=${category}`;
    });

    const img = document.createElement('img');
    img.src = product.images[0];
    img.alt = product.name;

    const name = document.createElement('h3');
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = product.price.toLocaleString('vi-VN') + 'đ';

    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = product.description;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(desc);

    return card;
}

// ===== 19. HIỂN THỊ/ẨN LOADING =====
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('productDetail').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'flex';
    document.getElementById('productDetail').style.display = 'none';
}

// ===== 20. SETUP SỰ KIỆN CHO BUTTONS =====
function setupActionButtons() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');

    addToCartBtn.addEventListener('click', addToCart);
    buyNowBtn.addEventListener('click', buyNow);
}

// ===== 21. KHỞI TẠO KHI TRANG LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
    setupImageNavigation();
    setupQuantityControls();
    setupActionButtons();
    updateCartBadge();
});

// ===============================================
// ✅ ĐÃ SỬA:
// - Ưu tiên đọc từ localStorage trước
// - Tự động fallback về JSON nếu không có localStorage
// - Đồng bộ hoàn toàn với admin panel
// ===============================================