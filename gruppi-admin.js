import { getDocFromServer } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

let api;

let pronte = false;

let gruppi = [];

let ultimoEliminato = null;

const el = id => document.getElementById(id);

const gruppiPredefiniti = [

    {

        id: "giovani",

        visibile: true,

        etichetta: "GIOVANI",

        titolo: "Gruppo Giovani",

        descrizione: "",

        info1Titolo: "PER CHI",

        info1Testo: "Giovani",

        info2Titolo: "INCONTRI",

        info2Testo: "Settimanali",

        pulsante: "Chiedi informazioni →",

        foto: "immagini/gruppo-giovani.jpg",

        alt: "Gruppo Giovani"

    },

    {

        id: "ac",

        visibile: true,

        etichetta: "AZIONE CATTOLICA",

        titolo: "Azione Cattolica",

        descrizione: "",

        info1Titolo: "PER CHI",

        info1Testo: "Ragazzi, giovani e adulti",

        info2Titolo: "INCONTRI",

        info2Testo: "Periodici",

        pulsante: "Chiedi informazioni →",

        foto: "immagini/azione-cattolica.jpg",

        alt: "Azione Cattolica"

    },

    {

        id: "catechismo",

        visibile: true,

        etichetta: "CATECHESI",

        titolo: "Catechismo",

        descrizione: "",

        info1Titolo: "PER CHI",

        info1Testo: "Bambini e ragazzi",

        info2Titolo: "INCONTRI",

        info2Testo: "Settimanali",

        pulsante: "Chiedi informazioni →",

        foto: "immagini/catechismo.jpg",

        alt: "Catechismo"

    },

    {

        id: "coro",

        visibile: true,

        etichetta: "MUSICA E LITURGIA",

        titolo: "Coro Parrocchiale",

        descrizione: "",

        info1Titolo: "PER CHI",

        info1Testo: "Tutti",

        info2Titolo: "PROVE",

        info2Testo: "Settimanali",

        pulsante: "Chiedi informazioni →",

        foto: "immagini/coro.jpg",

        alt: "Coro Parrocchiale"

    }

];

export function inizializzaGruppiAdmin(deps) {
    api = deps;

    el("groupsRetry")?.addEventListener("click", caricaGruppiAdmin);

    el("groupAdd")?.addEventListener("click", aggiungiGruppo);
    el("groupUndo")?.addEventListener("click", ripristinaUltimoGruppo);

    const groupsForm = el("groupsForm");
    groupsForm?.addEventListener("submit", event => {
        event.preventDefault();
        salvaGruppi(event);
    });

    // Intercetta direttamente il pulsante Salva anche se il form cambia.
    document.addEventListener("click", event => {
        const saveButton = event.target.closest("#groupsSaveButton");
        if (!saveButton) return;

        event.preventDefault();
        event.stopPropagation();
        salvaGruppi(event);
    }, true);
}

export async function caricaGruppiAdmin() {

    if (!api?.auth?.currentUser) return;

    pronte = false;

    if (el("groupsFields")) {

        el("groupsFields").disabled = true;

    }

    if (el("groupsRetry")) {

        el("groupsRetry").hidden = true;

    }

    if (el("groupsMessage")) {

        el("groupsMessage").textContent = "Caricamento dei contenuti...";

    }

    try {

        const snapshot = await getDocFromServer(
            api.doc(api.db, "impostazioni", "gruppi")
        );

        const dati = snapshot.exists() ? snapshot.data() : {};

        caricaTestiGenerali(dati);

        gruppi = leggiGruppiSalvati(dati);

        ultimoEliminato = null;

        aggiornaPulsanteAnnulla();

        renderGruppi();

        pronte = true;

        if (el("groupsFields")) {

            el("groupsFields").disabled = false;

        }

        if (el("groupsMessage")) {

            el("groupsMessage").textContent =

                "Modifica i contenuti, aggiungi o riordina i gruppi, poi premi Salva gruppi.";

        }

    } catch (errore) {

        console.error("Errore caricamento gruppi:", errore);

        if (el("groupsMessage")) {

            el("groupsMessage").textContent =

                errore.code === "permission-denied"

                    ? "Pubblica le regole Firebase per impostazioni/gruppi, poi premi Riprova il caricamento."

                    : "Impossibile leggere i contenuti salvati. Riprova. " +

                      errore.message;

        }

        if (el("groupsRetry")) {

            el("groupsRetry").hidden = false;

        }

    }

}

