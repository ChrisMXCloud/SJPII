(() => {
    "use strict";

    /*
     * ChrisWorld™ / San Juan Pablo II
     * site.js — scripts unificados
     *
     * Incluye:
     * - Detecciones del navegador (Modernizr).
     * - Parallax nativo.
     * - Preloader.
     * - Menú móvil.
     * - Cierre de alertas.
     * - Desplazamiento suave.
     * - Botón volver arriba.
     * - Bienvenida universal UTM.
     *
     * radio.js permanece independiente.
     */

    const CONFIG = {
        backToTopOffset: 500,
        mobileBreakpoint: 800,
        parallaxSpeed: 0.2,
        welcomeConfigUrl:
            "https://sanjuanpabloiipomoca.org/addons/config.json",
        maxUtmSourceLength: 100
    };

    const html = document.documentElement;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    /* =========================================================
     * 1. DETECCIONES DEL NAVEGADOR
     * Sustitución ligera de Modernizr 3.3.1.
     * ========================================================= */

    function initFeatureDetection() {
        const tests = {
            svg: () =>
                Boolean(
                    document.createElementNS &&
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg"
                    ).createSVGRect
                ),

            audio: () =>
                typeof document.createElement("audio").canPlayType ===
                "function",

            canvas: () => {
                const canvas = document.createElement("canvas");

                return Boolean(
                    canvas.getContext &&
                    canvas.getContext("2d")
                );
            },

            cssremunit: () =>
                CSS.supports("font-size", "1rem"),

            csscalc: () =>
                CSS.supports("width", "calc(10px + 1px)"),

            cssgradients: () =>
                CSS.supports(
                    "background-image",
                    "linear-gradient(to right, #000, #fff)"
                ),

            supports: () =>
                typeof CSS !== "undefined" &&
                typeof CSS.supports === "function",

            touchevents: () =>
                ("ontouchstart" in window) ||
                navigator.maxTouchPoints > 0,

            video: () =>
                typeof document.createElement("video").canPlayType ===
                "function",

            cssanimations: () =>
                CSS.supports("animation-name", "none"),

            cssfilters: () =>
                CSS.supports("filter", "blur(1px)"),

            flexbox: () =>
                CSS.supports("display", "flex"),

            flexboxlegacy: () =>
                CSS.supports("box-direction", "normal"),

            flexboxtweener: () =>
                CSS.supports("align-items", "flex-start"),

            flexwrap: () =>
                CSS.supports("flex-wrap", "wrap"),

            csstransforms: () =>
                CSS.supports("transform", "scale(1)"),

            csstransforms3d: () =>
                CSS.supports("perspective", "1px"),

            csstransitions: () =>
                CSS.supports("transition", "all 1s"),

            backgroundblendmode: () =>
                CSS.supports("background-blend-mode", "multiply")
        };

        const featureResults = {};

        for (const [name, test] of Object.entries(tests)) {
            let supported = false;

            try {
                supported = Boolean(test());
            } catch {
                supported = false;
            }

            featureResults[name] = supported;

            html.classList.add(
                `${supported ? "" : "no-"}${name}`
            );
        }

        window.Modernizr = Object.assign(
            window.Modernizr || {},
            featureResults
        );

        html.classList.remove("no-js");
        html.classList.add("js");

        html.setAttribute(
            "data-useragent",
            navigator.userAgent
        );
    }

    /* =========================================================
     * 2. PARALLAX NATIVO
     * Sustitución del plugin jQuery de plugins.js.
     * ========================================================= */

    function initParallax() {
        const elements = document.querySelectorAll(
            '[data-parallax="scroll"]'
        );

        if (!elements.length) return;

        const isSmallScreen = window.matchMedia(
            `(max-width: ${CONFIG.mobileBreakpoint}px)`
        );

        const instances = [];

        class Parallax {
            constructor(element) {
                this.element = element;

                this.image =
                    element.dataset.imageSrc ||
                    element.getAttribute("data-image-src");

                this.speed =
                    Number(element.dataset.speed) ||
                    CONFIG.parallaxSpeed;

                this.frame = null;
                this.active = false;

                if (!this.image) return;

                this.element.style.backgroundImage =
                    `url("${this.image.replace(/["\\]/g, "")}")`;

                this.element.style.backgroundSize = "cover";
                this.element.style.backgroundRepeat = "no-repeat";

                this.positionY =
                    this.element.dataset.positionY || "center";

                this.element.style.backgroundPosition =
                    `center ${this.positionY}`;

                this.requestUpdate =
                    this.requestUpdate.bind(this);

                this.enableIfAllowed();

                this.motionChange = () =>
                    this.enableIfAllowed();

                [
                    prefersReducedMotion,
                    isSmallScreen
                ].forEach(query => {
                    if (
                        typeof query.addEventListener === "function"
                    ) {
                        query.addEventListener(
                            "change",
                            this.motionChange
                        );
                    } else {
                        query.addListener(this.motionChange);
                    }
                });
            }

            enableIfAllowed() {
                const shouldRun =
                    !prefersReducedMotion.matches &&
                    !isSmallScreen.matches;

                if (shouldRun && !this.active) {
                    this.active = true;

                    window.addEventListener(
                        "scroll",
                        this.requestUpdate,
                        { passive: true }
                    );

                    window.addEventListener(
                        "resize",
                        this.requestUpdate,
                        { passive: true }
                    );

                    this.requestUpdate();

                } else if (!shouldRun && this.active) {
                    this.active = false;

                    window.removeEventListener(
                        "scroll",
                        this.requestUpdate
                    );

                    window.removeEventListener(
                        "resize",
                        this.requestUpdate
                    );

                    if (this.frame !== null) {
                        cancelAnimationFrame(this.frame);
                        this.frame = null;
                    }

                    this.element.style.backgroundPosition =
                        `center ${this.positionY}`;
                }
            }

            requestUpdate() {
                if (
                    !this.active ||
                    this.frame !== null
                ) {
                    return;
                }

                this.frame = requestAnimationFrame(() => {
                    this.frame = null;
                    this.update();
                });
            }

            update() {
                const rect =
                    this.element.getBoundingClientRect();

                const offset = -rect.top * this.speed;

                this.element.style.backgroundPosition =
                    `center calc(50% + ${offset}px)`;
            }

            destroy() {
                window.removeEventListener(
                    "scroll",
                    this.requestUpdate
                );

                window.removeEventListener(
                    "resize",
                    this.requestUpdate
                );

                if (this.frame !== null) {
                    cancelAnimationFrame(this.frame);
                }
            }
        }

        elements.forEach(element => {
            const instance = new Parallax(element);
            instances.push(instance);
        });

        window.addEventListener(
            "pagehide",
            () => {
                instances.forEach(instance =>
                    instance.destroy()
                );
            },
            { once: true }
        );
    }

    /* =========================================================
     * 3. PRELOADER
     * ========================================================= */

    function initPreloader() {
        const loader = document.querySelector("#loader");
        const preloader = document.querySelector("#preloader");

        html.classList.add("ss-preload");

        let hidden = false;

        function hidePreloader() {
            if (hidden) return;

            hidden = true;

            const duration =
                prefersReducedMotion.matches ? 0 : 600;

            if (loader) {
                loader.style.transition = duration
                    ? `opacity ${duration}ms ease`
                    : "none";

                loader.style.opacity = "0";
            }

            window.setTimeout(() => {
                if (preloader) {
                    preloader.style.transition = duration
                        ? `opacity ${duration}ms ease`
                        : "none";

                    preloader.style.opacity = "0";

                    window.setTimeout(() => {
                        preloader.style.visibility = "hidden";
                        preloader.style.display = "none";
                    }, duration);
                }

                html.classList.remove("ss-preload");
                html.classList.add("ss-loaded");

            }, prefersReducedMotion.matches ? 0 : 300);
        }

        if (document.readyState === "complete") {
            hidePreloader();
        } else {
            window.addEventListener(
                "load",
                hidePreloader,
                { once: true }
            );
        }
    }

    /* =========================================================
     * 4. MENÚ MÓVIL
     * Integra main.js y navbar.js.
     * ========================================================= */

    function initMobileMenu() {
        const button = document.querySelector(
            ".header-menu-toggle"
        );

        const menu = document.querySelector(
            ".header-nav-wrap"
        );

        if (!button || !menu) return;

        const mobileQuery = window.matchMedia(
            `(max-width: ${CONFIG.mobileBreakpoint}px)`
        );

        function setMenuState(open) {
            menu.classList.toggle(
                "menu-abierto",
                open
            );

            button.classList.toggle(
                "is-clicked",
                open
            );

            button.setAttribute(
                "aria-expanded",
                String(open)
            );

            document.body.classList.toggle(
                "menu-is-open",
                open
            );
        }

        button.addEventListener("click", event => {
            event.preventDefault();

            if (!mobileQuery.matches) return;

            setMenuState(
                !menu.classList.contains("menu-abierto")
            );
        });

        menu.addEventListener("click", event => {
            const link = event.target.closest("a");

            if (link && mobileQuery.matches) {
                setMenuState(false);
            }
        });

        const onBreakpointChange = () =>
            setMenuState(false);

        if (
            typeof mobileQuery.addEventListener === "function"
        ) {
            mobileQuery.addEventListener(
                "change",
                onBreakpointChange
            );
        } else {
            mobileQuery.addListener(onBreakpointChange);
        }

        setMenuState(false);
    }

    /* =========================================================
     * 5. ALERTAS
     * ========================================================= */

    function initAlertBoxes() {
        document.addEventListener("click", event => {
            const closeButton = event.target.closest(
                ".alert-box__close"
            );

            if (!closeButton) return;

            const alert = closeButton.closest(".alert-box");

            if (!alert) return;

            const duration =
                prefersReducedMotion.matches ? 0 : 500;

            alert.style.transition = duration
                ? `opacity ${duration}ms ease`
                : "none";

            alert.style.opacity = "0";

            window.setTimeout(() => {
                alert.style.display = "none";
            }, duration);
        });
    }

    /* =========================================================
     * 6. DESPLAZAMIENTO SUAVE
     * ========================================================= */

    function initSmoothScroll() {
        document.addEventListener("click", event => {
            const link = event.target.closest(
                "a.smoothscroll[href^='#']"
            );

            if (!link) return;

            const hash = link.getAttribute("href");

            if (!hash || hash === "#") return;

            let target;

            try {
                target = document.querySelector(hash);
            } catch {
                return;
            }

            if (!target) return;

            event.preventDefault();

            const top =
                target.getBoundingClientRect().top +
                window.scrollY;

            window.scrollTo({
                top,
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth"
            });

            const menu = document.querySelector(
                ".header-nav-wrap"
            );

            if (
                menu &&
                menu.classList.contains("menu-abierto")
            ) {
                const button = document.querySelector(
                    ".header-menu-toggle"
                );

                menu.classList.remove("menu-abierto");

                if (button) {
                    button.classList.remove("is-clicked");

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

                document.body.classList.remove(
                    "menu-is-open"
                );
            }

            if (history.pushState) {
                history.pushState(null, "", hash);
            } else {
                window.location.hash = hash;
            }
        });
    }

    /* =========================================================
     * 7. BOTÓN VOLVER ARRIBA
     * ========================================================= */

    function initBackToTop() {
        const button = document.querySelector(
            ".ss-go-top"
        );

        if (!button) return;

        function updateVisibility() {
            button.classList.toggle(
                "link-is-visible",
                window.scrollY >= CONFIG.backToTopOffset
            );
        }

        window.addEventListener(
            "scroll",
            updateVisibility,
            { passive: true }
        );

        updateVisibility();

        button.addEventListener("click", event => {
            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth"
            });
        });
    }

    /* =========================================================
     * 8. BIENVENIDA UNIVERSAL UTM
     * ========================================================= */

    async function initUniversalWelcome() {
        const container = document.getElementById(
            "bienvenida-universal"
        );

        if (!container) return;

        try {
            const response = await fetch(
                CONFIG.welcomeConfigUrl,
                { cache: "no-cache" }
            );

            if (!response.ok) {
                throw new Error(
                    `Error HTTP ${response.status}`
                );
            }

            const config = await response.json();

            if (
                !config ||
                typeof config !== "object" ||
                !config.activo ||
                !config.plataformas ||
                typeof config.plataformas !== "object" ||
                Array.isArray(config.plataformas)
            ) {
                return;
            }

            const params = new URLSearchParams(
                window.location.search
            );

            const source = params.get("utm_source");

            if (
                !source ||
                source.length > CONFIG.maxUtmSourceLength
            ) {
                return;
            }

            if (
                !Object.prototype.hasOwnProperty.call(
                    config.plataformas,
                    source
                )
            ) {
                return;
            }

            const platform = config.plataformas[source];

            if (
                !platform ||
                typeof platform !== "object" ||
                typeof platform.titulo !== "string" ||
                typeof platform.mensaje !== "string" ||
                typeof platform.nombre !== "string"
            ) {
                console.info(
                    "Fuente UTM no configurada o inválida:",
                    source
                );

                return;
            }

            const content = document.createElement("div");
            content.className =
                "bienvenida-universal__contenido";

            const textContainer =
                document.createElement("div");

            textContainer.className =
                "bienvenida-universal__texto";

            const title = document.createElement("strong");
            title.textContent = platform.titulo;

            const message = document.createElement("p");
            message.textContent = platform.mensaje;

            const origin = document.createElement("small");

            origin.className =
                "bienvenida-universal__fuente";

            origin.textContent =
                `Origen indicado: ${platform.nombre}`;

            const close = document.createElement("button");

            close.type = "button";

            close.className =
                "bienvenida-universal__cerrar";

            close.textContent = "×";

            close.setAttribute(
                "aria-label",
                "Cerrar mensaje de bienvenida"
            );

            close.addEventListener("click", () => {
                container.hidden = true;
            });

            textContainer.append(
                title,
                message,
                origin
            );

            content.append(
                textContainer,
                close
            );

            container.replaceChildren(content);
            container.hidden = false;

        } catch (error) {
            console.error(
                "No se pudo iniciar la bienvenida universal:",
                error
            );
        }
    }

    /* =========================================================
     * 9. INICIALIZACIÓN GENERAL
     * ========================================================= */

    function init() {
        initFeatureDetection();
        initParallax();
        initPreloader();
        initMobileMenu();
        initAlertBoxes();
        initSmoothScroll();
        initBackToTop();

        // La bienvenida obtiene config.json de forma asíncrona.
        initUniversalWelcome();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();