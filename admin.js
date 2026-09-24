/* =========================================================
   PARROCCHIA MARIA SS. DEL ROSARIO DI POMPEI
   ADMIN.JS

   Firebase + gestione articoli + Cloudinary
========================================================= */


/* =========================================================
   FIREBASE - IMPORT
========================================================= */

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================================
   FIREBASE - CONFIGURAZIONE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",
    authDomain: "parrocchia-vm.firebaseapp.com",
    projectId: "parrocchia-vm",
    storageBucket: "parrocchia-vm.firebasestorage.app",
    messagingSenderId: "25102143490",
    appId: "1:25102143490:web:713f02e631b4ae2311171b"
};


/* =========================================================
   CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD_NAME = "zm3cu87w";

const CLOUDINARY_UPLOAD_PRESET =
    "parrocchia_articoli";


/* =========================================================
   AVVIO FIREBASE
========================================================= */

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const auth =
    getAuth(app);


/* =========================================================
   STATO
========================================================= */

let articoloInModificaId = null;

let immagineArticoloEsistente = "";

let eventoInModificaId = null;


/* =========================================================
   AVVIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        impostaDataOggi();

        inizializzaContatore();

        inizializzaImmagine();

        inizializzaAnteprima();

        inizializzaPubblicazione();

        creaSezioneGestioneArticoli();

        inizializzaEventi();

        inizializzaOrariMesse();

        inizializzaAvvisi();

        inizializzaControlloAccesso();

    }
);


/* =========================================================
   CONTROLLO ACCESSO
========================================================= */

function inizializzaControlloAccesso() {

    onAuthStateChanged(
        auth,
        function (utente) {

            if (utente) {

                caricaArticoli();
                caricaEventi();
                caricaOrariMesse();
                caricaAvviso();
                caricaDashboard();

            } else {

                svuotaListaArticoli();

            }

        }
    );

}


/* =========================================================
   DATA AUTOMATICA
========================================================= */