function caricaTestiGenerali(dati) {

    document.querySelectorAll("[data-group-field]").forEach(input => {

        const value = dati.testi?.[input.dataset.groupField];

        input.value =

            typeof value === "string"

                ? value

                : input.defaultValue;

    });

}

function leggiGruppiSalvati(dati) {

    if (Array.isArray(dati.gruppi)) {

        return dati.gruppi

            .filter(item => item && typeof item.id === "string")

            .map(normalizzaGruppo);

    }

    return gruppiPredefiniti.map(predefinito => {

        const gruppo = { ...predefinito };

        const vecchiaImmagine =

            dati.immagini?.[predefinito.id];

        if (

            vecchiaImmagine &&

            typeof vecchiaImmagine.url === "string" &&

            vecchiaImmagine.url

        ) {

            gruppo.foto = vecchiaImmagine.url;

        }

        if (

            vecchiaImmagine &&

            typeof vecchiaImmagine.alt === "string"

        ) {

            gruppo.alt = vecchiaImmagine.alt;

        }

        applicaVecchiTesti(gruppo, dati.testi);

        return normalizzaGruppo(gruppo);

    });

}

function applicaVecchiTesti(gruppo, testi = {}) {

    if (!testi || typeof testi !== "object") return;

    const prefissi = [

        gruppo.id,

        gruppo.id === "ac" ? "azione_cattolica" : "",

        gruppo.id === "giovani" ? "gruppo_giovani" : ""

    ].filter(Boolean);

    const cerca = nomi => {

        for (const prefisso of prefissi) {

            for (const nome of nomi) {

                const chiave = `${prefisso}_${nome}`;

                if (typeof testi[chiave] === "string") {

                    return testi[chiave];

                }

            }

        }

        return null;

    };

    const etichetta = cerca(["etichetta", "label", "1"]);

    const titolo = cerca(["titolo", "title", "2"]);

    const descrizione = cerca(["descrizione", "testo", "3"]);

    const info1Titolo = cerca(["info1_titolo", "info_1_titolo", "4"]);

    const info1Testo = cerca(["info1_testo", "info_1_testo", "5"]);

    const info2Titolo = cerca(["info2_titolo", "info_2_titolo", "6"]);

    const info2Testo = cerca(["info2_testo", "info_2_testo", "7"]);

    const pulsante = cerca(["pulsante", "button", "cta", "8"]);

    if (etichetta !== null) gruppo.etichetta = etichetta;

    if (titolo !== null) gruppo.titolo = titolo;

    if (descrizione !== null) gruppo.descrizione = descrizione;

    if (info1Titolo !== null) gruppo.info1Titolo = info1Titolo;

    if (info1Testo !== null) gruppo.info1Testo = info1Testo;

    if (info2Titolo !== null) gruppo.info2Titolo = info2Titolo;

    if (info2Testo !== null) gruppo.info2Testo = info2Testo;

    if (pulsante !== null) gruppo.pulsante = pulsante;

}

