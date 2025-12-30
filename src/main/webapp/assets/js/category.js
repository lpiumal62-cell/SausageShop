async function saveCategory() {
    Notiflix.Loading.pulse("Saving category...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let categoryName = document.getElementById("categoryName");
    let categoryDescription = document.getElementById("categoryDescription");
    let categoryImage = document.getElementById("categoryImage");

    if (!categoryName.value || categoryName.value.trim() === "") {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("Category name is required!", {
            position: 'center-top'
        });
        return;
    }

    if (!categoryImage.files || categoryImage.files.length === 0) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("Category image is required!", {
            position: 'center-top'
        });
        return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("categoryName", categoryName.value.trim());
    
    if (categoryDescription.value && categoryDescription.value.trim() !== "") {
        formData.append("categoryDescription", categoryDescription.value.trim());
    }
    
    formData.append("categoryImage", categoryImage.files[0]);

    try {
        const response = await fetch("api/products/save-category", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            if (data.status) {
                Notiflix.Report.success(
                    "SausageShop",
                    data.message || "Category added successfully!",
                    "Okay",
                    () => {
                        // Reset form and redirect
                        window.location.href = "admin-settings.html";
                    }
                );
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Category adding failed!", {
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
