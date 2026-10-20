
(() => {
    "use strict";

    const CONFIG_URL = "https://sanjuanpabloiipomoca.org/addons/config.json";

    async function iniciarBienvenida() {
        try {
            const respuesta = await fetch(CONFIG_URL, {
                cache: "no-cache"
            });

            if (!respuesta.ok) {
                throw new Error(
                    `Error HTTP ${respuesta.status} al cargar config.json`
                );
            }

            const config = await respuesta.json();

            if (!config.activo) return;

            const parametros = new URLSearchParams(
                window.location.search
            );

            const fuente = parametros.get("utm_source");

            if (!fuente && config.mostrarSoloSiHayFuente) {
                return;
            }

            if (!fuente) return;

            // La comparación es literal:
            // chatgpt.com no es lo mismo que google.com.
            const plataforma = config.plataformas[fuente];

            if (!plataforma) {
                console.info(
                    "Fuente UTM no configurada:",
                    fuente
                );
                return;
            }

            const contenedor = document.getElementById(
                "bienvenida-universal"
            );

            if (!contenedor) {
                console.warn(
                    "No existe #bienvenida-universal en el HTML."
                );
                return;
            }

            const contenido = document.createElement("div");
            contenido.className = "bienvenida-universal__contenido";

            const texto = document.createElement("div");
            texto.className = "bienvenida-universal__texto";

            const titulo = document.createElement("strong");
            titulo.textContent = plataforma.titulo;

            const mensaje = document.createElement("p");
            mensaje.textContent = plataforma.mensaje;

            const procedencia = document.createElement("small");
            procedencia.className = "bienvenida-universal__fuente";
            procedencia.textContent =
                `Origen indicado: ${plataforma.nombre}`;

            const cerrar = document.createElement("button");
            cerrar.type = "button";
            cerrar.className = "bienvenida-universal__cerrar";
            cerrar.textContent = "×";
            cerrar.setAttribute(
                "aria-label",
                "Cerrar mensaje de bienvenida"
            );

            cerrar.addEventListener("click", () => {
                contenedor.hidden = true;
            });

            texto.append(titulo, mensaje, procedencia);
            contenido.append(texto, cerrar);

            contenedor.replaceChildren(contenido);
            contenedor.hidden = false;

        } catch (error) {
            console.error(
                "No se pudo iniciar la bienvenida universal:",
                error
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarBienvenida,
            { once: true }
        );
    } else {
        iniciarBienvenida();
    }
})();