function normalizzaGruppo(item) {

    return {

        id:

            typeof item.id === "string" && item.id

                ? item.id

                : creaIdGruppo(),

        visibile: item.visibile !== false,

        etichetta:

            typeof item.etichetta === "string"

                ? item.etichetta

                : "",

        titolo:

            typeof item.titolo === "string"

                ? item.titolo

                : "",

        descrizione:

            typeof item.descrizione === "string"

                ? item.descrizione

                : "",

        info1Titolo:

            typeof item.info1Titolo === "string"

                ? item.info1Titolo

                : "",

        info1Testo:

            typeof item.info1Testo === "string"

                ? item.info1Testo

                : "",

        info2Titolo:

            typeof item.info2Titolo === "string"

                ? item.info2Titolo

                : "",

        info2Testo:

            typeof item.info2Testo === "string"

                ? item.info2Testo

                : "",

        pulsante:

            typeof item.pulsante === "string"

                ? item.pulsante

                : "Chiedi informazioni →",

        foto:

            typeof item.foto === "string"

                ? item.foto

                : "",

        alt:

            typeof item.alt === "string"

                ? item.alt

                : "",

        file: null

    };

}

function creaIdGruppo() {

    if (

        typeof crypto !== "undefined" &&

        typeof crypto.randomUUID === "function"

    ) {

        return "gruppo-" + crypto.randomUUID();

    }

    return (

        "gruppo-" +

        Date.now() +

        "-" +

        Math.random().toString(36).slice(2, 9)

    );

}

function aggiungiGruppo() {

    if (!pronte) return;

    gruppi.push({

        id: creaIdGruppo(),

        visibile: true,

        etichetta: "GRUPPO PARROCCHIALE",

        titolo: "Nuovo gruppo",

        descrizione: "",

        info1Titolo: "PER CHI",

        info1Testo: "",

        info2Titolo: "INCONTRI",

        info2Testo: "",

        pulsante: "Chiedi informazioni →",

        foto: "",

        alt: "",

        file: null

    });

    renderGruppi();

    if (el("groupsMessage")) {

        el("groupsMessage").textContent =

            "Nuovo gruppo aggiunto. Completa i campi e premi Salva gruppi.";

    }

    const cards = el("groupsEditor")?.querySelectorAll(

        ".group-editor-card"

    );

    const ultima = cards?.[cards.length - 1];

    ultima?.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}

function renderGruppi() {

    const container = el("groupsEditor");

    if (!container) return;

    container.innerHTML = "";

    gruppi.forEach((gruppo, indice) => {

        container.appendChild(

            creaSchedaGruppo(gruppo, indice)

        );

    });

    if (el("groupsEmpty")) {

        el("groupsEmpty").hidden = gruppi.length !== 0;

    }

    aggiornaPulsanteAnnulla();

}

