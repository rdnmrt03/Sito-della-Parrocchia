import { inizializzaSocialEditor, caricaSocialEditor, leggiSocialEditor } from "./footer-social-admin.js";
import { urlFooterValido } from "./footer-url.js";
let api;
let pronto = false;
const el = id => document.getElementById(id);
export function inizializzaFooterAdmin(deps) {
    api = deps;
    inizializzaSocialEditor();
    el("footerRetry").addEventListener("click", caricaFooterAdmin);
    el("footerForm").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!api.auth.currentUser || !pronto || el("footerFields").disabled) return;
        if (!form.reportValidity()) return;
        for (const input of document.querySelectorAll("[data-footer-url]")) {
            if (!urlFooterValido(input.value.trim())) {
                el("footerMessage").textContent = "Collegamento non valido. Usa una pagina del sito o un indirizzo http, https, mailto o tel.";
                input.focus();
                return;
            }
        }
        let social;
        try { social = leggiSocialEditor(); }
        catch (errore) { el("footerMessage").textContent = errore.message; return; }
        const testi = {};
        document.querySelectorAll("[data-footer-field]").forEach(input => {
            testi[input.dataset.footerField] = input.value.trim();
        });
        el("footerFields").disabled = true;
        el("footerMessage").textContent = "Salvataggio in corso...";
        try {
            await api.setDoc(api.doc(api.db, "impostazioni", "footer"), {
                testi, social, modificatoDa: api.auth.currentUser.uid, modificatoIl: api.serverTimestamp()
            }, { merge: true });
            el("footerMessage").textContent = "Footer salvato! Ricarica la pagina del sito per vedere le modifiche.";
        } catch (errore) {
            console.error("Errore salvataggio footer:", errore);
            el("footerMessage").textContent = "Salvataggio non riuscito. Le modifiche restano nel modulo: riprova.";
        } finally {
            el("footerFields").disabled = !api.auth.currentUser;
        }
    });
}
export async function caricaFooterAdmin() {
    if (!api.auth.currentUser) return;
    pronto = false;
    el("footerFields").disabled = true;
    el("footerRetry").hidden = true;
    el("footerMessage").textContent = "Caricamento del footer...";
    try {
        const snapshot = await api.getDoc(api.doc(api.db, "impostazioni", "footer"));
        const dati = snapshot.exists() ? snapshot.data() : {};
        const testi = dati.testi;
        caricaSocialEditor(dati);
        document.querySelectorAll("[data-footer-field]").forEach(input => {
            const value = testi?.[input.dataset.footerField];
            input.value = typeof value === "string" ? value : input.defaultValue;
        });
        pronto = true;
        el("footerFields").disabled = !api.auth.currentUser;
        el("footerMessage").textContent = "Modifica i contenuti, poi premi Salva footer.";
    } catch (errore) {
        console.error("Errore caricamento footer:", errore);
        el("footerMessage").textContent = errore.code === "permission-denied"
            ? "Pubblica le regole Firebase per impostazioni/footer, poi riprova il caricamento."
            : "Impossibile caricare il footer. Riprova.";
        el("footerRetry").hidden = false;
    }
}