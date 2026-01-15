window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Data is loading", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        await getCities();
        await loadUserData();
        await loadOrders();
        await loadDashboardStats();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadOrders() {
    try {
        const response = await fetch("api/orders", {
            credentials: "include"
        });
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.orders) {
                renderOrders(data.orders);
                updateOrdersCount(data.orders.length);
            } else {
                showOrdersEmpty();
            }
        } else {
            showOrdersEmpty();
        }
    } catch (e) {
        console.error("Error loading orders:", e);
        showOrdersEmpty();
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById("ordersTableBody");
    const emptyDiv = document.getElementById("ordersEmpty");
    
    if (!tbody) return;
    
    if (orders.length === 0) {
        showOrdersEmpty();
        return;
    }
    
    if (emptyDiv) emptyDiv.classList.add('hidden');
    tbody.innerHTML = orders.map(order => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 font-semibold">#${order.id}</td>
            <td class="px-4 py-3 text-gray-600">${formatDate(order.createdAt)}</td>
            <td class="px-4 py-3">${order.itemCount || 0} item(s)</td>
            <td class="px-4 py-3 font-semibold">$${(order.total || 0).toFixed(2)}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}">
                    ${order.status || 'PENDING'}
                </span>
            </td>
            <td class="px-4 py-3">
                <button onclick="viewOrderDetails(${order.id})" class="text-orange-600 hover:text-orange-800 text-sm">
                    <i class="fas fa-eye mr-1"></i>View
                </button>
            </td>
        </tr>
    `).join('');
}

function showOrdersEmpty() {
    const tbody = document.getElementById("ordersTableBody");
    const emptyDiv = document.getElementById("ordersEmpty");
    
    if (tbody) tbody.innerHTML = '';
    if (emptyDiv) emptyDiv.classList.remove('hidden');
}

function updateOrdersCount(count) {
    const ordersCount = document.getElementById("ordersCount");
    const heroOrdersCount = document.getElementById("heroOrdersCount");
    
    if (ordersCount) ordersCount.textContent = count;
    if (heroOrdersCount) heroOrdersCount.textContent = count;
}

async function loadDashboardStats() {
    try {
        // Load orders count
        const ordersResponse = await fetch("api/orders", {
            credentials: "include"
        });
        if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.status && ordersData.orders) {
                updateOrdersCount(ordersData.orders.length);
            }
        }
        
        // Load wishlist count
        const wishlistResponse = await fetch("api/wishlist", {
            credentials: "include"
        });
        if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            if (wishlistData.status && wishlistData.wishlistItems) {
                const wishlistCount = document.getElementById("wishlistCount");
                const heroWishlistCount = document.getElementById("heroWishlistCount");
                const count = wishlistData.wishlistItems.length;
                if (wishlistCount) wishlistCount.textContent = count;
                if (heroWishlistCount) heroWishlistCount.textContent = count;
            }
        }
    } catch (e) {
        console.error("Error loading dashboard stats:", e);
    }
}

function getStatusColor(status) {
    const colors = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'PROCESSING': 'bg-blue-100 text-blue-800',
        'SHIPPED': 'bg-purple-100 text-purple-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

async function viewOrderDetails(orderId) {
    Notiflix.Loading.pulse("Loading order details...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch(`api/orders/${orderId}`, {
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.order) {
                showOrderDetailsModal(data.order);
            } else {
                Notiflix.Notify.failure(data.message || "Order not found", {
                    position: 'center-top'
                });
            }
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

function showOrderDetailsModal(order) {
    const itemsHtml = order.orderItems ? order.orderItems.map(item => `
        <div class="flex items-center justify-between py-2 border-b">
            <span>${item.productName || 'Product'}</span>
            <span>Qty: ${item.quantity} × $${item.price.toFixed(2)}</span>
        </div>
    `).join('') : 'No items';

    Notiflix.Report.info(
        `Order #${order.id}`,
        `
        <div class="text-left">
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Delivery:</strong> ${order.deliveryType}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <div class="mt-4">
                <strong>Items:</strong>
                ${itemsHtml}
            </div>
            <p class="mt-4"><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>
        </div>
        `,
        'Close'
    );
}

