document.addEventListener("DOMContentLoaded", () => {
    const botonMenu = document.querySelector(".header-menu-toggle");
    const menu = document.querySelector(".header-nav-wrap");

    if (!botonMenu || !menu) {
        console.error("ERROR DEL SISTEMA: No se encontró el botón o el menú.");
        return;
    }

    botonMenu.addEventListener("click", (event) => {
        event.preventDefault();

        const abierto = menu.classList.toggle("menu-abierto");

        botonMenu.setAttribute("aria-expanded", abierto);
    });
});