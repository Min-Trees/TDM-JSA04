// ===============================================
// ADMIN.JS - JAVASCRIPT CHO TRANG ADMIN
// ===============================================

// ===== BIẾN TOÀN CỤC =====
let allProducts = [];
let currentFilter = 'all';
let currentImages = [];
let editingProduct = null;

// Lưu file handles cho việc lưu JSON
let jsonFileHandles = {
    candy: null,
    snack: null,
    drink: null
};

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFormSubmit();
});

// ===== LOAD SẢN PHẨM =====
async function loadProducts() {
    try {
        const savedProducts = localStorage.getItem('adminProducts');
        
        if (savedProducts) {
            allProducts = JSON.parse(savedProducts);
        } else {
            const [candyRes, snackRes, drinkRes] = await Promise.all([
                fetch('data/candy.json'),
                fetch('data/snack.json'),
                fetch('data/drink.json')
            ]);

            const candyData = await candyRes.json();
            const snackData = await snackRes.json();
            const drinkData = await drinkRes.json();

            allProducts = [
                ...(candyData.Candy || []).map(p => ({...p, category: 'candy'})),
                ...(snackData.Snack || []).map(p => ({...p, category: 'snack'})),
                ...(drinkData.Soft_drink || []).map(p => ({...p, category: 'drink'}))
            ];

            saveProducts();
        }

        displayProducts();
        updateCounts();
    } catch (error) {
        console.error('Lỗi khi load sản phẩm:', error);
        showToast('Lỗi khi tải dữ liệu', 'error');
    }
}

// ===== LƯU SẢN PHẨM VÀO LOCALSTORAGE =====
// function saveProducts() {
//     localStorage.setItem('adminProducts', JSON.stringify(allProducts));
    
//     const candyProducts = allProducts.filter(p => p.category === 'candy');
//     const snackProducts = allProducts.filter(p => p.category === 'snack');
//     const drinkProducts = allProducts.filter(p => p.category === 'drink');

//     localStorage.setItem('products_candy', JSON.stringify(candyProducts));
//     localStorage.setItem('products_snack', JSON.stringify(snackProducts));
//     localStorage.setItem('products_drink', JSON.stringify(drinkProducts));
    
//     console.log('✅ Đã lưu sản phẩm vào localStorage');
// }
function saveProducts() {
    try {
        localStorage.setItem('adminProducts', JSON.stringify(allProducts));
        console.log('✅ Đã lưu adminProducts');
    } catch (e) {
        console.warn('⚠ localStorage đầy, bỏ qua cache');
        localStorage.removeItem('adminProducts');
    }
}


