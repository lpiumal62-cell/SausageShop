
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
    function initHomePage() {
        initPreloader();
        initWishlistButtons();
        renderReviews();
        initReviewSlider();
        initCounters();
    }

    document.addEventListener('appReady', initHomePage);
})();


