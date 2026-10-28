
(() => {
  const audio = document.getElementById("radio-vatican-audio");
  const button = document.getElementById("radio-vatican-play");
  const buttonText = document.getElementById("radio-vatican-button-text");
  const status = document.getElementById("radio-vatican-status");

  if (!audio || !button || !buttonText || !status) return;

  const setStatus = (message) => {
    status.textContent = message;
  };

  const setPlayingButton = (playing) => {
    buttonText.textContent = playing
      ? "❚❚ Pausar radio"
      : "▶ Escuchar en vivo";

    button.setAttribute("aria-pressed", String(playing));
  };

  button.addEventListener("click", async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    setStatus("Conectando con Vatican News…");

    try {
      await audio.play();
    } catch (error) {
      setStatus(
        "No se pudo iniciar la reproducción. Comprueba tu conexión o intenta de nuevo."
      );
      setPlayingButton(false);
    }
  });

  audio.addEventListener("playing", () => {
    setPlayingButton(true);
    setStatus("En vivo · Vatican News en español");
  });

  audio.addEventListener("pause", () => {
    setPlayingButton(false);

    if (!audio.ended) {
      setStatus("Radio pausada");
    }
  });

  audio.addEventListener("waiting", () => {
    setStatus("Cargando señal de radio…");
  });

  audio.addEventListener("error", () => {
    setPlayingButton(false);
    setStatus(
      "No se pudo recibir la señal. Intenta nuevamente más tarde."
    );
  });

  audio.addEventListener("ended", () => {
    setPlayingButton(false);
    setStatus("La señal terminó. Puedes intentar reproducirla de nuevo.");
  });
})();
