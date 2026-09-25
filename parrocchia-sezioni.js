export const sezioniPredefinite = [
    {
        "tipo":  "testo",
        "id":  "storia",
        "visibile":  true,
        "testo2":  "Questo spazio potrà essere arricchito con la storia reale della Parrocchia, le date più importanti, i parroci che si sono succeduti e gli avvenimenti che hanno segnato la vita della comunità.",
        "testo1":  "La Parrocchia di Vibo Marina è una comunità cristiana che vive e testimonia il Vangelo nel territorio. La sua storia è fatta di persone, famiglie, sacerdoti, gruppi e generazioni che nel corso degli anni hanno contribuito alla crescita della comunità.",
        "foto":  "",
        "alt":  "",
        "etichetta":  "LE NOSTRE RADICI",
        "titolo":  "La nostra storia"
    },
    {
        "tipo":  "testo",
        "id":  "chiesa",
        "visibile":  true,
        "testo2":  "Qui potremo inserire la storia dell\u0027edificio, informazioni sull\u0027architettura, sulle opere presenti e sul patrimonio artistico e religioso della Parrocchia.",
        "testo1":  "La chiesa parrocchiale è il cuore della vita liturgica e comunitaria. È il luogo nel quale la comunità si riunisce per celebrare l\u0027Eucaristia, ricevere i Sacramenti, pregare e condividere i momenti più importanti della vita cristiana.",
        "foto":  "",
        "alt":  "",
        "etichetta":  "LA NOSTRA CASA",
        "titolo":  "La chiesa"
    },
    {
        "tipo":  "testo",
        "id":  "parroco",
        "visibile":  true,
        "testo2":  "In questa sezione potremo inserire il nome del parroco, una fotografia, una breve presentazione e un messaggio rivolto alla comunità.",
        "testo1":  "Il parroco accompagna la comunità nel cammino di fede e nella vita pastorale, attraverso la celebrazione dei Sacramenti, l\u0027annuncio della Parola e il servizio alle persone.",
        "foto":  "",
        "alt":  "",
        "etichetta":  "AL SERVIZIO DELLA COMUNITÀ",
        "titolo":  "Il parroco"
    },
    {
        "visibile":  true,
        "tipo":  "messe",
        "id":  "messe",
        "titolo":  "Orari Sante Messe"
    },
    {
        "visibile":  true,
        "tipo":  "contatti",
        "id":  "parrocchia-contatti",
        "titolo":  "Contatta la Parrocchia"
    }
];
export function urlFotoSezione(value) {
    if (typeof value !== "string" || !value) return "";
    try {
        const url = new URL(value, import.meta.url);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
}
export function leggiSezioniParrocchia(dati = {}) {
    if (!Array.isArray(dati.sezioni)) {
        return sezioniPredefinite.map(item => {
            const section = { ...item };
            for (const key of ["etichetta", "titolo", "testo1", "testo2"]) {
                const value = dati.testi?.[item.id + "_" + key];
                if (typeof value === "string") section[key] = value;
            }
            return section;
        });
    }
    const ids = new Set();
    return dati.sezioni.filter(item => {
        if (!item || typeof item.id !== "string" || !/^(storia|chiesa|parroco|messe|parrocchia-contatti|sezione-[a-z0-9-]+)$/.test(item.id) || ids.has(item.id)) return false;
        if (!["testo", "messe", "contatti"].includes(item.tipo)) return false;
        if ((item.tipo === "messe") !== (item.id === "messe") || (item.tipo === "contatti") !== (item.id === "parrocchia-contatti")) return false;
        ids.add(item.id);
        return true;
    }).map(item => ({
        id: item.id, tipo: item.tipo, visibile: item.visibile !== false,
        ...Object.fromEntries(["titolo", "etichetta", "testo1", "testo2", "alt"].map(key => [key, typeof item[key] === "string" ? item[key] : ""])),
        foto: urlFotoSezione(item.foto)
    }));
}