<!DOCTYPE html>
<html lang="it">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="robots"
        content="noindex, nofollow"
    >

    <title>
        Amministrazione | Parrocchia Maria SS. del Rosario di Pompei
    </title>

    <link
        rel="stylesheet"
        href="style.css"
    >

</head>


<body class="admin-body">


<!-- =========================================================
     HEADER ADMIN
========================================================= -->

<header class="admin-header">

    <div class="admin-header-container">


        <a
            href="index.html"
            class="admin-brand"
        >

            <img
                src="immagini/logo.png"
                alt="Logo Parrocchia Maria SS. del Rosario di Pompei"
            >


            <div>

                <span>
                    Parrocchia Maria SS. del Rosario di Pompei
                </span>

                <strong>
                    Amministrazione
                </strong>

            </div>

        </a>


        <div class="admin-header-destra">

            <a
                href="index.html"
                class="admin-vedi-sito"
            >
                Vedi il sito →
            </a>


            <div class="admin-utente">

                <span class="admin-avatar">
                    A
                </span>

                <div>

                    <small>
                        ACCESSO COME
                    </small>

                    <strong>
                        Amministratore
                    </strong>

                </div>

            </div>

        </div>

    </div>

</header>



<!-- =========================================================
     LAYOUT ADMIN
========================================================= -->

