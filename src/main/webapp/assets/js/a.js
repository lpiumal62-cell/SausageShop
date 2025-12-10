(function() {
    'use strict';

    // Cache DOM elements
    const elements = {
        tabs: {
            buttons: document.querySelectorAll('.account-tab'),
            panels: document.querySelectorAll('.account-content'),
        },
        mobile: {
            menuBtn: document.getElementById('accountMobileMenuBtn'),
            sidebar: document.getElementById('mobileSidebar'),
            overlay: document.getElementById('mobileSidebarOverlay'),
            closeBtn: document.getElementById('closeMobileSidebar'),
        },
        dashboard: {
            profileView: document.getElementById('profileViewMode'),
            profileEdit: document.getElementById('profileEditMode'),
            toggleEdit: document.getElementById('toggleProfileEdit'),
            cancelEdit: document.getElementById('cancelProfileEdit'),
        },
        cookie: {
            toggle: document.getElementById('toggleCookieSection'),
            section: document.getElementById('cookieManagementSection'),
        },
        orders: {
            modal: document.getElementById('orderDetailsModal'),
            modalClose: document.getElementById('closeOrderModal'),
        },
    };

    // Initialize when DOM is ready
    function init() {
        if (!document.getElementById('dashboardTab')) return;

        attachEventListeners();
        switchTab('dashboard');
    }

    // Attach all event listeners
    function attachEventListeners() {
        // Tab navigation
        elements.tabs.buttons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });

        // Mobile menu
        elements.mobile.menuBtn?.addEventListener('click', openMobileMenu);
        elements.mobile.overlay?.addEventListener('click', closeMobileMenu);
        elements.mobile.closeBtn?.addEventListener('click', closeMobileMenu);

        // Dashboard profile edit toggle
        elements.dashboard.toggleEdit?.addEventListener('click', () => toggleProfileEdit(true));
        elements.dashboard.cancelEdit?.addEventListener('click', () => toggleProfileEdit(false));

        // Cookie section toggle
        elements.cookie.toggle?.addEventListener('click', toggleCookieSection);

        // Order modal
        elements.orders.modalClose?.addEventListener('click', closeOrderModal);
        elements.orders.modal?.addEventListener('click', (e) => {
            if (e.target === elements.orders.modal) closeOrderModal();
        });

        // Form submissions - just prevent default to show design
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // Just show design, no actual submission
            });
        });

        // Inline editable fields
        document.querySelectorAll('.editable-field').forEach(container => {
            const display = container.querySelector('.field-display');
            const input = container.querySelector('.field-input');

            display?.addEventListener('click', () => {
                display.classList.add('hidden');
                input?.classList.remove('hidden');
                input?.focus();
            });

            input?.addEventListener('blur', () => {
                if (input.value.trim()) {
                    display.textContent = input.value;
                }
                display.classList.remove('hidden');
                input.classList.add('hidden');
            });
        });

        // Expose switchTab globally for inline handlers
        window.switchTab = switchTab;
    }

    // Tab switching
    function switchTab(tabId) {
        // Hide all panels
        elements.tabs.panels.forEach(panel => {
            panel.classList.toggle('hidden', panel.id !== `${tabId}Tab`);
        });

        // Update button states
        elements.tabs.buttons.forEach(button => {
            const isActive = button.dataset.tab === tabId;
            button.classList.toggle('primary-red', isActive);
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('hover:bg-gray-100', !isActive);
            button.classList.toggle('text-gray-700', !isActive);
        });

        closeMobileMenu();
    }

    // Mobile menu controls
    function openMobileMenu() {
        if (!elements.mobile.sidebar) return;
        elements.mobile.sidebar.classList.remove('hidden');
        setTimeout(() => {
            elements.mobile.sidebar.classList.remove('-translate-x-full');
        }, 10);
        elements.mobile.overlay?.classList.remove('hidden');
    }

    function closeMobileMenu() {
        if (!elements.mobile.sidebar) return;
        elements.mobile.sidebar.classList.add('-translate-x-full');
        setTimeout(() => {
            elements.mobile.sidebar.classList.add('hidden');
        }, 200);
        elements.mobile.overlay?.classList.add('hidden');
    }

    // Profile edit toggle
    function toggleProfileEdit(editMode) {
        if (!elements.dashboard.profileView || !elements.dashboard.profileEdit) return;
        elements.dashboard.profileView.classList.toggle('hidden', editMode);
        elements.dashboard.profileEdit.classList.toggle('hidden', !editMode);
    }

    // Cookie section toggle
    function toggleCookieSection() {
        elements.cookie.section?.classList.toggle('hidden');
    }

    // Order modal
    function closeOrderModal() {
        elements.orders.modal?.classList.add('hidden');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
