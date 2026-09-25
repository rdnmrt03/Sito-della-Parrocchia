import { mostraSezioniParrocchia } from "./parrocchia-sezioni-pubbliche.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",
    authDomain: "parrocchia-vm.firebaseapp.com",
    projectId: "parrocchia-vm",
    storageBucket: "parrocchia-vm.firebasestorage.app",
    messagingSenderId: "25102143490",
    appId: "1:25102143490:web:713f02e631b4ae2311171b"
};

async function caricaTestiParrocchia() {
    try {
        const app = getApps().some(app => app.name === "[DEFAULT]")
            ? getApp() : initializeApp(firebaseConfig);
        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "parrocchia"));
        if (!snapshot.exists()) return;
        const dati = snapshot.data();
        const testi = dati.testi;
        document.querySelectorAll("[data-parrocchia]").forEach(elemento => {
            const valore = testi?.[elemento.dataset.parrocchia];
            if (typeof valore !== "string") return;
            elemento.textContent = valore;
            elemento.style.whiteSpace = "pre-line";
        });
        mostraSezioniParrocchia(dati);
    } catch (errore) {
        // I testi originali restano leggibili anche senza connessione.
        console.error("Errore caricamento testi Parrocchia:", errore);
    }
}

caricaTestiParrocchia();