const immaginiPagineModuloUrl = new URL("immagini-pagine.js", document.currentScript.src).href;

const footerModuloUrl = new URL("footer-contenuti.js", document.currentScript.src).href;

const identitaModuloUrl = new URL("identita-sito.js", document.currentScript.src).href;

/* =========================================================*

   Parrocchia Maria SS. del Rosario di Pompei

   SCRIPT.JS

*========================================================= */



document.addEventListener("DOMContentLoaded", function () {



    inizializzaSlideshowHome();

    avviaSito();



});





/* =========================================================*

   AVVIO

*========================================================= */



async function avviaSito() {

    import(immaginiPagineModuloUrl).then(modulo => modulo.caricaImmaginiPagine()).catch(errore => console.error("Errore immagini pagine:", errore));



    await caricaComponenti();




    await caricaMenuParrocchia();
    await caricaMenuGruppi();

    import(footerModuloUrl).then(modulo => modulo.caricaContenutiFooter()).catch(errore => console.error("Errore footer:", errore));

    import(identitaModuloUrl).then(modulo => modulo.caricaIdentitaSito()).catch(errore => console.error("Errore intestazione:", errore));



    inizializzaMenu();

    inizializzaRicerca();

    inizializzaScroll();

    inizializzaLinkInterni();

    inizializzaModuloContatti();

    caricaOrariMesseSito();



}





/* =========================================================*

   CARICA HEADER E FOOTER

*========================================================= */



async function caricaComponenti() {



    const header =

        document.getElementById("header");



    const footer =

        document.getElementById("footer");





    /* HEADER */



    if (header) {



        try {



            const risposta =

                await fetch("componenti/header.html");



            if (!risposta.ok) {

                throw new Error("Header non trovato");

            }



            const html =

                await risposta.text();



            header.innerHTML = html;



        } catch (errore) {



            console.error(

                "Errore caricamento header:",

                errore

            );



        }



    }





    /* FOOTER */



    if (footer) {



        try {



            const risposta =

                await fetch("componenti/footer.html");



            if (!risposta.ok) {

                throw new Error("Footer non trovato");

            }



            const html =

                await risposta.text();



            footer.innerHTML = html;



        } catch (errore) {



            console.error(

                "Errore caricamento footer:",

                errore

            );



        }



    }



}





/* =========================================================*

   MENU

*========================================================= */

/* =========================================================
   TENDINA "LA PARROCCHIA" - SINCRONIZZATA CON FIREBASE
========================================================= */

async function caricaMenuParrocchia() {

    /*
        Cerchiamo la tendina in due modi:
        1) tramite l'id nuovo "parrocchiaDropdown";
        2) tramite il link "parrocchia.html", così funziona anche
           se nell'header è rimasta la versione precedente.
    */
    let container = document.getElementById("parrocchiaDropdown");

    if (!container) {

        const pulsanteParrocchia = Array.from(
            document.querySelectorAll(".dropdown .dropbtn")
        ).find(function (link) {

            const href = link.getAttribute("href") || "";

            return (
                href === "parrocchia.html" ||
                href.endsWith("/parrocchia.html")
            );

        });

        container =
            pulsanteParrocchia
                ?.closest(".dropdown")
                ?.querySelector(".dropdown-content") || null;
    }

    if (!container) {
        return;
    }

    /*
        Assegniamo comunque l'id corretto.
        Da questo momento la tendina è riconoscibile
        anche dalle altre funzioni del sito.
    */
    container.id = "parrocchiaDropdown";

    const sezioniPredefinite = [
        { id: "storia", titolo: "La nostra storia", visibile: true },
        { id: "chiesa", titolo: "La chiesa", visibile: true },
        { id: "parroco", titolo: "Il parroco", visibile: true },
        { id: "messe", titolo: "Orari Messe", visibile: true }
    ];

    function mostraVoci(sezioni) {

        container.replaceChildren();

        sezioni
            .filter(function (item) {
                return (
                    item &&
                    typeof item.id === "string" &&
                    item.id &&
                    item.visibile !== false
                );
            })
            .forEach(function (item) {

                const link = document.createElement("a");

                link.href =
                    "parrocchia.html#" +
                    encodeURIComponent(item.id);

                link.textContent =
                    typeof item.titolo === "string" && item.titolo.trim()
                        ? item.titolo.trim()
                        : "Sezione";

                container.appendChild(link);
            });
    }

    /* Voci di riserva mentre Firebase viene letto. */
    mostraVoci(sezioniPredefinite);

    try {

        const [
            { initializeApp, getApps, getApp },
            { getFirestore, doc, getDoc }
        ] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
        ]);

        const firebaseConfig = {
            apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",
            authDomain: "parrocchia-vm.firebaseapp.com",
            projectId: "parrocchia-vm",
            storageBucket: "parrocchia-vm.firebasestorage.app",
            messagingSenderId: "25102143490",
            appId: "1:25102143490:web:713f02e631b4ae2311171b"
        };

        const app =
            getApps().some(function (app) {
                return app.name === "[DEFAULT]";
            })
                ? getApp()
                : initializeApp(firebaseConfig);

        const snapshot = await getDoc(
            doc(
                getFirestore(app),
                "impostazioni",
                "parrocchia"
            )
        );

        if (!snapshot.exists()) {
            return;
        }

        const dati = snapshot.data();

        if (Array.isArray(dati.sezioni)) {
            mostraVoci(dati.sezioni);
        }

    } catch (errore) {

        console.error(
            "Errore caricamento menu La Parrocchia:",
            errore
        );
    }
}






