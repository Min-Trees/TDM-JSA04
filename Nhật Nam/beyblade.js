// Tạo thẻ sản phẩm
function createProductCard(product, subcategory) {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Thêm sự kiện click để chuyển sang trang chi tiết
    card.style.cursor = "pointer";
    card.addEventListener('click', () => {
        // Chuyển hướng đến trang chi tiết với các tham số
        window.location.href = `productdetail.html?category=beyblade&subcategory=${subcategory}&id=${product.id}`;
    });

    card.innerHTML = `
        <img class="product-image" src="${product.sizeImage}" alt="${product.name}">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString('vi-VN')} ₫</p>
        <p class="product-description">${product.description}</p>
    `;

    return card;
}

// Hiển thị danh sách sản phẩm
function displayProducts(products, containerId, subcategory) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error("Không tìm thấy container:", containerId);
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {
        const card = createProductCard(product, subcategory);
        container.appendChild(card);
    });
}

// Load data từ JSON
async function loadProducts() {
    try {
        const response = await fetch("./beyblade.json");

        if (!response.ok) {
            throw new Error("Không load được JSON, mã lỗi: " + response.status);
        }

        const data = await response.json();

        // Load Burst
        if (data.burst) {
            displayProducts(data.burst, "burst-grid", "burst");
        }

        // Load X
        if (data.x) {
            displayProducts(data.x, "x-grid", "x");
        }

        console.log("Load thành công!");

    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadProducts);

// Mảng chứa các nội dung banner
const bannerContents = [
    {
        title: "Beyblade Burst",
        description: "Dòng con quay có khả năng bị nổ tung khi va chạm mạnh và có thể tái lắp ráp với nhiều kiểu khác nhau"
    },
    {
        title: "Beyblade X",
        description: "Dòng con quay thế hệ mới với răng cưa ở phần đế giúp con quay tăng tốc độ khi va chạm với đáy sàn tạo ra những đòn tấn công Extreme"
    },
    {
        title: "Beyblade", 
        description: "Đồ chơi trẻ em an toàn, thú vị và sáng tạo"
    }
];

let currentIndex = 0;

// Hàm cập nhật nội dung banner
function updateBanner() {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');
    
    // Thêm hiệu ứng fade out
    heroTitle.style.opacity = '0';
    heroDescription.style.opacity = '0';
    
    setTimeout(() => {
        // Cập nhật nội dung
        heroTitle.textContent = bannerContents[currentIndex].title;
        heroDescription.textContent = bannerContents[currentIndex].description;
        
        // Thêm hiệu ứng fade in
        heroTitle.style.opacity = '1';
        heroDescription.style.opacity = '1';
    }, 500);
}

// Hàm chuyển banner theo thứ tự: 0 -> 1 -> 2 -> 1 -> 0 -> lặp lại
function rotateBanner() {
    if (currentIndex === 0) {
        currentIndex = 1;
    } else if (currentIndex === 1) {
        if (previousIndex === 0) {
            currentIndex = 2;
        } else {
            currentIndex = 0;
        }
    } else if (currentIndex === 2) {
        currentIndex = 1;
    }
    
    previousIndex = (currentIndex === 1 && previousIndex === 0) ? 0 : 
                    (currentIndex === 2) ? 1 : 2;
    
    updateBanner();
}

// Biến lưu index trước đó
let previousIndex = 0;

// Khởi động carousel khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
    // Thêm CSS cho hiệu ứng transition
    const style = document.createElement('style');
    style.textContent = `
        .hero-content h1,
        .hero-content p {
            transition: opacity 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    // Bắt đầu chuyển banner sau mỗi 3 giây
    setInterval(rotateBanner, 3000);
});