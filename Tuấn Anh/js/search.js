// ===============================================
// SEARCH FUNCTIONALITY - Tìm kiếm sản phẩm realtime
// ===============================================

// ===== 1. HÀM CHUẨN HÓA CHỮ VIỆT =====
function normalizeVietnamese(str) {
    if (!str) return '';
    
    // Chuyển thành chữ thường
    str = str.toLowerCase();
    
    // Bảng chuyển đổi dấu tiếng Việt
    const accentsMap = {
        'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
        'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
        'ì|í|ị|ỉ|ĩ': 'i',
        'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
        'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
        'ỳ|ý|ỵ|ỷ|ỹ': 'y',
        'đ': 'd',
        'À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ': 'a',
        'È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ': 'e',
        'Ì|Í|Ị|Ỉ|Ĩ': 'i',
        'Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ': 'o',
        'Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ': 'u',
        'Ỳ|Ý|Ỵ|Ỷ|Ỹ': 'y',
        'Đ': 'd'
    };
    
    // Áp dụng chuyển đổi
    for (let pattern in accentsMap) {
        str = str.replace(new RegExp(pattern, 'g'), accentsMap[pattern]);
    }
    
    return str;
}

// ===== 2. HÀM TÌM KIẾM SẢN PHẨM =====
function searchProducts(products, keyword, containerId) {
    const container = document.getElementById(containerId);
    
    if (!keyword || keyword.trim() === '') {
        // Nếu không có từ khóa, hiển thị tất cả sản phẩm
        displayProducts(products, containerId);
        hideNoResults(containerId);
        return;
    }
    
    // Chuẩn hóa từ khóa tìm kiếm
    const normalizedKeyword = normalizeVietnamese(keyword.trim());
    
    // Lọc sản phẩm theo từ khóa (CHỈ TÌM THEO TÊN)
    const filteredProducts = products.filter(product => {
        const normalizedName = normalizeVietnamese(product.name);
        return normalizedName.includes(normalizedKeyword);
    });
    
    // Hiển thị kết quả
    if (filteredProducts.length > 0) {
        displayProducts(filteredProducts, containerId);
        hideNoResults(containerId);
    } else {
        container.innerHTML = '';
        showNoResults(containerId, keyword);
    }
}

// ===== 3. HIỂN THỊ THÔNG BÁO KHÔNG CÓ KẾT QUẢ =====
function showNoResults(containerId, keyword) {
    const container = document.getElementById(containerId);
    
    const noResultDiv = document.createElement('div');
    noResultDiv.className = 'no-results';
    noResultDiv.id = `no-results-${containerId}`;
    noResultDiv.innerHTML = `
        <div class="no-results-content">
            <div class="no-results-icon">🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "<strong>${keyword}</strong>"</p>
            <p class="no-results-suggestion">Gợi ý: Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm</p>
        </div>
    `;
    
    container.parentElement.appendChild(noResultDiv);
}

// ===== 4. ẨN THÔNG BÁO KHÔNG CÓ KẾT QUẢ =====
function hideNoResults(containerId) {
    const noResultDiv = document.getElementById(`no-results-${containerId}`);
    if (noResultDiv) {
        noResultDiv.remove();
    }
}

// ===== 5. KHỞI TẠO TÌM KIẾM CHO TỪNG TRANG =====
function initSearch(category) {
    // Xác định container ID và JSON file dựa trên category
    const config = {
        candy: {
            containerId: 'candy-grid',
            jsonFile: 'data/candy.json',
            jsonKey: 'Candy'
        },
        snack: {
            containerId: 'snack-grid',
            jsonFile: 'data/snack.json',
            jsonKey: 'Snack'
        },
        drink: {
            containerId: 'drink-grid',
            jsonFile: 'data/drink.json',
            jsonKey: 'Soft_drink'
        }
    };
    
    const categoryConfig = config[category];
    if (!categoryConfig) return;
    
    // Tạo search box
    createSearchBox(category);
    
    // Load dữ liệu và setup event listener
    fetch(categoryConfig.jsonFile)
        .then(response => response.json())
        .then(data => {
            const products = data[categoryConfig.jsonKey] || [];
            
            // Lấy search input
            const searchInput = document.getElementById(`search-input-${category}`);
            const clearBtn = document.getElementById(`search-clear-${category}`);
            
            if (searchInput) {
                // Event listener cho realtime search
                searchInput.addEventListener('input', (e) => {
                    const keyword = e.target.value;
                    searchProducts(products, keyword, categoryConfig.containerId);
                    
                    // Hiển thị/ẩn nút xóa
                    if (keyword.trim() !== '') {
                        clearBtn.style.display = 'flex';
                    } else {
                        clearBtn.style.display = 'none';
                    }
                });
                
                // Event listener cho nút xóa
                clearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    searchInput.focus();
                    searchProducts(products, '', categoryConfig.containerId);
                    clearBtn.style.display = 'none';
                });
                
                // Event listener cho Enter key
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        searchProducts(products, searchInput.value, categoryConfig.containerId);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Lỗi khi load dữ liệu:', error);
        });
}

