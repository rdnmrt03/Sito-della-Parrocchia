import { pagineImmagini, immaginePaginaPredefinita, urlImmaginePagina } from "./immagini-pagine-config.js";

let api;
let pronto = false;
let lettureInCorso = 0;
const foto = new Map();
const el = id => document.getElementById(id);
const messaggio = testo => { el("pageImagesMessage").textContent = testo; };

function aggiornaAnteprima(pagina) {
    const item = foto.get(pagina.id);
    const url = item.anteprima || item.url;
    const preview = el("pageImagePreview_" + pagina.id);
    preview.style.setProperty("--pagina-immagine", "url(" + JSON.stringify(url) + ")");
}

function creaCampi() {
    const container = el("pageImagesSlots");
    container.replaceChildren();
    for (const pagina of pagineImmagini) {
        foto.set(pagina.id, { url: immaginePaginaPredefinita, file: null, anteprima: "" });
        const section = document.createElement("section");
        section.className = "parish-editor-section";
        const heading = document.createElement("h3");
        heading.textContent = pagina.nome;
        const preview = document.createElement("div");
        preview.id = "pageImagePreview_" + pagina.id;
        preview.className = "page-image-preview";
        preview.style.setProperty("--pagina-sfumatura", pagina.sfumatura);
        preview.setAttribute("role", "img");
        preview.setAttribute("aria-label", "Anteprima dello sfondo: " + pagina.nome);
        const title = document.createElement("span");
        title.textContent = pagina.nome;
        preview.append(title);
        const label = document.createElement("label");
        label.htmlFor = "pageImageFile_" + pagina.id;
        label.textContent = "Scegli una nuova foto";
        const input = document.createElement("input");
        input.id = label.htmlFor;
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp";
        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
                input.value = "";
                messaggio("Scegli una foto JPG, PNG o WEBP fino a 5 MB.");
                return;
            }
            const item = foto.get(pagina.id);
            lettureInCorso++;
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const image = new Image();
                    image.src = reader.result;
                    await image.decode();
                    if (input.files[0] !== file) return;
                    item.file = file;
                    item.anteprima = reader.result;
                    aggiornaAnteprima(pagina);
                    messaggio("Anteprima aggiornata. Premi Salva immagini delle pagine per pubblicare.");
                } catch {
                    if (input.files[0] !== file) return;
                    input.value = "";
                    messaggio("Questa immagine non è leggibile. Scegli un altro file.");
                } finally { lettureInCorso--; }
            };
            reader.onerror = () => {
                lettureInCorso--;
                if (input.files[0] !== file) return;
                input.value = "";
                messaggio("Impossibile leggere il file. Riprova.");
            };
            reader.readAsDataURL(file);
        });
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "admin-button admin-button-secondary";
        reset.textContent = "Ripristina foto iniziale";
        reset.addEventListener("click", () => {
            foto.set(pagina.id, { url: immaginePaginaPredefinita, file: null, anteprima: "" });
            input.value = "";
            aggiornaAnteprima(pagina);
            messaggio("Foto iniziale selezionata. Premi Salva immagini delle pagine per pubblicare.");
        });
        const field = document.createElement("div");
        field.className = "admin-field";
        field.append(label, input);
        section.append(heading, preview, field, reset);
        container.append(section);
        aggiornaAnteprima(pagina);
    }
}

export function inizializzaImmaginiPagineAdmin(deps) {
    api = deps;
    creaCampi();
    el("pageImagesRetry").addEventListener("click", caricaImmaginiPagineAdmin);
    el("pageImagesForm").addEventListener("submit", async event => {
        event.preventDefault();
        if (!api.auth.currentUser || !pronto || el("pageImagesFields").disabled) return;
        if (lettureInCorso) { messaggio("Attendi che le anteprime siano pronte, poi salva."); return; }
        el("pageImagesFields").disabled = true;
        try {
            const immagini = {};
            for (const pagina of pagineImmagini) {
                const item = foto.get(pagina.id);
                if (item.file) {
                    messaggio("Caricamento foto: " + pagina.nome + "...");
                    const url = await api.upload(item.file);
                    if (!urlImmaginePagina(url)) throw new Error("Indirizzo immagine non valido.");
                    item.url = url;
                    item.file = null;
                }
                immagini[pagina.id] = { url: item.url };
            }
            messaggio("Salvataggio immagini...");
            await api.setDoc(api.doc(api.db, "impostazioni", "immaginiPagine"), {
                immagini, modificatoDa: api.auth.currentUser.uid, modificatoIl: api.serverTimestamp()
            }, { merge: true });
            for (const pagina of pagineImmagini) {
                foto.get(pagina.id).anteprima = "";
                el("pageImageFile_" + pagina.id).value = "";
                aggiornaAnteprima(pagina);
            }
            messaggio("Immagini salvate! Ricarica le pagine del sito per vedere le nuove foto.");
        } catch (errore) {
            console.error("Errore salvataggio immagini pagine:", errore);
            messaggio("Salvataggio non riuscito. Le foto selezionate restano nel modulo: riprova.");
        } finally {
            el("pageImagesFields").disabled = !api.auth.currentUser;
        }
    });
}

export async function caricaImmaginiPagineAdmin() {
    if (!api.auth.currentUser) return;
    pronto = false;
    el("pageImagesFields").disabled = true;
    el("pageImagesRetry").hidden = true;
    messaggio("Caricamento delle immagini salvate...");
    try {
        const snapshot = await api.getDoc(api.doc(api.db, "impostazioni", "immaginiPagine"));
        const immagini = snapshot.exists() ? snapshot.data().immagini : {};
        for (const pagina of pagineImmagini) {
            const url = urlImmaginePagina(immagini?.[pagina.id]?.url) || immaginePaginaPredefinita;
            foto.set(pagina.id, { url, file: null, anteprima: "" });
            el("pageImageFile_" + pagina.id).value = "";
            aggiornaAnteprima(pagina);
        }
        pronto = true;
        el("pageImagesFields").disabled = !api.auth.currentUser;
        messaggio("Scegli le foto da sostituire, poi premi Salva immagini delle pagine.");
    } catch (errore) {
        console.error("Errore caricamento immagini pagine:", errore);
        messaggio(errore.code === "permission-denied"
            ? "Pubblica le regole Firebase per impostazioni/immaginiPagine, poi riprova il caricamento."
            : "Impossibile leggere le immagini salvate. Riprova il caricamento.");
        el("pageImagesRetry").hidden = false;
    }
}