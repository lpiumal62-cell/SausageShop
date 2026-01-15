function fixImageUrl(url) {
    if (!url || url.trim() === '') return '';

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

let allProducts = [];
let filteredProducts = [];

window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {
        await loadCategories();
        await loadProducts();
        initAdvancedSearchToggle();
        initAdvancedSearch();
    } finally {
        Notiflix.Loading.remove();
    }
});

function initAdvancedSearchToggle() {
    const toggleBtn = document.getElementById('advancedSearchToggle');
    const panel = document.getElementById('advancedSearchPanel');
    
    if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('i');
            if (panel.classList.contains('hidden')) {
                icon.className = 'fas fa-sliders-h';
            } else {
                icon.className = 'fas fa-chevron-up';
            }
        });
    }
}

async function loadCategories() {
    try {
        const response = await fetch("api/shops/categories");
        if (response.ok) {
            const data = await response.json();
            const categorySelect = document.getElementById("categorySelect");
            if (categorySelect && data.categories && Array.isArray(data.categories)) {
                renderDropdowns(categorySelect, data.categories, 'name');
                
                // Add change event listener
                categorySelect.addEventListener('change', function() {
                    const selectedCategoryId = this.value;
                    filterProductsByCategory(selectedCategoryId);
                });
            }
        } else {
            Notiflix.Notify.failure("Categories loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

function renderDropdowns(selector, list, suffix) {
    if (!selector || !list || !Array.isArray(list)) return;
    selector.innerHTML = `<option value="all">All Categories</option>`;
    list.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.innerHTML = item[suffix];
        selector.appendChild(option);
    });
    
    // Add change event listener for category filtering
    selector.addEventListener('change', function() {
        const selectedCategoryId = this.value;
        filterProductsByCategory(selectedCategoryId);
    });
}

async function loadProducts() {
    try {
        const response = await fetch("api/shops/products");
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || [];
            filteredProducts = [...allProducts];
            const productsGrid = document.getElementById("productsGrid");
            
            if (productsGrid && allProducts.length > 0) {
                renderProducts(allProducts);
                updateProductCount(allProducts.length);
            } else if (productsGrid) {
                showEmptyState();
            }
        } else {
            Notiflix.Notify.failure("Products loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    productsGrid.innerHTML = products.map(product => {
        let imageUrl = '';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = product.images[0];
        } else if (product.image && product.image.trim() !== '') {
            imageUrl = product.image;
        }
        
        // Fix image URL
        imageUrl = fixImageUrl(imageUrl);
        
        // Fallback to placeholder if still empty
        if (!imageUrl || imageUrl.trim() === '') {
            imageUrl = 'data:image/svg+xml,%3Csvg width=\'400\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Arial\' font-size=\'18\' fill=\'%239ca3af\' text-anchor=\'middle\' dy=\'.3em\'%3ENo Image%3C/text%3E%3C/svg%3E';
        }
        const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
        const displayPrice = hasSale ? product.salePrice : product.price;
        const originalPrice = hasSale ? product.price : null;
        
        return `
            <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group transform hover:-translate-y-2" 
                 data-product-id="${product.id}"
                 data-category-id="${product.categoryId || ''}"
                 data-price="${displayPrice}"
                 data-stock="${product.stockQty}"
                 data-on-sale="${hasSale}">
                <div class="relative h-48 overflow-hidden">
                    ${hasSale ? '<div class="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Sale</div>' : ''}
                    <a href="product.html?id=${product.id}" class="block w-full h-full">
                        <img 
                            src="${imageUrl}" 
                            alt="${product.title || 'Product'}" 
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer bg-gray-100"
                            loading="lazy"
                            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg width=\'400\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Arial\' font-size=\'18\' fill=\'%239ca3af\' text-anchor=\'middle\' dy=\'.3em\'%3ENo Image%3C/text%3E%3C/svg%3E';"
                        >
                    </a>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none"></div>
                </div>
                <div class="p-5">
                    <a href="product.html?id=${product.id}">
                        <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 cursor-pointer">${product.title}</h3>
                    </a>
                    ${product.shortDescription ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.shortDescription}</p>` : ''}
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <span class="text-2xl font-bold text-orange-600">$${displayPrice.toFixed(2)}</span>
                            ${originalPrice ? `<span class="text-sm text-gray-400 line-through ml-2">$${originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                        ${product.stockQty > 0 ? `<span class="text-xs text-green-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>In Stock</span>` : '<span class="text-xs text-red-500 font-semibold"><i class="fas fa-times-circle mr-1"></i>Out of Stock</span>'}
                    </div>
                    <div class="flex gap-2">
                        <button onclick="addToCart(${product.id}, ${product.stockQty});" class="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition transform hover:scale-105 font-semibold">
                            <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                        </button>
                        <button 
                            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition transform hover:scale-105"
                        >
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterProductsByCategory(categoryId) {
    console.log('Filtering products by category ID:', categoryId);
    if (categoryId === 'all' || categoryId === '0') {
        const productsGrid = document.getElementById("productsGrid");
        if (productsGrid) {
            const cards = productsGrid.querySelectorAll('[data-category-id]');
            cards.forEach(card => {
                card.style.display = 'block';
            });
        }
    } else {
        const productsGrid = document.getElementById("productsGrid");
        if (productsGrid) {
            const cards = productsGrid.querySelectorAll('[data-category-id]');
            cards.forEach(card => {
                const cardCategoryId = card.getAttribute('data-category-id');
                if (cardCategoryId !== categoryId.toString()) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'block';
                }
            });
        }
    }
}


function initAdvancedSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            applyFilters();
        }, 300));
    }

    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            applyFilters();
        });
    }

    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyFilters();
            Notiflix.Notify.success('Filters applied!', {
                position: 'center-top',
                timeout: 1500
            });
        });
    }

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearAllFilters();
        });
    }

    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const stockFilter = document.getElementById('stockFilter');
    const sortBy = document.getElementById('sortBy');
    const onSaleOnly = document.getElementById('onSaleOnly');
    
    if (minPrice) minPrice.addEventListener('input', debounce(applyFilters, 500));
    if (maxPrice) maxPrice.addEventListener('input', debounce(applyFilters, 500));
    if (stockFilter) stockFilter.addEventListener('change', applyFilters);
    if (sortBy) sortBy.addEventListener('change', applyFilters);
    if (onSaleOnly) onSaleOnly.addEventListener('change', applyFilters);
}

