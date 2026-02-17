function fixImageUrl(url) {
    if (!url || url.trim() === '') {
        return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%239ca3af\' font-family=\'Arial\' font-size=\'16\'%3ENo Image%3C/text%3E%3C/svg%3E';
    }

    if (url.includes('/sausageSho/')) {
        url = url.replace('/sausageSho/', '/sausageShop/');
    }

    if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/sausageShop/')) {
        url = url.replace(/^\/+/, '');
        if (!url.startsWith('sausageShop/')) {
            url = '/sausageShop/' + url;
        } else {
            url = '/' + url;
        }
    }
    
    return url;
}

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

let currentProduct = null;
let currentQuantity = 1;
let selectedImageIndex = 0;
let isInWishlist = false;

window.addEventListener("load", async () => {
    if (!productId) {
        Notiflix.Notify.failure("Product ID not found!", {
            position: 'center-top'
        });
        return;
    }

    try {
        Notiflix.Loading.pulse("Loading product...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });
        
        await loadSingleProduct();
        await checkWishlistStatus();
        initEventListeners();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadSingleProduct() {
    try {
        const response = await fetch(`api/single-products/product?productId=${productId}`);

        if (response.ok) {
            const data = await response.json();
            if (data.status && data.product) {
                currentProduct = data.product;
                renderProduct(data.product);
                await loadRelatedProducts(data.product.categoryId);
            } else {
                Notiflix.Notify.failure(data.message || "Product not found!", {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Product data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

function renderProduct(product) {
    // Update page title
    document.title = `${product.title} - Sausage Shop`;

    // Update breadcrumb
    const breadcrumbCategory = document.querySelector('.breadcrumb-category');
    const breadcrumbProduct = document.querySelector('.breadcrumb-product');
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.categoryName || 'Category';
        breadcrumbCategory.href = `shop.html?category=${product.categoryId}`;
    }
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = product.title;
    }

    // Render images
    renderProductImages(product.images || []);

    // Render product info
    renderProductInfo(product);

    // Render tabs content
    renderTabsContent(product);
}

function renderProductImages(images) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailsContainer = document.querySelector('.product-thumbnails');
    
    if (images.length === 0) {
        images = [''];
    }

    // Main image
    if (mainImage) {
        mainImage.src = fixImageUrl(images[0] || '');
        mainImage.alt = currentProduct.title;
    }

    // Thumbnails
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const button = document.createElement('button');
            button.className = `border-2 ${index === 0 ? 'border-orange-500' : 'border-gray-200'} rounded-xl overflow-hidden hover:border-orange-500 transition`;
            button.onclick = () => selectImage(index);
            
            const img = document.createElement('img');
            img.src = fixImageUrl(image || '');
            img.alt = `Product view ${index + 1}`;
            img.className = 'w-full h-24 object-cover';
            
            button.appendChild(img);
            thumbnailsContainer.appendChild(button);
        });
    }
}

function selectImage(index) {
    selectedImageIndex = index;
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.product-thumbnails button');
    
    if (mainImage && currentProduct.images && currentProduct.images[index]) {
        mainImage.src = fixImageUrl(currentProduct.images[index]);
    }
    
    thumbnails.forEach((btn, i) => {
        if (i === index) {
            btn.classList.remove('border-gray-200');
            btn.classList.add('border-orange-500');
        } else {
            btn.classList.remove('border-orange-500');
            btn.classList.add('border-gray-200');
        }
    });
}

function renderProductInfo(product) {
    // Category badge
    const categoryBadge = document.querySelector('.product-category');
    if (categoryBadge) {
        categoryBadge.textContent = product.categoryName || 'Category';
    }

    // Title
    const title = document.querySelector('.product-title');
    if (title) {
        title.textContent = product.title;
    }

    // Short description
    const shortDesc = document.querySelector('.product-short-desc');
    if (shortDesc) {
        shortDesc.textContent = product.shortDescription || '';
    }

    // Price
    const priceContainer = document.querySelector('.product-price-container');
    if (priceContainer) {
        const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
        const discount = hasSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
        
        priceContainer.innerHTML = `
            <span class="text-5xl font-extrabold text-orange-600">$${hasSale ? product.salePrice.toFixed(2) : product.price.toFixed(2)}</span>
            ${hasSale ? `<span class="text-2xl text-gray-400 line-through">$${product.price.toFixed(2)}</span>` : ''}
            ${hasSale ? `<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">Save $${(product.price - product.salePrice).toFixed(2)}</span>` : ''}
        `;
    }

    // Sale badge
    const saleBadge = document.querySelector('.sale-badge');
    if (saleBadge && product.salePrice && product.salePrice > 0 && product.salePrice < product.price) {
        const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
        saleBadge.innerHTML = `<i class="fas fa-tag mr-1"></i>Sale - ${discount}% OFF`;
        saleBadge.classList.remove('hidden');
    } else if (saleBadge) {
        saleBadge.classList.add('hidden');
    }

    // Stock status
    const stockContainer = document.querySelector('.stock-status-container');
    if (stockContainer) {
        const inStock = product.stockQty > 0;
        stockContainer.innerHTML = `
            <i class="fas ${inStock ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-red-500'} text-xl"></i>
            <div>
                <p class="font-semibold ${inStock ? 'text-emerald-700' : 'text-red-700'}">${inStock ? 'In Stock' : 'Out of Stock'}</p>
                <p class="text-sm ${inStock ? 'text-emerald-600' : 'text-red-600'}">${inStock ? `${product.stockQty} units available • Usually ships within 24 hours` : 'Currently unavailable'}</p>
            </div>
        `;
    }

    // Quantity selector
    const quantityInput = document.getElementById('quantityInput');
    if (quantityInput) {
        quantityInput.max = product.stockQty;
        quantityInput.value = 1;
        currentQuantity = 1;
    }

    const maxQtyText = document.querySelector('.max-qty-text');
    if (maxQtyText) {
        maxQtyText.textContent = `Max ${product.stockQty} units per order`;
    }
}

function renderTabsContent(product) {
    // Description
    const descriptionContent = document.querySelector('.description-content');
    if (descriptionContent) {
        descriptionContent.innerHTML = `
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Product Description</h3>
            <p class="text-gray-600 leading-relaxed mb-4">${product.longDescription || product.shortDescription || 'No description available.'}</p>
        `;
    }

    // Nutrition Facts
    const nutritionContent = document.querySelector('.nutrition-content');
    if (nutritionContent) {
        nutritionContent.innerHTML = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Serving Size</span>
                    <span class="font-semibold text-gray-900">1 unit</span>
                </div>
                <div class="border-t border-gray-300 pt-3 mt-3">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Calories</span>
                        <span class="font-semibold text-gray-900">${product.calories || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Total Fat</span>
                        <span class="font-semibold text-gray-900">${product.fat ? product.fat + 'g' : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm mt-2">
                        <span class="text-gray-500">Protein</span>
                        <span class="font-semibold text-gray-900">${product.protein ? product.protein + 'g' : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Carbs</span>
                        <span class="font-semibold text-gray-900">${product.carbs ? product.carbs + 'g' : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Ingredients
    const ingredientsContent = document.querySelector('.ingredients-content');
    if (ingredientsContent) {
        ingredientsContent.innerHTML = `
            <div class="prose max-w-none">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Ingredients</h3>
                <p class="text-gray-600 leading-relaxed">${product.ingredients || 'Ingredients information not available.'}</p>
            </div>
        `;
    }

    // Product Information
    const productInfoContent = document.querySelector('.product-info-content');
    if (productInfoContent) {
        productInfoContent.innerHTML = `
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">SKU</span>
                    <span class="font-semibold text-gray-900">${product.sku || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Stock Quantity</span>
                    <span class="font-semibold text-gray-900">${product.stockQty} units</span>
                </div>
            </div>
        `;
    }
}

async function loadRelatedProducts(categoryId) {
    try {
        const response = await fetch(`api/single-products/related-products?productId=${productId}&categoryId=${categoryId || ''}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.products) {
                renderRelatedProducts(data.products);
            }
        }
    } catch (e) {
        console.error("Error loading related products:", e);
    }
}

function renderRelatedProducts(products) {
    const container = document.querySelector('.related-products-grid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No related products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div class="relative h-48 overflow-hidden">
                <a href="product.html?id=${product.id}">
                    <img src="${fixImageUrl(product.image || '')}" 
                         alt="${product.title}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                </a>
                ${product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? 
                    '<span class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Sale</span>' : ''}
            </div>
            <div class="p-5">
                <a href="product.html?id=${product.id}">
                    <h4 class="text-lg font-bold text-gray-800 mb-2 hover:text-orange-600 transition">${product.title}</h4>
                </a>
                <p class="text-gray-600 text-sm mb-3">${product.shortDescription || ''}</p>
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <span class="text-2xl font-bold text-orange-600">$${product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? product.salePrice.toFixed(2) : product.price.toFixed(2)}</span>
                        ${product.salePrice && product.salePrice > 0 && product.salePrice < product.price ? 
                            `<span class="text-sm text-gray-400 line-through ml-2">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                </div>
                <button onclick="addToCartFromProduct(${product.id})" class="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold">
                    <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function initEventListeners() {
    // Quantity controls
    const quantityInput = document.getElementById('quantityInput');
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                if (quantityInput) quantityInput.value = currentQuantity;
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            if (currentProduct && currentQuantity < currentProduct.stockQty) {
                currentQuantity++;
                if (quantityInput) quantityInput.value = currentQuantity;
            }
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            let value = parseInt(e.target.value) || 1;
            if (value < 1) value = 1;
            if (currentProduct && value > currentProduct.stockQty) value = currentProduct.stockQty;
            currentQuantity = value;
            e.target.value = value;
        });
    }

    // Add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCartFromProduct(currentProduct.id, currentQuantity);
        });
    }

    // Add to wishlist button
    const addToWishlistBtn = document.querySelector('.add-to-wishlist-btn');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', () => {
            toggleWishlistFromProduct();
        });
    }

    // Wishlist heart button
    const wishlistHeartBtn = document.querySelector('.wishlist-heart-btn');
    if (wishlistHeartBtn) {
        wishlistHeartBtn.addEventListener('click', () => {
            toggleWishlistFromProduct();
        });
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(b => {
                b.classList.remove('border-orange-500', 'text-orange-600');
                b.classList.add('text-gray-500');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            // Add active class to clicked tab
            btn.classList.add('border-orange-500', 'text-orange-600');
            btn.classList.remove('text-gray-500');
            
            const tabName = btn.dataset.tab || btn.textContent.trim().toLowerCase();
            const content = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
            if (content) {
                content.classList.remove('hidden');
            }
        });
    });
}

async function checkWishlistStatus() {
    if (window.SausageApp && window.SausageApp.wishlist) {
        isInWishlist = window.SausageApp.wishlist.includes(parseInt(productId));
        updateWishlistButton();
    }
}

function updateWishlistButton() {
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    const heartBtn = document.querySelector('.wishlist-heart-btn i');
    
    if (wishlistBtn) {
        if (isInWishlist) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart text-red-500"></i> Remove from Wishlist';
            wishlistBtn.classList.add('bg-red-50', 'border-red-500', 'text-red-600');
            wishlistBtn.classList.remove('border-orange-500', 'text-orange-600');
        } else {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Wishlist';
            wishlistBtn.classList.remove('bg-red-50', 'border-red-500', 'text-red-600');
            wishlistBtn.classList.add('border-orange-500', 'text-orange-600');
        }
    }
    
    if (heartBtn) {
        if (isInWishlist) {
            heartBtn.classList.add('text-red-500');
            heartBtn.classList.remove('text-gray-500');
        } else {
            heartBtn.classList.remove('text-red-500');
            heartBtn.classList.add('text-gray-500');
        }
    }
}

async function addToCartFromProduct(productId, quantity = 1) {
    if (!currentProduct || currentProduct.stockQty <= 0) {
        Notiflix.Notify.failure("Product is out of stock!", {
            position: 'center-top'
        });
        return;
    }

    if (window.SausageApp && window.SausageApp.addToCart) {
        await window.SausageApp.addToCart(productId, quantity);
    } else {
        // Fallback to direct API call
        try {
            const response = await fetch(`api/carts/add-to-cart?pid=${productId}&qty=${quantity}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    Notiflix.Notify.success(data.message || "Added to cart!", {
                        position: 'center-top'
                    });
                } else {
                    Notiflix.Notify.failure(data.message, {
                        position: 'center-top'
                    });
                }
            }
        } catch (e) {
            Notiflix.Notify.failure("Failed to add to cart", {
                position: 'center-top'
            });
        }
    }
}

async function toggleWishlistFromProduct() {
    if (window.SausageApp && window.SausageApp.toggleWishlist) {
        await window.SausageApp.toggleWishlist(productId);
        isInWishlist = !isInWishlist;
        updateWishlistButton();
    }
}

// Listen for wishlist updates
document.addEventListener('wishlistUpdated', (e) => {
    if (e.detail && e.detail.wishlist) {
        isInWishlist = e.detail.wishlist.includes(parseInt(productId));
        updateWishlistButton();
    }
});
