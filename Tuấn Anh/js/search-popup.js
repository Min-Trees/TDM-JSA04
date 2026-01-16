// ===============================================
// SEARCH POPUP - Tìm kiếm toàn bộ sản phẩm
// ✅ ĐÃ SỬA: Ưu tiên localStorage
// ===============================================

// ===== 1. TẠO POPUP HTML =====
function createSearchPopup() {
    if (document.getElementById('search-popup')) return;
    
    const popupHTML = `
        <div class="search-popup" id="search-popup">
            <div class="search-popup-overlay" id="search-popup-overlay"></div>
            <div class="search-popup-content">
                <div class="search-popup-header">
                    <h2>🔍 Tìm kiếm sản phẩm</h2>
                    <button class="search-popup-close" id="search-popup-close">✕</button>
                </div>
                
                <div class="search-popup-input-wrapper">
                    <span class="search-popup-icon">🔍</span>
                    <input 
                        type="text" 
                        class="search-popup-input" 
                        id="search-popup-input"
                        placeholder="Nhập tên sản phẩm bạn muốn tìm..."
                        autocomplete="off"
                        autofocus
                    >
                    <button class="search-popup-clear" id="search-popup-clear-btn" style="display: none;">
                        <span>✕</span>
                    </button>
                </div>
                
                <div class="search-popup-results" id="search-popup-results">
                    <div class="search-popup-placeholder">
                        <div class="search-popup-placeholder-icon">🬰🥤</div>
                        <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    initSearchPopupEvents();
}

// ===== 2. KHỞI TẠO SỰ KIỆN =====
function initSearchPopupEvents() {
    const popup = document.getElementById('search-popup');
    const overlay = document.getElementById('search-popup-overlay');
    const closeBtn = document.getElementById('search-popup-close');
    const input = document.getElementById('search-popup-input');
    const clearBtn = document.getElementById('search-popup-clear-btn');
    const resultsContainer = document.getElementById('search-popup-results');
    
    overlay.addEventListener('click', closeSearchPopup);
    closeBtn.addEventListener('click', closeSearchPopup);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closeSearchPopup();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        clearBtn.style.display = 'none';
        resultsContainer.innerHTML = `
            <div class="search-popup-placeholder">
                <div class="search-popup-placeholder-icon">🬰🥤</div>
                <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
            </div>
        `;
    });
    
    input.addEventListener('input', (e) => {
        const keyword = e.target.value;
        
        if (keyword.trim() !== '') {
            clearBtn.style.display = 'flex';
            searchAllProducts(keyword, resultsContainer);
        } else {
            clearBtn.style.display = 'none';
            resultsContainer.innerHTML = `
                <div class="search-popup-placeholder">
                    <div class="search-popup-placeholder-icon">🬰🥤</div>
                    <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
                </div>
            `;
        }
    });
}

// ===== 3. MỞ POPUP =====
function openSearchPopup() {
    createSearchPopup();
    const popup = document.getElementById('search-popup');
    const input = document.getElementById('search-popup-input');
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        input.focus();
    }, 300);
}

// ===== 4. ĐÓNG POPUP =====
function closeSearchPopup() {
    const popup = document.getElementById('search-popup');
    const input = document.getElementById('search-popup-input');
    
    popup.classList.remove('active');
    document.body.style.overflow = '';
    
    input.value = '';
    document.getElementById('search-popup-clear-btn').style.display = 'none';
}

// ===== 5. ✅ TÌM KIẾM TẤT CẢ SẢN PHẨM (ĐÃ SỬA) =====
async function searchAllProducts(keyword, resultsContainer) {
    const normalizedKeyword = normalizeVietnamese(keyword.trim().toLowerCase());
    
    resultsContainer.innerHTML = `
        <div class="search-popup-loading">
            <div class="search-popup-loader"></div>
            <p>Đang tìm kiếm...</p>
        </div>
    `;
    
    try {
        // ✅ ƯU TIÊN ĐỌC TỪ LOCALSTORAGE
        let candyProducts = [];
        let snackProducts = [];
        let drinkProducts = [];

        // Đọc từ localStorage trước
        const candyStorage = localStorage.getItem('products_candy');
        const snackStorage = localStorage.getItem('products_snack');
        const drinkStorage = localStorage.getItem('products_drink');

        if (candyStorage) {
            candyProducts = JSON.parse(candyStorage).map(p => ({...p, category: 'candy', categoryName: 'Kẹo'}));
        } else {
            const candyRes = await fetch('data/candy.json');
            const candyData = await candyRes.json();
            candyProducts = (candyData.Candy || []).map(p => ({...p, category: 'candy', categoryName: 'Kẹo'}));
        }

        if (snackStorage) {
            snackProducts = JSON.parse(snackStorage).map(p => ({...p, category: 'snack', categoryName: 'Bánh'}));
        } else {
            const snackRes = await fetch('data/snack.json');
            const snackData = await snackRes.json();
            snackProducts = (snackData.Snack || []).map(p => ({...p, category: 'snack', categoryName: 'Bánh'}));
        }

        if (drinkStorage) {
            drinkProducts = JSON.parse(drinkStorage).map(p => ({...p, category: 'drink', categoryName: 'Nước ngọt'}));
        } else {
            const drinkRes = await fetch('data/drink.json');
            const drinkData = await drinkRes.json();
            drinkProducts = (drinkData.Soft_drink || []).map(p => ({...p, category: 'drink', categoryName: 'Nước ngọt'}));
        }
        
        // Gộp tất cả sản phẩm
        const allProducts = [...candyProducts, ...snackProducts, ...drinkProducts];
        
        // Lọc sản phẩm
        const filteredProducts = allProducts.filter(product => {
            const normalizedName = normalizeVietnamese(product.name.toLowerCase());
            return normalizedName.includes(normalizedKeyword);
        });
        
        displaySearchResults(filteredProducts, keyword, resultsContainer);
        
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        resultsContainer.innerHTML = `
            <div class="search-popup-error">
                <div class="search-popup-error-icon">⚠️</div>
                <p>Có lỗi xảy ra khi tìm kiếm</p>
            </div>
        `;
    }
}

// ===== 6. HIỂN THỊ KẾT QUẢ =====
function displaySearchResults(products, keyword, container) {
    if (products.length === 0) {
        container.innerHTML = `
            <div class="search-popup-no-results">
                <div class="search-popup-no-results-icon">😔</div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Không có sản phẩm nào phù hợp với "<strong>${keyword}</strong>"</p>
            </div>
        `;
        return;
    }
    
    let resultsHTML = `
        <div class="search-popup-results-header">
            Tìm thấy <strong>${products.length}</strong> sản phẩm
        </div>
        <div class="search-popup-results-grid">
    `;
    
    products.forEach(product => {
        resultsHTML += `
            <div class="search-popup-result-item" onclick="goToProduct(${product.id}, '${product.category}')">
                <div class="search-popup-result-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <span class="search-popup-result-category">${product.categoryName}</span>
                </div>
                <div class="search-popup-result-info">
                    <h4>${product.name}</h4>
                    <p class="search-popup-result-price">${product.price.toLocaleString('vi-VN')}đ</p>
                    <p class="search-popup-result-desc">${product.description}</p>
                </div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    container.innerHTML = resultsHTML;
}

// ===== 7. CHUYỂN ĐẾN TRANG SẢN PHẨM =====
function goToProduct(id, category) {
    closeSearchPopup();
    setTimeout(() => {
        window.location.href = `product.html?id=${id}&category=${category}`;
    }, 200);
}

// ===== 8. HÀM CHUẨN HÓA TIẾNG VIỆT =====
function normalizeVietnamese(str) {
    if (!str) return '';
    str = str.toLowerCase();
    const accentsMap = {
        'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
        'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
        'ì|í|ị|ỉ|ĩ': 'i',
        'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
        'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
        'ỳ|ý|ỵ|ỷ|ỹ': 'y',
        'đ': 'd'
    };
    for (let pattern in accentsMap) {
        str = str.replace(new RegExp(pattern, 'g'), accentsMap[pattern]);
    }
    return str;
}

// ===== 9. KHỞI TẠO KHI LOAD TRANG =====
document.addEventListener('DOMContentLoaded', () => {
    const searchIcons = document.querySelectorAll('.header-right .icon[alt="Tìm kiếm"]');
    
    searchIcons.forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            openSearchPopup();
        });
    });
});

// ===============================================
// ✅ ĐÃ SỬA: Ưu tiên đọc từ localStorage
// ===============================================