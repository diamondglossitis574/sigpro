import { html } from "sigpro";

export const loading = (show = true, msg = "Cargando...") => {
  const body = document.body;

  if (!show) {
    if (loadingEl) {
      loadingEl.classList.replace("opacity-100", "opacity-0");
      body.style.removeProperty("overflow"); // Restaurar scroll

      const elToRemove = loadingEl; // Captura para el closure
      elToRemove.addEventListener(
        "transitionend",
        () => {
          if (elToRemove === loadingEl) {
            // Solo si sigue siendo el actual
            elToRemove.remove();
            loadingEl = null;
          }
        },
        { once: true },
      );
    }
    return;
  }

  if (loadingEl?.isConnected) {
    loadingEl.querySelector(".loading-text").textContent = msg;
    return;
  }

  body.style.overflow = "hidden"; // Bloquear scroll

  loadingEl = html`
    <div
      class="fixed inset-0 z-9999 flex items-center justify-center bg-base-300/40 backdrop-blur-md transition-opacity duration-300 opacity-0 pointer-events-auto select-none">
      <div class="flex flex-col items-center gap-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <span class="loading-text font-bold text-lg text-base-content">${msg}</span>
      </div>
    </div>
  `.firstElementChild;

  body.appendChild(loadingEl);
  requestAnimationFrame(() => loadingEl.classList.replace("opacity-0", "opacity-100"));
};