function impostaDataOggi() {

    const campoData =
        document.getElementById(
            "articleDate"
        );

    if (!campoData) {
        return;
    }

    if (!campoData.value) {

        const oggi =
            new Date();

        const anno =
            oggi.getFullYear();

        const mese =
            String(
                oggi.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const giorno =
            String(
                oggi.getDate()
            ).padStart(
                2,
                "0"
            );

        campoData.value =
            `${anno}-${mese}-${giorno}`;

    }

}


/* =========================================================
   CONTATORE CARATTERI
========================================================= */

function inizializzaContatore() {

    const contenuto =
        document.getElementById(
            "articleContent"
        );

    const contatore =
        document.getElementById(
            "characterCounter"
        );

    if (
        !contenuto ||
        !contatore
    ) {
        return;
    }

    contenuto.addEventListener(
        "input",
        aggiornaContatore
    );

    aggiornaContatore();

}


function aggiornaContatore() {

    const contenuto =
        document.getElementById(
            "articleContent"
        );

    const contatore =
        document.getElementById(
            "characterCounter"
        );

    if (
        !contenuto ||
        !contatore
    ) {
        return;
    }

    const numeroCaratteri =
        contenuto.value.length;

    contatore.textContent =
        numeroCaratteri +
        (
            numeroCaratteri === 1
                ? " carattere"
                : " caratteri"
        );

}


/* =========================================================
   IMMAGINE - ANTEPRIMA LOCALE
========================================================= */

function inizializzaImmagine() {

    const campoImmagine =
        document.getElementById(
            "articleImage"
        );

    const anteprimaImmagine =
        document.getElementById(
            "imagePreview"
        );

    if (
        !campoImmagine ||
        !anteprimaImmagine
    ) {
        return;
    }

    campoImmagine.addEventListener(
        "change",
        function () {

            const file =
                campoImmagine.files[0];

            if (!file) {

                if (
                    immagineArticoloEsistente
                ) {

                    anteprimaImmagine.src =
                        immagineArticoloEsistente;

                    anteprimaImmagine.style.display =
                        "block";

                } else {

                    anteprimaImmagine.style.display =
                        "none";

                    anteprimaImmagine.removeAttribute(
                        "src"
                    );

                }

                return;

            }


            const formatiPermessi = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !formatiPermessi.includes(
                    file.type
                )
            ) {

                alert(
                    "Formato non supportato. Usa JPG, JPEG, PNG oppure WEBP."
                );

                campoImmagine.value =
                    "";

                return;

            }


            const dimensioneMassima =
                5 * 1024 * 1024;


            if (
                file.size >
                dimensioneMassima
            ) {

                alert(
                    "L'immagine è troppo grande. Usa un file inferiore a 5 MB."
                );

                campoImmagine.value =
                    "";

                return;

            }


            const lettore =
                new FileReader();


            lettore.addEventListener(
                "load",
                function () {

                    anteprimaImmagine.src =
                        lettore.result;

                    anteprimaImmagine.style.display =
                        "block";

                }
            );


            lettore.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   CLOUDINARY - CARICAMENTO IMMAGINE
========================================================= */

async function caricaImmagineCloudinary(
    file
) {

    if (!file) {
        return "";
    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const url =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const risposta =
        await fetch(
            url,
            {
                method:
                    "POST",

                body:
                    formData
            }
        );


    if (!risposta.ok) {

        let messaggioErrore =
            "Errore durante il caricamento dell'immagine su Cloudinary.";


        try {

            const datiErrore =
                await risposta.json();


            if (
                datiErrore &&
                datiErrore.error &&
                datiErrore.error.message
            ) {

                messaggioErrore =
                    datiErrore.error.message;

            }

        } catch (
            errore
        ) {

            console.error(
                "Errore lettura risposta Cloudinary:",
                errore
            );

        }


        throw new Error(
            messaggioErrore
        );

    }


    const risultato =
        await risposta.json();


    if (
        !risultato.secure_url
    ) {

        throw new Error(
            "Cloudinary non ha restituito l'indirizzo dell'immagine."
        );

    }


    return risultato.secure_url;

}


/* =========================================================
   ANTEPRIMA ARTICOLO
========================================================= */

function inizializzaAnteprima() {

    const pulsante =
        document.getElementById(
            "previewButton"
        );

    if (!pulsante) {
        return;
    }

    pulsante.addEventListener(
        "click",
        function () {

            mostraAnteprima();

        }
    );

}


/* =========================================================
   MOSTRA ANTEPRIMA
========================================================= */

function mostraAnteprima() {

    const titolo =
        document.getElementById(
            "articleTitle"
        );

    const categoria =
        document.getElementById(
            "articleCategory"
        );

    const data =
        document.getElementById(
            "articleDate"
        );

    const descrizione =
        document.getElementById(
            "articleExcerpt"
        );

    const contenuto =
        document.getElementById(
            "articleContent"
        );

    const immagine =
        document.getElementById(
            "imagePreview"
        );

    const areaAnteprima =
        document.getElementById(
            "articlePreview"
        );

    const previewTitolo =
        document.getElementById(
            "previewTitle"
        );

    const previewCategoria =
        document.getElementById(
            "previewCategory"
        );

    const previewData =
        document.getElementById(
            "previewDate"
        );

    const previewContenuto =
        document.getElementById(
            "previewContent"
        );

    const previewImmagine =
        document.getElementById(
            "previewImage"
        );


    if (
        !titolo ||
        !categoria ||
        !data ||
        !contenuto ||
        !areaAnteprima ||
        !previewTitolo ||
        !previewCategoria ||
        !previewData ||
        !previewContenuto ||
        !previewImmagine
    ) {

        return;

    }


    previewTitolo.textContent =
        titolo.value.trim()
            ? titolo.value.trim()
            : "Titolo dell'articolo";


    previewCategoria.textContent =
        categoria.value
            ? categoria.value.toUpperCase()
            : "NOTIZIA";


    previewData.textContent =
        formattaData(
            data.value
        );


    let testoFinale =
        "";


    if (
        descrizione &&
        descrizione.value.trim()
    ) {

        testoFinale +=
            descrizione.value.trim();

        testoFinale +=
            "\n\n";

    }


    testoFinale +=
        contenuto.value.trim()
            ? contenuto.value.trim()
            : "Il testo dell'articolo apparirà qui.";


    previewContenuto.textContent =
        testoFinale;


    if (
        immagine &&
        immagine.src &&
        immagine.style.display !== "none"
    ) {

        previewImmagine.src =
            immagine.src;

        previewImmagine.style.display =
            "block";

    } else {

        previewImmagine.style.display =
            "none";

        previewImmagine.removeAttribute(
            "src"
        );

    }


    areaAnteprima.style.display =
        "block";


    areaAnteprima.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =========================================================
   FORMATTA DATA
========================================================= */

function formattaData(
    dataISO
) {

    if (!dataISO) {
        return "";
    }


    const parti =
        dataISO.split(
            "-"
        );


    if (
        parti.length !== 3
    ) {

        return dataISO;

    }


    const anno =
        Number(
            parti[0]
        );

    const mese =
        Number(
            parti[1]
        ) - 1;

    const giorno =
        Number(
            parti[2]
        );


    const data =
        new Date(
            anno,
            mese,
            giorno
        );


    return data.toLocaleDateString(
        "it-IT",
        {
            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   CREA SLUG
========================================================= */

function creaSlug(
    testo
) {

    return testo

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^a-z0-9\s-]/g,
            ""
        )

        .trim()

        .replace(
            /\s+/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        );

}


/* =========================================================
   PUBBLICAZIONE / MODIFICA
========================================================= */

function inizializzaPubblicazione() {

    const form =
        document.getElementById(
            "articleForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (
            event
        ) {

            event.preventDefault();


            if (
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            const utente =
                auth.currentUser;


            if (!utente) {

                mostraMessaggio(
                    "Devi effettuare l'accesso prima di salvare un articolo.",
                    "errore"
                );

                return;

            }


            const titolo =
                document
                    .getElementById(
                        "articleTitle"
                    )
                    .value
                    .trim();


            const categoria =
                document
                    .getElementById(
                        "articleCategory"
                    )
                    .value;


            const data =
                document
                    .getElementById(
                        "articleDate"
                    )
                    .value;


            const descrizione =
                document
                    .getElementById(
                        "articleExcerpt"
                    )
                    .value
                    .trim();


            const contenuto =
                document
                    .getElementById(
                        "articleContent"
                    )
                    .value
                    .trim();


            const campoImmagine =
                document.getElementById(
                    "articleImage"
                );


            const fileImmagine =
                campoImmagine &&
                campoImmagine.files
                    ? campoImmagine.files[0]
                    : null;


            const pulsantePubblica =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (
                pulsantePubblica
            ) {

                pulsantePubblica.disabled =
                    true;


                pulsantePubblica.textContent =
                    articoloInModificaId
                        ? "Salvataggio in corso..."
                        : "Pubblicazione in corso...";

            }


            try {

                /* =============================================
                   IMMAGINE
                ============================================= */

                let immagineFinale =
                    immagineArticoloEsistente;


                if (
                    fileImmagine
                ) {

                    if (
                        pulsantePubblica
                    ) {

                        pulsantePubblica.textContent =
                            "Caricamento immagine...";

                    }


                    immagineFinale =
                        await caricaImmagineCloudinary(
                            fileImmagine
                        );

                }


                /* =============================================
                   MODIFICA ARTICOLO
                ============================================= */

                if (
                    articoloInModificaId
                ) {

                    if (
                        pulsantePubblica
                    ) {

                        pulsantePubblica.textContent =
                            "Salvataggio modifiche...";

                    }


                    const riferimento =
                        doc(
                            db,
                            "articoli",
                            articoloInModificaId
                        );


                    await updateDoc(
                        riferimento,
                        {

                            titolo:
                                titolo,

                            categoria:
                                categoria,

                            data:
                                data,

                            descrizione:
                                descrizione,

                            contenuto:
                                contenuto,

                            immagine:
                                immagineFinale,

                            slug:
                                creaSlug(
                                    titolo
                                ),

                            pubblicato:
                                true,

                            modificatoDa:
                                utente.uid,

                            modificatoIl:
                                serverTimestamp()

                        }
                    );


                    mostraMessaggio(
                        "Modifiche salvate correttamente!",
                        "successo"
                    );

                }


                /* =============================================
                   NUOVO ARTICOLO
                ============================================= */

                else {

                    if (
                        pulsantePubblica
                    ) {

                        pulsantePubblica.textContent =
                            "Pubblicazione in corso...";

                    }


                    const articolo = {

                        titolo:
                            titolo,

                        categoria:
                            categoria,

                        data:
                            data,

                        descrizione:
                            descrizione,

                        contenuto:
                            contenuto,

                        immagine:
                            immagineFinale,

                        slug:
                            creaSlug(
                                titolo
                            ),

                        pubblicato:
                            true,

                        creatoDa:
                            utente.uid,

                        creatoIl:
                            serverTimestamp()

                    };


                    const riferimento =
                        await addDoc(

                            collection(
                                db,
                                "articoli"
                            ),

                            articolo

                        );


                    console.log(
                        "Articolo pubblicato con ID:",
                        riferimento.id
                    );


                    console.log(
                        "Immagine Cloudinary:",
                        immagineFinale
                    );


                    mostraMessaggio(
                        "Articolo pubblicato correttamente!",
                        "successo"
                    );

                }


                resetFormArticolo();


                await caricaArticoli();


            } catch (
                errore
            ) {

                console.error(
                    "Errore durante il salvataggio:",
                    errore
                );


                mostraMessaggio(
                    "Errore: " +
                    (
                        errore.message ||
                        "non è stato possibile salvare l'articolo."
                    ),
                    "errore"
                );


            } finally {

                aggiornaPulsantePubblicazione();

            }

        }
    );

}


/* =========================================================
   CREA SEZIONE GESTIONE ARTICOLI
========================================================= */

function creaSezioneGestioneArticoli() {

    const main =
        document.querySelector(
            ".admin-main"
        );


    if (!main) {
        return;
    }


    if (
        document.getElementById(
            "gestioneArticoli"
        )
    ) {

        return;

    }


    const stile =
        document.createElement(
            "style"
        );


    stile.textContent = `

        .gestione-articoli {
            margin-top: 60px;
            background: white;
            border: 1px solid #e4e7eb;
            box-shadow: 0 15px 50px rgba(0,21,54,.05);
        }

        .gestione-articoli-header {
            padding: 30px;
            border-bottom: 1px solid #e4e7eb;
        }

        .gestione-articoli-eyebrow {
            display: block;
            margin-bottom: 8px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #b99a5b;
        }

        .gestione-articoli-header h2 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 32px;
            font-weight: 400;
            color: #001536;
        }

        .gestione-articoli-descrizione {
            margin: 10px 0 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.7;
            color: #69717d;
        }

        .lista-articoli {
            padding: 0 30px 30px;
        }

        .lista-articoli-stato {
            padding: 35px 0 5px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            color: #69717d;
        }

        .gestione-articolo {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 25px;
            align-items: center;
            padding: 25px 0;
            border-bottom: 1px solid #e7e9ec;
        }

        .gestione-articolo:last-child {
            border-bottom: 0;
        }

        .gestione-articolo-meta {
            margin-bottom: 8px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.4px;
            color: #b99a5b;
        }

        .gestione-articolo h3 {
            margin: 0 0 8px;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 23px;
            font-weight: 400;
            color: #001536;
        }

        .gestione-articolo-descrizione {
            max-width: 760px;
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #69717d;
        }

        .gestione-articolo-azioni {
            display: flex;
            gap: 9px;
        }

        .gestione-articolo-button {
            min-height: 42px;
            padding: 0 16px;
            border: 0;
            cursor: pointer;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .5px;
        }

        .gestione-articolo-modifica {
            background: #001536;
            color: white;
        }

        .gestione-articolo-modifica:hover {
            background: #173c6b;
        }

        .gestione-articolo-elimina {
            background: #f4eaea;
            color: #8b2020;
        }

        .gestione-articolo-elimina:hover {
            background: #8b2020;
            color: white;
        }

        .modalita-modifica {
            margin-bottom: 25px;
            padding: 18px 20px;
            background: #fff9eb;
            border-left: 4px solid #b99a5b;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #001536;
        }

        .modalita-modifica strong {
            display: block;
            margin-bottom: 4px;
        }

        .annulla-modifica-button {
            margin-top: 12px;
            padding: 10px 14px;
            border: 1px solid #001536;
            background: transparent;
            color: #001536;
            cursor: pointer;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            font-weight: 700;
        }

        @media (max-width: 700px) {

            .gestione-articolo {
                grid-template-columns: 1fr;
            }

            .gestione-articolo-azioni {
                width: 100%;
            }

            .gestione-articolo-button {
                flex: 1;
            }

            .gestione-articoli-header,
            .lista-articoli {
                padding-left: 22px;
                padding-right: 22px;
            }

        }

    `;


    document.head.appendChild(
        stile
    );


    const sezione =
        document.createElement(
            "section"
        );


    sezione.className =
        "gestione-articoli";


    sezione.id =
        "gestioneArticoli";


    sezione.innerHTML = `

        <div class="gestione-articoli-header">

            <span class="gestione-articoli-eyebrow">
                GESTIONE CONTENUTI
            </span>

            <h2>
                I tuoi articoli
            </h2>

            <p class="gestione-articoli-descrizione">
                Modifica o elimina le notizie già pubblicate sul sito.
            </p>

        </div>

        <div
            class="lista-articoli"
            id="listaArticoli"
        >

            <div class="lista-articoli-stato">
                Caricamento articoli...
            </div>

        </div>

    `;


    main.appendChild(
        sezione
    );

}


/* =========================================================
   CARICA ARTICOLI
========================================================= */

async function caricaArticoli() {

    const lista =
        document.getElementById(
            "listaArticoli"
        );


    if (!lista) {
        return;
    }


    if (!auth.currentUser) {

        lista.innerHTML =
            "";

        return;

    }


    lista.innerHTML = `

        <div class="lista-articoli-stato">
            Caricamento articoli...
        </div>

    `;


    try {

        const articoliQuery =
            query(

                collection(
                    db,
                    "articoli"
                ),

                orderBy(
                    "data",
                    "desc"
                )

            );


        const risultato =
            await getDocs(
                articoliQuery
            );


        lista.innerHTML =
            "";


        if (
            risultato.empty
        ) {

            lista.innerHTML = `

                <div class="lista-articoli-stato">
                    Non ci sono ancora articoli pubblicati.
                </div>

            `;

            return;

        }


        risultato.forEach(
            function (
                documento
            ) {

                const articolo =
                    documento.data();


                const elemento =
                    creaElementoArticolo(
                        documento.id,
                        articolo
                    );


                lista.appendChild(
                    elemento
                );

            }
        );


    } catch (
        errore
    ) {

        console.error(
            "Errore caricamento articoli:",
            errore
        );


        lista.innerHTML = `

            <div class="lista-articoli-stato">
                Non è stato possibile caricare gli articoli.
            </div>

        `;

    }

}


/* =========================================================
   CREA RIGA ARTICOLO
========================================================= */

function creaElementoArticolo(
    id,
    articolo
) {

    const elemento =
        document.createElement(
            "article"
        );


    elemento.className =
        "gestione-articolo";


    const contenuto =
        document.createElement(
            "div"
        );


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "gestione-articolo-meta";


    const categoria =
        articolo.categoria
            ? articolo.categoria.toUpperCase()
            : "NOTIZIA";


    const data =
        articolo.data
            ? formattaData(
                articolo.data
            )
            : "";


    meta.textContent =
        data
            ? `${categoria} · ${data}`
            : categoria;


    const titolo =
        document.createElement(
            "h3"
        );


    titolo.textContent =
        articolo.titolo ||
        "Articolo senza titolo";


    const descrizione =
        document.createElement(
            "p"
        );


    descrizione.className =
        "gestione-articolo-descrizione";


    descrizione.textContent =
        articolo.descrizione ||
        creaEstratto(
            articolo.contenuto
        );


    contenuto.appendChild(
        meta
    );

    contenuto.appendChild(
        titolo
    );

    contenuto.appendChild(
        descrizione
    );


    const azioni =
        document.createElement(
            "div"
        );


    azioni.className =
        "gestione-articolo-azioni";


    const modifica =
        document.createElement(
            "button"
        );


    modifica.type =
        "button";


    modifica.className =
        "gestione-articolo-button gestione-articolo-modifica";


    modifica.textContent =
        "MODIFICA";


    modifica.addEventListener(
        "click",
        function () {

            modificaArticolo(
                id,
                articolo
            );

        }
    );


    const elimina =
        document.createElement(
            "button"
        );


    elimina.type =
        "button";


    elimina.className =
        "gestione-articolo-button gestione-articolo-elimina";


    elimina.textContent =
        "ELIMINA";


    elimina.addEventListener(
        "click",
        function () {

            eliminaArticolo(
                id,
                articolo.titolo
            );

        }
    );


    azioni.appendChild(
        modifica
    );

    azioni.appendChild(
        elimina
    );


    elemento.appendChild(
        contenuto
    );

    elemento.appendChild(
        azioni
    );


    return elemento;

}


/* =========================================================
   CREA ESTRATTO
========================================================= */

function creaEstratto(
    testo
) {

    if (!testo) {
        return "Nessuna descrizione.";
    }


    const testoPulito =
        testo.trim();


    if (
        testoPulito.length <= 150
    ) {

        return testoPulito;

    }


    return (
        testoPulito.substring(
            0,
            150
        ) + "…"
    );

}


/* =========================================================
   MODIFICA ARTICOLO
========================================================= */

function modificaArticolo(
    id,
    articolo
) {

    articoloInModificaId =
        id;


    const titolo =
        document.getElementById(
            "articleTitle"
        );

    const categoria =
        document.getElementById(
            "articleCategory"
        );

    const data =
        document.getElementById(
            "articleDate"
        );

    const descrizione =
        document.getElementById(
            "articleExcerpt"
        );

    const contenuto =
        document.getElementById(
            "articleContent"
        );


    if (titolo) {

        titolo.value =
            articolo.titolo || "";

    }


    if (categoria) {

        categoria.value =
            articolo.categoria || "";

    }


    if (data) {

        data.value =
            articolo.data || "";

    }


    if (descrizione) {

        descrizione.value =
            articolo.descrizione || "";

    }


    if (contenuto) {

        contenuto.value =
            articolo.contenuto || "";

    }


    /* =============================================
       RECUPERA IMMAGINE GIÀ SALVATA
    ============================================= */

    immagineArticoloEsistente =
        articolo.immagine || "";


    const anteprimaImmagine =
        document.getElementById(
            "imagePreview"
        );


    if (
        anteprimaImmagine
    ) {

        if (
            immagineArticoloEsistente
        ) {

            anteprimaImmagine.src =
                immagineArticoloEsistente;

            anteprimaImmagine.style.display =
                "block";

        } else {

            anteprimaImmagine.style.display =
                "none";

            anteprimaImmagine.removeAttribute(
                "src"
            );

        }

    }


    const campoImmagine =
        document.getElementById(
            "articleImage"
        );


    if (
        campoImmagine
    ) {

        campoImmagine.value =
            "";

    }


    aggiornaContatore();


    mostraModalitaModifica(
        articolo.titolo ||
        "Articolo"
    );


    aggiornaPulsantePubblicazione();


    const form =
        document.getElementById(
            "articleForm"
        );


    if (
        form
    ) {

        form.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/* =========================================================
   MODALITÀ MODIFICA
========================================================= */

function mostraModalitaModifica(
    titolo
) {

    rimuoviAvvisoModifica();


    const form =
        document.getElementById(
            "articleForm"
        );


    if (!form) {
        return;
    }


    const avviso =
        document.createElement(
            "div"
        );


    avviso.className =
        "modalita-modifica";


    avviso.id =
        "modalitaModifica";


    const testo =
        document.createElement(
            "strong"
        );


    testo.textContent =
        `Stai modificando: ${titolo}`;


    const descrizione =
        document.createElement(
            "span"
        );


    descrizione.textContent =
        "Modifica i campi desiderati e premi “Salva modifiche”.";


    const annulla =
        document.createElement(
            "button"
        );


    annulla.type =
        "button";


    annulla.className =
        "annulla-modifica-button";


    annulla.textContent =
        "ANNULLA MODIFICA";


    annulla.addEventListener(
        "click",
        function () {

            resetFormArticolo();

        }
    );


    avviso.appendChild(
        testo
    );


    avviso.appendChild(
        descrizione
    );


    avviso.appendChild(
        document.createElement(
            "br"
        )
    );


    avviso.appendChild(
        annulla
    );


    form.insertBefore(
        avviso,
        form.firstChild
    );

}


/* =========================================================
   RIMUOVI AVVISO MODIFICA
========================================================= */

function rimuoviAvvisoModifica() {

    const avviso =
        document.getElementById(
            "modalitaModifica"
        );


    if (
        avviso
    ) {

        avviso.remove();

    }

}


/* =========================================================
   AGGIORNA PULSANTE
========================================================= */

function aggiornaPulsantePubblicazione() {

    const form =
        document.getElementById(
            "articleForm"
        );


    if (!form) {
        return;
    }


    const pulsante =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!pulsante) {
        return;
    }


    pulsante.disabled =
        false;


    pulsante.textContent =
        articoloInModificaId
            ? "Salva modifiche"
            : "Pubblica articolo";

}


/* =========================================================
   ELIMINA ARTICOLO
========================================================= */

async function eliminaArticolo(
    id,
    titolo
) {

    const utente =
        auth.currentUser;


    if (!utente) {

        mostraMessaggio(
            "Devi effettuare l'accesso per eliminare un articolo.",
            "errore"
        );

        return;

    }


    const titoloArticolo =
        titolo ||
        "questo articolo";


    const conferma =
        window.confirm(
            `Vuoi eliminare definitivamente "${titoloArticolo}"?\n\nQuesta operazione non può essere annullata.`
        );


    if (!conferma) {
        return;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "articoli",
                id
            )

        );


        if (
            articoloInModificaId === id
        ) {

            resetFormArticolo();

        }


        mostraMessaggio(
            `L'articolo "${titoloArticolo}" è stato eliminato.`,
            "successo"
        );


        await caricaArticoli();


    } catch (
        errore
    ) {

        console.error(
            "Errore eliminazione articolo:",
            errore
        );


        mostraMessaggio(
            "Non è stato possibile eliminare l'articolo.",
            "errore"
        );

    }

}


/* =========================================================
   RESET FORM
========================================================= */

function resetFormArticolo() {

    const form =
        document.getElementById(
            "articleForm"
        );


    if (
        form
    ) {

        form.reset();

    }


    articoloInModificaId =
        null;


    immagineArticoloEsistente =
        "";


    rimuoviAvvisoModifica();


    impostaDataOggi();


    aggiornaContatore();


    aggiornaPulsantePubblicazione();


    /* =============================================
       RESET IMMAGINE
    ============================================= */

    const immagine =
        document.getElementById(
            "imagePreview"
        );


    if (
        immagine
    ) {

        immagine.style.display =
            "none";

        immagine.removeAttribute(
            "src"
        );

    }


    /* =============================================
       RESET ANTEPRIMA ARTICOLO
    ============================================= */

    const areaAnteprima =
        document.getElementById(
            "articlePreview"
        );


    if (
        areaAnteprima
    ) {

        areaAnteprima.style.display =
            "none";

    }

}


/* =========================================================
   SVUOTA LISTA
========================================================= */

function svuotaListaArticoli() {

    const lista =
        document.getElementById(
            "listaArticoli"
        );


    if (
        lista
    ) {

        lista.innerHTML =
            "";

    }

}



/* =========================================================
   EVENTI / PROSSIMI APPUNTAMENTI
========================================================= */

function inizializzaEventi() {
    const form = document.getElementById("eventForm");
    const annulla = document.getElementById("cancelEventEdit");

    impostaDataEventoOggi();

    if (annulla) {
        annulla.addEventListener("click", function () {
            resetFormEvento();
        });
    }

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const utente = auth.currentUser;

        if (!utente) {
            mostraMessaggioEvento("Devi effettuare l'accesso prima di salvare un evento.", "errore");
            return;
        }

        const datiEvento = {
            titolo: document.getElementById("eventTitle").value.trim(),
            categoria: document.getElementById("eventCategory").value,
            data: document.getElementById("eventDate").value,
            ora: document.getElementById("eventTime").value,
            luogo: document.getElementById("eventPlace").value.trim(),
            descrizione: document.getElementById("eventDescription").value.trim(),
            pubblicato: true
        };

        const pulsante = document.getElementById("eventSubmitButton");

        if (pulsante) {
            pulsante.disabled = true;
            pulsante.textContent = eventoInModificaId
                ? "Salvataggio modifiche..."
                : "Pubblicazione in corso...";
        }

        try {
            if (eventoInModificaId) {
                datiEvento.modificatoDa = utente.uid;
                datiEvento.modificatoIl = serverTimestamp();

                await updateDoc(
                    doc(db, "eventi", eventoInModificaId),
                    datiEvento
                );

                mostraMessaggioEvento("Modifiche all'evento salvate correttamente!");
            } else {
                datiEvento.creatoDa = utente.uid;
                datiEvento.creatoIl = serverTimestamp();

                await addDoc(collection(db, "eventi"), datiEvento);

                mostraMessaggioEvento("Evento pubblicato correttamente!");
            }

            resetFormEvento(false);
            await caricaEventi();

        } catch (errore) {
            console.error("Errore salvataggio evento:", errore);
            mostraMessaggioEvento(
                "Errore: " + (errore.message || "non è stato possibile salvare l'evento."),
                "errore"
            );
        } finally {
            aggiornaPulsanteEvento();
        }
    });
}


function impostaDataEventoOggi() {
    const campo = document.getElementById("eventDate");
    if (!campo || campo.value) return;

    const oggi = new Date();
    campo.value =
        `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, "0")}-${String(oggi.getDate()).padStart(2, "0")}`;
}


async function caricaEventi() {
    const lista = document.getElementById("eventList");
    if (!lista) return;

    if (!auth.currentUser) {
        lista.innerHTML = "";
        return;
    }

    lista.innerHTML = '<div class="lista-articoli-stato">Caricamento eventi...</div>';

    try {
        const risultato = await getDocs(
            query(collection(db, "eventi"), orderBy("data", "asc"))
        );

        lista.innerHTML = "";

        if (risultato.empty) {
            lista.innerHTML =
                '<div class="lista-articoli-stato">Non ci sono ancora eventi salvati.</div>';
            return;
        }

        risultato.forEach(function (documento) {
            lista.appendChild(
                creaElementoEvento(documento.id, documento.data())
            );
        });

    } catch (errore) {
        console.error("Errore caricamento eventi:", errore);
        lista.innerHTML =
            '<div class="lista-articoli-stato">Non è stato possibile caricare gli eventi.</div>';
    }
}


function creaElementoEvento(id, evento) {
    const elemento = document.createElement("article");
    elemento.className = "gestione-articolo";

    const contenuto = document.createElement("div");

    const meta = document.createElement("div");
    meta.className = "gestione-articolo-meta";

    const parti = [];
    if (evento.categoria) parti.push(evento.categoria.toUpperCase());
    if (evento.data) parti.push(formattaData(evento.data));
    if (evento.ora) parti.push("ORE " + evento.ora);
    if (evento.luogo) parti.push(evento.luogo.toUpperCase());
    meta.textContent = parti.join(" · ");

    const titolo = document.createElement("h3");
    titolo.textContent = evento.titolo || "Evento senza titolo";

    const descrizione = document.createElement("p");
    descrizione.className = "gestione-articolo-descrizione";
    descrizione.textContent = evento.descrizione || "Nessuna descrizione.";

    contenuto.append(meta, titolo, descrizione);

    const azioni = document.createElement("div");
    azioni.className = "gestione-articolo-azioni";

    const modifica = document.createElement("button");
    modifica.type = "button";
    modifica.className = "gestione-articolo-button gestione-articolo-modifica";
    modifica.textContent = "MODIFICA";
    modifica.addEventListener("click", function () {
        modificaEvento(id, evento);
    });

    const elimina = document.createElement("button");
    elimina.type = "button";
    elimina.className = "gestione-articolo-button gestione-articolo-elimina";
    elimina.textContent = "ELIMINA";
    elimina.addEventListener("click", function () {
        eliminaEvento(id, evento.titolo);
    });

    azioni.append(modifica, elimina);
    elemento.append(contenuto, azioni);

    return elemento;
}


function modificaEvento(id, evento) {
    eventoInModificaId = id;

    document.getElementById("eventTitle").value = evento.titolo || "";
    document.getElementById("eventCategory").value = evento.categoria || "";
    document.getElementById("eventDate").value = evento.data || "";
    document.getElementById("eventTime").value = evento.ora || "";
    document.getElementById("eventPlace").value = evento.luogo || "";
    document.getElementById("eventDescription").value = evento.descrizione || "";

    const titoloEditor = document.getElementById("eventEditorTitle");
    const annulla = document.getElementById("cancelEventEdit");

    if (titoloEditor) titoloEditor.textContent = "Modifica evento";
    if (annulla) annulla.style.display = "inline-block";

    aggiornaPulsanteEvento();

    const bottone = document.querySelector('.admin-nav-button[data-view="eventEditor"]');
    if (bottone) bottone.click();
}


async function eliminaEvento(id, titolo) {
    if (!auth.currentUser) return;

    const nome = titolo || "questo evento";

    if (!window.confirm(
        `Vuoi eliminare definitivamente "${nome}"?\n\nQuesta operazione non può essere annullata.`
    )) return;

    try {
        await deleteDoc(doc(db, "eventi", id));

        if (eventoInModificaId === id) {
            resetFormEvento();
        }

        await caricaEventi();
        window.alert(`L'evento "${nome}" è stato eliminato.`);

    } catch (errore) {
        console.error("Errore eliminazione evento:", errore);
        window.alert("Non è stato possibile eliminare l'evento.");
    }
}


function resetFormEvento(nascondiMessaggio = true) {
    const form = document.getElementById("eventForm");
    if (form) form.reset();

    eventoInModificaId = null;

    const titoloEditor = document.getElementById("eventEditorTitle");
    const annulla = document.getElementById("cancelEventEdit");
    const messaggio = document.getElementById("eventMessage");

    if (titoloEditor) titoloEditor.textContent = "Nuovo evento";
    if (annulla) annulla.style.display = "none";
    if (nascondiMessaggio && messaggio) messaggio.style.display = "none";

    impostaDataEventoOggi();
    aggiornaPulsanteEvento();
}


function aggiornaPulsanteEvento() {
    const pulsante = document.getElementById("eventSubmitButton");
    if (!pulsante) return;

    pulsante.disabled = false;
    pulsante.textContent = eventoInModificaId
        ? "Salva modifiche"
        : "Pubblica evento";
}


function mostraMessaggioEvento(testo, tipo = "successo") {
    const messaggio = document.getElementById("eventMessage");
    if (!messaggio) return;

    messaggio.textContent = testo;
    messaggio.style.display = "block";

    if (tipo === "errore") {
        messaggio.style.background = "#fff1f1";
        messaggio.style.borderLeftColor = "#a52a2a";
        messaggio.style.color = "#7a1d1d";
    } else {
        messaggio.style.background = "#eef7f0";
        messaggio.style.borderLeftColor = "#3f7d4c";
        messaggio.style.color = "#214b2a";
    }
}

/* =========================================================
   MESSAGGI
========================================================= */

function mostraMessaggio(
    testo,
    tipo = "successo"
) {

    const messaggio =
        document.getElementById(
            "adminMessage"
        );


    if (!messaggio) {
        return;
    }


    messaggio.textContent =
        testo;


    messaggio.style.display =
        "block";


    if (
        tipo === "errore"
    ) {

        messaggio.style.background =
            "#fff1f1";

        messaggio.style.borderLeftColor =
            "#a52a2a";

        messaggio.style.color =
            "#7a1d1d";

    } else {

        messaggio.style.background =
            "#eef7f0";

        messaggio.style.borderLeftColor =
            "#3f7d4c";

        messaggio.style.color =
            "#214b2a";

    }


    messaggio.scrollIntoView({

        behavior:
            "smooth",

        block:
            "nearest"

    });

}

/* =========================================================
   ORARI SANTE MESSE
========================================================= */

function inizializzaOrariMesse() {
    const form = document.getElementById("massTimesForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const utente = auth.currentUser;
        if (!utente) {
            mostraMessaggioOrari("Devi effettuare l'accesso prima di salvare gli orari.", "errore");
            return;
        }

        const pulsante = form.querySelector('button[type="submit"]');
        if (pulsante) {
            pulsante.disabled = true;
            pulsante.textContent = "Salvataggio in corso...";
        }

        const dati = {
            feriali: leggiCampoOrari(["massWeekdaysTimes"]),
            ferialiNota: leggiCampoOrari(["massWeekdaysNote"]),
            sabato: leggiCampoOrari(["massSaturdayTimes"]),
            sabatoNota: leggiCampoOrari(["massSaturdayNote"]),
            domenica: leggiCampoOrari(["massSundayTimes"]),
            domenicaNota: leggiCampoOrari(["massSundayNote"]),
            modificatoDa: utente.uid,
            modificatoIl: serverTimestamp()
        };

        try {
            await setDoc(doc(db, "impostazioni", "orariMesse"), dati, { merge: true });
            mostraMessaggioOrari("Orari delle Messe salvati correttamente!", "successo");
        } catch (errore) {
            console.error("Errore salvataggio orari Messe:", errore);
            mostraMessaggioOrari(
                "Errore: " + (errore.message || "non è stato possibile salvare gli orari."),
                "errore"
            );
        } finally {
            if (pulsante) {
                pulsante.disabled = false;
                pulsante.textContent = "Salva orari";
            }
        }
    });
}

async function caricaOrariMesse() {
    if (!auth.currentUser) return;

    try {
        const snapshot = await getDoc(doc(db, "impostazioni", "orariMesse"));
        if (!snapshot.exists()) return;

        const dati = snapshot.data();
        scriviCampoOrari(["massWeekdaysTimes"], dati.feriali);
        scriviCampoOrari(["massWeekdaysNote"], dati.ferialiNota);
        scriviCampoOrari(["massSaturdayTimes"], dati.sabato);
        scriviCampoOrari(["massSaturdayNote"], dati.sabatoNota);
        scriviCampoOrari(["massSundayTimes"], dati.domenica);
        scriviCampoOrari(["massSundayNote"], dati.domenicaNota);
    } catch (errore) {
        console.error("Errore caricamento orari Messe:", errore);
        mostraMessaggioOrari("Non è stato possibile caricare gli orari salvati.", "errore");
    }
}

function trovaCampoOrari(ids) {
    for (const id of ids) {
        const elemento = document.getElementById(id);
        if (elemento) return elemento;
    }
    return null;
}

function leggiCampoOrari(ids) {
    const campo = trovaCampoOrari(ids);
    return campo ? campo.value.trim() : "";
}

function scriviCampoOrari(ids, valore) {
    const campo = trovaCampoOrari(ids);
    if (campo && typeof valore === "string") campo.value = valore;
}

function mostraMessaggioOrari(testo, tipo = "successo") {
    const messaggio =
        document.getElementById("massTimesMessage") ||
        document.getElementById("messeMessage") ||
        document.getElementById("orariMesseMessage");

    if (!messaggio) {
        if (tipo === "errore") window.alert(testo);
        return;
    }

    messaggio.textContent = testo;
    messaggio.style.display = "block";

    if (tipo === "errore") {
        messaggio.style.background = "#fff1f1";
        messaggio.style.borderLeftColor = "#a52a2a";
        messaggio.style.color = "#7a1d1d";
    } else {
        messaggio.style.background = "#eef7f0";
        messaggio.style.borderLeftColor = "#3f7d4c";
        messaggio.style.color = "#214b2a";
    }
}


/* =========================================================
   AVVISI PARROCCHIALI
========================================================= */

function inizializzaAvvisi() {
    const form = document.getElementById("noticeForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const utente = auth.currentUser;
        if (!utente) {
            mostraMessaggioAvviso("Devi effettuare l'accesso prima di salvare l'avviso.", "errore");
            return;
        }

        const titolo = trovaCampoAvviso(["noticeTitle", "alertTitle", "avvisoTitle"]);
        const testo = trovaCampoAvviso(["noticeText", "noticeMessage", "alertText", "avvisoText"]);
        const visibilita = trovaCampoAvviso(["noticeVisibility", "noticeActive", "alertVisibility", "avvisoVisibility"]);

        if (!titolo || !testo) {
            mostraMessaggioAvviso("Non riesco a trovare i campi Titolo e Testo dell'avviso.", "errore");
            return;
        }

        let attivo = true;
        if (visibilita) {
            if (visibilita.type === "checkbox") {
                attivo = visibilita.checked;
            } else {
                const valore = String(visibilita.value).toLowerCase();
                attivo = !["false", "0", "no", "nascondi", "nascosto", "off", "disattivo"].includes(valore);
            }
        }

        const pulsante = form.querySelector('button[type="submit"]');
        if (pulsante) {
            pulsante.disabled = true;
            pulsante.textContent = "Salvataggio in corso...";
        }

        try {
            await setDoc(doc(db, "impostazioni", "avviso"), {
                titolo: titolo.value.trim(),
                testo: testo.value.trim(),
                attivo: attivo,
                modificatoDa: utente.uid,
                modificatoIl: serverTimestamp()
            }, { merge: true });

            mostraMessaggioAvviso("Avviso salvato correttamente!", "successo");
        } catch (errore) {
            console.error("Errore salvataggio avviso:", errore);
            mostraMessaggioAvviso(
                "Errore: " + (errore.message || "non è stato possibile salvare l'avviso."),
                "errore"
            );
        } finally {
            if (pulsante) {
                pulsante.disabled = false;
                pulsante.textContent = "Salva avviso";
            }
        }
    });
}

async function caricaAvviso() {
    if (!auth.currentUser) return;

    try {
        const snapshot = await getDoc(doc(db, "impostazioni", "avviso"));
        if (!snapshot.exists()) return;

        const dati = snapshot.data();
        const titolo = trovaCampoAvviso(["noticeTitle", "alertTitle", "avvisoTitle"]);
        const testo = trovaCampoAvviso(["noticeText", "noticeMessage", "alertText", "avvisoText"]);
        const visibilita = trovaCampoAvviso(["noticeVisibility", "noticeActive", "alertVisibility", "avvisoVisibility"]);

        if (titolo) titolo.value = dati.titolo || "";
        if (testo) testo.value = dati.testo || "";

        if (visibilita) {
            if (visibilita.type === "checkbox") {
                visibilita.checked = dati.attivo !== false;
            } else {
                const opzioni = Array.from(visibilita.options || []);
                const desiderato = dati.attivo !== false;
                const opzione = opzioni.find(function (item) {
                    const valore = String(item.value).toLowerCase();
                    const significaAttivo = !["false", "0", "no", "nascondi", "nascosto", "off", "disattivo"].includes(valore);
                    return significaAttivo === desiderato;
                });
                if (opzione) visibilita.value = opzione.value;
            }
        }
    } catch (errore) {
        console.error("Errore caricamento avviso:", errore);
        mostraMessaggioAvviso("Non è stato possibile caricare l'avviso salvato.", "errore");
    }
}

function trovaCampoAvviso(ids) {
    for (const id of ids) {
        const elemento = document.getElementById(id);
        if (elemento) return elemento;
    }
    return null;
}

function mostraMessaggioAvviso(testo, tipo = "successo") {
    const messaggio =
        document.getElementById("noticeMessage") ||
        document.getElementById("noticeStatus") ||
        document.getElementById("alertMessage") ||
        document.getElementById("avvisoMessage");

    if (!messaggio) {
        window.alert(testo);
        return;
    }

    messaggio.textContent = testo;
    messaggio.style.display = "block";

    if (tipo === "errore") {
        messaggio.style.background = "#fff1f1";
        messaggio.style.borderLeftColor = "#a52a2a";
        messaggio.style.color = "#7a1d1d";
    } else {
        messaggio.style.background = "#eef7f0";
        messaggio.style.borderLeftColor = "#3f7d4c";
        messaggio.style.color = "#214b2a";
    }
}

/* =========================================================
   DASHBOARD - DATI REALI DA FIREBASE
========================================================= */

async function caricaDashboard() {

    if (!auth.currentUser) {
        return;
    }

    const articoliEl =
        document.getElementById("dashboardArticlesCount");

    const eventiEl =
        document.getElementById("dashboardEventsCount");

    const avvisoEl =
        document.getElementById("dashboardNoticeStatus");

    const messeEl =
        document.getElementById("dashboardMassStatus");


    try {

        const [
            articoliSnapshot,
            eventiSnapshot,
            avvisoSnapshot,
            messeSnapshot
        ] = await Promise.all([

            getDocs(
                collection(db, "articoli")
            ),

            getDocs(
                collection(db, "eventi")
            ),

            getDoc(
                doc(db, "impostazioni", "avviso")
            ),

            getDoc(
                doc(db, "impostazioni", "orariMesse")
            )

        ]);


        /* ARTICOLI PUBBLICATI */

        if (articoliEl) {

            let totaleArticoli = 0;

            articoliSnapshot.forEach(function (documento) {

                const dati =
                    documento.data();

                if (dati.pubblicato !== false) {
                    totaleArticoli++;
                }

            });

            articoliEl.textContent =
                String(totaleArticoli);

        }


        /* PROSSIMI EVENTI PUBBLICATI */

        if (eventiEl) {

            const adesso =
                new Date();

            const oggi =
                `${adesso.getFullYear()}-${String(adesso.getMonth() + 1).padStart(2, "0")}-${String(adesso.getDate()).padStart(2, "0")}`;

            let totaleEventi =
                0;

            eventiSnapshot.forEach(function (documento) {

                const dati =
                    documento.data();

                if (
                    dati.pubblicato !== false &&
                    typeof dati.data === "string" &&
                    dati.data >= oggi
                ) {
                    totaleEventi++;
                }

            });

            eventiEl.textContent =
                String(totaleEventi);

        }


        /* AVVISO HOME */

        if (avvisoEl) {

            if (!avvisoSnapshot.exists()) {

                avvisoEl.textContent =
                    "NASCOSTO";

            } else {

                const dati =
                    avvisoSnapshot.data();

                const attivo =
                    dati.attivo === true ||
                    dati.visibile === true ||
                    dati.pubblicato === true;

                avvisoEl.textContent =
                    attivo
                        ? "ATTIVO"
                        : "NASCOSTO";

            }

        }


        /* ORARI MESSE */

        if (messeEl) {

            if (!messeSnapshot.exists()) {

                messeEl.textContent =
                    "DA IMPOSTARE";

            } else {

                const dati =
                    messeSnapshot.data();

                const configurati =
                    Boolean(
                        (dati.feriali && String(dati.feriali).trim()) ||
                        (dati.sabato && String(dati.sabato).trim()) ||
                        (dati.domenica && String(dati.domenica).trim())
                    );

                messeEl.textContent =
                    configurati
                        ? "CONFIGURATI"
                        : "DA IMPOSTARE";

            }

        }


    } catch (errore) {

        console.error(
            "Errore caricamento Dashboard:",
            errore
        );

        if (articoliEl) articoliEl.textContent = "—";
        if (eventiEl) eventiEl.textContent = "—";
        if (avvisoEl) avvisoEl.textContent = "—";
        if (messeEl) messeEl.textContent = "—";

    }

}


/* Aggiorna i dati ogni volta che si apre la Dashboard */

document.addEventListener(
    "click",
    function (event) {

        const pulsanteDashboard =
            event.target.closest(
                '.admin-nav-button[data-view="dashboard"]'
            );

        if (
            pulsanteDashboard &&
            auth.currentUser
        ) {
            caricaDashboard();
        }

    }
);

