
/* ==========================================
   PARROQUIA SAN JUAN PABLO II
   MÓDULO INDEPENDIENTE: MODO NAVIDEÑO
   Archivo: addons/navidad/navidad.js
========================================== */

(() => {
    "use strict";

    // Evitar inicializaciones duplicadas
    if (window.NavidadSJPII) return;

    const CONFIG = {
        storageKey: "sjpii_modo_navideno",
        snowflakes: 35,
        lights: 24
    };

    let active = false;
    let effectsContainer;
    let toggleButton;
    let starButton;
    let messageBox;

    // Mensajes navideños cristianos
    const messages = [
        "¡Que Jesús nazca en nuestros corazones!",
        "La luz de Cristo ilumine nuestros hogares.",
        "Navidad es celebrar el nacimiento de nuestro Salvador.",
        "Que la paz de Jesucristo reine en cada familia.",
        "Con esperanza y amor, celebremos el nacimiento de Jesús.",
        "¡Gloria a Dios en el cielo y paz en la tierra!"
    ];

    /* ======================================
       CREAR ELEMENTOS
    ====================================== */

    function createInterface() {

        // Contenedor de efectos
        effectsContainer = document.createElement("div");
        effectsContainer.id = "sjpii-navidad-effects";
        effectsContainer.setAttribute("aria-hidden", "true");

        // Botón principal
        toggleButton = document.createElement("button");
        toggleButton.id = "sjpii-navidad-toggle";
        toggleButton.className = "navidad-toggle";
        toggleButton.type = "button";
        toggleButton.setAttribute("aria-pressed", "false");
        toggleButton.textContent = "🎄 Activar Modo Navideño";

        // Estrella interactiva
        starButton = document.createElement("button");
        starButton.id = "sjpii-navidad-star";
        starButton.className = "navidad-star";
        starButton.type = "button";
        starButton.textContent = "⭐";
        starButton.setAttribute("aria-label", "Ver mensaje navideño");
        starButton.hidden = true;

        // Mensaje emergente
        messageBox = document.createElement("div");
        messageBox.id = "sjpii-navidad-message";
        messageBox.className = "navidad-message";
        messageBox.setAttribute("role", "status");
        messageBox.setAttribute("aria-live", "polite");
        messageBox.hidden = true;

        document.body.append(
            effectsContainer,
            toggleButton,
            starButton,
            messageBox
        );
    }

    /* ======================================
       CREAR LUCES NAVIDEÑAS
    ====================================== */

    function createLights() {

        const garland = document.createElement("div");
        garland.className = "navidad-garland";
        garland.setAttribute("aria-hidden", "true");

        for (let i = 0; i < CONFIG.lights; i++) {

            const light = document.createElement("span");
            light.className = "navidad-light";

            light.style.setProperty(
                "--light-delay",
                `${Math.random() * 2}s`
            );

            light.dataset.color = [
                "red",
                "green",
                "gold",
                "white"
            ][i % 4];

            garland.appendChild(light);
        }

        effectsContainer.appendChild(garland);
    }

    /* ======================================
       CREAR NIEVE
    ====================================== */

    function createSnow() {

        const snowContainer = document.createElement("div");
        snowContainer.className = "navidad-snow";
        snowContainer.setAttribute("aria-hidden", "true");

        for (let i = 0; i < CONFIG.snowflakes; i++) {

            const snowflake = document.createElement("span");

            snowflake.className = "navidad-snowflake";
            snowflake.textContent = "❄";

            snowflake.style.left = `${Math.random() * 100}%`;

            snowflake.style.setProperty(
                "--snow-duration",
                `${7 + Math.random() * 12}s`
            );

            snowflake.style.setProperty(
                "--snow-delay",
                `${Math.random() * 12}s`
            );

            snowflake.style.setProperty(
                "--snow-size",
                `${8 + Math.random() * 13}px`
            );

            snowContainer.appendChild(snowflake);
        }

        effectsContainer.appendChild(snowContainer);
    }

    /* ======================================
       MENSAJES NAVIDEÑOS
    ====================================== */

    function showMessage() {

        const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];

        messageBox.textContent = randomMessage;
        messageBox.hidden = false;

        messageBox.classList.remove("navidad-message-show");

        // Reiniciar animación
        void messageBox.offsetWidth;

        messageBox.classList.add("navidad-message-show");

        clearTimeout(showMessage.timeout);

        showMessage.timeout = setTimeout(() => {
            messageBox.classList.remove("navidad-message-show");
            messageBox.hidden = true;
        }, 5000);
    }

    /* ======================================
       ACTIVAR MODO NAVIDEÑO
    ====================================== */

    function activate() {

        if (active) return;

        active = true;

        document.body.classList.add("sjpii-navidad-active");

        effectsContainer.setAttribute("aria-hidden", "false");

        toggleButton.textContent = "✕ Desactivar Modo Navideño";
        toggleButton.setAttribute("aria-pressed", "true");

        starButton.hidden = false;

        // Guardar preferencia
        try {
            localStorage.setItem(CONFIG.storageKey, "true");
        } catch (error) {
            console.warn("No se pudo guardar la preferencia navideña.");
        }

        showMessage();
    }

    /* ======================================
       DESACTIVAR MODO NAVIDEÑO
    ====================================== */

    function deactivate() {

        if (!active) return;

        active = false;

        document.body.classList.remove("sjpii-navidad-active");

        effectsContainer.setAttribute("aria-hidden", "true");

        toggleButton.textContent = "🎄 Activar Modo Navideño";
        toggleButton.setAttribute("aria-pressed", "false");

        starButton.hidden = true;
        messageBox.hidden = true;

        messageBox.classList.remove("navidad-message-show");

        clearTimeout(showMessage.timeout);

        // Eliminar preferencia guardada
        try {
            localStorage.setItem(CONFIG.storageKey, "false");
        } catch (error) {
            console.warn("No se pudo actualizar la preferencia navideña.");
        }
    }

    /* ======================================
       INTERRUPTOR PRINCIPAL
    ====================================== */

    function toggle() {

        if (active) {
            deactivate();
        } else {
            activate();
        }
    }

    /* ======================================
       INICIALIZACIÓN
    ====================================== */

    function init() {

        // Evitar duplicados
        if (document.getElementById("sjpii-navidad-toggle")) {
            return;
        }

        createInterface();
        createLights();
        createSnow();

        // Eventos
        toggleButton.addEventListener("click", toggle);

        starButton.addEventListener("click", showMessage);

        // Recuperar preferencia del visitante
        let savedPreference = false;

        try {
            savedPreference =
                localStorage.getItem(CONFIG.storageKey) === "true";
        } catch (error) {
            savedPreference = false;
        }

        if (savedPreference) {
            activate();
        }
    }

    /* ======================================
       API DEL MÓDULO
    ====================================== */

    window.NavidadSJPII = Object.freeze({
        activate,
        deactivate,
        toggle,
        get active() {
            return active;
        }
    });

    // Esperar a que exista el documento
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }

})();
