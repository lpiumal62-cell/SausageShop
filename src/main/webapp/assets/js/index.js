window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {

        await loadCategories();
    } finally {
        Notiflix.Loading.remove();
    }
});


async function loadCategories() {
    try {
        const categoriesGrid = document.getElementById("categoriesGrid");
        if (!categoriesGrid) return;
        categoriesGrid.innerHTML = "";
        const response = await fetch("api/index/categories");
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const categories = data.category || [];
            if (categories.length === 0) {
                return;
            }
            categoriesGrid.innerHTML = categories.map((category, index) => {
                const imageUrl = category.image && category.image.trim() !== '' 
                    ? category.image 
                    : 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(category.name);
                const description = category.description && category.description.trim() !== '' 
                    ? category.description 
                    : null;
                return `
                    <div class="category-card group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer border border-gray-100 transform hover:-translate-y-2" data-category="${category.id}">
                        <div class="relative h-40 overflow-hidden">
                            <img src="${imageUrl}" alt="${category.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(category.name)}'">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        <div class="p-4 text-center">
                            <h3 class="text-lg font-bold text-gray-800 mb-1">${category.name}</h3>
                            ${description ? `<p class="text-xs text-gray-500 mt-1 line-clamp-2">${description}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            if (typeof Notiflix !== 'undefined') {
                Notiflix.Notify.failure("Categories loading failed!", {
                    position: 'center-top'
                });
            }
        }
    } catch (e) {
        console.error('Error loading categories:', e);
        if (typeof Notiflix !== 'undefined') {
            Notiflix.Notify.failure(e.message, {
                position: 'center-top'
            });
        }
    }
}

