import { $, html } from "sigpro";

$.component(
  "c-dialog",
  (props, { slot, emit }) => {
    return html`
      <dialog
        .class=${() => `modal ${props.open() ? "modal-open" : ""}`}
        .open=${() => props.open()}
        @close=${(e) => {
          if (typeof props.open === "function") props.open(false);
          emit("close", e);
        }}>
        <div class="modal-box">
          <div class="flex flex-col gap-4">${slot()}</div>

          <div class="modal-action">
            <form method="dialog" @submit=${() => props.open(false)}>
              ${slot("buttons")}
              ${() =>
                !slot("buttons").length
                  ? html`
                      <button class="btn">Cerrar</button>
                    `
                  : ""}
            </form>
          </div>
        </div>

        <form method="dialog" class="modal-backdrop" @submit=${() => props.open(false)}>
          <button>close</button>
        </form>
      </dialog>
    `;
  },
  ["open"],
);
