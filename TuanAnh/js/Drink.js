// ===============================
// 1. HÀM LOADPRODUCT
// ===============================
async function loadProducts() {
   try {
        const savedProducts = localStorage.getItem('products_drink');
        if (savedProducts) {
            const products = JSON.parse(savedProducts);
            displayProducts(products, "drink-grid");
            return;
        }

        const response = await fetch("data/drink.json");
        const data = await response.json();
        displayProducts(data.Soft_drink, "drink-grid");
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

// ===============================
// 2. HIỂN THỊ SẢN PHẨM LÊN HTML
// ===============================
function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// ===============================
// 3. TẠO THẺ PRODUCT VỚI AUTO SLIDER
// ===============================
function createProductCard(product) {
    const card = document.createElement("div");
    card.classList.add("product-card");

    // === THÊM SỰ KIỆN CLICK ĐỂ CHUYỂN ĐẾN TRANG CHI TIẾT ===
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
        // Chuyển đến trang product.html với ID và category
        window.location.href = `product.html?id=${product.id}&category=drink`;
    });

    // === CONTAINER CHỨA TẤT CẢ ẢNH ===
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("product-images");

    // Tạo tất cả các ảnh
    product.images.forEach((imageSrc, index) => {
        const img = document.createElement("img");
        img.src = imageSrc;
        img.alt = `${product.name} - Ảnh ${index + 1}`;
        img.classList.add("product-image");
        
        // Ảnh đầu tiên hiển thị mặc định
        if (index === 0) {
            img.classList.add("active");
        }
        
        imageContainer.appendChild(img);
    });

    // === TẠO INDICATOR DOTS ===
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

    // === TỰ ĐỘNG CHUYỂN ẢNH KHI HOVER ===
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

    // === THÔNG TIN SẢN PHẨM ===
    
    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.classList.add("price");
    price.textContent = product.price.toLocaleString("vi-VN") + "đ";

    const desc = document.createElement("p");
    desc.classList.add("description");
    desc.textContent = product.description;

    // === GẮN VÀO CARD ===
    card.appendChild(imageContainer);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(desc);

    return card;
}

// ===============================
// 4. CẬP NHẬT ẢNH VÀ DOT ĐANG ACTIVE
// ===============================
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

// ===============================
// 5. TỰ ĐỘNG CHẠY KHI LOAD TRANG
// ===============================
document.addEventListener("DOMContentLoaded", loadProducts);

initSearch('drink');