// Make viewOrderDetails available globally
window.viewOrderDetails = viewOrderDetails;

async function profilePasswordChange() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    let currentPassword = document.getElementById("currentPassword")//.value;
    let newPassword = document.getElementById("newPassword")//.value;
    let conformPassword = document.getElementById("conformPassword")//.value;
    // alert(currentPassword+newPassword+conformPassword)

    const userObj = {
        password: currentPassword.value,
        newPassword: newPassword.value,
        conformPassword: conformPassword.value,

    }
    try {
        const response = await fetch("api/profiles/update-profilePassword", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userObj)
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            if (data.status) {
                Notiflix.Report.success(
                    'SausageShop',
                    data.message,
                    'Okay'
                );
                await loadUserData();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Profile Password update failed!", {
                position: 'center-top'
            });
        }

    } catch
        (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove(1000);
    }
}

async function profileAddressSave() {
    // alert("ok")
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    let lineOne = document.getElementById("lineOne");
    let lineTwo = document.getElementById("lineTwo");
    let postalCode = document.getElementById("postalCode");
    let citySelect = document.getElementById("citySelect");
    let mobile = document.getElementById("mobile");


    const userObj = {
        lineOne: lineOne.value,
        lineTwo: lineTwo.value,
        postalCode: postalCode.value,
        cityId: citySelect.value,
        mobile: mobile.value,
    }
    try {
        const response = await fetch("api/profiles/update-address", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userObj)
        });
        if (response.ok) {
            const data = await response.json();
            // console.log(data)
            if (data.status) {
                Notiflix.Report.success(
                    'SausageShop',
                    data.message,
                    'Okay'
                );
                await loadUserData();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Profile Address update failed!", {
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

async function profileSave() {

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    let firstName = document.getElementById("firstName");
    let lastName = document.getElementById("lastName");



    const userObj = {
        firstName: firstName.value,
        lastName: lastName.value,

    }

    try {
        const response = await fetch("api/profiles/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userObj)
        });

        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                Notiflix.Report.success(
                    'SausageShop',
                    data.message,
                    'Okay'
                );
                await loadUserData();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Profile update failed!", {
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

async function loadUserData() {
    try {
        const response = await fetch("api/profiles/user-loading");
        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            const data = await response.json();
            // console.log(data);

            document.getElementById("username").innerHTML = `Hello, ${data.user.firstName} ${data.user.lastName}`;

            document.getElementById("firstName").value = data.user.firstName;
            document.getElementById("lastName").value = data.user.lastName;
            document.getElementById("email").value = data.user.email;
            document.getElementById("lineOne").value = data.user.lineOne ? data.user.lineOne : "";
            document.getElementById("lineTwo").value = data.user.lineTwo ? data.user.lineTwo : "";
            document.getElementById("postalCode").value = data.user.postalCode ? data.user.postalCode : "";
            document.getElementById("citySelect").value = data.user.cityId ? data.user.cityId : 0;
            document.getElementById("mobile").value = data.user.mobile;
            document.getElementById("currentPassword").value = data.user.password;


            document.getElementById("name").innerHTML = ` ${data.user.firstName} ${data.user.lastName}`;
            document.getElementById("email2").innerHTML = data.user.email;
            document.getElementById("mobile2").innerHTML = data.user.mobile;
        } else {
            Notiflix.Notify.failure("Profile data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

async function getCities() {
    try {
        const response = await fetch("api/profiles/cities");
        if (response.ok) {
            const data = await response.json();
            const citySelect = document.getElementById("citySelect");
            data.cities.forEach((city) => {
                const option = document.createElement("option");
                option.value = city.id;
                option.innerHTML = city.name;
                citySelect.appendChild(option); // add component as a last child
            })
        } else {
            Notiflix.Notify.failure("City loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

async function signOut() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/users/logout", {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {

            Notiflix.Report.success(
                'SausageShop',
                "Logout successful",
                'Okay',
                () => {
                    window.location = "sign-in.html";
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

