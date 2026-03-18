import { $, html } from "sigpro";

$.component(
  "c-radio",
  (props, { emit }) => {
    return html`
      <label class="label cursor-pointer flex justify-start gap-4">
        <input
          type="radio"
          .name=${() => props.name()}
          .value=${() => props.value()}
          .class=${() => `radio ${props.ui() ?? ""}`}
          .disabled=${() => props.disabled()}
          .checked=${() => props.checked()}
          @change=${(e) => {
            if (e.target.checked) emit("change", props.value());
          }} />
        ${() =>
          props.label()
            ? html`
                <span class="label-text">${() => props.label()}</span>
              `
            : ""}
      </label>
    `;
  },
  ["checked", "name", "label", "ui", "disabled", "value"],
);