function creaSchedaGruppo(gruppo, indice) {

    const section = document.createElement("section");

    section.className =

        "parish-editor-section group-editor-card";

    section.dataset.groupId = gruppo.id;

    const intestazione = document.createElement("div");

    intestazione.style.display = "flex";

    intestazione.style.justifyContent = "space-between";

    intestazione.style.alignItems = "center";

    intestazione.style.gap = "20px";

    intestazione.style.flexWrap = "wrap";

    intestazione.style.marginBottom = "20px";

    const titoloScheda = document.createElement("h3");

    titoloScheda.textContent =

        gruppo.titolo || `Gruppo ${indice + 1}`;

    titoloScheda.style.margin = "0";

    const visibilita = document.createElement("label");

    visibilita.style.display = "flex";

    visibilita.style.alignItems = "center";

    visibilita.style.gap = "8px";

    visibilita.style.cursor = "pointer";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = gruppo.visibile;

    checkbox.addEventListener("change", () => {

        gruppo.visibile = checkbox.checked;

    });

    const testoVisibilita = document.createElement("span");

    testoVisibilita.textContent = "Mostra sul sito";

    visibilita.append(

        checkbox,

        testoVisibilita

    );

    intestazione.append(

        titoloScheda,

        visibilita

    );

    section.append(intestazione);

    section.append(

        creaCampoTesto(

            "Etichetta",

            gruppo.etichetta,

            value => {

                gruppo.etichetta = value;

            },

            200

        )

    );

    section.append(

        creaCampoTesto(

            "Titolo del gruppo",

            gruppo.titolo,

            value => {

                gruppo.titolo = value;

                titoloScheda.textContent =

                    value || `Gruppo ${indice + 1}`;

            },

            200

        )

    );

    section.append(

        creaCampoTextarea(

            "Descrizione",

            gruppo.descrizione,

            value => {

                gruppo.descrizione = value;

            }

        )

    );

    const griglia1 = document.createElement("div");

    griglia1.className = "admin-field-grid";

    griglia1.append(

        creaCampoTesto(

            "Titolo informazione 1",

            gruppo.info1Titolo,

            value => {

                gruppo.info1Titolo = value;

            },

            100

        ),

        creaCampoTesto(

            "Testo informazione 1",

            gruppo.info1Testo,

            value => {

                gruppo.info1Testo = value;

            },

            300

        )

    );

    section.append(griglia1);

    const griglia2 = document.createElement("div");

    griglia2.className = "admin-field-grid";

    griglia2.append(

        creaCampoTesto(

            "Titolo informazione 2",

            gruppo.info2Titolo,

            value => {

                gruppo.info2Titolo = value;

            },

            100

        ),

        creaCampoTesto(

            "Testo informazione 2",

            gruppo.info2Testo,

            value => {

                gruppo.info2Testo = value;

            },

            300

        )

    );

    section.append(griglia2);

    section.append(

        creaCampoTesto(

            "Testo del pulsante",

            gruppo.pulsante,

            value => {

                gruppo.pulsante = value;

            },

            200

        )

    );

    section.append(

        creaGestioneFoto(gruppo)

    );

    const azioni = document.createElement("div");

    azioni.className = "admin-actions";

    azioni.style.marginTop = "24px";

    azioni.style.flexWrap = "wrap";

    const su = creaPulsante(

        "↑ Sposta su",

        () => spostaGruppo(indice, -1)

    );

    const giu = creaPulsante(

        "↓ Sposta giù",

        () => spostaGruppo(indice, 1)

    );

    const elimina = creaPulsante(

        "Elimina",

        () => eliminaGruppo(indice)

    );

    su.disabled = indice === 0;

    giu.disabled = indice === gruppi.length - 1;

    elimina.style.borderColor = "#a32626";

    elimina.style.color = "#a32626";

    azioni.append(

        su,

        giu,

        elimina

    );

    section.append(azioni);

    return section;

}

function creaCampoTesto(

    labelText,

    value,

    onInput,

    maxlength = 300

) {

    const wrapper = document.createElement("div");

    wrapper.className = "admin-field";

    const label = document.createElement("label");

    label.textContent = labelText;

    const input = document.createElement("input");

    input.type = "text";

    input.value = value || "";

    input.maxLength = maxlength;

    input.addEventListener("input", () => {

        onInput(input.value);

    });

    wrapper.append(

        label,

        input

    );

    return wrapper;

}

function creaCampoTextarea(

    labelText,

    value,

    onInput

) {

    const wrapper = document.createElement("div");

    wrapper.className = "admin-field";

    const label = document.createElement("label");

    label.textContent = labelText;

    const textarea = document.createElement("textarea");

    textarea.value = value || "";

    textarea.maxLength = 12000;

    textarea.style.minHeight = "140px";

    textarea.addEventListener("input", () => {

        onInput(textarea.value);

    });

    wrapper.append(

        label,

        textarea

    );

    return wrapper;

}

