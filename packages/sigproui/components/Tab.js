import { $, html } from "sigpro";

$.component(
  "c-tab",
  (props, { emit, slot }) => {
    const groupName = `tab-group-${Math.random().toString(36).substring(2, 9)}`;
    const items = () => props.items() || [];

    return html`
      <div .class=${() => `tabs ${props.ui() ?? "tabs-lifted"}`}>
        ${() =>
          items().map(
            (item) => html`
              <input
                type="radio"
                name="${groupName}"
                class="tab"
                .checked=${() => props.value() === item.value}
                @change=${() => {
                  if (typeof props.value === "function") props.value(item.value);
                  emit("change", item.value);
                }} />
              <label class="tab">${item.label}</label>
            `,
          )}
      </div>
      <div class="tab-content bg-base-100 border-base-300 p-6">${() => slot(props.value())}</div>
    `;
  },
  ["items", "value", "ui"],
);
