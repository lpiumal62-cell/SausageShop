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

    function updateRequirements(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        reqItems.forEach(item => {
            const key = item.dataset.requirement;
            const icon = item.querySelector('i');
            if (checks[key]) {
                item.classList.add('text-green-600');
                item.classList.remove('text-gray-600');
                if (icon) icon.className = 'fas fa-check-circle text-green-500 text-[12px]';
            } else {
                item.classList.remove('text-green-600');
                item.classList.add('text-gray-600');
                if (icon) icon.className = 'fas fa-circle text-gray-300 text-[6px]';
            }
        });
    }

    function checkMatch() {
        const a = document.getElementById('newPassword')?.value || '';
        const b = document.getElementById('confirmNewPassword')?.value || '';
        if (!matchIndicator || !mismatchIndicator) return;
        if (!b.length) {
            matchIndicator.classList.add('hidden');
            mismatchIndicator.classList.add('hidden');
            return;
        }
        if (a === b) {
            matchIndicator.classList.remove('hidden');
            mismatchIndicator.classList.add('hidden');
        } else {
            matchIndicator.classList.add('hidden');
            mismatchIndicator.classList.remove('hidden');
        }
    }

    const newPass = document.getElementById('newPassword');
    const confirmPass = document.getElementById('confirmNewPassword');
    if (newPass) {
        newPass.addEventListener('input', e => {
            const val = e.target.value;
            updateStrength(val);
            updateRequirements(val);
            checkMatch();
        });
    }
    if (confirmPass) {
        confirmPass.addEventListener('input', checkMatch);
    }

    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', e => {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const np = newPass?.value || '';
            const cp = confirmPass?.value || '';
            if (!current || !np || !cp || np !== cp) {
                alert('Please complete the form correctly.');
                return;
            }
            const btn = document.getElementById('passwordChangeSubmitBtn');
            const text = btn?.querySelector('.submit-btn-text');
            const loader = btn?.querySelector('.submit-btn-loader');
            btn.disabled = true;
            text?.classList.add('hidden');
            loader?.classList.remove('hidden');
            setTimeout(() => {
                btn.disabled = false;
                text?.classList.remove('hidden');
                loader?.classList.add('hidden');
                alert('Password updated (demo).');
                passwordForm.reset();
                updateStrength('');
                updateRequirements('');
                checkMatch();
            }, 1000);
        });
    }
})();
