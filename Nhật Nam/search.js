// search.js - File xử lý tìm kiếm chung cho tất cả các trang

// Hàm tìm kiếm sản phẩm
function searchProducts(keyword, jsonFile, subcategories) {
    keyword = keyword.toLowerCase().trim();
    
    if (!keyword) {
        alert('Vui lòng nhập từ khóa tìm kiếm!');
        return;
    }

    // Fetch dữ liệu từ file JSON
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu sản phẩm!');
            }
            return response.json();
        })
        .then(data => {
            let results = [];

            // Tìm kiếm trong tất cả các subcategory
            subcategories.forEach(subcat => {
                if (data[subcat]) {
                    const filtered = data[subcat].filter(product => {
                        return product.name.toLowerCase().includes(keyword) ||
                               product.description.toLowerCase().includes(keyword);
                    });
                    
                    // Thêm thông tin subcategory vào mỗi sản phẩm
                    filtered.forEach(product => {
                        results.push({
                            ...product,
                            subcategory: subcat
                        });
                    });
                }
            });

            // Hiển thị kết quả
            displaySearchResults(results, keyword);
        })
        .catch(error => {
            console.error('Lỗi khi tìm kiếm:', error);
            alert('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
        });
}

// Hàm hiển thị kết quả tìm kiếm
function displaySearchResults(results, keyword) {
    // Ẩn tất cả các section
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        if (section.classList.contains('hero-section')) return;
        section.style.display = 'none';
    });

    // Xóa section kết quả cũ nếu có
    const oldResultSection = document.getElementById('search-results-section');
    if (oldResultSection) {
        oldResultSection.remove();
    }

    // Tạo section mới cho kết quả tìm kiếm
    const resultSection = document.createElement('section');
    resultSection.id = 'search-results-section';
    resultSection.style.margin = '60px 0';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Kết quả tìm kiếm cho "${keyword}" (${results.length} sản phẩm)`;
    
    const grid = document.createElement('div');
    grid.className = 'products-grid';

    if (results.length === 0) {
        // Không tìm thấy sản phẩm
        const noResult = document.createElement('div');
        noResult.style.cssText = `
            text-align: center;
            padding: 60px 20px;
            grid-column: 1 / -1;
        `;
        noResult.innerHTML = `
            <h3 style="font-size: 24px; color: #666; margin-bottom: 15px;">
                Không tìm thấy sản phẩm nào
            </h3>
            <p style="font-size: 16px; color: #999; margin-bottom: 25px;">
                Vui lòng thử lại với từ khóa khác
            </p>
            <button onclick="clearSearch()" style="
                padding: 12px 30px;
                background: #1e40af;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">
                Xem tất cả sản phẩm
            </button>
        `;
        grid.appendChild(noResult);
    } else {
        // Hiển thị sản phẩm tìm được
        results.forEach(product => {
            const card = createSearchProductCard(product);
            grid.appendChild(card);
        });
    }

    resultSection.appendChild(title);
    resultSection.appendChild(grid);

    // Thêm nút "Xem tất cả sản phẩm" ở cuối nếu có kết quả
    if (results.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.style.cssText = 'text-align: center; margin-top: 40px;';
        clearButton.innerHTML = `
            <button onclick="clearSearch()" style="
                padding: 12px 40px;
                background: white;
                color: #1e40af;
                border: 2px solid #1e40af;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#1e40af'; this.style.color='white';" 
               onmouseout="this.style.background='white'; this.style.color='#1e40af';">
                Xem tất cả sản phẩm
            </button>
        `;
        resultSection.appendChild(clearButton);
    }

    // Thêm vào container
    const container = document.querySelector('.container main') || document.querySelector('main.container');
    if (container) {
        const heroSection = container.querySelector('.hero-section');
        if (heroSection) {
            heroSection.after(resultSection);
        } else {
            container.insertBefore(resultSection, container.firstChild);
        }
    }
}

// Hàm tạo card sản phẩm cho kết quả tìm kiếm
function createSearchProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";
    
    // Xác định category dựa vào trang hiện tại
    let category = '';
    const currentPage = window.location.pathname;
    if (currentPage.includes('beyblade')) {
        category = 'beyblade';
    } else if (currentPage.includes('kamenrider')) {
        category = 'kamenrider';
    } else if (currentPage.includes('ninjago')) {
        category = 'ninjago';
    }
    
    card.addEventListener('click', () => {
        window.location.href = `productdetail.html?category=${category}&subcategory=${product.subcategory}&id=${product.id}`;
    });

    card.innerHTML = `
        <img class="product-image" src="${product.sizeImage}" alt="${product.name}">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString('vi-VN')} ₫</p>
        <p class="product-description">${product.description}</p>
    `;

    return card;
}

// Hàm xóa kết quả tìm kiếm và hiển thị lại tất cả sản phẩm
function clearSearch() {
    // Xóa section kết quả tìm kiếm
    const resultSection = document.getElementById('search-results-section');
    if (resultSection) {
        resultSection.remove();
    }

    // Hiển thị lại tất cả các section
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        if (!section.classList.contains('hero-section')) {
            section.style.display = 'block';
        }
    });

    // Xóa nội dung ô tìm kiếm
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Khởi tạo sự kiện tìm kiếm khi trang load
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchForm && searchInput) {
        // Xử lý submit form
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });

        // Xử lý click nút tìm
        if (searchBtn) {
            searchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                performSearch();
            });
        }

        // Xử lý Enter trong ô input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    function performSearch() {
        const keyword = searchInput.value;
        const currentPage = window.location.pathname;

        // Xác định file JSON và subcategories dựa vào trang hiện tại
        if (currentPage.includes('beyblade')) {
            searchProducts(keyword, './beyblade.json', ['burst', 'x']);
        } else if (currentPage.includes('kamenrider')) {
            searchProducts(keyword, './kamenrider.json', ['gotchard', 'geats']);
        } else if (currentPage.includes('ninjago')) {
            searchProducts(keyword, './ninjago.json', ['mos', 'dr']);
        } else {
            alert('Không xác định được trang hiện tại!');
        }
    }
});