function creaGestioneFoto(gruppo) {

    const wrapper = document.createElement("div");

    wrapper.className = "admin-field";

    const label = document.createElement("label");

    label.textContent = "Foto del gruppo";

    const box = document.createElement("div");

    box.className = "admin-file-box";

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/jpeg,image/png,image/webp";

    const spiegazione = document.createElement("p");

    spiegazione.textContent =

        "JPG, PNG o WEBP fino a 5 MB.";

    const preview = document.createElement("img");

    preview.className = "admin-image-preview";

    preview.alt = gruppo.alt || "Anteprima foto";

    if (gruppo.foto) {

        preview.src = gruppo.foto;

    } else {

        preview.hidden = true;

    }

    input.addEventListener("change", () => {

        const file = input.files?.[0];

        if (!file) {

            gruppo.file = null;

            if (gruppo.foto) {

                preview.src = gruppo.foto;

                preview.hidden = false;

            }

            return;

        }

        if (

            ![

                "image/jpeg",

                "image/png",

                "image/webp"

            ].includes(file.type) ||

            file.size > 5 * 1024 * 1024

        ) {

            input.value = "";

            if (el("groupsMessage")) {

                el("groupsMessage").textContent =

                    "Scegli una foto JPG, PNG o WEBP fino a 5 MB.";

            }

            return;

        }

        gruppo.file = file;

        const reader = new FileReader();

        reader.onload = () => {

            if (gruppo.file === file) {

                preview.src = reader.result;

                preview.hidden = false;

            }

        };

        reader.readAsDataURL(file);

    });

    box.append(

        input,

        spiegazione,

        preview

    );

    wrapper.append(

        label,

        box

    );

    const altWrapper = document.createElement("div");

    altWrapper.className = "admin-field";

    const altLabel = document.createElement("label");

    altLabel.textContent =

        "Descrizione della foto";

    const altInput = document.createElement("input");

    altInput.type = "text";

    altInput.maxLength = 300;

    altInput.value = gruppo.alt || "";

    altInput.placeholder =

        "Es. Foto del Gruppo Giovani";

    altInput.addEventListener("input", () => {

        gruppo.alt = altInput.value;

        preview.alt =

            altInput.value || "Anteprima foto";

    });

    altWrapper.append(

        altLabel,

        altInput

    );

    const contenitore = document.createElement("div");

    contenitore.append(

        wrapper,

        altWrapper

    );

    return contenitore;

}

function creaPulsante(testo, azione) {

    const button = document.createElement("button");

    button.type = "button";

    button.className =

        "admin-button admin-button-secondary";

    button.textContent = testo;

    button.addEventListener("click", azione);

    return button;

}

function spostaGruppo(indice, direzione) {

    const nuovoIndice = indice + direzione;

    if (

        nuovoIndice < 0 ||

        nuovoIndice >= gruppi.length

    ) {

        return;

    }

    const [gruppo] = gruppi.splice(indice, 1);

    gruppi.splice(

        nuovoIndice,

        0,

        gruppo

    );

    renderGruppi();

    if (el("groupsMessage")) {

        el("groupsMessage").textContent =

            "Ordine modificato. Premi Salva gruppi per pubblicarlo.";

    }

}

function eliminaGruppo(indice) {

    const gruppo = gruppi[indice];

    if (!gruppo) return;

    ultimoEliminato = {

        gruppo: { ...gruppo },

        indice

    };

    gruppi.splice(indice, 1);

    renderGruppi();

    if (el("groupsMessage")) {

        el("groupsMessage").textContent =

            `"${gruppo.titolo || "Gruppo"}" eliminato. ` +

            "Puoi annullare l'eliminazione oppure premere Salva gruppi.";

    }

}

function ripristinaUltimoGruppo() {

    if (!ultimoEliminato) return;

    const indice = Math.min(

        ultimoEliminato.indice,

        gruppi.length

    );

    gruppi.splice(

        indice,

        0,

        ultimoEliminato.gruppo

    );

    ultimoEliminato = null;

    renderGruppi();

    if (el("groupsMessage")) {

        el("groupsMessage").textContent =

            "Gruppo ripristinato. Premi Salva gruppi per pubblicare le modifiche.";

    }

}

function aggiornaPulsanteAnnulla() {

    if (el("groupUndo")) {

        el("groupUndo").hidden =

            !ultimoEliminato;

    }

}

