/**
 * home.js
 * Page-specific interactions for index.html.
 */
(function () {
    const products = [
        {
            id: 'classic-bratwurst',
            name: 'Classic Bratwurst',
            price: 12.99,
            rating: 4.9,
            badge: 'Best Seller',
            image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=60',
        },
        {
            id: 'smoked-chicken',
            name: 'Smoked Chicken Sausage',
            price: 10.5,
            rating: 4.8,
            badge: 'Smoked',
            image: 'https://images.unsplash.com/photo-1446000442451-e162542e5f63?auto=format&fit=crop&w=600&q=60',
        },
        {
            id: 'jalapeno-cheddar',
            name: 'Jalapeño Cheddar',
            price: 13.75,
            rating: 4.7,
            badge: 'Spicy',
            image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=60',
        },
        {
            id: 'herb-garlic',
            name: 'Herb & Garlic',
            price: 11.25,
            rating: 4.8,
            badge: 'Gourmet',
            image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=60',
        },
    ];

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

    /* ------------------------------------------------------------------ */
    /* Preloader                                                          */
    /* ------------------------------------------------------------------ */
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        const hide = () => preloader.classList.add('opacity-0', 'pointer-events-none');
        window.addEventListener('load', hide);
        setTimeout(hide, 2000); // fallback
    }

    /* ------------------------------------------------------------------ */
    /* Products Grid                                                      */
    /* ------------------------------------------------------------------ */
    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = products
            .map(
                (product) => `
                <article class="product-card bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col border border-gray-100 group">
                    <div class="relative overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover transition-transform duration-700">
                        <span class="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg badge-pulse z-10">${product.badge}</span>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div class="p-6 flex flex-col flex-1">
                        <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">${product.name}</h3>
                        <div class="flex items-center space-x-2 text-sm mb-4">
                            <div class="flex items-center">
                                ${Array.from({ length: 5 }, (_, i) => 
                                    `<i class="fas fa-star ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}"></i>`
                                ).join('')}
                            </div>
                            <span class="text-gray-600 font-medium">${product.rating}</span>
                        </div>
                        <div class="mt-auto pt-4 border-t border-gray-100">
                            <div class="flex items-center justify-between mb-4">
                                <p class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">$${product.price.toFixed(2)}</p>
                            </div>
                            <div class="flex space-x-3">
                                <button class="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105 btn-primary"
                                    data-add-to-cart="${product.id}">
                                    <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                                </button>
                                <button class="w-14 h-12 rounded-xl border-2 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all group/wish"
                                    data-wishlist-toggle="${product.id}">
                                    <i class="fas fa-heart group-hover/wish:scale-110 transition-transform"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>`,
            )
            .join('');
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
    /* Category Cards                                                     */
    /* ------------------------------------------------------------------ */
    function initCategoryCards() {
        const cards = document.querySelectorAll('.category-card');
        if (cards.length === 0) return;

        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => card.classList.add('shadow-xl', '-translate-y-1'));
            card.addEventListener('mouseleave', () => card.classList.remove('shadow-xl', '-translate-y-1'));
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                dispatchCategoryFilter(category);
            });
        });
    }

    function dispatchCategoryFilter(category) {
        document.dispatchEvent(
            new CustomEvent('categorySelected', {
                detail: { category },
            }),
        );
    }

    /* ------------------------------------------------------------------ */
    /* Bootstrapping                                                      */
    /* ------------------------------------------------------------------ */
    function initHomePage() {
        initPreloader();
        renderProducts();
        initWishlistButtons();
        renderReviews();
        initReviewSlider();
        initCounters();
        initCategoryCards();
    }

    document.addEventListener('appReady', initHomePage);
})();


