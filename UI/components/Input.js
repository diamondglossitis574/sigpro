import { $, html } from "sigpro";

$.component(
  "c-input",
  (props, { slot, emit }) => {
    return html`
      <div class="${props.tooltip() ? "tooltip" : ""}" data-tip=${() => props.tooltip() ?? ""}>
        <label class="floating-label">
          <span>${() => props.label() ?? ""}</span>
          <label class=${() => `input ${props.ui() ?? ""}`}>
            <input
              type=${() => props.type() ?? "text"}
              class="input"
              :value=${props.value}
              placeholder=${() => props.place() ?? props.label() ?? ""}
              @input=${(e) => emit("input", e.target.value)}
              @change=${(e) => emit("change", e.target.value)} />
            <span>${slot("icon-action")}</span>
            <span class=${() => props.icon() ?? ""}></span>
          </label>
        </label>
      </div>
    `;
  },
  ["label", "value", "icon", "tooltip", "ui", "place", "type"],
);
