import { pagineImmagini, urlImmaginePagina } from "./immagini-pagine-config.js";
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
export async function caricaImmaginiPagine() {
    const pagina = pagineImmagini.find(item => document.querySelector(item.selettore));
    if (!pagina) return;
    try {
        const app = getApps().some(item => item.name === "[DEFAULT]") ? getApp() : initializeApp(firebaseConfig);
        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "immaginiPagine"));
        if (!snapshot.exists()) return;
        const url = urlImmaginePagina(snapshot.data().immagini?.[pagina.id]?.url);
        if (!url) return;
        const image = new Image();
        image.src = url;
        await image.decode();
        document.querySelector(pagina.selettore).style.setProperty("--pagina-immagine", "url(" + JSON.stringify(url) + ")");
    } catch (errore) {
        // Se il salvataggio o la foto non sono disponibili resta lo sfondo originale.
        console.error("Errore caricamento immagine pagina:", errore);
    }
}