
"use strict";

/* =========================
   CONFIGURACIÓN
========================= */

const CONFIG = {
    postsURL: "posts/posts.json",
    avatarURL: "https://sanjuanpabloiipomoca.org/images/icon.jpg",
    verifiedURL: "verified.svg",

    updateInterval: 60 * 1000
};


/* =========================
   ELEMENTOS DEL DOM
========================= */

const postsContainer = document.getElementById("posts-container");


/* =========================
   SEGURIDAD
========================= */

/**
 * Convierte caracteres especiales
 * para evitar la inyección de HTML.
 */
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


/**
 * Comprueba que una imagen utilice
 * una dirección segura.
 */
function getSafeImageURL(value) {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    try {
        const url = new URL(value, window.location.href);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return null;
        }

        return url.href;

    } catch {
        return null;
    }
}


/* =========================
   FECHAS
========================= */

/**
 * Convierte una fecha ISO 8601
 * en una fecha válida.
 */
function parseDate(value) {
    if (typeof value !== "string") {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}


/**
 * Devuelve el tiempo transcurrido
 * desde la publicación.
 */
function getRelativeTime(date) {
    if (!date) {
        return "Fecha desconocida";
    }

    const now = Date.now();
    const difference = now - date.getTime();

    if (difference < 0) {
        return "Ahora mismo";
    }

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Ahora mismo";
    }

    if (minutes < 60) {
        return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }

    if (hours < 24) {
        return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }

    if (days < 30) {
        return `Hace ${days} ${days === 1 ? "día" : "días"}`;
    }

    if (days < 365) {
        const months = Math.floor(days / 30);

        return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
    }

    const years = Math.floor(days / 365);

    return `Hace ${years} ${years === 1 ? "año" : "años"}`;
}


/**
 * Formatea la fecha y hora
 * según la configuración regional.
 */
function formatDate(date) {
    if (!date) {
        return "Fecha desconocida";
    }

    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeStyle: "short"
    }).format(date);
}


/* =========================
   FORMATO DEL CONTENIDO
========================= */

/**
 * Conserva los saltos de línea
 * sin interpretar HTML.
 */
function formatText(value) {
    return escapeHTML(value);
}


/* =========================
   AVATAR DEL PERFIL
========================= */

function renderAvatar() {
    return `
        <div class="avatar">
            <img
                src="${CONFIG.avatarURL}"
                alt="Parroquia San Juan Pablo II"
                width="40"
                height="40"
                loading="lazy"
            >
        </div>
    `;
}


/* =========================
   INSIGNIA VERIFICADA
========================= */

function renderVerifiedBadge() {
    return `
        <img
            src="${CONFIG.verifiedURL}"
            alt="Perfil verificado"
            width="16"
            height="16"
            loading="lazy"
        >
    `;
}


/* =========================
   IMAGEN DE PUBLICACIÓN
========================= */

function renderPostImage(image) {
    const safeURL = getSafeImageURL(image);

    if (!safeURL) {
        return "";
    }

    return `
        <img
            class="post-image"
            src="${escapeHTML(safeURL)}"
            alt="Imagen de la publicación"
            loading="lazy"
            decoding="async"
        >
    `;
}


/* =========================
   RENDERIZAR PUBLICACIÓN
========================= */

function renderPost(post) {
    const date = parseDate(post.publishedAt);

    const text = typeof post.text === "string"
        ? post.text
        : "";

    const imageMarkup = renderPostImage(post.image);

    return `
        <article class="post">

            <header class="post-header">

                ${renderAvatar()}

                <div class="post-author">

                    <div class="post-author-name">

                        <span>
                            Parroquia San Juan Pablo II
                        </span>

                        ${renderVerifiedBadge()}

                    </div>

                    <time
                        class="post-date"
                        datetime="${date ? escapeHTML(date.toISOString()) : ""}"
                        title="${date ? escapeHTML(formatDate(date)) : "Fecha desconocida"}"
                    >
                        ${escapeHTML(getRelativeTime(date))}
                    </time>

                </div>

            </header>

            <div class="post-content">
                <p>${formatText(text)}</p>
            </div>

            ${imageMarkup}

        </article>
    `;
}


/* =========================
   VALIDACIÓN DE PUBLICACIONES
========================= */

function validatePost(post) {
    return (
        post !== null &&
        typeof post === "object" &&
        typeof post.publishedAt === "string" &&
        parseDate(post.publishedAt) !== null &&
        (
            typeof post.text === "string" ||
            typeof post.image === "string"
        )
    );
}


/* =========================
   RENDERIZAR PUBLICACIONES
========================= */

function renderPosts(posts) {
    if (!postsContainer) {
        console.error(
            "Social Channel: no se encontró #posts-container."
        );

        return;
    }

    const validPosts = posts
        .filter(validatePost)
        .sort((a, b) => {
            return (
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
            );
        });

    if (validPosts.length === 0) {
        postsContainer.innerHTML = `
            <p class="loading-message">
                Todavía no hay publicaciones.
            </p>
        `;

        postsContainer.setAttribute("aria-busy", "false");

        return;
    }

    postsContainer.innerHTML = validPosts
        .map(renderPost)
        .join("");

    postsContainer.setAttribute("aria-busy", "false");
}


/* =========================
   ACTUALIZAR TIEMPOS
========================= */

function updateRelativeTimes() {
    if (!postsContainer) {
        return;
    }

    const dates = postsContainer.querySelectorAll(".post-date");

    dates.forEach(element => {
        const date = parseDate(element.dateTime);

        if (!date) {
            return;
        }

        element.textContent = getRelativeTime(date);
        element.title = formatDate(date);
    });
}


/* =========================
   CARGAR PUBLICACIONES
========================= */

async function loadPosts() {
    if (!postsContainer) {
        return;
    }

    try {
        const response = await fetch(CONFIG.postsURL, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        const data = await response.json();

        const posts = Array.isArray(data)
            ? data
            : data.posts;

        if (!Array.isArray(posts)) {
            throw new Error(
                "El archivo posts.json no contiene una lista válida."
            );
        }

        renderPosts(posts);

    } catch (error) {
        console.error(
            "Social Channel: error al cargar publicaciones:",
            error
        );

        postsContainer.innerHTML = `
            <p class="loading-message">
                No se pudieron cargar las publicaciones.
                Inténtalo nuevamente más tarde.
            </p>
        `;

        postsContainer.setAttribute("aria-busy", "false");
    }
}


/* =========================
   INICIALIZACIÓN
========================= */

async function initializeSocialChannel() {
    await loadPosts();

    updateRelativeTimes();

    window.setInterval(
        updateRelativeTimes,
        CONFIG.updateInterval
    );
}


/* =========================
   EJECUCIÓN
========================= */

initializeSocialChannel();