/* =========================================================
   TENDINA "GRUPPI PARROCCHIALI" - SINCRONIZZATA CON FIREBASE
========================================================= */

async function caricaMenuGruppi() {

    let container = document.getElementById("gruppiDropdown");

    if (!container) {
        const pulsanteGruppi = Array.from(
            document.querySelectorAll(".dropdown .dropbtn")
        ).find(function (link) {
            const href = link.getAttribute("href") || "";
            return (
                href === "gruppi.html" ||
                href.endsWith("/gruppi.html")
            );
        });

        container =
            pulsanteGruppi
                ?.closest(".dropdown")
                ?.querySelector(".dropdown-content") || null;
    }

    if (!container) {
        return;
    }

    container.id = "gruppiDropdown";

    const gruppiPredefiniti = [
        { id: "giovani", titolo: "Gruppo Giovani", visibile: true },
        { id: "ac", titolo: "Azione Cattolica", visibile: true },
        { id: "catechismo", titolo: "Catechismo", visibile: true },
        { id: "coro", titolo: "Coro Parrocchiale", visibile: true }
    ];

    function mostraVoci(gruppi) {
        container.replaceChildren();

        gruppi
            .filter(function (item) {
                return (
                    item &&
                    typeof item.id === "string" &&
                    item.id.trim() &&
                    item.visibile !== false
                );
            })
            .forEach(function (item) {
                const link = document.createElement("a");

                link.href =
                    "gruppi.html#" +
                    encodeURIComponent(item.id.trim());

                link.textContent =
                    typeof item.titolo === "string" && item.titolo.trim()
                        ? item.titolo.trim()
                        : (
                            typeof item.etichetta === "string" && item.etichetta.trim()
                                ? item.etichetta.trim()
                                : "Gruppo"
                        );

                container.appendChild(link);
            });
    }

    mostraVoci(gruppiPredefiniti);

    try {
        const [
            { initializeApp, getApps, getApp },
            { getFirestore, doc, getDocFromServer }
        ] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")
        ]);

        const firebaseConfig = {
            apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",
            authDomain: "parrocchia-vm.firebaseapp.com",
            projectId: "parrocchia-vm",
            storageBucket: "parrocchia-vm.firebasestorage.app",
            messagingSenderId: "25102143490",
            appId: "1:25102143490:web:713f02e631b4ae2311171b"
        };

        const app =
            getApps().some(function (app) {
                return app.name === "[DEFAULT]";
            })
                ? getApp()
                : initializeApp(firebaseConfig);

        const snapshot = await getDocFromServer(
            doc(
                getFirestore(app),
                "impostazioni",
                "gruppi"
            )
        );

        if (!snapshot.exists()) {
            return;
        }

        const dati = snapshot.data();

        if (Array.isArray(dati.gruppi)) {
            mostraVoci(dati.gruppi);
        }

    } catch (errore) {
        console.error(
            "Errore caricamento menu Gruppi Parrocchiali:",
            errore
        );
    }
}


