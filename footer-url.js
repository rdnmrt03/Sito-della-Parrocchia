export function urlFooterValido(valore) {
    if (typeof valore !== "string" || valore.length > 2000) return false;
    if (!valore.trim()) return true;
    if (/[\u0000-\u001f\u007f]/.test(valore)) return false;
    try {
        const url = new URL(valore, "https://parrocchia.example/");
        return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
    } catch {
        return false;
    }
}