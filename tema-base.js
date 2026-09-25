/* Colori condivisi e cache del tema, applicati prima del primo disegno. */
(() => {
    const presets = {
        classico: { nome: "classico", principale: "#001536", accento: "#d8c49b", sfondo: "#ffffff" },
        bordeaux: { nome: "bordeaux", principale: "#5c2030", accento: "#dec39a", sfondo: "#fffaf3" },
        verde: { nome: "verde", principale: "#174c3c", accento: "#d6c59a", sfondo: "#fafbf5" }
    };
    const key = "parrocchia.tema.v1";
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const hex = values => "#" + values.map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
    const mix = (a, b, amount) => hex(rgb(a).map((v, i) => v * (1 - amount) + rgb(b)[i] * amount));
    function luminanza(color) {
        const c = rgb(color).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
        return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
    }
    function contrasto(a, b) {
        const x = luminanza(a), y = luminanza(b);
        return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
    }
    function normalizza(value) {
        if (!value || !["principale", "accento", "sfondo"].every(k => /^#[0-9a-f]{6}$/i.test(value[k]))) return null;
        return { nome: Object.hasOwn(presets, value.nome) ? value.nome : "personalizzato", principale: value.principale, accento: value.accento, sfondo: value.sfondo };
    }
    function problema(value) {
        const t = normalizza(value);
        if (!t) return "Scegli tre colori validi.";
        if (contrasto(t.principale, "#ffffff") < 4.5) return "Scegli un colore principale più scuro: deve rendere leggibili i testi bianchi.";
        if (contrasto(t.principale, t.sfondo) < 4.5) return "Aumenta la differenza tra il colore principale e lo sfondo.";
        if (contrasto(t.principale, t.accento) < 4.5) return "Scegli un accento più chiaro per i pulsanti e i dettagli sul colore principale.";
        if (luminanza(t.sfondo) < .75) return "Scegli uno sfondo chiaro per mantenere leggibili i contenuti del sito.";
        return "";
    }
    function applica(value, target = document.documentElement) {
        const t = normalizza(value);
        if (!t) return;
        let accentoTesto = t.accento;
        for (let i = 0; i < 25 && contrasto(accentoTesto, t.sfondo) < 4.5; i++) accentoTesto = mix(accentoTesto, t.principale, .2);
        const vars = {
            principale: t.principale, "principale-rgb": rgb(t.principale).join(", "),
            accento: t.accento, "accento-testo": accentoTesto,
            sfondo: t.sfondo, "sfondo-secondario": mix(t.sfondo, t.principale, .035),
            "testo-secondario": mix(t.principale, t.sfondo, .32),
            bordo: mix(t.sfondo, t.principale, .15)
        };
        Object.entries(vars).forEach(([name, value]) => target.style.setProperty("--tema-" + name, value));
    }
    function salvaCache(value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Cache facoltativa. */ }
    }
    window.TemiSito = { presets, normalizza, problema, contrasto, applica, salvaCache };
    if (!document.currentScript.hasAttribute("data-admin")) {
        let tema = presets.classico;
        try { const cached = JSON.parse(localStorage.getItem(key)); if (!problema(cached)) tema = cached; } catch {}
        applica(tema);
    }
})();