// ===== LƯU CÁC FILE JSON =====
async function saveJSONFiles(jsonData) {
    try {
        const categories = [
            { name: 'snack', data: jsonData.snack, filename: 'snack.json' },
            { name: 'candy', data: jsonData.candy, filename: 'candy.json' },            
            { name: 'drink', data: jsonData.drink, filename: 'drink.json' }
        ];
        
        let savedCount = 0;
        
        for (const category of categories) {
            // Nếu đã có file handle từ lần trước, dùng lại
            if (!jsonFileHandles[category.name]) {
                // Chưa có, yêu cầu chọn file
                jsonFileHandles[category.name] = await window.showSaveFilePicker({
                    suggestedName: category.filename,
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
            }
            
            // Ghi vào file
            const writable = await jsonFileHandles[category.name].createWritable();
            await writable.write(JSON.stringify(category.data, null, 2));
            await writable.close();
            
            savedCount++;
            console.log(`✅ Đã lưu ${category.filename}`);
        }
        
        if (savedCount === 3) {
            showToast('💾 Đã lưu tất cả file JSON!', 'success');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Lỗi khi lưu file:', error);
            showToast('❌ Lỗi khi lưu file: ' + error.message, 'error');
        }
    }
}

// ===== LƯU THỦ CÔNG VÀO FILE JSON =====
async function manualSaveJSON() {
    if (!window.showSaveFilePicker) {
        showToast('Trình duyệt không hỗ trợ! Vui lòng dùng Chrome hoặc Edge', 'error');
        return;
    }
    
    try {
        // Tách sản phẩm theo category từ localStorage
        const candyProducts = allProducts.filter(p => p.category === 'candy');
        const snackProducts = allProducts.filter(p => p.category === 'snack');
        const drinkProducts = allProducts.filter(p => p.category === 'drink');
        
        // Tạo object theo format của file gốc
        const jsonData = {
            candy: { Candy: candyProducts },
            snack: { Snack: snackProducts },
            drink: { Soft_drink: drinkProducts }
        };
        
        await saveJSONFiles(jsonData);
    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Lỗi khi lưu file JSON', 'error');
    }
}

// ===== RESET FILE JSON (CHỌN LẠI FILE MỚI) =====
function resetJSONFiles() {
    if (confirm('Bạn có muốn chọn lại các file JSON không?\n\nLần lưu tiếp theo sẽ yêu cầu bạn chọn file mới.')) {
        jsonFileHandles = {
            candy: null,
            snack: null,
            drink: null
        };
        showToast('🔄 Đã reset! Lần lưu tiếp theo sẽ chọn file mới.', 'success');
    }
}

// ===== HIỂN THỊ SẢN PHẨM =====
function displayProducts() {
    const tbody = document.getElementById('productTableBody');
    const emptyState = document.getElementById('emptyState');
    
    let filteredProducts = allProducts;
    if (currentFilter !== 'all') {
        filteredProducts = allProducts.filter(p => p.category === currentFilter);
    }

    if (filteredProducts.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = filteredProducts.map((product, index) => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
            </td>
            <td>${product.name}</td>
            <td>${product.price.toLocaleString('vi-VN')}đ</td>
            <td>
                <span class="category-badge category-${product.category}">
                    ${getCategoryName(product.category)}
                </span>
            </td>
            <td>${product.description}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${getGlobalIndex(product)})">
                        ✏️ Sửa
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${getGlobalIndex(product)})">
                        🗑️ Xóa
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== LẤY INDEX TRONG MẢNG TOÀN CỤC =====
function getGlobalIndex(product) {
    return allProducts.findIndex(p => p.id === product.id && p.category === product.category);
}

// ===== LẤY TÊN DANH MỤC =====
function getCategoryName(category) {
    const names = {
        candy: '🍬 Kẹo',
        snack: '🍰 Bánh',
        drink: '🥤 Nước ngọt'
    };
    return names[category] || category;
}

// ===== CẬP NHẬT SỐ LƯỢNG =====
function updateCounts() {
    document.getElementById('count-all').textContent = allProducts.length;
    document.getElementById('count-candy').textContent = allProducts.filter(p => p.category === 'candy').length;
    document.getElementById('count-snack').textContent = allProducts.filter(p => p.category === 'snack').length;
    document.getElementById('count-drink').textContent = allProducts.filter(p => p.category === 'drink').length;
}

// ===== LỌC THEO DANH MỤC =====
function filterCategory(category) {
    currentFilter = category;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayProducts();
}

// ===== MỞ MODAL THÊM =====
function openAddModal() {
    editingProduct = null;
    currentImages = [];
    document.getElementById('modalTitle').textContent = 'Thêm Sản Phẩm';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('editIndex').value = '';
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('productModal').classList.add('show');
}

// ===== MỞ MODAL SỬA =====
function editProduct(index) {
    editingProduct = allProducts[index];
    currentImages = [...editingProduct.images];
    
    document.getElementById('modalTitle').textContent = 'Sửa Sản Phẩm';
    document.getElementById('productId').value = editingProduct.id;
    document.getElementById('editIndex').value = index;
    document.getElementById('productName').value = editingProduct.name;
    document.getElementById('productPrice').value = editingProduct.price;
    document.getElementById('productCategory').value = editingProduct.category;
    document.getElementById('productDescription').value = editingProduct.description;
    
    displayImagePreviews();
    
    document.getElementById('productModal').classList.add('show');
}

// ===== ĐÓNG MODAL =====
function closeModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('productForm').reset();
    currentImages = [];
    editingProduct = null;
}

// ===== THÊM HÌNH ẢNH TỪ FILE =====
function addImageFromFile() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file hình ảnh', 'error');
        return;
    }
    
    // Giới hạn 30MB
    if (file.size > 30 * 1024 * 1024) {
        showToast('Kích thước ảnh không được vượt quá 30MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImages.push(e.target.result);
        displayImagePreviews();
        fileInput.value = '';
        showToast('Đã thêm hình ảnh', 'success');
    };
    reader.onerror = function() {
        showToast('Lỗi khi đọc file', 'error');
    };
    reader.readAsDataURL(file);
}

// ===== THÊM HÌNH ẢNH TỪ URL =====
function addImageFromUrl() {
    const imageUrl = document.getElementById('imageUrl').value.trim();
    if (!imageUrl) {
        showToast('Vui lòng nhập URL hình ảnh', 'error');
        return;
    }
    
    currentImages.push(imageUrl);
    document.getElementById('imageUrl').value = '';
    displayImagePreviews();
    showToast('Đã thêm hình ảnh', 'success');
}

// ===== CHUYỂN ĐỔI TAB THÊM ẢNH =====
function switchImageTab(tab) {
    const filePanel = document.getElementById('fileImageInput');
    const urlPanel = document.getElementById('urlImageInput');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'file') {
        filePanel.style.display = 'block';
        urlPanel.style.display = 'none';
    } else {
        filePanel.style.display = 'none';
        urlPanel.style.display = 'block';
    }
}

