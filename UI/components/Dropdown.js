import { $, html } from "sigpro";

$.component(
  "c-dropdown",
  (props, { slot }) => {
    // Generamos un ID único para el anclaje nativo
    const id = props.id() ?? `pop-${Math.random().toString(36).slice(2, 7)}`;

    return html`
      <div class="inline-block">
        <button class="btn" popovertarget="${id}" style="anchor-name: --${id}">${slot("trigger")}</button>

        <div popover id="${id}" style="position-anchor: --${id}" class="dropdown menu bg-base-100 rounded-box shadow-sm border border-base-300">
          ${slot()}
        </div>
      </div>
    `;
  },
  ["id"],
);
