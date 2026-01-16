// ========================================
// ADMIN.JS - MShop Admin Dashboard Logic
// ========================================

// Kiểm tra quyền admin
window.addEventListener('DOMContentLoaded', async function() {
    const isAdmin = localStorage.getItem('isAdmin');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isAdmin || isAdmin !== 'true' || currentUser !== 'admin123@gmail.com') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }
    
    await initializeProductsFromJSON();
    loadProducts();
    loadOrders();
    updateStats();
    
    // Setup category filter
    setupCategoryFilter();
    
    // Setup search functionality
    setupSearch();
    
    // Listen for storage changes (sync between tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'allProducts') {
            loadProducts();
            updateStats();
        }
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        window.location.href = 'login.html';
    }
});

// Tab switching
document.querySelectorAll('.admin-menu li').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        document.querySelectorAll('.admin-menu li').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// Setup category filter
function setupCategoryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterProducts(category);
            updateCategoryDropdown(category);
        });
    });
}

// Update category dropdown based on active filter
function updateCategoryDropdown(activeFilter) {
    const categorySelect = document.getElementById('productCategory');
    const optgroups = categorySelect.querySelectorAll('optgroup');
    const options = categorySelect.querySelectorAll('option[value]');
    
    // Reset all
    optgroups.forEach(group => group.style.display = '');
    options.forEach(opt => opt.style.display = '');
    
    if (activeFilter === 'all') {
        // Show all options
        return;
    }
    
    // Hide options not in the active filter
    optgroups.forEach(group => {
        const groupType = group.getAttribute('data-group');
        if (groupType !== activeFilter) {
            group.style.display = 'none';
            // Hide all options in this group
            const groupOptions = group.querySelectorAll('option');
            groupOptions.forEach(opt => opt.style.display = 'none');
        }
    });
}

// Filter products by category
function filterProducts(category) {
    const sections = document.querySelectorAll('.category-section');
    
    if (category === 'all') {
        sections.forEach(section => section.classList.remove('hidden'));
    } else {
        sections.forEach(section => {
            const sectionCategory = section.getAttribute('data-category');
            if (sectionCategory === category) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }
    
    // Re-apply search filter if active
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        searchProducts(searchInput.value.trim());
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput || !clearBtn) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        if (searchTerm) {
            clearBtn.style.display = 'flex';
            searchProducts(searchTerm);
        } else {
            clearBtn.style.display = 'none';
            searchProducts('');
        }
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchProducts('');
        searchInput.focus();
    });
}

// Search products by name
function searchProducts(searchTerm) {
    const sections = document.querySelectorAll('.category-section');
    
    // If no search term, reload all products to show everything
    if (!searchTerm) {
        loadProducts();
        // Reapply category filter if active
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            const category = activeFilter.getAttribute('data-category');
            if (category !== 'all') {
                filterProducts(category);
            }
        }
        return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    sections.forEach(section => {
        // Skip hidden sections (filtered by category)
        if (section.classList.contains('hidden')) {
            return;
        }
        
        const tbody = section.querySelector('tbody');
        const allRows = tbody.querySelectorAll('tr');
        let hasVisibleProducts = false;
        
        allRows.forEach(row => {
            // Skip if this is an empty message row
            if (row.querySelector('.empty-message')) {
                return;
            }
            
            const productName = row.querySelector('.product-name');
            if (productName) {
                const nameText = productName.textContent.toLowerCase();
                if (nameText.includes(searchLower)) {
                    row.style.display = '';
                    hasVisibleProducts = true;
                } else {
                    row.style.display = 'none';
                }
            }
        });
        
        // Hide entire section if no products match, otherwise show it
        if (!hasVisibleProducts) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// Update products by category - SAVE TO ALL STORAGE LOCATIONS
function updateCategoryProducts(allProducts) {
    const categories = {
        'kamenrider-geats': 'geatsProducts',
        'kamenrider-gotchard': 'gotchardProducts',
        'beyblade-burst': 'burstProducts',
        'beyblade-x': 'xProducts',
        'ninjago-mos': 'mosProducts',
        'ninjago-dr': 'drProducts'
    };
    
    // Save to each category localStorage
    Object.keys(categories).forEach(categoryKey => {
        const categoryProducts = allProducts.filter(p => p.category === categoryKey);
        localStorage.setItem(categories[categoryKey], JSON.stringify(categoryProducts));
    });
    
    // IMPORTANT: Also save to main storage for homepage
    localStorage.setItem('allProducts', JSON.stringify(allProducts));
    
    // Trigger storage event for other tabs/pages
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'allProducts',
        newValue: JSON.stringify(allProducts)
    }));
}

