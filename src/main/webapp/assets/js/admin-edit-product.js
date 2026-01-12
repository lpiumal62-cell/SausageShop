let currentProductId = null;

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

window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Loading product data...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProductId = urlParams.get('id');
        
        if (!currentProductId) {
            Notiflix.Notify.failure("Product ID is missing!", {
                position: 'center-top'
            });
            setTimeout(() => {
                window.location.href = "admin-products.html";
            }, 2000);
            return;
        }

        document.getElementById("productId").value = currentProductId;
        
        await Promise.all([
            loadCategories(),
            loadProduct(currentProductId)
        ]);
    } catch (error) {
        Notiflix.Notify.failure("Error loading data: " + error.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadProduct(productId) {
    try {
        const response = await fetch(`api/admin/products/${productId}`, {
            method: "GET",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.product) {
                populateForm(data.product);
            } else {
                Notiflix.Notify.failure(data.message || "Product not found!", {
                    position: 'center-top'
                });
                setTimeout(() => {
                    window.location.href = "admin-products.html";
                }, 2000);
            }
        } else {
            Notiflix.Notify.failure("Failed to load product!", {
                position: 'center-top'
            });
            setTimeout(() => {
                window.location.href = "admin-products.html";
            }, 2000);
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
        setTimeout(() => {
            window.location.href = "admin-products.html";
        }, 2000);
    }
}

function populateForm(product) {
    // Basic info
    document.getElementById("productTitle").value = product.title || "";
    document.getElementById("shortDescription").value = product.shortDescription || "";
    document.getElementById("longDescription").value = product.longDescription || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productStock").value = product.stockQuantity || "";
    document.getElementById("salePrice").value = product.salePrice && product.salePrice > 0 ? product.salePrice : "";
    document.getElementById("productSKU").value = product.sku || "";
    document.getElementById("ingredients").value = product.ingredients || "";
    
    // Nutrition
    document.getElementById("nutritionCalories").value = product.calories && product.calories > 0 ? product.calories : "";
    document.getElementById("nutritionProtein").value = product.protein && product.protein > 0 ? product.protein : "";
    document.getElementById("nutritionFat").value = product.fat && product.fat > 0 ? product.fat : "";
    document.getElementById("nutritionCarbs").value = product.carbs && product.carbs > 0 ? product.carbs : "";
    
    // Category
    const categorySelect = document.getElementById("productCategory");
    if (product.categoryId) {
        categorySelect.value = product.categoryId;
    }
    
    // Images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach((imageUrl, index) => {
            if (index < 3) { // Only show first 3 images
                const slotNumber = index + 1;
                const previewImg = document.getElementById(`previewImg${slotNumber}`);
                const preview = document.getElementById(`preview${slotNumber}`);
                const uploadArea = document.getElementById(`uploadArea${slotNumber}`);
                
                // Handle image URL using fixImageUrl function
                let imgUrl = fixImageUrl(imageUrl);
                
                if (previewImg && preview && uploadArea && imgUrl) {
                    previewImg.src = imgUrl;
                    preview.classList.remove('hidden');
                    uploadArea.classList.add('hidden');
                }
            }
        });
    }
}

async function loadCategories() {
    try {
        const response = await fetch("api/products/categories");
        if (response.ok) {
            const data = await response.json();
            const productCategory = document.getElementById("productCategory");
            renderDropdowns(productCategory, data.categories, 'name');
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
    const currentValue = selector.value; // Save current value
    selector.innerHTML = `<option value="0">Select</option>`;
    list.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.innerHTML = item[suffix];
        selector.appendChild(option);
    });
    // Restore current value if it exists
    if (currentValue) {
        selector.value = currentValue;
    }
}

async function updateProduct() {
    if (!currentProductId) {
        Notiflix.Notify.failure("Product ID is missing!", {
            position: 'center-top'
        });
        return;
    }

    Notiflix.Loading.pulse("Updating product...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let productTitle = document.getElementById("productTitle");
    let shortDescription = document.getElementById("shortDescription");
    let longDescription = document.getElementById("longDescription");
    let productCategory = document.getElementById("productCategory");
    let productPrice = document.getElementById("productPrice");
    let productStock = document.getElementById("productStock");
    let salePrice = document.getElementById("salePrice");
    let productSKU = document.getElementById("productSKU");
    let ingredients = document.getElementById("ingredients");
    let nutritionCalories = document.getElementById("nutritionCalories");
    let nutritionFat = document.getElementById("nutritionFat");
    let nutritionCarbs = document.getElementById("nutritionCarbs");
    let nutritionProtein = document.getElementById("nutritionProtein");

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    // Validate required fields
    if (!productTitle.value.trim()) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("Product title is required!", {
            position: 'center-top'
        });
        return;
    }

    if (!productCategory.value || productCategory.value === "0") {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("Category is required!", {
            position: 'center-top'
        });
        return;
    }

    const productData = {
        title: productTitle.value.trim(),
        shortDescription: shortDescription.value.trim(),
        longDescription: longDescription.value.trim(),
        categoryId: parseInt(productCategory.value),
        price: parseFloat(productPrice.value),
        stockQty: parseInt(productStock.value),
        salePrice: salePrice.value && salePrice.value.trim() ? parseFloat(salePrice.value) : null,
        sku: productSKU.value.trim(),
        ingredients: ingredients.value.trim(),
        calories: nutritionCalories.value && nutritionCalories.value.trim() ? parseFloat(nutritionCalories.value) : null,
        fat: nutritionFat.value && nutritionFat.value.trim() ? parseFloat(nutritionFat.value) : null,
        carbs: nutritionCarbs.value && nutritionCarbs.value.trim() ? parseFloat(nutritionCarbs.value) : null,
        protein: nutritionProtein.value && nutritionProtein.value.trim() ? parseFloat(nutritionProtein.value) : null
    };

    const formData = new FormData();
    formData.append("product", JSON.stringify(productData));

    // Only append images if new files are selected
    if (img1.files[0]) formData.append("images", img1.files[0]);
    if (img2.files[0]) formData.append("images", img2.files[0]);
    if (img3.files[0]) formData.append("images", img3.files[0]);

    try {
        const response = await fetch(`api/products/update-product/${currentProductId}`, {
            method: "PUT",
            body: formData,
            credentials: "include"
        });
    
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    "SausageShop",
                    data.message || "Product updated successfully!",
                    "Okay",
                    () => {
                        window.location.href = "admin-products.html";
                    }
                );
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Product update failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
}