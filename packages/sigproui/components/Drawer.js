import { $, html } from "sigpro";

$.component(
  "c-drawer",
  (props, { emit, slot }) => {
    const id = `drawer-${Math.random().toString(36).substring(2, 9)}`;

    return html`
      <div class="drawer">
        <input
          id="${id}"
          type="checkbox"
          class="drawer-toggle"
          .checked=${() => props.open()}
          @change=${(e) => {
            const isChecked = e.target.checked;
            if (typeof props.open === "function") props.open(isChecked);
            emit("change", isChecked);
          }} />

        <div class="drawer-content">${slot("content")}</div>

        <div class="drawer-side z-999">
          <label for="${id}" aria-label="close sidebar" class="drawer-overlay"></label>
          <div class="bg-base-200 min-h-full w-80">${slot()}</div>
        </div>
      </div>
    `;
  },
  ["open"],
);
