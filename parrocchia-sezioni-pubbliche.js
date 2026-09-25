import { leggiSezioniParrocchia, urlFotoSezione } from "./parrocchia-sezioni.js";
export function mostraSezioniParrocchia(dati) {
    if (!Array.isArray(dati.sezioni)) return;
    const container = document.getElementById("parishSections");
    if (!container) return;
    // Conserva gli elementi degli orari: vengono aggiornati anche dallo script condiviso.
    const speciali = {
        messe: document.getElementById("messe"),
        contatti: document.getElementById("parrocchia-contatti")
    };
    const fragment = document.createDocumentFragment();
    let numero = 0;
    for (const item of leggiSezioniParrocchia(dati)) {
        let section;
        if (item.tipo !== "testo") {
            section = speciali[item.tipo];
            if (!section) continue;
        } else {
            section = document.createElement("section");
            section.id = item.id;
            section.className = "sezione-pagina";
            if (item.visibile) numero++;
            if (numero % 2 === 0) section.classList.add("sezione-grigia");
            const inner = document.createElement("div");
            inner.className = "pagina-contenuto";
            const number = document.createElement("div");
            number.className = "numero-sezione";
            number.textContent = String(numero).padStart(2, "0");
            const content = document.createElement("div");
            function text(tag, value, className = "") {
                if (!value) return;
                const element = document.createElement(tag);
                element.textContent = value;
                if (className) element.className = className;
                element.style.whiteSpace = "pre-line";
                content.append(element);
            }
            text("p", item.etichetta, "pagina-etichetta");
            text("h2", item.titolo);
            const url = urlFotoSezione(item.foto);
            if (url) {
                const image = document.createElement("img");
                image.className = "parrocchia-section-photo";
                image.src = url;
                image.alt = item.alt;
                image.loading = "lazy";
                image.addEventListener("error", () => { image.hidden = true; });
                content.append(image);
            }
            text("p", item.testo1, "parrocchia-section-text");
            text("p", item.testo2, "parrocchia-section-text");
            inner.append(number, content);
            section.append(inner);
        }
        section.hidden = !item.visibile;
        fragment.append(section);
    }
    container.replaceChildren(fragment);
    // Rispetta i link diretti anche quando il contenuto arriva dopo il caricamento.
    if (location.hash) {
        const target = document.getElementById(location.hash.slice(1));
        if (target && !target.hidden && container.contains(target)) target.scrollIntoView();
    }
}