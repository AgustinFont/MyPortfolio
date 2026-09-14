const HIT_URL = "https://abacus.jasoncameron.dev/hit/agusgonzalezfont-portfolio/access";
const GET_URL = "https://abacus.jasoncameron.dev/get/agusgonzalezfont-portfolio/access";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    const url = req.query && req.query.hit === "0" ? GET_URL : HIT_URL;

    try {
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();
        const value = Number(data && data.value);
        if (!response.ok || !Number.isFinite(value)) {
            res.status(502).json({ error: "counter unavailable" });
            return;
        }
        res.status(200).json({ value });
    } catch {
        res.status(503).json({ error: "counter unavailable" });
    }
}