// ===== 6. TẠO SEARCH BOX HTML =====
function createSearchBox(category) {
    // Tìm section tương ứng
    const section = document.getElementById(category);
    if (!section) return;
    
    // Kiểm tra xem đã có search box chưa
    if (document.getElementById(`search-container-${category}`)) return;
    
    // Tạo search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.id = `search-container-${category}`;
    searchContainer.innerHTML = `
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
                type="text" 
                class="search-input" 
                id="search-input-${category}"
                placeholder="Tìm kiếm sản phẩm..."
                autocomplete="off"
            >
            <button class="search-clear" id="search-clear-${category}" style="display: none;">
                <span>✕</span>
            </button>
        </div>
    `;
    
    // Chèn search box vào trước section title
    const sectionTitle = section.querySelector('.section-title');
    if (sectionTitle) {
        section.insertBefore(searchContainer, sectionTitle.nextSibling);
    }
}

// ===== 7. HÀM HỖ TRỢ - Copy từ các file JS gốc =====
// Hàm này phải tương thích với code hiện có
function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.classList.add("product-card");

    // Xác định category dựa trên containerId hiện tại
    let category = 'candy';
    const container = document.querySelector('.candy-grid, .snack-grid, .drink-grid');
    if (container) {
        if (container.id === 'snack-grid') category = 'snack';
        else if (container.id === 'drink-grid') category = 'drink';
    }

    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}&category=${category}`;
    });

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("product-images");

    product.images.forEach((imageSrc, index) => {
        const img = document.createElement("img");
        img.src = imageSrc;
        img.alt = `${product.name} - Ảnh ${index + 1}`;
        img.classList.add("product-image");
        
        if (index === 0) {
            img.classList.add("active");
        }
        
        imageContainer.appendChild(img);
    });

    const indicators = document.createElement("div");
    indicators.classList.add("image-indicators");
    
    product.images.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("image-dot");
        if (index === 0) {
            dot.classList.add("active");
        }
        indicators.appendChild(dot);
    });
    
    imageContainer.appendChild(indicators);

    let currentIndex = 0;
    let autoSlideInterval = null;

    card.addEventListener("mouseenter", () => {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % product.images.length;
            updateActiveImage(imageContainer, indicators, currentIndex);
        }, 1000);
    });

    card.addEventListener("mouseleave", () => {
        clearInterval(autoSlideInterval);
        currentIndex = 0;
        updateActiveImage(imageContainer, indicators, 0);
    });

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.classList.add("price");
    price.textContent = product.price.toLocaleString("vi-VN") + "đ";

    const desc = document.createElement("p");
    desc.classList.add("description");
    desc.textContent = product.description;

    card.appendChild(imageContainer);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(desc);

    return card;
}

function updateActiveImage(container, indicators, activeIndex) {
    const images = container.querySelectorAll(".product-image");
    images.forEach((img, index) => {
        img.classList.toggle("active", index === activeIndex);
    });

    const dots = indicators.querySelectorAll(".image-dot");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
    });
}

// ===============================================
// HƯỚNG DẪN SỬ DỤNG:
// ===============================================
// 1. Thêm file search.js vào các trang HTML:
//    <script src="js/search.js"></script>
//
// 2. Trong Candy.js, thêm ở cuối file:
//    initSearch('candy');
//
// 3. Trong Snack.js, thêm ở cuối file:
//    initSearch('snack');
//
// 4. Trong Drink.js, thêm ở cuối file:
//    initSearch('drink');
//
// 5. Thêm CSS cho search box (xem file search.css)
// ===============================================