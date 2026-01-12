// Fix image URLs to ensure correct context path
function fixImageUrl(url) {
    if (!url || url.trim() === '') return '';
    
    // If it's a full URL with the wrong context path, fix it
    if (url.includes('/sausageSho/')) {
        url = url.replace('/sausageSho/', '/sausageShop/');
    }
    
    // If it's a relative path, ensure it starts with /sausageShop
    if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/sausageShop/')) {
        // Remove any leading slash
        url = url.replace(/^\/+/, '');
        // Add correct context path
        if (!url.startsWith('sausageShop/')) {
            url = '/sausageShop/' + url;
        } else {
            url = '/' + url;
        }
    }
    
    return url;
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch("api/admin/dashboard/stats", {
            method: "GET",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                // Update stat counters
                updateCounter('totalOrders', data.totalOrders || 0);
                updateCounter('totalSales', data.totalSales || 0);
                updateCounter('totalCustomers', data.totalCustomers || 0);
                updateCounter('totalProducts', data.totalProducts || 0);
            }
        }
    } catch (e) {
        console.error("Error loading dashboard stats:", e);
    }
}

// Animate counters
function updateCounter(elementClass, targetValue) {
    const elements = document.querySelectorAll(`.counter[data-target="${targetValue}"]`);
    if (elements.length === 0) {
        // If no element with exact target, find any counter and update
        const allCounters = document.querySelectorAll('.counter');
        allCounters.forEach(el => {
            if (el.closest('.border-blue-500') && elementClass === 'totalOrders') {
                animateCounter(el, targetValue);
            } else if (el.closest('.border-green-500') && elementClass === 'totalSales') {
                animateCounter(el, targetValue);
            } else if (el.closest('.border-purple-500') && elementClass === 'totalCustomers') {
                animateCounter(el, targetValue);
            } else if (el.closest('.border-orange-500') && elementClass === 'totalProducts') {
                animateCounter(el, targetValue);
            }
        });
    } else {
        elements.forEach(el => animateCounter(el, targetValue));
    }
}

function animateCounter(element, target) {
    const duration = 1000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch("api/admin/orders", {
            method: "GET",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status && data.orders) {
                renderRecentOrders(data.orders.slice(0, 10)); // Show only last 10 orders
            }
        }
    } catch (e) {
        console.error("Error loading recent orders:", e);
        document.getElementById("recentOrdersTable").innerHTML = 
            '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Error loading orders</td></tr>';
    }
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById("recentOrdersTable");
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const statusColors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PROCESSING': 'bg-blue-100 text-blue-800',
            'SHIPPED': 'bg-purple-100 text-purple-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'COMPLETED': 'bg-green-100 text-green-800'
        };
        
        const statusClass = statusColors[order.status] || 'bg-gray-100 text-gray-800';
        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
        const customerName = order.customerName || 'Guest';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">#${order.id}</td>
                <td class="px-6 py-4 text-sm text-gray-700">${customerName}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${order.customerEmail || 'N/A'}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    $${(order.total || 0).toFixed(2)}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                        ${order.status || 'PENDING'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${orderDate}</td>
                <td class="px-6 py-4">
                    <button onclick="viewOrder(${order.id})" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewOrder(orderId) {
    window.location.href = `admin-orders.html?orderId=${orderId}`;
}

// Notifications dropdown
document.addEventListener('DOMContentLoaded', function() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const profileBtn = document.getElementById('adminProfileBtn');
    const profileDropdown = document.getElementById('adminProfileDropdown');
    
    if (notificationsBtn && notificationsDropdown) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('hidden');
            if (profileDropdown) {
                profileDropdown.classList.add('hidden');
            }
        });
    }
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            if (notificationsDropdown) {
                notificationsDropdown.classList.add('hidden');
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        if (notificationsDropdown) notificationsDropdown.classList.add('hidden');
        if (profileDropdown) profileDropdown.classList.add('hidden');
    });
    
    // Logout button in dropdown
    const logoutBtnTop = document.getElementById('adminLogoutBtnTop');
    if (logoutBtnTop) {
        logoutBtnTop.addEventListener('click', function() {
            logOut();
        });
    }
});

// Load dashboard data on page load
window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Loading dashboard...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    
    try {
        await Promise.all([
            loadDashboardStats(),
            loadRecentOrders()
        ]);
    } catch (error) {
        Notiflix.Notify.failure("Error loading dashboard data", {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
});