// ===== HIỂN THỊ PREVIEW HÌNH ẢNH =====
function displayImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = currentImages.map((url, index) => `
        <div class="image-preview-item">
            <img src="${url}" class="image-preview" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        </div>
    `).join('');
}

// ===== XÓA HÌNH ẢNH =====
function removeImage(index) {
    currentImages.splice(index, 1);
    displayImagePreviews();
}

// ===== SETUP FORM SUBMIT =====
function setupFormSubmit() {
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
}

// ===== LƯU SẢN PHẨM =====
function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();

    if (!name || !price || !category) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    if (currentImages.length === 0) {
        showToast('Vui lòng thêm ít nhất 1 hình ảnh', 'error');
        return;
    }

    const editIndex = document.getElementById('editIndex').value;

    if (editIndex !== '') {
        allProducts[editIndex] = {
            ...allProducts[editIndex],
            name,
            price,
            category,
            description,
            images: currentImages
        };
        showToast('Cập nhật sản phẩm thành công!', 'success');
    } else {
        const newId = Math.max(...allProducts.map(p => p.id), 0) + 1;
        const newProduct = {
            id: newId,
            name,
            price,
            category,
            description,
            images: currentImages
        };
        allProducts.push(newProduct);
        showToast('Thêm sản phẩm thành công!', 'success');
    }

    saveProducts();
    displayProducts();
    updateCounts();
    closeModal();
    
    // Nhắc nhở user lưu vào JSON
    setTimeout(() => {
        if (confirm('💡 Bạn có muốn lưu thay đổi vào file JSON không?')) {
            manualSaveJSON();
        }
    }, 1000);
}

// ===== XÓA SẢN PHẨM =====
function deleteProduct(index) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    allProducts.splice(index, 1);
    
    saveProducts();
    displayProducts();
    updateCounts();
    
    showToast('Đã xóa sản phẩm thành công!', 'success');
    
    // Nhắc nhở user lưu vào JSON
    setTimeout(() => {
        if (confirm('💡 Bạn có muốn lưu thay đổi vào file JSON không?')) {
            manualSaveJSON();
        }
    }, 1000);
}

// ===== HIỂN THỊ TOAST =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    msg.textContent = message;
    icon.textContent = type === 'success' ? '✅' : '❌';
    
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===============================================
// HƯỚNG DẪN SỬ DỤNG:
// ===============================================
// 
// 1. CÁCH DỮ LIỆU ĐƯỢC LƯU:
//    - adminProducts: Toàn bộ sản phẩm
//    - products_candy: Sản phẩm kẹo
//    - products_snack: Sản phẩm bánh
//    - products_drink: Sản phẩm nước ngọt
//
// 2. LƯU VÀO FILE JSON:
//    - Sau khi thêm/sửa/xóa sản phẩm
//    - Hệ thống sẽ hỏi có muốn lưu vào file JSON
//    - Chọn YES → Chọn 3 file: candy.json, snack.json, drink.json
//    - Các lần sau sẽ tự động lưu vào file đã chọn
//    - Click "Reset" để chọn lại file mới
//
// 3. YÊU CẦU TRÌNH DUYỆT:
//    - Google Chrome 86+
//    - Microsoft Edge 86+
//    - Các trình duyệt khác chưa hỗ trợ File System Access API
//
// ===============================================