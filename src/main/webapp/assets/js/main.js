
(function () {
    const STORAGE_KEYS = {
        USER: 'sd_user',
        CART: 'sd_cart',
        WISHLIST: 'sd_wishlist',
        THEME: 'sd_theme',
    };

    const state = {
        user: null,
        cart: [],
        wishlist: [],
    };


    const safeJSONParse = (value, fallback) => {
        if (!value) return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn('Failed to parse JSON from storage:', error);
            return fallback;
        }
    };

    const readStateFromStorage = () => {
        state.user = safeJSONParse(localStorage.getItem(STORAGE_KEYS.USER), null);
        state.cart = safeJSONParse(localStorage.getItem(STORAGE_KEYS.CART), []);
        state.wishlist = safeJSONParse(localStorage.getItem(STORAGE_KEYS.WISHLIST), []);
    };

    const persistState = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const dispatchGlobalEvent = (name, detail) => {
        document.dispatchEvent(new CustomEvent(name, { detail }));
    };



    function initThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        const root = document.documentElement;
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
        applyTheme(storedTheme);

        toggle.addEventListener('click', () => {
            const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
        });
    }

    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }

    function initUserMenu() {
        const btn = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userMenuDropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', () => dropdown.classList.toggle('hidden'));

        document.addEventListener('click', (event) => {
            if (
                dropdown.classList.contains('hidden') ||
                btn.contains(event.target) ||
                dropdown.contains(event.target)
            ) {
                return;
            }
            dropdown.classList.add('hidden');
        });
    }

    function initNavHighlight() {
        const currentPage = document.body.dataset.page;
        if (!currentPage) return;

        document.querySelectorAll('.nav-link').forEach((link) => {
            if (link.dataset.page === currentPage) {
                link.classList.add('text-orange-500');
            } else {
                link.classList.remove('text-orange-500');
            }
        });
    }

    function initAuthUI() {
        const guestMenu = document.getElementById('guestMenu');
        const loggedInMenu = document.getElementById('loggedInMenu');
        const mobileAuth = document.getElementById('mobileAuthButtons');
        const mobileUser = document.getElementById('mobileUserMenu');
        const userName = document.getElementById('userNameMenu');
        const userEmail = document.getElementById('userEmailMenu');

        if (state.user) {
            guestMenu?.classList.add('hidden');
            loggedInMenu?.classList.remove('hidden');
            mobileAuth?.classList.add('hidden');
            mobileUser?.classList.remove('hidden');
            if (userName) userName.textContent = state.user.name || 'Valued Customer';
            if (userEmail) userEmail.textContent = state.user.email || 'hello@example.com';
        } else {
            guestMenu?.classList.remove('hidden');
            loggedInMenu?.classList.add('hidden');
            mobileAuth?.classList.remove('hidden');
            mobileUser?.classList.add('hidden');
        }

        document.getElementById('logoutBtn')?.addEventListener('click', clearUserSession);
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', clearUserSession);
    }

    function initCounts() {
        updateCountBadges();
    }

    function initCartButtons() {
        document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
            button.addEventListener('click', () => {
                const productId = button.dataset.addToCart;
                addToCart(productId);
            });
        });
    }

    async function addToCart(productId, quantity = 1) {
        // If user is logged in, use backend API
        if (state.user) {
            try {
                const response = await fetch("api/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ productId: parseInt(productId), quantity: quantity })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        await syncCartFromBackend();
                        if (typeof Notiflix !== 'undefined') {
                            Notiflix.Notify.success(data.message || "Added to cart", {
                                position: 'center-top'
                            });
                        }
                    } else {
                        if (typeof Notiflix !== 'undefined') {
                            Notiflix.Notify.failure(data.message, {
                                position: 'center-top'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Error adding to cart:", e);
                // Fallback to localStorage
                addToCartLocal(productId, quantity);
            }
        } else {
            // Use localStorage for guest users
            addToCartLocal(productId, quantity);
        }
    }

    function addToCartLocal(productId, quantity = 1) {
        const existing = state.cart.find((item) => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            state.cart.push({ id: productId, quantity });
        }

        persistState(STORAGE_KEYS.CART, state.cart);
        updateCountBadges();
        dispatchGlobalEvent('cartUpdated', { cart: state.cart });
    }

    async function removeFromCart(productId) {
        // If user is logged in, use backend API
        if (state.user) {
            // Find cart item ID from backend
            try {
                const cartResponse = await fetch("api/cart", {
                    credentials: "include"
                });
                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    if (cartData.status && cartData.cartItems) {
                        const cartItem = cartData.cartItems.find(item => item.productId === parseInt(productId));
                        if (cartItem) {
                            const deleteResponse = await fetch(`api/cart/${cartItem.id}`, {
                                method: "DELETE",
                                credentials: "include"
                            });
                            if (deleteResponse.ok) {
                                await syncCartFromBackend();
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error removing from cart:", e);
                removeFromCartLocal(productId);
            }
        } else {
            removeFromCartLocal(productId);
        }
    }

    function removeFromCartLocal(productId) {
        state.cart = state.cart.filter((item) => item.id !== productId);
        persistState(STORAGE_KEYS.CART, state.cart);
        updateCountBadges();
        dispatchGlobalEvent('cartUpdated', { cart: state.cart });
    }

    async function clearCart() {
        if (state.user) {
            try {
                const response = await fetch("api/cart/clear", {
                    method: "DELETE",
                    credentials: "include"
                });
                if (response.ok) {
                    await syncCartFromBackend();
                }
            } catch (e) {
                console.error("Error clearing cart:", e);
                clearCartLocal();
            }
        } else {
            clearCartLocal();
        }
    }

    function clearCartLocal() {
        state.cart = [];
        persistState(STORAGE_KEYS.CART, state.cart);
        updateCountBadges();
        dispatchGlobalEvent('cartUpdated', { cart: state.cart });
    }

    async function syncCartFromBackend() {
        if (!state.user) return;
        
        try {
            const response = await fetch("api/cart", {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status && data.cartItems) {
                    state.cart = data.cartItems.map(item => ({
                        id: item.productId,
                        quantity: item.quantity,
                        cartId: item.id // Store cartId for updates
                    }));
                    persistState(STORAGE_KEYS.CART, state.cart);
                    updateCountBadges();
                    dispatchGlobalEvent('cartUpdated', { cart: state.cart });
                }
            }
        } catch (e) {
            console.error("Error syncing cart:", e);
        }
    }

    async function setUserSession(user) {
        state.user = user;
        persistState(STORAGE_KEYS.USER, user);
        initAuthUI();
        // Sync cart and wishlist from backend after login
        await syncCartFromBackend();
        await syncWishlistFromBackend();
        dispatchGlobalEvent('userLogin', { user });
    }

    async function clearUserSession() {
        // Clear backend session
        try {
            await fetch("api/users/logout", {
                method: "GET",
                credentials: "include"
            });
        } catch (e) {
            console.error("Error logging out:", e);
        }
        
        state.user = null;
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Keep cart and wishlist in localStorage for guest
        initAuthUI();
        dispatchGlobalEvent('userLogout');
    }

    async function toggleWishlist(productId) {
        if (state.user) {
            try {
                const response = await fetch("api/wishlist", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ productId: parseInt(productId) })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    await syncWishlistFromBackend();
                    if (typeof Notiflix !== 'undefined') {
                        if (data.added) {
                            Notiflix.Notify.success("Added to wishlist", {
                                position: 'center-top'
                            });
                        } else {
                            Notiflix.Notify.info("Removed from wishlist", {
                                position: 'center-top'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Error toggling wishlist:", e);
                toggleWishlistLocal(productId);
            }
        } else {
            toggleWishlistLocal(productId);
        }
    }

    function toggleWishlistLocal(productId) {
        const exists = state.wishlist.includes(productId);
        state.wishlist = exists
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId];

        persistState(STORAGE_KEYS.WISHLIST, state.wishlist);
        updateCountBadges();
        dispatchGlobalEvent('wishlistUpdated', { wishlist: state.wishlist });
    }

    async function clearWishlist() {
        if (state.user) {
            try {
                const response = await fetch("api/wishlist/clear", {
                    method: "DELETE",
                    credentials: "include"
                });
                if (response.ok) {
                    await syncWishlistFromBackend();
                }
            } catch (e) {
                console.error("Error clearing wishlist:", e);
                clearWishlistLocal();
            }
        } else {
            clearWishlistLocal();
        }
    }

    function clearWishlistLocal() {
        state.wishlist = [];
        persistState(STORAGE_KEYS.WISHLIST, state.wishlist);
        updateCountBadges();
        dispatchGlobalEvent('wishlistUpdated', { wishlist: state.wishlist });
    }

    async function syncWishlistFromBackend() {
        if (!state.user) return;
        
        try {
            const response = await fetch("api/wishlist", {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status && data.wishlistItems) {
                    state.wishlist = data.wishlistItems.map(item => item.productId);
                    updateCountBadges();
                    dispatchGlobalEvent('wishlistUpdated', { wishlist: state.wishlist });
                }
            }
        } catch (e) {
            console.error("Error syncing wishlist:", e);
        }
    }


    function updateCountBadges() {
        const cartCount = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const wishlistCount = state.wishlist.length;

        setCount('#cartCount', cartCount);
        setCount('#cartCountMenu', cartCount);
        setCount('#cartCountMenuLogged', cartCount);
        setCount('#cartCountMobile', cartCount);

        setCount('#wishlistCount', wishlistCount);
        setCount('#wishlistCountMenu', wishlistCount);
        setCount('#wishlistCountMenuLogged', wishlistCount);
        setCount('#wishlistCountMobile', wishlistCount);
    }

    function setCount(selector, value) {
        const el = document.querySelector(selector);
        if (!el) return;

        el.textContent = value;
        el.style.display = value > 0 ? 'flex' : 'none';
    }



    function handleStorageSync(event) {
        if (!event.key || !Object.values(STORAGE_KEYS).includes(event.key)) return;
        readStateFromStorage();
        updateCountBadges();
        initAuthUI();
    }

    async function initGlobalApp() {
        readStateFromStorage();

        initThemeToggle();
        initMobileMenu();
        initUserMenu();
        initNavHighlight();
        initAuthUI();
        initCounts();
        initCartButtons();

        // Sync cart and wishlist from backend if user is logged in
        if (state.user) {
            await syncCartFromBackend();
            await syncWishlistFromBackend();
        }

        dispatchGlobalEvent('appReady', { state: { ...state } });
    }

    document.addEventListener('componentsLoaded', initGlobalApp);
    window.addEventListener('storage', handleStorageSync);


    window.SausageApp = {
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        clearWishlist,
        setUserSession,
        clearUserSession,
        syncCartFromBackend,
        syncWishlistFromBackend,
        get cart() {
            return [...state.cart];
        },
        get wishlist() {
            return [...state.wishlist];
        },
        get user() {
            return state.user ? { ...state.user } : null;
        },
    };
})();


