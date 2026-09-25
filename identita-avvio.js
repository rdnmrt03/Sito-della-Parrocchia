/* Eseguito prima del contenuto: evita di mostrare l'intestazione originale. */
(() => {
    const key = "parrocchia.identita.v1";
    const base = document.currentScript.src;
    const titles = ".header-superiore .logo a, .admin-brand-text strong";
    const logos = ".header-superiore .logo-immagine, .footer-logo img, .admin-brand img, .login-logo";
    let dati = null;
    let versione = 0;
    const style = document.createElement("style");
    style.textContent = `html.identita-attesa :is(${titles}, ${logos}):not([data-identita-pronta]) { visibility: hidden; }`;
    document.head.appendChild(style);
    document.documentElement.classList.add("identita-attesa");

    function render() {
        if (!dati) return;
        document.querySelectorAll(titles).forEach(el => {
            if (!dati.titolo) return;
            if (el.textContent !== dati.titolo) el.textContent = dati.titolo;
            el.style.whiteSpace = "pre-line";
            el.style.overflowWrap = "anywhere";
            el.dataset.identitaPronta = "true";
        });
        document.querySelectorAll(logos).forEach(el => {
            if (!dati.logo) return;
            if (el.src !== dati.logo) el.src = dati.logo;
            el.alt = "Logo " + (dati.titolo || "della parrocchia").replace(/\s+/g, " ");
            el.dataset.identitaPronta = "true";
        });
    }
    function termina() {
        document.documentElement.classList.remove("identita-attesa");
    }
    async function applica(value, salva = true) {
        const turno = ++versione;
        const nuovo = {};
        if (typeof value?.titolo === "string" && value.titolo.trim()) nuovo.titolo = value.titolo;
        if (typeof value?.logo === "string" && value.logo) {
            try {
                const url = new URL(value.logo, base);
                if (["https:", "http:"].includes(url.protocol)) {
                    const img = new Image();
                    img.src = url.href;
                    await Promise.race([
                        img.decode(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error("Logo non disponibile")), 7000))
                    ]);
                    nuovo.logo = url.href;
                }
            } catch { /* Conserva il logo già disponibile se quello nuovo non si carica. */ }
        }
        if (turno !== versione) return;
        dati = { ...dati, ...nuovo };
        render();
        if (salva) {
            try { localStorage.setItem(key, JSON.stringify(dati)); } catch { /* Memoria locale non disponibile. */ }
            termina();
        }
    }
    window.identitaSito = { applica, termina };
    new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
    try {
        const cache = JSON.parse(localStorage.getItem(key));
        if (cache && typeof cache === "object") applica(cache, false);
    } catch { /* Una cache assente o non valida non impedisce il caricamento. */ }
    // Ripristina comunque la leggibilità se Firebase o i moduli non rispondono.
    setTimeout(termina, 8000);
})();