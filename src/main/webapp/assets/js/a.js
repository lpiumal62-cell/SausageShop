(function () {
    const elements = {
        tabs: document.querySelectorAll('.account-tab'),
        contents: document.querySelectorAll('.account-content')
    };

    function switchTab(id) {
        elements.contents.forEach(c => c.classList.toggle('hidden', c.id !== `${id}Tab`));
        elements.tabs.forEach(b => {
            const active = b.dataset.tab === id;
            b.classList.toggle('primary-red', active);
            b.classList.toggle('text-white', active);
            b.classList.toggle('hover:bg-gray-100', !active);
        });
    }

    elements.tabs.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    window.switchTab = switchTab;
    switchTab('dashboard');

    // Password features
    document.querySelectorAll('.toggle-password-visibility').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            const icon = btn.querySelector('i');
            if (!target || !icon) return;
            if (target.type === 'password') {
                target.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                target.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    const strengthText = document.querySelector('.password-strength-text');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const reqItems = document.querySelectorAll('.requirement-item');
    const matchIndicator = document.querySelector('.password-match-indicator');
    const mismatchIndicator = document.querySelector('.password-mismatch-indicator');

    function updateStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        strengthBars.forEach((bar, idx) => {
            bar.classList.toggle('active', idx < score);
        });

        const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ef4444', '#ef4444', '#f97316', '#eab308', '#22c55e'];
        if (strengthText) {
            strengthText.textContent = labels[score] || '';
            strengthText.style.color = colors[score] || '';
        }
    }

})();
