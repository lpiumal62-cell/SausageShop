function fixCartImageUrl(url) {
    if (!url || url.trim() === "") return "";

    if (url.includes("/sausageSho/")) {
        url = url.replace("/sausageSho/", "/sausageShop/");
    }

    if (!url.startsWith("http") && !url.startsWith("data:") && !url.startsWith("/sausageShop/")) {
        url = url.replace(/^\/+/, "");
        if (!url.startsWith("sausageShop/")) {
            url = "/sausageShop/" + url;
        } else {
            url = "/" + url;
        }
    }

    return url;
}

async function addToCart(productid, qty) {
    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch(`api/carts/add-to-cart?pid=${productid}&qty=${qty}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Notify.success(data.message, {
                    position: "center-top"
                });
                await loadCartItems();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: "center-top"
                });
            }
        } else {
            Notiflix.Notify.failure("Add to cart process failed!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

async function loadCartItems() {
    const container = document.getElementById("cartItemsContainer");
    const emptyState = document.getElementById("cartEmptyState");
    const summaryItemCount = document.getElementById("summaryItemCount");
    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryTotal = document.getElementById("summaryTotal");

    if (!container) {
        return;
    }

    try {
        const response = await fetch("api/carts/items");
        if (!response.ok) {
            throw new Error("Cart loading failed!");
        }
        const data = await response.json();

        if (!data.status || !data.items || data.items.length === 0) {
            container.innerHTML = "";
            if (emptyState) emptyState.classList.remove("hidden");
            if (summaryItemCount) summaryItemCount.textContent = "0";
            if (summarySubtotal) summarySubtotal.textContent = "$0.00";
            if (summaryTotal) summaryTotal.textContent = "$0.00";
            return;
        }

        if (emptyState) emptyState.classList.add("hidden");

        container.innerHTML = data.items.map(item => {
            let imageUrl = fixCartImageUrl(item.image || "");
            if (!imageUrl) {
                imageUrl =
                    "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            }

            const qty = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const lineTotal = unitPrice * qty;

            return `
                <div class="flex gap-4 p-4 border border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all">
                    <div class="relative w-24 h-24 flex-shrink-0">
                        <img src="${imageUrl}"
                             alt="${item.title || "Product"}"
                             class="w-full h-full object-cover rounded-xl"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E';">
                        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">${qty}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="font-bold text-gray-900 text-lg">${item.title || ""}</h3>
                                <p class="text-sm text-gray-500">${item.shortDescription || ""}</p>
                            </div>
                            <button class="text-gray-400 hover:text-red-500 transition" onclick="removeCartItem(${item.productId})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center gap-3">
                                <button class="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-orange-500 flex items-center justify-center transition" onclick="updateCartQuantity(${item.productId}, ${qty - 1})">
                                    <i class="fas fa-minus text-xs text-gray-600"></i>
                                </button>
                                <span class="font-semibold text-gray-900 w-8 text-center">${qty}</span>
                                <button class="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-orange-500 flex items-center justify-center transition" onclick="updateCartQuantity(${item.productId}, ${qty + 1})">
                                    <i class="fas fa-plus text-xs text-gray-600"></i>
                                </button>
                            </div>
                            <div class="text-right">
                                <p class="text-xl font-bold text-orange-600">$${lineTotal.toFixed(2)}</p>
                                <p class="text-sm text-gray-500">$${unitPrice.toFixed(2)} each</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        if (data.summary) {
            if (summaryItemCount) summaryItemCount.textContent = data.summary.itemCount || 0;
            if (summarySubtotal) summarySubtotal.textContent = `$${(data.summary.subtotal || 0).toFixed(2)}`;
            if (summaryTotal) summaryTotal.textContent = `$${(data.summary.total || 0).toFixed(2)}`;
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    }
}

async function updateCartQuantity(productId, qty) {
    if (qty < 0) return;
    try {
        Notiflix.Loading.pulse("Updating cart...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch(`api/carts/update-qty?pid=${productId}&qty=${qty}`);
        const data = await response.json();
        if (data.status) {
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message || "Failed to update cart!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

async function removeCartItem(productId) {
    try {
        Notiflix.Loading.pulse("Removing item...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch(`api/carts/remove-item?pid=${productId}`);
        const data = await response.json();
        if (data.status) {
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message || "Failed to remove item!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

async function clearCart() {
    try {
        Notiflix.Loading.pulse("Clearing cart...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch("api/carts/clear");
        const data = await response.json();
        if (data.status) {
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message || "Failed to clear cart!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

let cartState = {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    discountCode: null,
    total: 0,
    deliveryType: 'standard'
};

const TAX_RATE = 0.08;

function fixCartImageUrl(url) {
    if (!url || url.trim() === "") return "";

    if (url.includes("/sausageSho/")) {
        url = url.replace("/sausageSho/", "/sausageShop/");
    }

    if (!url.startsWith("http") && !url.startsWith("data:") && !url.startsWith("/sausageShop/")) {
        url = url.replace(/^\/+/, "");
        if (!url.startsWith("sausageShop/")) {
            url = "/sausageShop/" + url;
        } else {
            url = "/" + url;
        }
    }

    return url;
}

async function addToCart(productid, qty) {
    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch(`api/carts/add-to-cart?pid=${productid}&qty=${qty}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Notify.success(data.message, {
                    position: "center-top"
                });
                await loadCartItems();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: "center-top"
                });
            }
        } else {
            Notiflix.Notify.failure("Add to cart process failed!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

function calculateTotals() {
    const subtotal = cartState.subtotal || 0;
    const shipping = cartState.shipping || 0;
    const tax = subtotal * TAX_RATE;
    const discount = cartState.discount || 0;
    const total = Math.max(0, subtotal + shipping + tax - discount);

    cartState.tax = tax;
    cartState.total = total;

    // Update summary display
    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryShipping = document.getElementById("summaryShipping");
    const summaryTax = document.getElementById("summaryTax");
    const summaryTotal = document.getElementById("summaryTotal");
    const summaryDiscount = document.getElementById("summaryDiscount");
    const discountAmount = document.getElementById("discountAmount");
    const discountCode = document.getElementById("discountCode");

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryShipping) {
        if (shipping === 0) {
            summaryShipping.textContent = "FREE";
            summaryShipping.className = "font-semibold text-emerald-600";
        } else {
            summaryShipping.textContent = `$${shipping.toFixed(2)}`;
            summaryShipping.className = "font-semibold text-gray-700";
        }
    }
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;

    // Show/hide discount
    if (summaryDiscount) {
        if (discount > 0 && cartState.discountCode) {
            summaryDiscount.classList.remove("hidden");
            if (discountAmount) discountAmount.textContent = `-$${discount.toFixed(2)}`;
            if (discountCode) discountCode.textContent = cartState.discountCode;
        } else {
            summaryDiscount.classList.add("hidden");
        }
    }

    // Update stats card
    const statsItemCount = document.getElementById("statsItemCount");
    const statsTotalValue = document.getElementById("statsTotalValue");
    if (statsItemCount) statsItemCount.textContent = cartState.items.length;
    if (statsTotalValue) statsTotalValue.textContent = `$${total.toFixed(2)}`;
}

async function loadCartItems() {
    const container = document.getElementById("cartItemsContainer");
    const emptyState = document.getElementById("cartEmptyState");
    const summaryItemCount = document.getElementById("summaryItemCount");

    if (!container) {
        return;
    }

    try {
        const response = await fetch("api/carts/items");
        if (!response.ok) {
            throw new Error("Cart loading failed!");
        }
        const data = await response.json();

        if (!data.status || !data.items || data.items.length === 0) {
            container.innerHTML = "";
            if (emptyState) emptyState.classList.remove("hidden");
            if (summaryItemCount) summaryItemCount.textContent = "0";
            cartState.items = [];
            cartState.subtotal = 0;
            calculateTotals();
            return;
        }

        if (emptyState) emptyState.classList.add("hidden");

        // Store cart state
        cartState.items = data.items;
        cartState.subtotal = data.summary?.subtotal || 0;

        container.innerHTML = data.items.map(item => {
            let imageUrl = fixCartImageUrl(item.image || "");
            if (!imageUrl) {
                imageUrl =
                    "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            }

            const qty = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const lineTotal = unitPrice * qty;

            return `
                <div class="flex gap-4 p-4 border border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all">
                    <div class="relative w-24 h-24 flex-shrink-0">
                        <a href="product.html?id=${item.productId}">
                            <img src="${imageUrl}"
                                 alt="${item.title || "Product"}"
                                 class="w-full h-full object-cover rounded-xl cursor-pointer"
                                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E';">
                        </a>
                        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">${qty}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <a href="product.html?id=${item.productId}">
                                    <h3 class="font-bold text-gray-900 text-lg hover:text-orange-600 transition cursor-pointer">${item.title || ""}</h3>
                                </a>
                                <p class="text-sm text-gray-500">${item.shortDescription || ""}</p>
                            </div>
                            <button class="text-gray-400 hover:text-red-500 transition" onclick="removeCartItem(${item.productId})" title="Remove item">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center gap-3">
                                <button class="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-orange-500 flex items-center justify-center transition" onclick="updateCartQuantity(${item.productId}, ${Math.max(0, qty - 1)})" ${qty <= 1 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''}>
                                    <i class="fas fa-minus text-xs text-gray-600"></i>
                                </button>
                                <span class="font-semibold text-gray-900 w-8 text-center">${qty}</span>
                                <button class="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-orange-500 flex items-center justify-center transition" onclick="updateCartQuantity(${item.productId}, ${qty + 1})">
                                    <i class="fas fa-plus text-xs text-gray-600"></i>
                                </button>
                            </div>
                            <div class="text-right">
                                <p class="text-xl font-bold text-orange-600">$${lineTotal.toFixed(2)}</p>
                                <p class="text-sm text-gray-500">$${unitPrice.toFixed(2)} each</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        if (data.summary) {
            if (summaryItemCount) summaryItemCount.textContent = data.summary.itemCount || cartState.items.length;
        }

        calculateTotals();
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    }
}

async function updateCartQuantity(productId, qty) {
    if (qty < 0) return;
    try {
        Notiflix.Loading.pulse("Updating cart...", {
            clickToClose: false,
            svgColor: "#0284c7"
        });
        const response = await fetch(`api/carts/update-qty?pid=${productId}&qty=${qty}`);
        const data = await response.json();
        if (data.status) {
            Notiflix.Notify.success(data.message || "Cart updated!", {
                position: "center-top",
                timeout: 1500
            });
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message || "Failed to update cart!", {
                position: "center-top"
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: "center-top"
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

async function removeCartItem(productId) {
    Notiflix.Confirm.show(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        'Yes',
        'No',
        async () => {
            try {
                Notiflix.Loading.pulse("Removing item...", {
                    clickToClose: false,
                    svgColor: "#0284c7"
                });
                const response = await fetch(`api/carts/remove-item?pid=${productId}`);
                const data = await response.json();
                if (data.status) {
                    Notiflix.Notify.success(data.message || "Item removed!", {
                        position: "center-top"
                    });
                    await loadCartItems();
                } else {
                    Notiflix.Notify.failure(data.message || "Failed to remove item!", {
                        position: "center-top"
                    });
                }
            } catch (e) {
                Notiflix.Notify.failure(e.message, {
                    position: "center-top"
                });
            } finally {
                Notiflix.Loading.remove();
            }
        }
    );
}

async function clearCart() {
    Notiflix.Confirm.show(
        'Clear Cart',
        'Are you sure you want to remove all items from your cart?',
        'Yes',
        'No',
        async () => {
            try {
                Notiflix.Loading.pulse("Clearing cart...", {
                    clickToClose: false,
                    svgColor: "#0284c7"
                });
                const response = await fetch("api/carts/clear");
                const data = await response.json();
                if (data.status) {
                    Notiflix.Notify.success(data.message || "Cart cleared!", {
                        position: "center-top"
                    });
                    cartState.discount = 0;
                    cartState.discountCode = null;
                    await loadCartItems();
                } else {
                    Notiflix.Notify.failure(data.message || "Failed to clear cart!", {
                        position: "center-top"
                    });
                }
            } catch (e) {
                Notiflix.Notify.failure(e.message, {
                    position: "center-top"
                });
            } finally {
                Notiflix.Loading.remove();
            }
        }
    );
}

function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    deliveryOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active state from all
            deliveryOptions.forEach(opt => {
                opt.classList.remove('border-orange-500', 'bg-orange-50');
                opt.classList.add('border-gray-200');
                const icon = opt.querySelector('.w-10');
                if (icon) {
                    icon.classList.remove('bg-orange-500', 'text-white');
                    icon.classList.add('bg-gray-200', 'text-gray-600');
                }
            });

            // Add active state to clicked
            this.classList.remove('border-gray-200');
            this.classList.add('border-orange-500', 'bg-orange-50');
            const icon = this.querySelector('.w-10');
            if (icon) {
                icon.classList.remove('bg-gray-200', 'text-gray-600');
                icon.classList.add('bg-orange-500', 'text-white');
            }

            // Update shipping cost
            const price = parseFloat(this.dataset.price || 0);
            cartState.shipping = price;
            cartState.deliveryType = this.dataset.type || 'standard';
            calculateTotals();
        });
    });
}

function initPromoCode() {
    const applyBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoCodeInput');
    const appliedBadge = document.getElementById('appliedCouponBadge');

    if (applyBtn && promoInput) {
        applyBtn.addEventListener('click', async () => {
            const code = promoInput.value.trim().toUpperCase();
            if (!code) {
                Notiflix.Notify.warning('Please enter a promo code', {
                    position: 'center-top'
                });
                return;
            }

            // Simple promo code validation (can be extended with backend API)
            const validCodes = {
                'NEW15': 0.15,  // 15% discount
                'SAVE10': 0.10,  // 10% discount
                'WELCOME': 0.05  // 5% discount
            };

            if (validCodes[code]) {
                const discountPercent = validCodes[code];
                cartState.discount = cartState.subtotal * discountPercent;
                cartState.discountCode = code;
                appliedBadge.textContent = code;
                appliedBadge.classList.remove('hidden');
                promoInput.value = '';
                promoInput.disabled = true;
                applyBtn.disabled = true;
                applyBtn.textContent = 'Applied';
                calculateTotals();
                Notiflix.Notify.success(`Promo code ${code} applied!`, {
                    position: 'center-top'
                });
            } else {
                Notiflix.Notify.failure('Invalid promo code', {
                    position: 'center-top'
                });
            }
        });

        // Allow removing promo code
        if (appliedBadge) {
            appliedBadge.addEventListener('click', () => {
                cartState.discount = 0;
                cartState.discountCode = null;
                appliedBadge.classList.add('hidden');
                promoInput.disabled = false;
                applyBtn.disabled = false;
                applyBtn.textContent = 'Apply';
                calculateTotals();
                Notiflix.Notify.info('Promo code removed', {
                    position: 'center-top'
                });
            });
        }
    }
}

function initCheckoutButton() {
    const checkoutBtn = document.getElementById('proceedToCheckoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartState.items.length === 0) {
                Notiflix.Notify.warning('Your cart is empty!', {
                    position: 'center-top'
                });
                return;
            }
            // Store cart state in sessionStorage for checkout page
            sessionStorage.setItem('cartState', JSON.stringify(cartState));
            window.location.href = 'checkout.html';
        });
    }
}

window.addEventListener("load", () => {
    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            clearCart();
        });
    }

    initDeliveryOptions();
    initPromoCode();
    initCheckoutButton();
    loadCartItems();
});
