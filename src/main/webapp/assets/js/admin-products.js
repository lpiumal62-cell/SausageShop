window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Loading products...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {
        await loadProducts();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadProducts() {
    try {
        const response = await fetch("api/admin/products", {
            method: "GET",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.products) {
                renderProducts(data.products);
            } else {
                Notiflix.Notify.failure(data.message || "Failed to load products!", {
                    position: 'center-top'
                });
                document.getElementById("productsTableBody").innerHTML = 
                    '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">No products found</td></tr>';
            }
        } else {
            Notiflix.Notify.failure("Products loading failed!", {
                position: 'center-top'
            });
            document.getElementById("productsTableBody").innerHTML = 
                '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Error loading products</td></tr>';
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
        document.getElementById("productsTableBody").innerHTML = 
            '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Error loading products</td></tr>';
    }
}

function fixImageUrl(url) {
    if (!url || url.trim() === '') return '';
    
    // Fix wrong context path
    if (url.includes('/sausageSho/')) {
        url = url.replace('/sausageSho/', '/sausageShop/');
    }
    
    // If it's a relative path, ensure it starts with /sausageShop
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

function renderProducts(products) {
    const tbody = document.getElementById("productsTableBody");
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        // Handle image URL
        let imageUrl = fixImageUrl(product.image || '');
        
        // Fallback placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            const placeholderSvg = encodeURIComponent(`
                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="80" fill="#f3f4f6"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">No Image</text>
                </svg>
            `);
            imageUrl = `data:image/svg+xml,${placeholderSvg}`;
        }

        const displayPrice = product.salePrice && product.salePrice > 0 && product.salePrice < product.price 
            ? product.salePrice 
            : product.price;
        const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
        
        const stockStatus = product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
        const stockClass = product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600';

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="product-checkbox w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" data-product-id="${product.id}">
                </td>
                <td class="px-6 py-4">
                    <img src="${imageUrl}" alt="${product.title}" class="w-16 h-16 object-cover rounded" 
                         onerror="this.onerror=null; this.src='data:image/svg+xml,${encodeURIComponent(`<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>`)}';">
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${product.title || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-gray-700">${product.category || 'N/A'}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <span class="font-medium text-gray-900">$${displayPrice.toFixed(2)}</span>
                        ${hasSale ? `<span class="ml-2 text-sm text-gray-500 line-through">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="${stockClass} font-medium">${stockStatus}</span>
                    <div class="text-sm text-gray-500">Qty: ${product.stockQuantity}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-800 font-medium">
                            <i class="fas fa-edit mr-1"></i>Update
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-800 font-medium">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function editProduct(productId) {
    window.location.href = `admin-edit-product.html?id=${productId}`;
}

function deleteProduct(productId) {
    Notiflix.Confirm.show(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        'Yes',
        'No',
        function() {
            // Delete functionality can be implemented here
            Notiflix.Notify.info('Delete functionality to be implemented', {
                position: 'center-top'
            });
        }
    );
}