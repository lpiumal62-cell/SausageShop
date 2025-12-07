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
            description: 'Traditional German-style sausage with a juicy bite.',
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
            description: 'Applewood smoked chicken with herbs.',
        },
        {
            id: 'jalapeno-cheddar',
            name: 'Jalapeno Cheddar',
            price: 13.75,
            compareAt: 15.75,
            rating: 4.7,
            tag: 'Spicy',
            badge: 'Spicy',
            image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=60',
            description: 'Bold heat balanced with creamy cheddar.',
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
            description: 'Mediterranean herbs and roasted garlic.',
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
            description: 'Decadent blend of gouda and shaved truffle.',
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
            description: 'Sweet maple infused breakfast links.',
        },
    ];

    if (!window.SausageCatalog) {
        window.SausageCatalog = DEFAULT_CATALOG;
    }

    const catalogIndex = window.SausageCatalog.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
    }, {});

    const COUPONS = {
        NEW15: { label: 'New customer', type: 'percent', value: 0.15 },
        SAUSAGE10: { label: 'Loyalty treat', type: 'fixed', value: 10 },
    };

    const elements = {};
    const state = {
        items: [],
        shippingMethod: 'standard',
        coupon: null,
    };

    document.addEventListener('appReady', initCartPage);
    document.addEventListener('cartUpdated', syncCart);

    function initCartPage() {
        cacheElements();
        if (!elements.cartContent) return;
        bindEvents();
        hydrateState();
        renderAll();
    }

    function cacheElements() {
        elements.cartEmpty = document.getElementById('cartEmpty');
        elements.cartContent = document.getElementById('cartContent');
        elements.cartItems = document.getElementById('cartItems');
        elements.count = document.getElementById('cartItemsCount');
        elements.subtotal = document.getElementById('subtotal');
        elements.shipping = document.getElementById('shipping');
        elements.tax = document.getElementById('tax');
        elements.total = document.getElementById('total');
        elements.couponInput = document.getElementById('cartCouponInput');
        elements.couponApply = document.getElementById('cartApplyCoupon');
        elements.couponMessage = document.getElementById('cartCouponMessage');
        elements.couponRow = document.getElementById('cartCouponRow');
        elements.clearBtn = document.getElementById('cartClearBtn');
        elements.saveBtn = document.getElementById('cartSaveForLater');
        elements.recommendations = document.getElementById('cartRecommendations');
        elements.recommendationGrid = document.getElementById('cartRecommendationGrid');
        elements.deliveryStandard = document.getElementById('deliveryStandard');
        elements.deliveryExpress = document.getElementById('deliveryExpress');
    }

    function bindEvents() {
        elements.couponApply?.addEventListener('click', applyCouponFromInput);
        elements.couponInput?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyCouponFromInput();
            }
        });

        elements.clearBtn?.addEventListener('click', () => window.SausageApp?.clearCart());
        elements.saveBtn?.addEventListener('click', () =>
            alert('Items saved for later! Sign in to access them anytime.'),
        );

        elements.deliveryStandard?.addEventListener('click', () => selectShipping('standard'));
        elements.deliveryExpress?.addEventListener('click', () => selectShipping('express'));
    }

    function syncCart() {
        hydrateState();
        renderAll();
    }

    function hydrateState() {
        const cart = window.SausageApp?.cart || [];
        state.items = cart
            .map((entry) => {
                const product = catalogIndex[entry.id];
                if (!product) return null;
                return {
                    ...product,
                    quantity: entry.quantity || 1,
                };
            })
            .filter(Boolean);
    }

    function renderAll() {
        const hasItems = state.items.length > 0;
        elements.cartEmpty?.classList.toggle('hidden', hasItems);
        elements.cartContent?.classList.toggle('hidden', !hasItems);
        const totalUnits = state.items.reduce((sum, item) => sum + item.quantity, 0);
        if (elements.count) elements.count.textContent = hasItems ? totalUnits : 0;

        if (!hasItems) {
            elements.recommendations?.classList.add('hidden');
            updateSummary(0, 0, 0, 0);
            return;
        }

        renderCartItems();
        renderRecommendations();
        updateSummaryFromItems();
        highlightShippingSelection();
    }

    function renderCartItems() {
        elements.cartItems.innerHTML = state.items
            .map((item) => {
                const lineTotal = item.price * item.quantity;
                return `
                <article class="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-lg transition" data-cart-item="${item.id}">
                    <div class="relative">
                        <img src="${item.image}" alt="${item.name}" class="w-36 h-32 object-cover rounded-2xl">
                        <span class="absolute top-2 left-2 bg-white text-xs font-bold px-3 py-1 rounded-full shadow">${item.badge}</span>
                    </div>
                    <div class="flex-1 flex flex-col">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-gray-400">${item.tag}</p>
                                <h3 class="text-lg font-semibold text-gray-900">${item.name}</h3>
                                <p class="text-sm text-gray-500 mt-1">${item.description}</p>
                            </div>
                            <button class="text-gray-400 hover:text-red-500" data-remove-item="${item.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-3 mt-3 text-sm text-amber-500">
                            <i class="fas fa-star"></i>
                            <span>${item.rating.toFixed(1)} rating</span>
                        </div>
                        <div class="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
                            <div class="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-2 w-max">
                                <button class="w-8 h-8 rounded-full bg-white border text-xl" data-qty-decrease="${item.id}">-</button>
                                <span class="text-lg font-semibold w-10 text-center">${item.quantity}</span>
                                <button class="w-8 h-8 rounded-full bg-orange-500 text-white text-xl" data-qty-increase="${item.id}">+</button>
                            </div>
                            <div class="text-right">
                                <p class="text-xl font-bold text-gray-900">$${lineTotal.toFixed(2)}</p>
                                <p class="text-xs text-gray-400">($${item.price.toFixed(2)} each)</p>
                            </div>
                            <div class="flex gap-3 text-sm font-semibold">
                                <button class="text-orange-500 hover:text-orange-600" data-move-wishlist="${item.id}">
                                    <i class="fas fa-heart mr-1"></i>Save for later
                                </button>
                                <button class="text-gray-500 hover:text-gray-700" data-remove-item="${item.id}">Remove</button>
                            </div>
                        </div>
                    </div>
                </article>`;
            })
            .join('');

        elements.cartItems.querySelectorAll('[data-qty-increase]').forEach((button) => {
            button.addEventListener('click', () => adjustQuantity(button.dataset.qtyIncrease, 1));
        });
        elements.cartItems.querySelectorAll('[data-qty-decrease]').forEach((button) => {
            button.addEventListener('click', () => adjustQuantity(button.dataset.qtyDecrease, -1));
        });
        elements.cartItems.querySelectorAll('[data-remove-item]').forEach((button) => {
            button.addEventListener('click', () => removeItem(button.dataset.removeItem));
        });
        elements.cartItems.querySelectorAll('[data-move-wishlist]').forEach((button) => {
            button.addEventListener('click', () => moveToWishlist(button.dataset.moveWishlist));
        });
    }

    function adjustQuantity(productId, delta) {
        const entry = window.SausageApp?.cart?.find((item) => item.id === productId);
        if (!entry) return;
        const nextQty = Math.max(1, (entry.quantity || 1) + delta);
        window.SausageApp?.removeFromCart(productId);
        window.SausageApp?.addToCart(productId, nextQty);
    }

    function removeItem(productId) {
        window.SausageApp?.removeFromCart(productId);
    }

    function moveToWishlist(productId) {
        window.SausageApp?.toggleWishlist(productId);
        window.SausageApp?.removeFromCart(productId);
    }

    function renderRecommendations() {
        const idsInCart = new Set(state.items.map((item) => item.id));
        const suggestions = window.SausageCatalog.filter((product) => !idsInCart.has(product.id)).slice(0, 4);
        if (suggestions.length === 0) {
            elements.recommendations?.classList.add('hidden');
            return;
        }
        elements.recommendations?.classList.remove('hidden');
        elements.recommendationGrid.innerHTML = suggestions
            .map(
                (product) => `
                <article class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover">
                    <div class="p-4 space-y-3">
                        <div class="flex items-center justify-between text-xs text-gray-500">
                            <span>${product.tag}</span>
                            <span class="font-semibold text-orange-500">${product.badge}</span>
                        </div>
                        <h4 class="text-lg font-semibold text-gray-900">${product.name}</h4>
                        <div class="flex items-center justify-between">
                            <p class="text-xl font-bold text-gray-900">$${product.price.toFixed(2)}</p>
                            <button class="text-sm font-semibold text-orange-600 hover:text-orange-700" data-add-recommend="${product.id}">
                                Add <i class="fas fa-plus ml-1"></i>
                            </button>
                        </div>
                    </div>
                </article>`,
            )
            .join('');

        elements.recommendationGrid.querySelectorAll('[data-add-recommend]').forEach((button) => {
            button.addEventListener('click', () => window.SausageApp?.addToCart(button.dataset.addRecommend));
        });
    }

    function updateSummaryFromItems() {
        const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = state.shippingMethod === 'express' ? 12 : subtotal >= 75 ? 0 : 6.5;
        const tax = subtotal * 0.08;
        const discount = calculateDiscount(subtotal);
        const total = Math.max(subtotal + shipping + tax - discount, 0);
        updateSummary(subtotal, shipping, tax, total, discount);
    }

    function calculateDiscount(subtotal) {
        if (!state.coupon) return 0;
        const coupon = COUPONS[state.coupon];
        if (!coupon) return 0;
        return coupon.type === 'percent' ? subtotal * coupon.value : coupon.value;
    }

    function updateSummary(subtotal, shipping, tax, total, discount = 0) {
        elements.subtotal.textContent = formatCurrency(subtotal);
        elements.shipping.textContent = shipping === 0 ? 'Free' : formatCurrency(shipping);
        elements.tax.textContent = formatCurrency(tax);
        elements.total.textContent = formatCurrency(total);

        if (discount > 0) {
            elements.couponRow.classList.remove('hidden');
            elements.couponRow.innerHTML = `
                <span>Coupon applied</span>
                <span class="text-emerald-500">- ${formatCurrency(discount)}</span>`;
        } else {
            elements.couponRow.classList.add('hidden');
        }
    }

    function applyCouponFromInput() {
        const code = elements.couponInput.value.trim().toUpperCase();
        if (!code) return;
        if (!COUPONS[code]) {
            elements.couponMessage.textContent = 'Invalid coupon. Try SAUSAGE10 or NEW15.';
            elements.couponMessage.classList.remove('text-emerald-500');
            elements.couponMessage.classList.add('text-red-500');
            state.coupon = null;
        } else {
            state.coupon = code;
            elements.couponMessage.textContent = `${code} applied - ${COUPONS[code].label}!`;
            elements.couponMessage.classList.remove('text-red-500');
            elements.couponMessage.classList.add('text-emerald-500');
        }
        updateSummaryFromItems();
    }

    function selectShipping(method) {
        state.shippingMethod = method;
        updateSummaryFromItems();
        highlightShippingSelection();
    }

    function highlightShippingSelection() {
        const active = ['border-orange-400', 'bg-orange-50'];
        elements.deliveryStandard?.classList.remove(...active);
        elements.deliveryExpress?.classList.remove(...active);
        if (state.shippingMethod === 'standard') {
            elements.deliveryStandard?.classList.add(...active);
        } else {
            elements.deliveryExpress?.classList.add(...active);
        }
    }

    function formatCurrency(value) {
        return `$${value.toFixed(2)}`;
    }
})();

