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

export async function applicaIdentitaSito(dati) {
    await window.identitaSito?.applica(dati);
}
export async function caricaIdentitaSito() {
    try {
        const app = getApps().some(app => app.name === "[DEFAULT]") ? getApp() : initializeApp(firebaseConfig);
        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "identitaSito"));
        if (snapshot.exists()) await applicaIdentitaSito(snapshot.data());
    } catch (errore) {
        console.error("Errore caricamento logo e titolo:", errore);
    } finally {
        window.identitaSito?.termina();
    }
}