async function salvaGruppi(event) {
    event?.preventDefault();

    const messaggio = el("groupsMessage");

    if (messaggio) {
        messaggio.textContent = "Avvio salvataggio...";
    }

    if (!api?.auth?.currentUser) {
        if (messaggio) {
            messaggio.textContent = "Salvataggio bloccato: sessione amministratore non disponibile.";
        }
        return;
    }

    if (!pronte) {
        if (messaggio) {
            messaggio.textContent = "Salvataggio bloccato: i gruppi non sono ancora pronti.";
        }
        return;
    }

    const fields = el("groupsFields");
    if (fields?.disabled) {
        if (messaggio) {
            messaggio.textContent = "Salvataggio già in corso. Attendi qualche secondo.";
        }
        return;
    }

    if (fields) {
        fields.disabled = true;
    }

    if (messaggio) {
        messaggio.textContent = "Salvataggio in corso...";
    }

    try {

        const testi = {};

        document

            .querySelectorAll("[data-group-field]")

            .forEach(input => {

                testi[input.dataset.groupField] =

                    input.value.trim();

            });

        for (const gruppo of gruppi) {

            if (gruppo.file) {

                if (el("groupsMessage")) {

                    el("groupsMessage").textContent =

                        `Caricamento foto di "${gruppo.titolo || "gruppo"}"...`;

                }

                gruppo.foto =

                    await api.upload(gruppo.file);

                gruppo.file = null;

            }

        }

        const gruppiDaSalvare = gruppi.map(

            gruppo => ({

                id: gruppo.id,

                visibile: gruppo.visibile !== false,

                etichetta: gruppo.etichetta.trim(),

                titolo: gruppo.titolo.trim(),

                descrizione: gruppo.descrizione.trim(),

                info1Titolo:

                    gruppo.info1Titolo.trim(),

                info1Testo:

                    gruppo.info1Testo.trim(),

                info2Titolo:

                    gruppo.info2Titolo.trim(),

                info2Testo:

                    gruppo.info2Testo.trim(),

                pulsante:

                    gruppo.pulsante.trim(),

                foto:

                    typeof gruppo.foto === "string"

                        ? gruppo.foto

                        : "",

                alt:

                    gruppo.alt.trim()

            })

        );

        await api.setDoc(

            api.doc(

                api.db,

                "impostazioni",

                "gruppi"

            ),

            {

                testi,

                gruppi: gruppiDaSalvare,

                modificatoDa:

                    api.auth.currentUser.uid,

                modificatoIl:

                    api.serverTimestamp()

            },

            {

                merge: true

            }

        );

        // Verifica immediatamente ciò che Firebase restituisce dopo il salvataggio.
        const verificaSnapshot = await getDocFromServer(
            api.doc(api.db, "impostazioni", "gruppi")
        );

        if (!verificaSnapshot.exists()) {
            throw new Error("Il documento impostazioni/gruppi non esiste dopo il salvataggio.");
        }

        const verificaDati = verificaSnapshot.data();

        if (!Array.isArray(verificaDati.gruppi)) {
            throw new Error("Firebase non ha restituito l'elenco dei gruppi appena salvato.");
        }

        gruppi = verificaDati.gruppi.map(normalizzaGruppo);
        ultimoEliminato = null;
        aggiornaPulsanteAnnulla();
        renderGruppi();

        if (el("groupsMessage")) {
            const primoTitolo = gruppi[0]?.titolo || "(senza titolo)";
            el("groupsMessage").textContent =
                `Firebase conferma il salvataggio. Primo gruppo: "${primoTitolo}"`;
        }

    } catch (errore) {

        console.error(

            "Errore salvataggio gruppi:",

            errore

        );

        if (el("groupsMessage")) {

            el("groupsMessage").textContent =

                "Salvataggio non riuscito. Le modifiche restano nel modulo. " +

                errore.message;

        }

    } finally {

        if (el("groupsFields")) {

            el("groupsFields").disabled = false;

        }

    }

}
