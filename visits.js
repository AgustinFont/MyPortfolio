// === visits.js - Contador global de cargas de la página ===
(function () {
    const COUNTER_KEY = "agusgonzalezfont-portfolio-logins";
    const API = "https://countapi.mileshilliard.com/api/v1";
    const HIT_URL = `${API}/hit/${COUNTER_KEY}`;
    const GET_URL = `${API}/get/${COUNTER_KEY}`;
    const CACHE_KEY = "agus-portfolio-visit-count";
    const PLACEHOLDER = "------";

    function formatCount(value) {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) return PLACEHOLDER;
        return String(Math.floor(num)).padStart(6, "0");
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
        const response = await fetch(url, { cache: "no-store", mode: "cors" });
        if (!response.ok) throw new Error(`counter ${response.status}`);
        const data = await response.json();
        const value = Number(data && data.value);
        if (!Number.isFinite(value)) throw new Error("counter missing value");
        return value;
    }

    async function registerVisit() {
        const cached = readCached();
        if (cached != null) render(cached);

        try {
            let value;
            try {
                value = await fetchCounter(HIT_URL);
            } catch {
                value = await fetchCounter(GET_URL);
            }
            writeCached(value);
            render(value);
        } catch (err) {
            console.warn("Visit counter unavailable:", err);
            if (cached == null) render(PLACEHOLDER);
        }
    }

    registerVisit();
})();
