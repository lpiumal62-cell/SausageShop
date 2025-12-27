window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Data is loading", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {
        await loadCategories();
    } finally {
        Notiflix.Loading.remove();
    }
});



async function productImages(productId) {

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    if (!img1.files.length && !img2.files.length && !img3.files.length) {
        Notiflix.Notify.failure(
            "At least one product image is required!",
            { position: "center-top" }
        );
        return;
    }

    const formData = new FormData();

    if (img1.files[0]) formData.append("images", img1.files[0]);
    if (img2.files[0]) formData.append("images", img2.files[0]);
    if (img3.files[0]) formData.append("images", img3.files[0]);

    try {
        const response = await fetch(`api/products/${productId}/upload-images`, {
            method: "PUT",
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.status) {
            Notiflix.Report.success("SmartTrade", data.message, "Okay");
        } else {
            Notiflix.Notify.failure(data.message, { position: "center-top" });
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message, { position: "center-top" });
    }
}


async function saveProduct() {
    Notiflix.Loading.pulse("Saving product...", {
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

    // Get image files
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");

    // Validate that at least one image is provided
    if (!img1.files.length && !img2.files.length && !img3.files.length) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("At least one product image is required!", {
            position: 'center-top'
        });
        return;
    }

    const productData = {
        title: productTitle.value,
        shortDescription: shortDescription.value,
        longDescription: longDescription.value,
        categoryId: parseInt(productCategory.value),
        price: parseFloat(productPrice.value),
        stockQty: parseInt(productStock.value),
        salePrice: salePrice.value ? parseFloat(salePrice.value) : null,
        sku: productSKU.value,
        ingredients: ingredients.value,
        calories: nutritionCalories.value ? parseFloat(nutritionCalories.value) : null,
        fat: nutritionFat.value ? parseFloat(nutritionFat.value) : null,
        carbs: nutritionCarbs.value ? parseFloat(nutritionCarbs.value) : null,
        protein: nutritionProtein.value ? parseFloat(nutritionProtein.value) : null
    };

    const formData = new FormData();
    formData.append("product", JSON.stringify(productData));
    
    // Add images to form data
    if (img1.files[0]) formData.append("images", img1.files[0]);
    if (img2.files[0]) formData.append("images", img2.files[0]);
    if (img3.files[0]) formData.append("images", img3.files[0]);

    try {
        const response = await fetch("api/products/save-product", {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data.status) {
                Notiflix.Report.success(
                    "SausageShop",
                    data.message || "Product added successfully!",
                    "Okay",
                    () => {
                        // Reset form or redirect
                        window.location.reload();
                    }
                );
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Product details adding failed!", {
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

async function loadCategories() {

    try {
        const response = await fetch("api/products/categories");
        if (response.ok) {
            const data = await response.json();
            // console.log(data);
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
    selector.innerHTML = `<option value="0">Select</option>`;
    list.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.innerHTML = item[suffix];
        selector.appendChild(option);
    });

}

async function logOut() {
    // alert("ok");
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/admin/logout", {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {

            Notiflix.Report.success(
                'SausageShop Admin Panel',
                "Logout successful",
                'Okay',
                () => {
                    window.location = "admin-login.html";
                }
            );
        } else {
            Notiflix.Notify.failure("Something went wrong. Logout failed!", {
                position: 'center-top'
            });
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove(1000);
    }
}