function inizializzaMenu() {



    const menuToggle =

        document.getElementById("menuToggle");



    const mainMenu =

        document.getElementById("mainMenu");



    const dropdowns =

        document.querySelectorAll(".dropdown");



    const dropdownButtons =

        document.querySelectorAll(".dropbtn");





    if (!menuToggle || !mainMenu) {

        return;

    }





    /* HAMBURGER */



    menuToggle.addEventListener(

        "click",

        function () {



            const aperto =

                mainMenu.classList.toggle(

                    "menu-aperto"

                );



            menuToggle.classList.toggle(

                "attivo",

                aperto

            );



            menuToggle.setAttribute(

                "aria-expanded",

                aperto ? "true" : "false"

            );



        }

    );





    /* DROPDOWN MOBILE */



    dropdownButtons.forEach(

        function (button) {



            button.addEventListener(

                "click",

                function (event) {



                    if (

                        window.innerWidth > 900

                    ) {

                        return;

                    }



                    const dropdown =

                        button.closest(".dropdown");



                    if (!dropdown) {

                        return;

                    }



                    const aperto =

                        dropdown.classList.contains(

                            "dropdown-aperto"

                        );



                    if (!aperto) {



                        event.preventDefault();



                        dropdowns.forEach(

                            function (altro) {



                                if (

                                    altro !== dropdown

                                ) {



                                    altro.classList.remove(

                                        "dropdown-aperto"

                                    );



                                }



                            }

                        );



                        dropdown.classList.add(

                            "dropdown-aperto"

                        );



                    }



                }

            );



        }

    );





    /* ESC */



    document.addEventListener(

        "keydown",

        function (event) {



            if (event.key === "Escape") {



                mainMenu.classList.remove(

                    "menu-aperto"

                );



                menuToggle.classList.remove(

                    "attivo"

                );



                dropdowns.forEach(

                    function (dropdown) {



                        dropdown.classList.remove(

                            "dropdown-aperto"

                        );



                    }

                );



            }



        }

    );





    /* RESIZE */



    window.addEventListener(

        "resize",

        function () {



            if (

                window.innerWidth > 900

            ) {



                mainMenu.classList.remove(

                    "menu-aperto"

                );



                menuToggle.classList.remove(

                    "attivo"

                );



                dropdowns.forEach(

                    function (dropdown) {



                        dropdown.classList.remove(

                            "dropdown-aperto"

                        );



                    }

                );



            }



        }

    );



}





/* =========================================================*

   RICERCA

*========================================================= */



function inizializzaRicerca() {



    const searchButton =

        document.getElementById(

            "searchButton"

        );



    if (!searchButton) {

        return;

    }





    searchButton.addEventListener(

        "click",

        function () {



            const ricerca =

                prompt(

                    "Cosa vuoi cercare in questa pagina?"

                );



            if (!ricerca) {

                return;

            }



            const testo =

                ricerca.trim();



            if (!testo) {

                return;

            }





            const contenuto =

                document.body.innerText

                    .toLowerCase();



            if (

                contenuto.includes(

                    testo.toLowerCase()

                )

            ) {



                if (

                    typeof window.find ===

                    "function"

                ) {



                    window.find(testo);



                }



            } else {



                alert(

                    'Non ho trovato "' +

                    testo +

                    '" in questa pagina.'

                );



            }



        }

    );



}





/* =========================================================*

   EFFETTO HEADER DURANTE LO SCROLL

*========================================================= */



function inizializzaScroll() {



    const navbar =

        document.querySelector(".navbar");



    if (!navbar) {

        return;

    }





    function controllaScroll() {



        if (window.scrollY > 50) {



            navbar.classList.add(

                "navbar-scroll"

            );



        } else {



            navbar.classList.remove(

                "navbar-scroll"

            );



        }



    }





    window.addEventListener(

        "scroll",

        controllaScroll

    );



    controllaScroll();



}





/* =========================================================*

   LINK INTERNI

*========================================================= */



function inizializzaLinkInterni() {



    const linkInterni =

        document.querySelectorAll(

            'a[href^="#"]'

        );





    linkInterni.forEach(

        function (link) {



            link.addEventListener(

                "click",

                function (event) {



                    const destinazione =

                        link.getAttribute("href");



                    if (

                        !destinazione ||

                        !destinazione.startsWith("#") || destinazione === "#"

                    ) {

                        return;

                    }





                    const elemento =

                        document.getElementById(destinazione.slice(1));





                    if (elemento) {



                        event.preventDefault();



                        elemento.scrollIntoView({

                            behavior: "smooth",

                            block: "start"

                        });



                    }



                }

            );



        }

    );



}





/* =========================================================*

   MODULO CONTATTI

*========================================================= */



