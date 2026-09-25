import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, getDocFromServer, doc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",
    authDomain: "parrocchia-vm.firebaseapp.com",
    projectId: "parrocchia-vm",
    storageBucket: "parrocchia-vm.firebasestorage.app",
    messagingSenderId: "25102143490",
    appId: "1:25102143490:web:713f02e631b4ae2311171b"
};

function testo(value) {
    return typeof value === "string" ? value : "";
}

function creaElemento(tag, value, className = "") {
    const elemento = document.createElement(tag);
    elemento.textContent = testo(value);
    elemento.style.whiteSpace = "pre-line";
    if (className) elemento.className = className;
    return elemento;
}

function creaSchedaGruppo(gruppo, numero) {
    const sezione = document.createElement("section");
    sezione.className = "gruppo-card";
    if (numero % 2 === 0) {
        sezione.classList.add("gruppo-inverso");
    }
    sezione.id = gruppo.id;

    const areaImmagine = document.createElement("div");
    areaImmagine.className = "gruppo-immagine";

    if (testo(gruppo.foto)) {
        const immagine = document.createElement("img");
        immagine.src = gruppo.foto;
        immagine.alt = testo(gruppo.alt) || testo(gruppo.titolo) || "Gruppo parrocchiale";
        immagine.loading = "lazy";
        immagine.addEventListener("error", () => {
            areaImmagine.hidden = true;
        });
        areaImmagine.appendChild(immagine);
    } else {
        areaImmagine.hidden = true;
    }

    const contenuto = document.createElement("div");
    contenuto.className = "gruppo-contenuto";

    const numeroGruppo = creaElemento("span", String(numero).padStart(2, "0"), "numero-gruppo");
    contenuto.appendChild(numeroGruppo);

    if (testo(gruppo.etichetta)) {
        contenuto.appendChild(creaElemento("p", gruppo.etichetta, "pagina-etichetta"));
    }

    if (testo(gruppo.titolo)) {
        contenuto.appendChild(creaElemento("h2", gruppo.titolo));
    }

    if (testo(gruppo.descrizione)) {
        contenuto.appendChild(creaElemento("p", gruppo.descrizione));
    }

    const haInfo1 = testo(gruppo.info1Titolo) || testo(gruppo.info1Testo);
    const haInfo2 = testo(gruppo.info2Titolo) || testo(gruppo.info2Testo);

    if (haInfo1 || haInfo2) {
        const info = document.createElement("div");
        info.className = "info-gruppo";

        if (haInfo1) {
            const blocco = document.createElement("div");
            if (testo(gruppo.info1Titolo)) {
                blocco.appendChild(creaElemento("span", gruppo.info1Titolo));
            }
            if (testo(gruppo.info1Testo)) {
                blocco.appendChild(creaElemento("strong", gruppo.info1Testo));
            }
            info.appendChild(blocco);
        }

        if (haInfo2) {
            const blocco = document.createElement("div");
            if (testo(gruppo.info2Titolo)) {
                blocco.appendChild(creaElemento("span", gruppo.info2Titolo));
            }
            if (testo(gruppo.info2Testo)) {
                blocco.appendChild(creaElemento("strong", gruppo.info2Testo));
            }
            info.appendChild(blocco);
        }

        contenuto.appendChild(info);
    }

    if (testo(gruppo.pulsante)) {
        const link = creaElemento("a", gruppo.pulsante, "pulsante-gruppo");
        link.href = "contatti.html";
        contenuto.appendChild(link);
    }

    sezione.append(areaImmagine, contenuto);
    return sezione;
}

function mostraGruppiDinamici(gruppi) {
    if (!Array.isArray(gruppi)) return;

    const container = document.querySelector(".gruppi-container");
    if (!container) return;

    const visibili = gruppi.filter(gruppo =>
        gruppo &&
        typeof gruppo.id === "string" &&
        gruppo.id.trim() &&
        gruppo.visibile !== false
    );

    const fragment = document.createDocumentFragment();

    visibili.forEach((gruppo, indice) => {
        fragment.appendChild(creaSchedaGruppo(gruppo, indice + 1));
    });

    container.replaceChildren(fragment);

    if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));
        const target = document.getElementById(id);
        if (target) {
            requestAnimationFrame(() => {
                target.scrollIntoView();
            });
        }
    }
}

function applicaTesti(testi) {
    document.querySelectorAll("[data-gruppi]").forEach(elemento => {
        const valore = testi?.[elemento.dataset.gruppi];
        if (typeof valore !== "string") return;

        elemento.textContent = valore;
        elemento.style.whiteSpace = "pre-line";
    });
}

async function caricaContenutiGruppi() {
    try {
        const app = getApps().some(app => app.name === "[DEFAULT]")
            ? getApp()
            : initializeApp(firebaseConfig);

        const db = getFirestore(app);

        // Leggiamo direttamente dal server, come nella versione Admin funzionante.
        const snapshot = await getDocFromServer(
            doc(db, "impostazioni", "gruppi")
        );

        if (!snapshot.exists()) return;

        const dati = snapshot.data();

        // Hero, introduzione e sezione finale.
        applicaTesti(dati.testi);

        // Se esiste il nuovo elenco dinamico, sostituisce le schede statiche.
        // Se non esiste, l'HTML originale resta come fallback.
        if (Array.isArray(dati.gruppi)) {
            mostraGruppiDinamici(dati.gruppi);
        }
    } catch (errore) {
        // In caso di problemi rimane visibile l'HTML originale della pagina.
        console.error("Errore caricamento contenuti Gruppi:", errore);
    }
}

caricaContenutiGruppi();
