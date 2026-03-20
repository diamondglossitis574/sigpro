import { html } from "sigpro";

let container = null;

export const toast = (msg, type = "alert-success", ms = 3500) => {
  if (!container || !container.isConnected) {
    container = document.createElement("div");
    container.className = "fixed top-0 right-0 z-9999 p-6 flex flex-col gap-4 pointer-events-none items-end";
    document.body.appendChild(container);
  }

  const close = (n) => {
    if (!n || n._c) return;
    n._c = 1;
    Object.assign(n.style, { transform: "translateX(100%)", opacity: 0 });

    setTimeout(() => {
      Object.assign(n.style, { maxHeight: "0px", marginBottom: "-1rem", marginTop: "0px", padding: "0px" });
    }, 100);

    n.addEventListener("transitionend", (e) => {
      if (["max-height", "opacity"].includes(e.propertyName)) {
        n.remove();
        if (!container.hasChildNodes()) (container.remove(), (container = null));
      }
    });
  };

  const el = html`
    <div
      class="card bg-base-100 shadow-xl border border-base-200 w-80 sm:w-96 overflow-hidden transition-all duration-500 ease-in-out transform translate-x-full opacity-0 pointer-events-auto"
      style="max-height:200px">
      <div class="card-body p-1">
        <div role="alert" class="${`alert ${type} alert-soft border-none p-2`}">
          <div class="flex items-center justify-between w-full gap-2">
            <span class="font-medium text-sm">${msg}</span>
            <button class="btn btn-ghost btn-xs btn-circle" @click="${(e) => close(e.target.closest(".card"))}">
              <span class="icon-[lucide--circle-x] w-5 h-5"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `.firstElementChild;

  container.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("translate-x-full", "opacity-0")));
  setTimeout(() => close(el), ms);
};