// Show/Hide product form
document.getElementById('addProductBtn').addEventListener('click', function() {
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('formTitle').textContent = '✨ Thêm Sản Phẩm Mới';
    document.getElementById('productFormElement').reset();
    document.getElementById('productId').value = '';
    
    // Set default category based on active filter
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
        const filterCategory = activeFilter.getAttribute('data-category');
        updateCategoryDropdown(filterCategory);
        
        // Auto-select first available category if not "all"
        if (filterCategory !== 'all') {
            const categorySelect = document.getElementById('productCategory');
            const visibleOptions = Array.from(categorySelect.options).filter(opt => 
                opt.value && opt.style.display !== 'none'
            );
            if (visibleOptions.length > 0) {
                categorySelect.value = visibleOptions[0].value;
            }
        }
    }
    
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('productForm').style.display = 'none';
    document.getElementById('productFormElement').reset();
});

// Initialize products from JSON files
async function initializeProductsFromJSON() {
    try {
        const [ninjagoRes, kamenriderRes, beybladeRes] = await Promise.all([
            fetch('ninjago.json'),
            fetch('kamenrider.json'),
            fetch('beyblade.json')
        ]);
        
        const ninjagoData = await ninjagoRes.json();
        const kamenriderData = await kamenriderRes.json();
        const beybladeData = await beybladeRes.json();
        
        let allProducts = [];
        
        // Convert Ninjago MOS products
        ninjagoData.mos.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'ninjago-mos',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Convert Ninjago DR products
        ninjagoData.dr.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'ninjago-dr',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Convert Kamen Rider Gotchard products
        kamenriderData.gotchard.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'kamenrider-gotchard',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Convert Kamen Rider Geats products
        kamenriderData.geats.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'kamenrider-geats',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Convert Beyblade Burst products
        beybladeData.burst.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'beyblade-burst',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Convert Beyblade X products
        beybladeData.x.forEach(p => {
            allProducts.push({
                id: 'prod_' + p.id,
                name: p.name,
                price: p.price.replace(/\./g, ''),
                category: 'beyblade-x',
                image: p.sizeImage,
                description: p.description,
                images: p.images
            });
        });
        
        // Merge with existing custom products
        const existingProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
        const customProducts = existingProducts.filter(p => p.id.startsWith('custom_'));
        
        allProducts = [...allProducts, ...customProducts];
        
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
        updateCategoryProducts(allProducts);
        
        console.log('Loaded ' + allProducts.length + ' products from JSON');
    } catch (error) {
        console.error('Error loading JSON:', error);
        alert('Không thể load dữ liệu sản phẩm. Vui lòng kiểm tra file JSON!');
    }
}

// Load products from localStorage
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    
    // Separate products by main category
    const kamenriderProducts = products.filter(p => 
        p.category === 'kamenrider-geats' || p.category === 'kamenrider-gotchard'
    );
    const beybladeProducts = products.filter(p => 
        p.category === 'beyblade-burst' || p.category === 'beyblade-x'
    );
    const ninjagoProducts = products.filter(p => 
        p.category === 'ninjago-mos' || p.category === 'ninjago-dr'
    );
    
    // Load each category
    loadCategoryProducts('kamenriderTableBody', kamenriderProducts);
    loadCategoryProducts('beybladeTableBody', beybladeProducts);
    loadCategoryProducts('ninjagoTableBody', ninjagoProducts);
    
    updateStats();
}

