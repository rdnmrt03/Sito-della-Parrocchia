let api;
let pronto = false;
const el = id => document.getElementById(id);
export function inizializzaPrivacyAdmin(deps) {
    api = deps;
    el("privacyRetry").addEventListener("click", caricaPrivacyAdmin);
    el("privacyForm").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!api.auth.currentUser || !pronto || el("privacyFields").disabled) return;
        if (!form.reportValidity()) return;
        const testi = {};
        document.querySelectorAll("[data-privacy-field]").forEach(input => {
            testi[input.dataset.privacyField] = input.value.trim();
        });
        el("privacyFields").disabled = true;
        el("privacyMessage").textContent = "Salvataggio in corso...";
        try {
            await api.setDoc(api.doc(api.db, "impostazioni", "privacy"), {
                testi, modificatoDa: api.auth.currentUser.uid, modificatoIl: api.serverTimestamp()
            }, { merge: true });
            el("privacyMessage").textContent = "Privacy salvata! Ricarica la pagina Privacy per vedere le modifiche.";
        } catch (errore) {
            console.error("Errore salvataggio privacy:", errore);
            el("privacyMessage").textContent = "Salvataggio non riuscito. Le modifiche restano nel modulo: riprova.";
        } finally {
            el("privacyFields").disabled = !api.auth.currentUser;
        }
    });
}
export async function caricaPrivacyAdmin() {
    if (!api.auth.currentUser) return;
    pronto = false;
    el("privacyFields").disabled = true;
    el("privacyRetry").hidden = true;
    el("privacyMessage").textContent = "Caricamento della privacy...";
    try {
        const snapshot = await api.getDoc(api.doc(api.db, "impostazioni", "privacy"));
        const testi = snapshot.exists() ? snapshot.data().testi : {};
        document.querySelectorAll("[data-privacy-field]").forEach(input => {
            const value = testi?.[input.dataset.privacyField];
            input.value = typeof value === "string" ? value : input.defaultValue;
        });
        pronto = true;
        el("privacyFields").disabled = !api.auth.currentUser;
        el("privacyMessage").textContent = "Modifica i contenuti, poi premi Salva privacy.";
    } catch (errore) {
        console.error("Errore caricamento privacy:", errore);
        el("privacyMessage").textContent = errore.code === "permission-denied"
            ? "Pubblica le regole Firebase per impostazioni/privacy, poi riprova il caricamento."
            : "Impossibile caricare la privacy. Riprova.";
        el("privacyRetry").hidden = false;
    }
}