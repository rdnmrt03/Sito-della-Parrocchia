export const pagineImmagini = [
    { id: "parrocchia", nome: "La Parrocchia", selettore: ".parrocchia-hero", sfumatura: .76 },
    { id: "notizie", nome: "Notizie", selettore: ".notizie-hero", sfumatura: .76 },
    { id: "eventi", nome: "Eventi", selettore: ".eventi-hero", sfumatura: .76 },
    { id: "gruppi", nome: "Gruppi parrocchiali", selettore: ".gruppi-hero", sfumatura: .68 },
    { id: "comunita", nome: "Comunità", selettore: ".comunita-hero", sfumatura: .74 },
    { id: "contatti", nome: "Contatti", selettore: ".contatti-hero", sfumatura: .76 },
    { id: "privacy", nome: "Privacy Policy", selettore: ".privacy-hero", sfumatura: .80 }
];
export const immaginePaginaPredefinita = "immagini/chiesa.jpg";
export function urlImmaginePagina(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
        const url = new URL(value, import.meta.url);
        return ["https:", "http:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
}