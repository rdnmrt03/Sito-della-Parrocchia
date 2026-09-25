import { urlFooterValido } from "./footer-url.js";

export const tipiSocial = {
    instagram: { nome: "Instagram", disegno: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>' },
    facebook: { nome: "Facebook", disegno: '<path d="M14 21v-9h3l.5-4H14V6c0-1 .5-2 2-2h2V1h-3c-3 0-5 2-5 5v2H7v4h3v9"/>' },
    youtube: { nome: "YouTube", disegno: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/>' },
    whatsapp: { nome: "WhatsApp", disegno: '<path d="M4 17a9 9 0 1 1 3 3l-5 2Z"/><path d="M8 7c0 5 4 9 9 9l1-3-3-1-1 2c-2-1-3-2-4-4l2-1-1-3Z"/>' },
    telegram: { nome: "Telegram", disegno: '<path d="m2 11 20-8-4 18-6-5-4 3 1-6 9-7-12 8Z"/>' },
    x: { nome: "X", disegno: '<path d="m4 3 13 18h3L7 3Zm16 0L4 21"/>' },
    link: { nome: "Altro collegamento", disegno: '<path d="m10 14 4-4m-6 5-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>' }
};

export function iconaSocial(tipo) {
    const info = tipiSocial[tipo] || tipiSocial.link;
    const template = document.createElement("template");
    // Solo disegni definiti nel codice; nessun contenuto salvato viene interpretato come HTML.
    template.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + info.disegno + '</svg>';
    return template.content.firstElementChild;
}

export function leggiSocialFooter(dati = {}) {
    if (Array.isArray(dati.social)) {
        return dati.social.filter(item => item && Object.hasOwn(tipiSocial, item.tipo)
            && typeof item.url === "string" && urlFooterValido(item.url))
            .map(item => ({ tipo: item.tipo, url: item.url, nome: typeof item.nome === "string" ? item.nome : "" }));
    }
    // Compatibilità con i due collegamenti presenti prima della gestione dinamica.
    return [
        { tipo: "instagram", url: dati.testi?.link_testo_3 ?? "#", nome: "Instagram" },
        { tipo: "facebook", url: dati.testi?.link_testo_4 ?? "#", nome: "Facebook" }
    ].filter(item => urlFooterValido(item.url));
}

export function mostraSocialFooter(dati = {}) {
    const container = document.querySelector(".footer-social");
    if (!container) return;
    container.replaceChildren();
    const social = leggiSocialFooter(dati);
    for (const item of social) {
        const link = document.createElement("a");
        const nome = item.nome.trim() || tipiSocial[item.tipo].nome;
        link.setAttribute("aria-label", nome);
        link.title = nome;
        if (item.url.trim() && item.url.trim() !== "#") link.href = item.url.trim();
        link.append(iconaSocial(item.tipo));
        container.append(link);
    }
    container.hidden = social.length === 0;
}