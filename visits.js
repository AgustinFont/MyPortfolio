// === visits.js - Contador global de cargas de la página ===
(function () {
    const COUNTER_KEY = "agusgonzalezfont-portfolio-logins";
    const COUNTER_URL = `https://countapi.mileshilliard.com/api/v1/hit/${COUNTER_KEY}`;
    const PLACEHOLDER = "------";

    function formatCount(value) {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) return PLACEHOLDER;
        return String(Math.floor(num)).padStart(6, "0");
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

    async function registerVisit() {
        try {
            const response = await fetch(COUNTER_URL, { cache: "no-store" });
            if (!response.ok) throw new Error("counter request failed");
            const data = await response.json();
            render(data.value);
        } catch {
            render(PLACEHOLDER);
        }
    }

    registerVisit();
})();