function applyFilters() {
    let products = [...allProducts];

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const searchTerm = searchInput.value.toLowerCase().trim();
        products = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm))
        );
    }

    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect && categorySelect.value && categorySelect.value !== '0' && categorySelect.value !== 'all') {
        const selectedCategory = categorySelect.value;
        products = products.filter(product => 
            product.categoryId && product.categoryId.toString() === selectedCategory
        );
    }

    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice && minPrice.value) {
        const min = parseFloat(minPrice.value);
        products = products.filter(product => {
            const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
            return price >= min;
        });
    }
    if (maxPrice && maxPrice.value) {
        const max = parseFloat(maxPrice.value);
        products = products.filter(product => {
            const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
            return price <= max;
        });
    }

    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter && stockFilter.value !== 'all') {
        if (stockFilter.value === 'instock') {
            products = products.filter(product => product.stockQty > 0);
        } else if (stockFilter.value === 'outofstock') {
            products = products.filter(product => product.stockQty === 0);
        }
    }

    const onSaleOnly = document.getElementById('onSaleOnly');
    if (onSaleOnly && onSaleOnly.checked) {
        products = products.filter(product => 
            product.salePrice && product.salePrice > 0 && product.salePrice < product.price
        );
    }

    const sortBy = document.getElementById('sortBy');
    if (sortBy && sortBy.value !== 'default') {
        products = sortProducts(products, sortBy.value);
    }
    
    filteredProducts = products;

    if (products.length > 0) {
        renderProducts(products);
        hideEmptyState();
    } else {
        showEmptyState();
    }
    
    updateProductCount(products.length);
    updateActiveFiltersCount();
}

function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch(sortType) {
        case 'price-low':
            return sorted.sort((a, b) => {
                const priceA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price;
                const priceB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price;
                return priceA - priceB;
            });
        case 'price-high':
            return sorted.sort((a, b) => {
                const priceA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price;
                const priceB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price;
                return priceB - priceA;
            });
        case 'name-az':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'name-za':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        case 'newest':
            return sorted.sort((a, b) => b.id - a.id);
        default:
            return sorted;
    }
}

function clearAllFilters() {

    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter) stockFilter.value = 'all';
    

    const sortBy = document.getElementById('sortBy');
    if (sortBy) sortBy.value = 'default';

    const onSaleOnly = document.getElementById('onSaleOnly');
    if (onSaleOnly) onSaleOnly.checked = false;
    

    applyFilters();
    
    Notiflix.Notify.info('Advanced filters cleared', {
        position: 'center-top',
        timeout: 1500
    });
}

function updateProductCount(count) {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
}

function updateActiveFiltersCount() {
    let activeCount = 0;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) activeCount++;
    
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect && categorySelect.value && categorySelect.value !== '0' && categorySelect.value !== 'all') activeCount++;
    
    const minPrice = document.getElementById('minPrice');
    if (minPrice && minPrice.value) activeCount++;
    
    const maxPrice = document.getElementById('maxPrice');
    if (maxPrice && maxPrice.value) activeCount++;
    
    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter && stockFilter.value !== 'all') activeCount++;
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy && sortBy.value !== 'default') activeCount++;
    
    const onSaleOnly = document.getElementById('onSaleOnly');
    if (onSaleOnly && onSaleOnly.checked) activeCount++;
    
    const activeFiltersCount = document.getElementById('activeFiltersCount');
    if (activeFiltersCount) {
        if (activeCount === 0) {
            activeFiltersCount.textContent = 'No filters active';
        } else {
            activeFiltersCount.textContent = `${activeCount} filter${activeCount !== 1 ? 's' : ''} active`;
        }
    }
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const productsGrid = document.getElementById('productsGrid');
    
    if (emptyState) emptyState.classList.remove('hidden');
    if (productsGrid) productsGrid.classList.add('hidden');
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const productsGrid = document.getElementById('productsGrid');
    
    if (emptyState) emptyState.classList.add('hidden');
    if (productsGrid) productsGrid.classList.remove('hidden');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
