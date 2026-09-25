import { sezioniPredefinite, leggiSezioniParrocchia, urlFotoSezione } from "./parrocchia-sezioni.js";
let api;
let pronto = false;
let sezioni = [];
let eliminate = [];
let letture = 0;
const el = id => document.getElementById(id);
const messaggio = text => { el("parishMessage").textContent = text; };

function aggiornaComandi() {
    const rows = el("parishSectionsEditor").children;
    [...rows].forEach((row, index) => {
        row.querySelector("[data-move-up]").disabled = index === 0;
        row.querySelector("[data-move-down]").disabled = index === rows.length - 1;
    });
    el("parishEmpty").hidden = sezioni.length > 0;
    el("parishUndo").hidden = eliminate.length === 0;
    const select = el("parishSectionType");
    const selected = select.value;
    select.replaceChildren(new Option("Nuova sezione di testo", "nuova"));
    sezioniPredefinite.filter(item => !sezioni.some(section => section.id === item.id)).forEach(item => {
        select.add(new Option("Ripristina: " + item.titolo, item.id));
    });
    if ([...select.options].some(option => option.value === selected)) select.value = selected;
}
function disegnaSezioni() {
    const container = el("parishSectionsEditor");
    container.replaceChildren();
    for (const item of sezioni) {
        const card = document.createElement("section");
        card.className = "parish-editor-section";
        card.dataset.sectionId = item.id;
        const heading = document.createElement("h3");
        heading.tabIndex = -1;
        heading.textContent = item.titolo || "Nuova sezione";
        const actions = document.createElement("div");
        actions.className = "parish-section-actions";
        const visible = document.createElement("input");
        visible.type = "checkbox";
        visible.checked = item.visibile;
        visible.addEventListener("change", () => { item.visibile = visible.checked; });
        const label = document.createElement("label");
        label.append(visible, document.createTextNode(" Mostra sul sito"));
        actions.append(label);
        function button(text, handler) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "admin-button admin-button-secondary";
            btn.textContent = text;
            btn.addEventListener("click", handler);
            actions.append(btn);
            return btn;
        }
        function move(delta) {
            const index = sezioni.indexOf(item);
            if (index + delta < 0 || index + delta >= sezioni.length) return;
            [sezioni[index], sezioni[index + delta]] = [sezioni[index + delta], sezioni[index]];
            const sibling = delta < 0 ? card.previousElementSibling : card.nextElementSibling;
            if (delta < 0) container.insertBefore(card, sibling);
            else container.insertBefore(sibling, card);
            aggiornaComandi();
            heading.focus();
        }
        button("Sposta su", () => move(-1)).dataset.moveUp = "";
        button("Sposta giù", () => move(1)).dataset.moveDown = "";
        button("Elimina sezione", () => {
            const index = sezioni.indexOf(item);
            eliminate.push({ item, index });
            sezioni.splice(index, 1);
            card.remove();
            aggiornaComandi();
            el("parishUndo").focus();
            messaggio("Sezione rimossa dal modulo. Puoi annullare oppure salvare per pubblicare.");
        });
        card.append(heading, actions);
        function field(key, text, multiline = false) {
            const wrapper = document.createElement("div");
            wrapper.className = "admin-field";
            const input = document.createElement(multiline ? "textarea" : "input");
            if (!multiline) input.type = "text";
            input.id = "parishSection_" + item.id + "_" + key;
            input.maxLength = multiline ? 12000 : 200;
            input.value = item[key] || "";
            if (multiline) input.style.minHeight = "140px";
            input.addEventListener("input", () => {
                item[key] = input.value;
                if (key === "titolo") heading.textContent = input.value.trim() || "Nuova sezione";
            });
            const title = document.createElement("label");
            title.htmlFor = input.id;
            title.textContent = text;
            wrapper.append(title, input);
            card.append(wrapper);
        }
        if (item.tipo === "testo") {
            field("etichetta", "Frase sopra il titolo");
            field("titolo", "Titolo");
            field("testo1", "Testo");
            field("testo2", "Altro paragrafo (facoltativo)", true);
            // Anche il primo testo è un paragrafo multilinea.
            const first = card.querySelector("#parishSection_" + item.id + "_testo1");
            const area = document.createElement("textarea");
            area.id = first.id;
            area.maxLength = 12000;
            area.style.minHeight = "160px";
            area.value = item.testo1 || "";
            area.addEventListener("input", () => { item.testo1 = area.value; });
            first.replaceWith(area);
            const photo = document.createElement("img");
            photo.className = "parish-section-photo-preview";
            photo.alt = "Anteprima foto della sezione";
            function updatePhoto() {
                photo.hidden = !(item.anteprima || item.foto);
                if (!photo.hidden) photo.src = item.anteprima || item.foto;
                else photo.removeAttribute("src");
            }
            updatePhoto();
            const file = document.createElement("input");
            file.type = "file";
            file.id = "parishPhoto_" + item.id;
            file.accept = "image/jpeg,image/png,image/webp";
            const fileLabel = document.createElement("label");
            fileLabel.htmlFor = file.id;
            fileLabel.textContent = "Foto facoltativa (JPG, PNG o WEBP, massimo 5 MB)";
            file.addEventListener("change", () => {
                const selected = file.files[0];
                if (!selected) return;
                if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
                    file.value = "";
                    messaggio("Scegli una foto JPG, PNG o WEBP fino a 5 MB.");
                    return;
                }
                letture++;
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const image = new Image();
                        image.src = reader.result;
                        await image.decode();
                        if (file.files[0] !== selected) return;
                        item.file = selected;
                        item.anteprima = reader.result;
                        updatePhoto();
                    } catch {
                        if (file.files[0] === selected) file.value = "";
                        messaggio("Impossibile leggere questa immagine. Scegli un altro file.");
                    } finally { letture--; }
                };
                reader.onerror = () => { letture--; messaggio("Impossibile leggere la foto. Riprova."); };
                reader.readAsDataURL(selected);
            });
            const removePhoto = document.createElement("button");
            removePhoto.type = "button";
            removePhoto.className = "admin-button admin-button-secondary";
            removePhoto.textContent = "Rimuovi foto";
            removePhoto.addEventListener("click", () => {
                item.foto = "";
                item.file = null;
                item.anteprima = "";
                file.value = "";
                updatePhoto();
            });
            const photoField = document.createElement("div");
            photoField.className = "admin-field";
            photoField.append(fileLabel, photo, file, removePhoto);
            card.append(photoField);
            field("alt", "Descrizione della foto");
        } else {
            const note = document.createElement("p");
            note.className = "parish-editor-description";
            note.textContent = item.tipo === "messe"
                ? "Gli orari restano collegati alla gestione Orari Messe."
                : "Questo blocco invita a visitare la pagina Contatti.";
            card.append(note);
        }
        container.append(card);
    }
    aggiornaComandi();
}
export function inizializzaTestiParrocchia(deps) {
    api = deps;
    el("parishRetry").addEventListener("click", caricaTestiParrocchiaAdmin);
    el("parishAdd").addEventListener("click", () => {
        const selected = el("parishSectionType").value;
        const preset = sezioniPredefinite.find(item => item.id === selected);
        const item = preset ? { ...preset } : {
            id: "sezione-" + crypto.randomUUID(), tipo: "testo", titolo: "Nuova sezione",
            etichetta: "", testo1: "", testo2: "", foto: "", alt: "", visibile: true
        };
        sezioni.push(item);
        disegnaSezioni();
        el("parishSectionsEditor").lastElementChild.querySelector("h3").focus();
    });
    el("parishUndo").addEventListener("click", () => {
        const removed = eliminate.pop();
        if (!removed) return;
        // Se è già stato ripristinato un blocco standard, l'annullamento recupera i contenuti eliminati.
        sezioni = sezioni.filter(item => item.id !== removed.item.id);
        sezioni.splice(Math.min(removed.index, sezioni.length), 0, removed.item);
        disegnaSezioni();
    });
    el("parishForm").addEventListener("submit", async event => {
        event.preventDefault();
        if (!pronto || !api.auth.currentUser || el("parishFields").disabled) return;
        if (letture) { messaggio("Attendi il caricamento delle anteprime prima di salvare."); return; }
        if (!event.currentTarget.reportValidity()) return;
        const testi = {};
        el("parishFields").querySelectorAll("[data-parrocchia-field]").forEach(input => {
            testi[input.dataset.parrocchiaField] = input.value.trim();
        });
        el("parishFields").disabled = true;
        try {
            const salvate = [];
            for (const item of sezioni) {
                if (item.file) {
                    messaggio("Caricamento foto: " + (item.titolo || "Nuova sezione") + "...");
                    const url = await api.upload(item.file);
                    if (!urlFotoSezione(url)) throw new Error("Indirizzo immagine non valido.");
                    item.foto = url;
                    item.file = null;
                }
                const section = { id: item.id, tipo: item.tipo, visibile: item.visibile };
                for (const key of ["titolo", "etichetta", "testo1", "testo2", "foto", "alt"]) {
                    section[key] = typeof item[key] === "string" ? item[key].trim() : "";
                }
                salvate.push(section);
            }
            await api.setDoc(api.doc(api.db, "impostazioni", "parrocchia"), {
                testi, sezioni: salvate, modificatoDa: api.auth.currentUser.uid, modificatoIl: api.serverTimestamp()
            }, { merge: true });
            sezioni = salvate;
            eliminate = [];
            disegnaSezioni();
            messaggio("Pagina salvata! Ricarica La Parrocchia per vedere le modifiche.");
        } catch (errore) {
            console.error("Errore salvataggio Parrocchia:", errore);
            messaggio("Salvataggio non riuscito. Le modifiche restano nel modulo: riprova.");
        } finally { el("parishFields").disabled = !api.auth.currentUser; }
    });
}
export async function caricaTestiParrocchiaAdmin() {
    if (!api.auth.currentUser) return;
    pronto = false;
    el("parishFields").disabled = true;
    el("parishRetry").hidden = true;
    messaggio("Caricamento della pagina...");
    try {
        const snapshot = await api.getDoc(api.doc(api.db, "impostazioni", "parrocchia"));
        const dati = snapshot.exists() ? snapshot.data() : {};
        el("parishFields").querySelectorAll("[data-parrocchia-field]").forEach(input => {
            const value = dati.testi?.[input.dataset.parrocchiaField];
            input.value = typeof value === "string" ? value : input.defaultValue;
        });
        sezioni = leggiSezioniParrocchia(dati);
        eliminate = [];
        disegnaSezioni();
        pronto = true;
        el("parishFields").disabled = !api.auth.currentUser;
        messaggio("Modifica e riordina le sezioni, poi premi Salva pagina.");
    } catch (errore) {
        console.error("Errore caricamento Parrocchia:", errore);
        messaggio("Impossibile leggere la pagina salvata. Riprova il caricamento.");
        el("parishRetry").hidden = false;
    }
}