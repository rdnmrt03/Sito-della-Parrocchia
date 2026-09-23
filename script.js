/* =========================================================
   Parrocchia Maria SS. del Rosario di Pompei
   SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    avviaSito();

});


/* =========================================================
   AVVIO
========================================================= */

async function avviaSito() {

    await caricaComponenti();

    inizializzaMenu();
    inizializzaRicerca();
    inizializzaScroll();
    inizializzaLinkInterni();
    inizializzaModuloContatti();

}


/* =========================================================
   CARICA HEADER E FOOTER
========================================================= */

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


/* =========================================================
   MENU
========================================================= */

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


/* =========================================================
   RICERCA
========================================================= */

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


/* =========================================================
   EFFETTO HEADER DURANTE LO SCROLL
========================================================= */

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


/* =========================================================
   LINK INTERNI
========================================================= */

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
                        destinazione === "#"
                    ) {
                        return;
                    }


                    const elemento =
                        document.querySelector(
                            destinazione
                        );


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


/* =========================================================
   MODULO CONTATTI
========================================================= */

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