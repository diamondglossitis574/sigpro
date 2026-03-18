import { $, html } from "sigpro";

$.component(
  "c-button",
  (props, { emit, slot }) => {
    const spinner = () => html`
      <span .class="${() => `loading loading-spinner loading-xs ${props.loading() ? "" : "hidden"}`}"></span>
    `;

    return html`
      <div class="${props.tooltip() ? "tooltip" : ""}" data-tip=${() => props.tooltip() ?? ""}>
        <button
          class="${() => `btn ${props.ui() ?? ""} ${props.badge() ? "indicator" : ""}`}"
          ?disabled=${() => props.disabled()}
          @click=${(e) => {
            e.stopPropagation();
            if (!props.loading() && !props.disabled()) emit("click", e);
          }}>
          ${spinner()} ${slot()}
          ${() =>
            props.badge()
              ? html`
                  <span class="indicator-item badge badge-secondary">${props.badge()}</span>
                `
              : null}
        </button>
      </div>
    `;
  },
  ["ui", "loading", "badge", "tooltip", "disabled"],
);
