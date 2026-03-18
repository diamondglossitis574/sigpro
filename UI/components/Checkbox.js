import { $, html } from "sigpro";

const getVal = (props, key, def) => {
  const v = props[key];
  if (v === undefined || v === null) return def;
  if (typeof v === "function") {
    try {
      return v();
    } catch {
      return def;
    }
  }
  return v;
};

const toString = (val) => {
  if (val === undefined || val === null) return "";
  return String(val);
};

$.component(
  "c-check",
  (props, { emit }) => {
    const label = toString(getVal(props, "label", ""));
    const disabled = getVal(props, "disabled", false);
    const isToggle = getVal(props, "toggle", false);

    return html`
      <label class="label cursor-pointer flex gap-2">
        <input
          type="checkbox"
          class="${isToggle ? "toggle" : "checkbox"}"
          ?disabled="${disabled}"
          .checked=${() => getVal(props, "checked", false)}
          @change="${(e) => {
            if (disabled) return;
            const val = e.target.checked;
            if (typeof props.checked === "function") props.checked(val);
            emit("change", val);
          }}" />
        ${label
          ? html`
              <span class="label-text">${label}</span>
            `
          : ""}
      </label>
    `;
  },
  ["label", "checked", "disabled", "toggle"],
);
