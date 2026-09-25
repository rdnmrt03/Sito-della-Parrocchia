import { tipiSocial, iconaSocial, leggiSocialFooter } from "./footer-social.js";
import { urlFooterValido } from "./footer-url.js";
let sequenza = 0;
const el = id => document.getElementById(id);

function aggiornaVuoto() {
    el("footerSocialEmpty").hidden = Boolean(el("footerSocialList").children.length);
}
function aggiungiRiga(item = { tipo: "instagram", url: "", nome: "" }, focus = false) {
    const id = "socialRow" + (++sequenza);
    const row = document.createElement("div");
    row.className = "footer-social-editor-row";
    const icon = document.createElement("span");
    icon.className = "footer-social-editor-icon";
    const select = document.createElement("select");
    select.id = id + "Type";
    select.dataset.socialType = "";
    for (const [key, info] of Object.entries(tipiSocial)) {
        select.add(new Option(info.nome, key));
    }
    select.value = item.tipo;
    const url = document.createElement("input");
    url.type = "text";
    url.id = id + "Url";
    url.dataset.socialUrl = "";
    url.maxLength = 2000;
    url.placeholder = "https://...";
    url.value = item.url;
    const name = document.createElement("input");
    name.type = "text";
    name.id = id + "Name";
    name.dataset.socialName = "";
    name.maxLength = 100;
    name.placeholder = "Facoltativo";
    name.value = item.nome;
    function field(label, input) {
        const wrapper = document.createElement("div");
        wrapper.className = "admin-field";
        const title = document.createElement("label");
        title.htmlFor = input.id;
        title.textContent = label;
        wrapper.append(title, input);
        return wrapper;
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "admin-button admin-button-secondary";
    remove.textContent = "Elimina";
    function aggiornaIcona() {
        icon.replaceChildren(iconaSocial(select.value));
        remove.setAttribute("aria-label", "Elimina " + tipiSocial[select.value].nome);
    }
    select.addEventListener("change", () => {
        if (name.value === tipiSocial[item.tipo]?.nome) name.value = "";
        aggiornaIcona();
    });
    remove.addEventListener("click", () => {
        row.remove();
        aggiornaVuoto();
        el("footerSocialAdd").focus();
    });
    aggiornaIcona();
    row.append(icon, field("Social / icona", select), field("Indirizzo del profilo", url), field("Nome del collegamento", name), remove);
    el("footerSocialList").append(row);
    aggiornaVuoto();
    if (focus) select.focus();
}
export function inizializzaSocialEditor() {
    el("footerSocialAdd").addEventListener("click", () => aggiungiRiga(undefined, true));
}
export function caricaSocialEditor(dati) {
    el("footerSocialList").replaceChildren();
    leggiSocialFooter(dati).forEach(item => aggiungiRiga(item));
    aggiornaVuoto();
}
export function leggiSocialEditor() {
    const social = [];
    for (const row of el("footerSocialList").children) {
        const input = row.querySelector("[data-social-url]");
        const url = input.value.trim();
        if (!urlFooterValido(url)) {
            input.focus();
            throw new Error("Controlla il collegamento del social: usa un indirizzo http, https, mailto o tel.");
        }
        social.push({
            tipo: row.querySelector("[data-social-type]").value,
            url,
            nome: row.querySelector("[data-social-name]").value.trim()
        });
    }
    return social;
}