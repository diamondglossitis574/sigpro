import { $, html } from "sigpro";

$.component(
  "c-range",
  (props, { emit }) => {
    return html`
      <input
        type="range"
        .min=${() => props.min() ?? 0}
        .max=${() => props.max() ?? 100}
        .step=${() => props.step() ?? 1}
        .value=${() => props.value()}
        .class=${() => `range ${props.ui() ?? ""}`}
        @input=${(e) => {
          const val = e.target.value;
          if (typeof props.value === "function") props.value(val);

          emit("input", val);
          emit("change", val);
        }} />
    `;
  },
  ["ui", "value", "min", "max", "step"],
);