// Load products for a specific category
function loadCategoryProducts(tbodyId, products) {
    const tbody = document.getElementById(tbodyId);
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Chưa có sản phẩm nào</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const imageUrl = product.image || '';
        const description = product.description || 'Chưa có mô tả';
        
        let imageHtml = '';
        if (imageUrl && imageUrl !== 'Chưa có hình ảnh') {
            imageHtml = `<img src="${imageUrl}" alt="${product.name}" onerror="this.parentElement.innerHTML='<span class=\\'no-image-text\\'>Không có hình ảnh</span>'">`;
        } else {
            imageHtml = '<span class="no-image-text">Không có hình ảnh</span>';
        }
        
        return `
        <tr>
            <td>${imageHtml}</td>
            <td class="product-name">${product.name}</td>
            <td class="price-cell">${parseInt(product.price).toLocaleString('vi-VN')} đ</td>
            <td><span class="category-badge">${getCategoryName(product.category)}</span></td>
            <td class="product-desc">${description}</td>
            <td class="actions-cell">
                <button class="btn-edit" onclick="editProduct('${product.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa
                </button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Xóa
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'kamenrider-geats': 'Kamen Rider Geats',
        'kamenrider-gotchard': 'Kamen Rider Gotchard',
        'beyblade-burst': 'Beyblade Burst',
        'beyblade-x': 'Beyblade X',
        'ninjago-mos': 'Ninjago MOS',
        'ninjago-dr': 'Ninjago DR'
    };
    return categories[category] || category;
}

// Add/Update product
document.getElementById('productFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const imageValue = document.getElementById('productImage').value.trim();
    const descValue = document.getElementById('productDescription').value.trim();
    
    const productData = {
        id: productId || 'custom_' + Date.now(),
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        image: imageValue || 'Chưa có hình ảnh',
        description: descValue || 'Chưa có mô tả'
    };
    
    let products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        products.push(productData);
    }
    
    localStorage.setItem('allProducts', JSON.stringify(products));
    updateCategoryProducts(products);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'allProducts',
        newValue: JSON.stringify(products)
    }));
    
    alert(productId ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
    document.getElementById('productForm').style.display = 'none';
    document.getElementById('productFormElement').reset();
    loadProducts();
});

// Update products by category
function updateCategoryProducts(allProducts) {
    const categories = {
        'kamenrider-geats': 'geatsProducts',
        'kamenrider-gotchard': 'gotchardProducts',
        'beyblade-burst': 'burstProducts',
        'beyblade-x': 'xProducts',
        'ninjago-mos': 'mosProducts',
        'ninjago-dr': 'drProducts'
    };
    
    Object.keys(categories).forEach(categoryKey => {
        const categoryProducts = allProducts.filter(p => p.category === categoryKey);
        localStorage.setItem(categories[categoryKey], JSON.stringify(categoryProducts));
    });
}

// Edit product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        document.getElementById('productForm').style.display = 'block';
        document.getElementById('formTitle').textContent = '✏️ Sửa Sản Phẩm';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image === 'Chưa có hình ảnh' ? '' : product.image;
        document.getElementById('productDescription').value = product.description || '';
        
        // Show all categories when editing
        updateCategoryDropdown('all');
        document.getElementById('productCategory').value = product.category;
        
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        return;
    }
    
    let products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    products = products.filter(p => p.id !== productId);
    
    localStorage.setItem('allProducts', JSON.stringify(products));
    updateCategoryProducts(products);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'allProducts',
        newValue: JSON.stringify(products)
    }));
    
    alert('Xóa sản phẩm thành công!');
    loadProducts();
}

// Load orders from localStorage
function loadOrders() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const tbody = document.getElementById('ordersTableBody');
    
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Chưa có sản phẩm nào trong giỏ hàng</td></tr>';
        updateStats();
        return;
    }
    
    tbody.innerHTML = cart.map((item, index) => {
        const totalPrice = parseInt(item.price) * item.quantity;
        
        return `
            <tr>
                <td>#${index + 1}</td>
                <td>${new Date().toLocaleDateString('vi-VN')}</td>
                <td class="product-name">${item.name}</td>
                <td>${item.quantity}</td>
                <td class="price-cell">${totalPrice.toLocaleString('vi-VN')} đ</td>
            </tr>
        `;
    }).join('');
    
    // Add total row
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);
    
    tbody.innerHTML += `
        <tr class="total-row">
            <td colspan="3"><strong>Tổng cộng</strong></td>
            <td><strong>${totalQuantity}</strong></td>
            <td class="price-cell"><strong>${totalAmount.toLocaleString('vi-VN')} đ</strong></td>
        </tr>
    `;
    
    updateStats();
}

// Update statistics
function updateStats() {
    const products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = cart.length;
}