/**
 * load-components.js
 * Loads shared HTML partials (header & footer) into placeholders so that
 * all pages can reuse the same markup without duplicating code.
 */
(function () {
    const PARTIALS = [
        { id: 'header-placeholder', file: 'header.html' },
        { id: 'footer-placeholder', file: 'footer.html' },
    ];

    /**
     * Fetches an HTML partial and injects it into the requested placeholder.
     * @param {HTMLElement} container
     * @param {string} file
     * @returns {Promise<void>}
     */
    async function injectPartial(container, file) {
        if (!container) return;

        try {
            const response = await fetch(file, { cache: 'no-store' });
            if (!response.ok) throw new Error(`${file} returned ${response.status}`);
            container.innerHTML = await response.text();
        } catch (error) {
            console.error(`Failed to load ${file}:`, error);
            container.innerHTML = `
                <div class="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mt-4">
                    <p class="font-semibold">Unable to load ${file}.</p>
                    <p class="text-sm opacity-75">${error.message}</p>
                </div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await Promise.all(
            PARTIALS.map(({ id, file }) => injectPartial(document.getElementById(id), file)),
        );

        // Let other scripts know the shared components are ready.
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    });
})();


