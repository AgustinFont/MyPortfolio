// === visits.js - Contador global de cargas de la página ===
(function () {
    const CACHE_KEY = "agus-portfolio-visit-count";
    const PLACEHOLDER = "------";
    const TIMEOUT_MS = 4000;

    const BACKENDS = [
        {
            hit: "/api/visits",
            get: "/api/visits?hit=0",
        },
        {
            hit: "https://abacus.jasoncameron.dev/hit/agusgonzalezfont-portfolio/access",
            get: "https://abacus.jasoncameron.dev/get/agusgonzalezfont-portfolio/access",
        },
        {
            hit: "https://countapi.mileshilliard.com/api/v1/hit/agusgonzalezfont-portfolio-logins",
            get: "https://countapi.mileshilliard.com/api/v1/get/agusgonzalezfont-portfolio-logins",
        },
    ];

    function formatCount(value) {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) return PLACEHOLDER;
        return String(Math.floor(num)).padStart(6, "0");
    }

    function parseValue(data) {
        const raw = data && (data.value ?? data.count);
        const num = Number(raw);
        return Number.isFinite(num) && num >= 0 ? Math.floor(num) : null;
    }

    function readCached() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw == null) return null;
            const num = Number(raw);
            return Number.isFinite(num) ? num : null;
        } catch {
            return null;
        }
    }

    function writeCached(value) {
        try {
            localStorage.setItem(CACHE_KEY, String(Math.floor(value)));
        } catch {
            /* ignore quota / private mode */
        }
    }

    function render(value) {
        const formatted = formatCount(value);
        document.querySelectorAll("[data-visit-count]").forEach((el) => {
            el.textContent = formatted;
        });

        const badge = document.getElementById("visit-counter");
        if (badge) {
            badge.classList.add("is-ready");
            badge.setAttribute("aria-label", `People who opened this portfolio: ${formatted}`);
        }
    }

    async function fetchCounter(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                cache: "no-store",
                mode: "cors",
                signal: controller.signal,
            });
            if (!response.ok) throw new Error(`counter ${response.status}`);
            const data = await response.json();
            const value = parseValue(data);
            if (value == null) throw new Error("counter missing value");
            return value;
        } finally {
            clearTimeout(timer);
        }
    }

    async function registerVisit() {
        const cached = readCached();
        if (cached != null) render(cached);

        let value = null;
        for (const backend of BACKENDS) {
            try {
                value = await fetchCounter(backend.hit);
                break;
            } catch {
                try {
                    value = await fetchCounter(backend.get);
                    break;
                } catch {
                    /* try next backend */
                }
            }
        }

        if (value != null) {
            writeCached(value);
            render(value);
            return;
        }

        console.warn("Visit counter unavailable");
        if (cached == null) render(PLACEHOLDER);
    }

    registerVisit();
})();
