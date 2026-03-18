import { $, html } from "sigpro";

$.component(
  "c-fab",
  (props, { emit }) => {
    const handleClick = (e, item) => {
      if (item.onclick) item.onclick(e);
      emit("select", item);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    return html`
      <div class="dropdown dropdown-top dropdown-end fixed bottom-6 right-6 z-100">
        <div tabindex="0" role="button" .class=${() => `btn btn-lg btn-circle btn-primary shadow-2xl ${props.ui() ?? ""}`}>
          <span class="${() => props["main-icon"]() || "icon-[lucide--plus]"} w-6 h-6"></span>
        </div>

        <ul tabindex="0" class="dropdown-content menu mb-4 p-0 flex flex-col gap-3 items-center">
          ${() =>
            (props.actions() || []).map(
              (item) => html`
                <li class="p-0">
                  <button
                    .class=${() => `btn btn-circle shadow-lg ${item.ui() ?? "btn-secondary"}`}
                    @click=${(e) => handleClick(e, item)}
                    .title=${item.label}>
                    <span class="${item.icon} w-5 h-5"></span>
                  </button>
                </li>
              `,
            )}
        </ul>
      </div>
    `;
  },
  ["main-icon", "actions", "ui"],
);
