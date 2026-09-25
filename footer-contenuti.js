import { mostraSocialFooter } from "./footer-social.js";
import { urlFooterValido } from "./footer-url.js";
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

export async function caricaContenutiFooter() {
    mostraSocialFooter();
    try {
        const app = getApps().some(app => app.name === "[DEFAULT]")
            ? getApp() : initializeApp(firebaseConfig);
        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "footer"));
        if (!snapshot.exists()) return;
        const dati = snapshot.data();
        mostraSocialFooter(dati);
        const testi = dati.testi;
        document.querySelectorAll("[data-footer-link]").forEach(elemento => {
            const valore = testi?.[elemento.dataset.footerLink];
            if (typeof valore !== "string" || !urlFooterValido(valore)) return;
            if (valore.trim()) elemento.setAttribute("href", valore.trim());
            else elemento.removeAttribute("href");
        });
        document.querySelectorAll("[data-footer]").forEach(elemento => {
            const valore = testi?.[elemento.dataset.footer];
            if (typeof valore !== "string") return;
            elemento.textContent = valore;
            elemento.style.whiteSpace = "pre-line";
        });
    } catch (errore) {
        // I testi originali restano leggibili anche senza connessione.
        console.error("Errore caricamento contenuti footer:", errore);
    }
}

