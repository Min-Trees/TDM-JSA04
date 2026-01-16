// Tạo thẻ sản phẩm
function createProductCard(product, subcategory) {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Thêm sự kiện click để chuyển sang trang chi tiết
    card.style.cursor = "pointer";
    card.addEventListener('click', () => {
        window.location.href = `productdetail.html?category=kamenrider&subcategory=${subcategory}&id=${product.id}`;
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
        const response = await fetch("./kamenrider.json");

        if (!response.ok) {
            throw new Error("Không load được JSON, mã lỗi: " + response.status);
        }

        const data = await response.json();

        // Load Gotchard
        if (data.gotchard) {
            displayProducts(data.gotchard, "gotchard-grid", "gotchard");
        }

        // Load Geats
        if (data.geats) {
            displayProducts(data.geats, "geats-grid", "geats");
        }

        console.log("Load thành công!");

    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
    }
}

 document.addEventListener("DOMContentLoaded", loadProducts); 
 //DOMContentLoaded: Sự kiện này được kích hoạt khi
 //Toàn bộ cấu trúc HTML đã được tải xuống và phân tích xong
// Trình duyệt đã xây dựng xong DOM cây (Mô hình đối tượng tài liệu)
// Nhưng chưa được mong đợi các tài nguyên khác như hình ảnh, biểu định kiểu hoặc iframe tải xong

// Mảng chứa các nội dung banner
const bannerContents = [
    {
        title: "Kamen Rider Geats",
        description: "Bộ Kamen Rider cho bé sự sáng tạo và thỏa sức biến hình bằng cách kết hợp các hình dạng với nhau"
    },
    {
        title: "Kamen Rider Gotchard",
        description: "Bộ sưu tầm thẻ bài cùng những con thú đáng yêu và mạnh mẽ, có thể giúp ta biến thân thành các dạng kết hợp với nhau"
    },
    {
        title: "Kamen Rider", 
        description: "Những món thắt lưng biến thân thú vị, thỏa sức nhập vai"
    }
];

let currentIndex = 0;

// Hàm cập nhật nội dung banner
function updateBanner() {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');
    
    heroTitle.style.opacity = '0';
    heroDescription.style.opacity = '0';
    
    setTimeout(() => {
        heroTitle.textContent = bannerContents[currentIndex].title;
        heroDescription.textContent = bannerContents[currentIndex].description;
        
        heroTitle.style.opacity = '1';
        heroDescription.style.opacity = '1';
    }, 500);
}

// Hàm chuyển banner
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

let previousIndex = 0;

// Khởi động carousel
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .hero-content h1,
        .hero-content p {
            transition: opacity 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    setInterval(rotateBanner, 3000);
});