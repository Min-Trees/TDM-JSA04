// filter.js - Hệ thống lọc và sắp xếp sản phẩm

// Hàm chuyển đổi giá từ string sang number
function parsePrice(priceString) {
    return parseInt(priceString.replace(/\./g, ''));
}

// Hàm sắp xếp sản phẩm
function sortProducts(products, sortType) {
    const sortedProducts = [...products]; // Clone array để không ảnh hưởng array gốc
    
    switch(sortType) {
        case 'price-asc': // Giá từ thấp đến cao
            sortedProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            break;
            
        case 'price-desc': // Giá từ cao đến thấp
            sortedProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            break;
            
        case 'name-asc': // Tên A-Z
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            break;
            
        case 'name-desc': // Tên Z-A
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
            break;
            
        default: // Mặc định
            return sortedProducts;
    }
    
    return sortedProducts;
}

// Hàm tạo dropdown lọc
function createFilterDropdown() {
    const filterHTML = `
        <div class="filter-container">
            <label for="sort-select" class="filter-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Sắp xếp theo:
            </label>
            <select id="sort-select" class="filter-select">
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="name-asc">Tên: A-Z</option>
                <option value="name-desc">Tên: Z-A</option>
            </select>
        </div>
    `;
    
    return filterHTML;
}

// Hàm thêm filter vào trang
function addFilterToPage() {
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroSection) {
        console.error('Không tìm thấy hero section');
        return;
    }
    
    // Kiểm tra xem đã có filter chưa
    if (document.querySelector('.filter-wrapper')) {
        return;
    }
    
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'filter-wrapper';
    filterWrapper.innerHTML = createFilterDropdown();
    
    // Thêm sau hero section
    heroSection.after(filterWrapper);
    
    // Thêm event listener cho dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

// Hàm xử lý khi thay đổi lọc
function handleSortChange(event) {
    const sortType = event.target.value;
    const currentPage = window.location.pathname;
    
    // Lấy tất cả section sản phẩm
    let sections = [];
    
    if (currentPage.includes('beyblade')) {
        sections = [
            { id: 'burst', gridId: 'burst-grid', subcategory: 'burst' },
            { id: 'x', gridId: 'x-grid', subcategory: 'x' }
        ];
    } else if (currentPage.includes('kamenrider')) {
        sections = [
            { id: 'gotchard', gridId: 'gotchard-grid', subcategory: 'gotchard' },
            { id: 'geats', gridId: 'geats-grid', subcategory: 'geats' }
        ];
    } else if (currentPage.includes('ninjago')) {
        sections = [
            { id: 'mos', gridId: 'mos-grid', subcategory: 'mos' },
            { id: 'dr', gridId: 'dr-grid', subcategory: 'dr' }
        ];
    }
    
    // Load và sắp xếp lại sản phẩm cho mỗi section
    sections.forEach(section => {
        loadAndSortSection(section, sortType, currentPage);
    });
}

// Hàm load và sắp xếp sản phẩm cho một section
async function loadAndSortSection(section, sortType, currentPage) {
    try {
        let jsonFile;
        let category;
        
        if (currentPage.includes('beyblade')) {
            jsonFile = './beyblade.json';
            category = 'beyblade';
        } else if (currentPage.includes('kamenrider')) {
            jsonFile = './kamenrider.json';
            category = 'kamenrider';
        } else if (currentPage.includes('ninjago')) {
            jsonFile = './ninjago.json';
            category = 'ninjago';
        }
        
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu sản phẩm!');
        }
        
        const data = await response.json();
        let products = data[section.subcategory];
        
        if (!products) return;
        
        // Sắp xếp sản phẩm
        if (sortType !== 'default') {
            products = sortProducts(products, sortType);
        }
        
        // Hiển thị lại sản phẩm
        displaySortedProducts(products, section.gridId, section.subcategory, category);
        
    } catch (error) {
        console.error('Lỗi khi sắp xếp sản phẩm:', error);
    }
}

// Hàm hiển thị sản phẩm đã sắp xếp
function displaySortedProducts(products, gridId, subcategory, category) {
    const grid = document.getElementById(gridId);
    
    if (!grid) {
        console.error('Không tìm thấy grid:', gridId);
        return;
    }
    
    // Xóa nội dung cũ
    grid.innerHTML = '';
    
    // Tạo lại các card sản phẩm
    products.forEach(product => {
        const card = createFilteredProductCard(product, subcategory, category);
        grid.appendChild(card);
    });
}

// Hàm tạo card sản phẩm (tương tự như trong các file js khác)
function createFilteredProductCard(product, subcategory, category) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', () => {
        window.location.href = `productdetail.html?category=${category}&subcategory=${subcategory}&id=${product.id}`;
    });
    
    card.innerHTML = `
        <img class="product-image" src="${product.sizeImage}" alt="${product.name}">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString('vi-VN')} ₫</p>
        <p class="product-description">${product.description}</p>
    `;
    
    return card;
}

// Khởi tạo filter khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Đợi một chút để các script khác load xong
    setTimeout(() => {
        addFilterToPage();
    }, 100);
});