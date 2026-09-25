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

async function caricaContenutiContatti() {
    try {
        const app = getApps().some(app => app.name === "[DEFAULT]")
            ? getApp() : initializeApp(firebaseConfig);
        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "contatti"));
        if (!snapshot.exists()) return;
        const testi = snapshot.data().testi;
        document.querySelectorAll("[data-contatti]").forEach(elemento => {
            const valore = testi?.[elemento.dataset.contatti];
            if (typeof valore !== "string") return;
            if (elemento.dataset.contatti === "telefono") {
                if (valore && !/^[+0-9() .\-]{3,40}$/.test(valore)) return;
                if (valore) elemento.setAttribute("href", "tel:" + valore.replace(/[^+0-9]/g, ""));
                else elemento.removeAttribute("href");
            }
            if (elemento.dataset.contatti === "email") {
                if (valore && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valore)) return;
                if (valore) elemento.setAttribute("href", "mailto:" + encodeURIComponent(valore));
                else elemento.removeAttribute("href");
            }
            elemento.textContent = valore;
            elemento.style.whiteSpace = "pre-line";
        });
    } catch (errore) {
        // I testi originali restano leggibili anche senza connessione.
        console.error("Errore caricamento contatti:", errore);
    }
}

caricaContenutiContatti();