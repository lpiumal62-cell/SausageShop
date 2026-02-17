
(function () {
    const reviews = [
        {
            quote: 'These sausages are the highlight of every family BBQ!',
            name: 'Olivia Martinez',
            role: 'Food Blogger',
            rating: 5,
        },
        {
            quote: 'Incredible quality and fast delivery — we keep coming back.',
            name: 'James Parker',
            role: 'Chef, Urban Bistro',
            rating: 5,
        },
        {
            quote: 'Rich flavors, perfect texture, and locally sourced ingredients.',
            name: 'Sophia Bennett',
            role: 'Nutritionist',
            rating: 4.8,
        },
    ];
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        const hide = () => preloader.classList.add('opacity-0', 'pointer-events-none');
        window.addEventListener('load', hide);
        setTimeout(hide, 2000); // fallback
    }
    function initWishlistButtons() {
        document.querySelectorAll('[data-wishlist-toggle]').forEach((button) => {
            button.addEventListener('click', () => {
                const productId = button.dataset.wishlistToggle;
                window.SausageApp?.toggleWishlist(productId);
                button.classList.toggle('text-red-500');
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /* Reviews Slider                                                     */
    /* ------------------------------------------------------------------ */
    function renderReviews() {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;

        container.innerHTML = reviews
            .map(
                (review) => `
                <div class="min-w-full px-6">
                    <div class="bg-white rounded-3xl shadow-xl p-10 h-full flex flex-col justify-between border border-gray-100 hover:shadow-2xl transition-all">
                        <div>
                            <div class="flex items-center space-x-1 mb-6">
                                ${Array.from({ length: 5 }, (_, i) =>
                                    `<i class="fas fa-star ${i < Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'} text-xl"></i>`
                                ).join('')}
                            </div>
                            <div class="mb-6">
                                <i class="fas fa-quote-left text-4xl text-orange-200 mb-4"></i>
                                <p class="text-gray-700 text-xl italic leading-relaxed">"${review.quote}"</p>
                            </div>
                        </div>
                        <div class="mt-8 pt-6 border-t border-gray-100">
                            <p class="font-bold text-gray-900 text-lg">${review.name}</p>
                            <p class="text-sm text-orange-600 font-medium">${review.role}</p>
                        </div>
                    </div>
                </div>`,
            )
            .join('');
    }

    function initReviewSlider() {
        const container = document.getElementById('reviewsContainer');
        const dots = document.querySelectorAll('.review-dot');
        if (!container || dots.length === 0) return;

        let currentIndex = 0;

        const goToSlide = (index) => {
            currentIndex = index;
            container.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, idx) =>
                dot.classList.toggle('bg-orange-500', idx === index),
            );
            dots.forEach((dot, idx) =>
                dot.classList.toggle('bg-gray-300', idx !== index),
            );
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => goToSlide(Number(dot.dataset.slide)));
        });

        setInterval(() => {
            const next = (currentIndex + 1) % dots.length;
            goToSlide(next);
        }, 5000);
    }

    /* ------------------------------------------------------------------ */
    /* Counters                                                           */
    /* ------------------------------------------------------------------ */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.4 },
        );

        counters.forEach((counter) => observer.observe(counter));
    }

    function animateCounter(element) {
        const target = Number(element.dataset.target || 0);
        const duration = 2000;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            element.textContent = Math.floor(progress * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
    /* ------------------------------------------------------------------ */
    /* Featured Products                                                  */
    /* ------------------------------------------------------------------ */
    function loadFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        fetch('/sausageShop/api/shop/products')
            .then(response => response.json())
            .then(data => {
                if (data.products && data.products.length > 0) {
                    const featured = data.products.slice(0, 4); // Get first 4 products
                    renderFeaturedProducts(featured);
                } else {
                    container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No featured products available</div>';
                }
            })
            .catch(error => {
                console.error('Error loading featured products:', error);
                container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Error loading products</div>';
            });
    }

    function renderFeaturedProducts(products) {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        container.innerHTML = products.map(product => {
            const imageUrl = product.images && product.images.length > 0 
                ? `/sausageShop/${product.images[0]}` 
                : 'https://via.placeholder.com/300x300?text=No+Image';
            const price = product.salePrice || product.price;
            const originalPrice = product.salePrice ? product.price : null;
            const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null;

            return `
                <div class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 transform hover:-translate-y-2">
                    <div class="relative overflow-hidden">
                        <img src="${imageUrl}" alt="${product.title}" 
                             class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300">
                        ${discount ? `<div class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">-${discount}%</div>` : ''}
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <a href="product.html?id=${product.id}" 
                               class="opacity-0 group-hover:opacity-100 bg-white text-orange-600 px-6 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all">
                                View Details
                            </a>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">${product.title}</h3>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.shortDescription || ''}</p>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-orange-600">$${price.toFixed(2)}</span>
                                ${originalPrice ? `<span class="text-gray-400 line-through text-sm">$${originalPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button onclick="window.SausageApp?.addToCart(${product.id}, 1)" 
                                    class="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-all transform hover:scale-110">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function initHomePage() {
        initPreloader();
        initWishlistButtons();
        renderReviews();
        initReviewSlider();
        initCounters();
        loadFeaturedProducts();
    }

    document.addEventListener('appReady', initHomePage);
})();


