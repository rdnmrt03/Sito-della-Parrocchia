let api;
let pronto = false;
const el = id => document.getElementById(id);
export function inizializzaContattiAdmin(deps) {
    api = deps;
    el("contactsRetry").addEventListener("click", caricaContattiAdmin);
    el("contactsForm").addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!api.auth.currentUser || !pronto || el("contactsFields").disabled) return;
        if (!form.reportValidity()) return;
        const testi = {};
        document.querySelectorAll("[data-contact-field]").forEach(input => {
            testi[input.dataset.contactField] = input.value.trim();
        });
        if (testi.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testi.email)) {
            el("contactsMessage").textContent = "Inserisci un indirizzo email valido.";
            return;
        }
        el("contactsFields").disabled = true;
        el("contactsMessage").textContent = "Salvataggio in corso...";
        try {
            await api.setDoc(api.doc(api.db, "impostazioni", "contatti"), {
                testi, modificatoDa: api.auth.currentUser.uid, modificatoIl: api.serverTimestamp()
            }, { merge: true });
            el("contactsMessage").textContent = "Contatti salvati! Ricarica la pagina Contatti per vedere le modifiche.";
        } catch (errore) {
            console.error("Errore salvataggio contatti:", errore);
            el("contactsMessage").textContent = "Salvataggio non riuscito. Le modifiche restano nel modulo: riprova.";
        } finally {
            el("contactsFields").disabled = !api.auth.currentUser;
        }
    });
}
export async function caricaContattiAdmin() {
    if (!api.auth.currentUser) return;
    pronto = false;
    el("contactsFields").disabled = true;
    el("contactsRetry").hidden = true;
    el("contactsMessage").textContent = "Caricamento dei contatti...";
    try {
        const snapshot = await api.getDoc(api.doc(api.db, "impostazioni", "contatti"));
        const testi = snapshot.exists() ? snapshot.data().testi : {};
        document.querySelectorAll("[data-contact-field]").forEach(input => {
            const value = testi?.[input.dataset.contactField];
            input.value = typeof value === "string" ? value : input.defaultValue;
        });
        pronto = true;
        el("contactsFields").disabled = !api.auth.currentUser;
        el("contactsMessage").textContent = "Modifica i contenuti, poi premi Salva contatti.";
    } catch (errore) {
        console.error("Errore caricamento contatti:", errore);
        el("contactsMessage").textContent = errore.code === "permission-denied"
            ? "Pubblica le regole Firebase per impostazioni/contatti, poi riprova il caricamento."
            : "Impossibile caricare i contatti. Riprova.";
        el("contactsRetry").hidden = false;
    }
}