function inizializzaModuloContatti() {



    const form =

        document.getElementById(

            "formContatti"

        );



    const messaggio =

        document.getElementById(

            "messaggioForm"

        );





    if (!form) {

        return;

    }





    form.addEventListener(

        "submit",

        function (event) {



            event.preventDefault();





            if (messaggio) {



                messaggio.style.display =

                    "block";



                messaggio.textContent =

                    "Grazie! Il modulo funziona correttamente. L'invio reale dei messaggi verrà configurato quando pubblicheremo il sito.";



            }





            form.reset();



        }

    );



}

/* Slideshow iniziale della home */

function inizializzaSlideshowHome() {

    const hero = document.querySelector(".home-hero");

    if (!hero) return;

    const slides = Array.from(hero.querySelectorAll(".home-hero-slide"));

    if (slides.length < 2) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let current = 0;

    let timer;



    function showSlide() {

        const next = (current + 1) % slides.length;

        if (!slides[next].complete || !slides[next].naturalWidth) return;

        slides[current].classList.remove("is-active");

        slides[current].setAttribute("aria-hidden", "true");

        current = next;

        slides[current].classList.add("is-active");

        slides[current].removeAttribute("aria-hidden");

    }



    function schedule() {

        window.clearInterval(timer);

        if (!motion.matches && !document.hidden) {

            timer = window.setInterval(showSlide, 5000);

        }

    }



    document.addEventListener("visibilitychange", schedule);

    motion.addEventListener("change", schedule);

    schedule();

}



/* Orari condivisi tra Home, pagina Parrocchia e footer. */

async function caricaOrariMesseSito() {

    const cards = document.querySelectorAll(".griglia-messe .card-messa");

    const righeFooter = document.querySelectorAll(".footer-orari > div");

    if (!cards.length && !righeFooter.length) return;



    // Valori di riserva comuni, usati anche se il servizio non è disponibile.

    const predefiniti = {

        feriali: "19:00",

        ferialiNota: "Santa Messa",

        sabato: "08:00\*\n19:00",

        sabatoNota: "Santa Messa\n\n\*La Santa Messa delle ore 08:00\nsarà celebrata al Santuario",

        domenica: "08:00\n11:00\n19:00",

        domenicaNota: "Santa Messa"

    };



    function scriviRighe(elemento, testo, separaOrari = false) {

        if (!elemento) return;

        elemento.replaceChildren();

        const righe = separaOrari

            ? testo.split(/[,;\r\n]+/).map(riga => riga.trim()).filter(Boolean)

            : testo.split(/\r?\n/);

        if (separaOrari && !righe.length) righe.push("—");

        righe.forEach((riga, indice) => {

            if (indice) elemento.appendChild(document.createElement("br"));

            elemento.appendChild(document.createTextNode(riga));

        });

    }



    function mostraOrari(dati) {

        ["feriali", "sabato", "domenica"].forEach((giorno, indice) => {

            const orari = typeof dati[giorno] === "string" ? dati[giorno] : predefiniti[giorno];

            const nota = typeof dati[giorno + "Nota"] === "string"

                ? dati[giorno + "Nota"] : predefiniti[giorno + "Nota"];

            scriviRighe(cards[indice]?.querySelector("strong"), orari, true);

            scriviRighe(cards[indice]?.querySelector("p"), nota);

            scriviRighe(righeFooter[indice]?.querySelector("strong"), orari, true);

            const orarioFooter = righeFooter[indice]?.querySelector("strong");

            if (orarioFooter) orarioFooter.title = nota;

        });

    }



    mostraOrari(predefiniti);



    try {

        const [{ initializeApp, getApps, getApp }, { getFirestore, doc, getDoc }] = await Promise.all([

            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),

            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js")

        ]);

    const firebaseConfig = {

        apiKey: "AIzaSyCBP7PNuG822H7puA50sriMa80G0vluKPo",

        authDomain: "parrocchia-vm.firebaseapp.com",

        projectId: "parrocchia-vm",

        storageBucket: "parrocchia-vm.firebasestorage.app",

        messagingSenderId: "25102143490",

        appId: "1:25102143490:web:713f02e631b4ae2311171b"

    };

        const app = getApps().some(app => app.name === "[DEFAULT]")

            ? getApp() : initializeApp(firebaseConfig);

        const snapshot = await getDoc(doc(getFirestore(app), "impostazioni", "orariMesse"));

        if (snapshot.exists()) mostraOrari(snapshot.data());

    } catch (errore) {

        console.error("Errore caricamento orari Messe:", errore);

    }

}