<div class="admin-layout">


    <!-- =====================================================
         SIDEBAR
    ====================================================== -->

    <aside class="admin-sidebar">


        <nav class="admin-nav">


            <button
                class="admin-nav-link attivo"
                type="button"
                data-admin-section="dashboard"
            >

                <span>
                    ▦
                </span>

                Dashboard

            </button>



            <button
                class="admin-nav-link"
                type="button"
                data-admin-section="articoli"
            >

                <span>
                    ✎
                </span>

                Articoli

            </button>



            <button
                class="admin-nav-link"
                type="button"
                id="nuovoArticoloSidebar"
            >

                <span>
                    ＋
                </span>

                Nuovo articolo

            </button>



            <div class="admin-nav-separatore"></div>


            <a
                href="notizie.html"
                class="admin-nav-link"
            >

                <span>
                    ◉
                </span>

                Visualizza notizie

            </a>


            <a
                href="index.html"
                class="admin-nav-link"
            >

                <span>
                    ↗
                </span>

                Torna al sito

            </a>


        </nav>


        <div class="admin-sidebar-footer">

            <p>
                AREA RISERVATA
            </p>

            <small>

                In seguito collegheremo
                questa area a un sistema
                di autenticazione sicuro.

            </small>

        </div>

    </aside>



    <!-- =====================================================
         CONTENUTO
    ====================================================== -->

    <main class="admin-main">


        <!-- =================================================
             DASHBOARD
        ================================================== -->

        <section
            class="admin-section admin-section-attiva"
            id="adminDashboard"
        >


            <div class="admin-titolo-pagina">


                <div>

                    <p class="pagina-etichetta">
                        AREA RISERVATA
                    </p>

                    <h1>
                        Bentornato
                    </h1>

                    <p>

                        Da qui potrai gestire
                        le notizie pubblicate
                        sul sito della Parrocchia.

                    </p>

                </div>


                <button
                    class="admin-btn-primary"
                    type="button"
                    id="nuovoArticoloDashboard"
                >

                    + Nuovo articolo

                </button>


            </div>



            <!-- =============================================
                 STATISTICHE
            ============================================== -->

            <div class="admin-statistiche">


                <div class="admin-stat-card">

                    <span>
                        ARTICOLI
                    </span>

                    <strong id="numeroArticoli">
                        3
                    </strong>

                    <p>
                        Totale articoli
                    </p>

                </div>


                <div class="admin-stat-card">

                    <span>
                        PUBBLICATI
                    </span>

                    <strong id="numeroPubblicati">
                        3
                    </strong>

                    <p>
                        Visibili sul sito
                    </p>

                </div>


                <div class="admin-stat-card">

                    <span>
                        BOZZE
                    </span>

                    <strong id="numeroBozze">
                        0
                    </strong>

                    <p>
                        Da completare
                    </p>

                </div>


            </div>



            <!-- =============================================
                 ARTICOLI RECENTI
            ============================================== -->

            <div class="admin-pannello">


                <div class="admin-pannello-header">

                    <div>

                        <p class="pagina-etichetta">
                            CONTENUTI
                        </p>

                        <h2>
                            Articoli recenti
                        </h2>

                    </div>


                    <button
                        class="admin-link-button"
                        type="button"
                        id="vediTuttiArticoli"
                    >
                        Vedi tutti →
                    </button>

                </div>



                <div
                    class="admin-lista-articoli"
                    id="listaArticoliDashboard"
                >

                    <!--
                        Gli articoli verranno inseriti
                        automaticamente da admin.js
                    -->

                </div>


            </div>


        </section>



        <!-- =================================================
             TUTTI GLI ARTICOLI
        ================================================== -->

        <section
            class="admin-section"
            id="adminArticoli"
        >


            <div class="admin-titolo-pagina">


                <div>

                    <p class="pagina-etichetta">
                        CONTENUTI
                    </p>

                    <h1>
                        Articoli
                    </h1>

                    <p>

                        Gestisci le notizie
                        pubblicate e le bozze.

                    </p>

                </div>


                <button
                    class="admin-btn-primary"
                    type="button"
                    id="nuovoArticoloArticoli"
                >

                    + Nuovo articolo

                </button>


            </div>



            <!-- RICERCA -->

            <div class="admin-toolbar">


                <input
                    type="search"
                    id="ricercaArticoli"
                    placeholder="Cerca un articolo..."
                >


                <select id="filtroStato">

                    <option value="tutti">
                        Tutti gli articoli
                    </option>

                    <option value="pubblicato">
                        Pubblicati
                    </option>

                    <option value="bozza">
                        Bozze
                    </option>

                </select>


            </div>



            <div
                class="admin-lista-articoli"
                id="listaArticoliCompleta"
            >
            </div>


        </section>



        <!-- =================================================
             EDITOR ARTICOLO
        ================================================== -->

        <section
            class="admin-section"
            id="adminEditor"
        >


            <div class="admin-editor-header">


                <button
                    class="admin-indietro"
                    type="button"
                    id="tornaArticoli"
                >
                    ← Torna agli articoli
                </button>


                <div>

                    <p class="pagina-etichetta">
                        EDITOR
                    </p>

                    <h1 id="titoloEditor">
                        Nuovo articolo
                    </h1>

                </div>


            </div>



            <!-- =============================================
                 FORM ARTICOLO
            ============================================== -->

            <form
                class="admin-editor-form"
                id="formArticolo"
            >


                <input
                    type="hidden"
                    id="articoloId"
                >



                <!-- TITOLO -->

                <div class="admin-campo">

                    <label for="titoloArticolo">
                        Titolo dell'articolo
                    </label>

                    <input
                        type="text"
                        id="titoloArticolo"
                        placeholder="Es. Festa della Madonna"
                        required
                    >

                </div>



                <!-- RIGA META -->

                <div class="admin-form-grid">


                    <div class="admin-campo">

                        <label for="categoriaArticolo">
                            Categoria
                        </label>

                        <select
                            id="categoriaArticolo"
                            required
                        >

                            <option value="Eventi">
                                Eventi
                            </option>

                            <option value="Avvisi">
                                Avvisi
                            </option>

                            <option value="Gruppo Giovani">
                                Gruppo Giovani
                            </option>

                            <option value="Catechismo">
                                Catechismo
                            </option>

                            <option value="Azione Cattolica">
                                Azione Cattolica
                            </option>

                            <option value="Comunità">
                                Comunità
                            </option>

                        </select>

                    </div>



                    <div class="admin-campo">

                        <label for="dataArticolo">
                            Data
                        </label>

                        <input
                            type="date"
                            id="dataArticolo"
                            required
                        >

                    </div>


                </div>



                <!-- IMMAGINE -->

                <div class="admin-campo">

                    <label for="immagineArticolo">
                        Immagine di copertina
                    </label>

                    <input
                        type="file"
                        id="immagineArticolo"
                        accept="image/*"
                    >

                    <small>

                        In questa prima versione
                        l'immagine viene mostrata
                        solamente in anteprima.

                    </small>

                </div>



                <div
                    class="admin-preview-immagine"
                    id="previewImmagine"
                >

                    <span>
                        Nessuna immagine selezionata
                    </span>

                </div>



                <!-- RIASSUNTO -->

                <div class="admin-campo">

                    <label for="riassuntoArticolo">
                        Riassunto
                    </label>

                    <textarea
                        id="riassuntoArticolo"
                        rows="4"
                        placeholder="Scrivi una breve introduzione che comparirà nella pagina Notizie..."
                        required
                    ></textarea>

                </div>



                <!-- CONTENUTO -->

                <div class="admin-campo">

                    <label for="contenutoArticolo">
                        Contenuto dell'articolo
                    </label>


                    <div class="admin-editor-toolbar">

                        <button
                            type="button"
                            data-format="bold"
                            title="Grassetto"
                        >
                            <strong>B</strong>
                        </button>

                        <button
                            type="button"
                            data-format="italic"
                            title="Corsivo"
                        >
                            <em>I</em>
                        </button>

                        <button
                            type="button"
                            data-format="h2"
                            title="Titolo"
                        >
                            H2
                        </button>

                        <button
                            type="button"
                            data-format="ul"
                            title="Elenco"
                        >
                            • Lista
                        </button>

                    </div>


                    <textarea
                        id="contenutoArticolo"
                        rows="14"
                        placeholder="Scrivi qui il testo completo dell'articolo..."
                        required
                    ></textarea>

                </div>



                <!-- =========================================
                     AZIONI
                ========================================== -->

                <div class="admin-editor-actions">


                    <button
                        type="button"
                        class="admin-btn-secondary"
                        id="salvaBozza"
                    >
                        Salva bozza
                    </button>


                    <button
                        type="submit"
                        class="admin-btn-primary"
                    >
                        Pubblica articolo
                    </button>


                </div>


            </form>


        </section>


    </main>

</div>



<!-- =========================================================
     MODALE ELIMINA
========================================================= -->

<div
    class="admin-modal"
    id="modalElimina"
    aria-hidden="true"
>

    <div class="admin-modal-box">

        <p class="pagina-etichetta">
            ATTENZIONE
        </p>

        <h2>
            Eliminare l'articolo?
        </h2>

        <p>

            Questa operazione rimuoverà
            l'articolo dall'elenco
            di questa demo.

        </p>


        <div class="admin-modal-actions">

            <button
                type="button"
                class="admin-btn-secondary"
                id="annullaElimina"
            >
                Annulla
            </button>


            <button
                type="button"
                class="admin-btn-danger"
                id="confermaElimina"
            >
                Elimina
            </button>

        </div>

    </div>

</div>



<!-- =========================================================
     NOTIFICA
========================================================= -->

<div
    class="admin-notifica"
    id="adminNotifica"
>
</div>



<!-- =========================================================
     JAVASCRIPT
========================================================= -->

<script src="admin.js"></script>


</body>

</html>