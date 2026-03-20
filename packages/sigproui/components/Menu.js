import { $, html } from "sigpro";

$.component(
  "c-menu",
  (props, { emit }) => {
    const getItems = () => props.items() || [];

    const renderItems = (data) => {
      return data.map((item) => {
        const hasChildren = item.sub && item.sub.length > 0;
        const content = html`
          ${item.icon
            ? html`
                <span class="${item.icon} h-4 w-4"></span>
              `
            : ""}
          <span>${item.label}</span>
        `;

        if (hasChildren) {
          return html`
            <li>
              <details .open="${!!item.open}">
                <summary>${content}</summary>
                <ul>
                  ${renderItems(item.sub)}
                </ul>
              </details>
            </li>
          `;
        }

        return html`
          <li>
            <a
              href="${item.href || "#"}"
              .class=${item.active ? "active" : ""}
              @click="${(e) => {
                if (!item.href || item.href === "#") e.preventDefault();
                if (item.onClick) item.onClick(item);
                emit("select", item);
              }}">
              ${content}
            </a>
          </li>
        `;
      });
    };

    return html`
      <ul .class=${() => `menu bg-base-200 rounded-box w-full ${props.ui() ?? ""}`}>
        ${() => renderItems(getItems())}
      </ul>
    `;
  },
  ["items", "ui"],
);
