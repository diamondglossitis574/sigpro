import { $, html } from "sigpro";

$.component(
  "c-card",
  (props, host) => {
    return html`
      <div class="${() => `card bg-base-100 shadow-sm ${props.ui() ?? ""}`}">
        ${() =>
          props.img()
            ? html`
                <figure>
                  <img src="${() => props.img()}" alt="${() => props.alt() ?? "Card image"}" />
                </figure>
              `
            : null}

        <div class="card-body">
          <h2 class="card-title">${host.slot("title")}</h2>
          <div class="card-content">${host.slot("body")}</div>
          <div class="card-actions justify-end">${host.slot("actions")}</div>
        </div>
      </div>
    `;
  },
  ["img", "alt", "ui"],
);
