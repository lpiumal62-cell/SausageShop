(function () {
    const DEFAULT_CATALOG = [
        {
            id: 'classic-bratwurst',
            name: 'Classic Bratwurst',
            price: 12.99,
            compareAt: 14.99,
            rating: 4.9,
            tag: 'Classic',
            badge: 'Best Seller',
            image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=600&q=60',
            description: 'Traditional recipes with premium cuts.',
        },
        {
            id: 'smoked-chicken',
            name: 'Smoked Chicken Sausage',
            price: 10.5,
            compareAt: 12.5,
            rating: 4.8,
            tag: 'Smoked',
            badge: 'Lean Protein',
            image: 'https://images.unsplash.com/photo-1446000442451-e162542e5f63?auto=format&fit=crop&w=600&q=60',
            description: 'Naturally smoked with applewood.',
        },
        {
            id: 'jalapeno-cheddar',
            name: 'Jalapeno Cheddar',
            price: 13.75,
            compareAt: 15.75,
            rating: 4.7,
            tag: 'Spicy',
            badge: 'Heat Lovers',
            image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=60',
            description: 'Creamy cheddar with jalapeno kick.',
        },
        {
            id: 'herb-garlic',
            name: 'Herb & Garlic',
            price: 11.25,
            compareAt: 13.25,
            rating: 4.8,
            tag: 'Gourmet',
            badge: 'Chef Crafted',
            image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=60',
            description: 'Garden herbs and roasted garlic.',
        },
        {
            id: 'truffle-gouda',
            name: 'Black Truffle & Gouda',
            price: 16.95,
            compareAt: 19.95,
            rating: 4.9,
            tag: 'Limited',
            badge: 'Limited Batch',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60',
            description: 'Decadent truffle shavings with gouda.',
        },
        {
            id: 'maple-breakfast',
            name: 'Maple Breakfast Links',
            price: 9.95,
            compareAt: 11.5,
            rating: 4.6,
            tag: 'Breakfast',
            badge: 'Morning Favorite',
            image: 'https://images.unsplash.com/photo-1460306855393-0410f61241c7?auto=format&fit=crop&w=600&q=60',
            description: 'Sweet maple morning classic.',
        },
    ];

    if (!window.SausageCatalog) {
        window.SausageCatalog = DEFAULT_CATALOG;
    }

    const catalogIndex = window.SausageCatalog.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
    }, {});

    const elements = {};
    const state = {
        ids: [],
        items: [],
        sort: 'recent',
        activeTags: new Set(),
    };

    document.addEventListener('appReady', initWishlistPage);
    document.addEventListener('wishlistUpdated', syncWishlist);

    function initWishlistPage() {
        cacheElements();
        if (!elements.container) return;
        bindEvents();
        hydrateState();
        renderAll();
    }

    function cacheElements() {
        elements.container = document.getElementById('wishlistContent');
        elements.empty = document.getElementById('wishlistEmpty');
        elements.count = document.getElementById('wishlistItemCount');
        elements.savings = document.getElementById('wishlistSavings');
        elements.sortSelect = document.getElementById('wishlistSortSelect');
        elements.tagFilters = document.getElementById('wishlistTagFilters');
        elements.clearBtn = document.getElementById('wishlistClearBtn');
        elements.shareBtn = document.getElementById('wishlistShareBtn');
        elements.recommendations = document.getElementById('wishlistRecommendations');
        elements.recommendationGrid = document.getElementById('wishlistRecommendationGrid');
    }

    function bindEvents() {
        elements.sortSelect?.addEventListener('change', (event) => {
            state.sort = event.target.value;
            renderList();
        });

        elements.clearBtn?.addEventListener('click', () => {
            if (!state.items.length) return;
            if (confirm('Clear all items from your wishlist?')) {
                window.SausageApp?.clearWishlist?.();
            }
        });

        elements.shareBtn?.addEventListener('click', shareWishlist);
    }

    function syncWishlist() {
        hydrateState();
        renderAll();
    }

    function hydrateState() {
        const wishlist = window.SausageApp?.wishlist || [];
        state.ids = wishlist;
        state.items = wishlist
            .map((id) => catalogIndex[id])
            .filter(Boolean)
            .map((item, index) => ({ ...item, order: index }));

        state.availableTags = Array.from(new Set(state.items.map((item) => item.tag)));
    }

    function renderAll() {
        const hasItems = state.items.length > 0;
        elements.empty?.classList.toggle('hidden', hasItems);
        elements.container?.classList.toggle('hidden', !hasItems);
        elements.recommendations?.classList.toggle('hidden', !hasItems);

        elements.count.textContent = state.items.reduce((sum) => sum + 1, 0);
        const savings = state.items.reduce(
            (sum, item) => sum + Math.max(0, (item.compareAt || item.price) - item.price),
            0,
        );
        elements.savings.textContent = `$${savings.toFixed(2)}`;

        renderTagFilters();
        renderList();
        renderRecommendations();
    }

    function renderTagFilters() {
        if (!elements.tagFilters) return;
        if (!state.availableTags || state.availableTags.length === 0) {
            elements.tagFilters.innerHTML =
                '<p class="text-sm text-gray-400">Tags will appear once you add items.</p>';
            return;
        }

        elements.tagFilters.innerHTML = state.availableTags
            .map(
                (tag) => `
                <button class="px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-orange-400 transition ${state.activeTags.has(tag) ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-600'}" data-tag-filter="${tag}">
                    ${tag}
                </button>`,
            )
            .join('');

        elements.tagFilters.querySelectorAll('[data-tag-filter]').forEach((button) => {
            button.addEventListener('click', () => {
                const tag = button.dataset.tagFilter;
                if (state.activeTags.has(tag)) {
                    state.activeTags.delete(tag);
                } else {
                    state.activeTags.add(tag);
                }
                renderTagFilters();
                renderList();
            });
        });
    }

    function getFilteredItems() {
        let items = [...state.items];
        if (state.activeTags.size > 0) {
            items = items.filter((item) => state.activeTags.has(item.tag));
        }

        switch (state.sort) {
            case 'price_low':
                return items.sort((a, b) => a.price - b.price);
            case 'price_high':
                return items.sort((a, b) => b.price - a.price);
            case 'rating':
                return items.sort((a, b) => b.rating - a.rating);
            default:
                return items.sort((a, b) => b.order - a.order);
        }
    }

    function renderList() {
        if (!elements.container) return;
        if (state.items.length === 0) {
            elements.container.innerHTML = '';
            return;
        }

        const items = getFilteredItems();
        elements.container.innerHTML = items
            .map(
                (item) => `
                <article class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                    <div class="relative">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-56 object-cover">
                        <span class="absolute top-4 left-4 bg-white/90 text-xs font-bold px-4 py-1 rounded-full shadow">${item.badge}</span>
                        <button class="absolute top-4 right-4 text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/60" data-remove-wishlist="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-6 flex flex-col flex-1">
                        <p class="text-xs uppercase tracking-wide text-gray-400">${item.tag}</p>
                        <h3 class="text-2xl font-bold text-gray-900 mt-1">${item.name}</h3>
                        <p class="text-sm text-gray-500 mt-2 flex-1">${item.description}</p>
                        <div class="flex items-center gap-2 text-sm text-amber-500 mt-3">
                            <i class="fas fa-star"></i>
                            <span>${item.rating.toFixed(1)} average rating</span>
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <div>
                                <p class="text-3xl font-extrabold text-gray-900">$${item.price.toFixed(2)}</p>
                                ${
                                    item.compareAt && item.compareAt > item.price
                                        ? `<p class="text-sm text-emerald-500 font-semibold">Save $${(
                                              item.compareAt - item.price
                                          ).toFixed(2)}</p>`
                                        : ''
                                }
                            </div>
                            <div class="flex gap-3">
                                <button class="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:border-orange-400" data-move-wishlist="${item.id}">
                                    Remove
                                </button>
                                <button class="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-red-600" data-add-cart="${item.id}">
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                </article>`,
            )
            .join('');

        elements.container.querySelectorAll('[data-add-cart]').forEach((button) => {
            button.addEventListener('click', () => window.SausageApp?.addToCart(button.dataset.addCart));
        });

        elements.container.querySelectorAll('[data-remove-wishlist]').forEach((button) => {
            button.addEventListener('click', () => window.SausageApp?.toggleWishlist(button.dataset.removeWishlist));
        });

        elements.container.querySelectorAll('[data-move-wishlist]').forEach((button) => {
            button.addEventListener('click', () => window.SausageApp?.toggleWishlist(button.dataset.moveWishlist));
        });
    }

    function renderRecommendations() {
        if (!elements.recommendationGrid) return;
        const wishlistIds = new Set(state.ids);
        const suggestions = window.SausageCatalog.filter((item) => !wishlistIds.has(item.id)).slice(0, 4);
        if (suggestions.length === 0) {
            elements.recommendations?.classList.add('hidden');
            return;
        }
        elements.recommendations?.classList.remove('hidden');
        elements.recommendationGrid.innerHTML = suggestions
            .map(
                (product) => `
                <article class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition">
                    <div class="flex items-center gap-4">
                        <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-cover rounded-xl">
                        <div>
                            <p class="text-xs uppercase tracking-wide text-gray-400">${product.tag}</p>
                            <h4 class="text-lg font-semibold text-gray-900">${product.name}</h4>
                            <p class="text-sm text-gray-500">$${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <button class="mt-4 w-full text-sm font-semibold text-orange-600 hover:text-orange-700" data-add-recommend="${product.id}">
                        Add to cart <i class="fas fa-arrow-up-right-from-square ml-1"></i>
                    </button>
                </article>`,
            )
            .join('');

        elements.recommendationGrid.querySelectorAll('[data-add-recommend]').forEach((button) => {
            button.addEventListener('click', () => window.SausageApp?.addToCart(button.dataset.addRecommend));
        });
    }

    function shareWishlist() {
        if (!state.items.length) return;
        const text = `My Sausage Delight wishlist: ${state.items.map((item) => item.name).join(', ')}`;
        if (navigator.share) {
            navigator.share({
                title: 'My Sausage Wishlist',
                text,
                url: window.location.href,
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            elements.shareBtn.textContent = 'Copied!';
            setTimeout(() => (elements.shareBtn.textContent = 'Share List'), 1500);
        }
    }
})();

