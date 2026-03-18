import { html, $ } from "sigpro";
import buttonsPage from "./pages/buttons.js";
import inputPage from "./pages/input.js";
import checkboxPage from "./pages/checkbox.js";
import "@components/Drawer.js";
import "@components/Menu.js";

// Configuración de rutas
const routes = [
  { path: "/", component: () => buttonsPage() },
  { path: "/buttons", component: () => buttonsPage() },
  { path: "/input", component: () => inputPage() },
  { path: "/checkbox", component: () => checkboxPage() },
];

export default function App() {
  const openMenu = $(false);

  const menuConfig = [
    { label: "Buttons", icon: "icon-[lucide--square]", href: "#/buttons" },
    {
      label: "Forms",
      icon: "icon-[lucide--form-input]",
      open: false,
      sub: [
        { label: "Input", href: "#/input" },
        { label: "Checkbox", href: "#/checkbox" },
        { label: "Radio", href: "#/radio" },
        { label: "Range", href: "#/range" },
        { label: "Rating", href: "#/rating" },
        { label: "Color Picker", href: "#/colorpicker" },
        { label: "Date Picker", href: "#/datepicker" },
      ],
    },
    {
      label: "Display",
      icon: "icon-[lucide--layout]",
      open: false,
      sub: [
        { label: "Card", href: "#/card" },
        { label: "Tabs", href: "#/tabs" },
        { label: "Loading", href: "#/loading" },
      ],
    },
    {
      label: "Feedback",
      icon: "icon-[lucide--message-circle]",
      open: false,
      sub: [
        { label: "Toast", href: "#/toast" },
        { label: "Dialog", href: "#/dialog" },
        { label: "FAB", href: "#/fab" },
        { label: "Dropdown", href: "#/dropdown" },
      ],
    },
    { label: "About", icon: "icon-[lucide--info]", href: "#/about" },
  ];

  return html`
    <div class="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      <header class="navbar bg-base-200 justify-between shadow-xl px-4">
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" @click=${() => openMenu(!openMenu())}>
            <span class="icon-[lucide--menu] size-5"></span>
          </button>
          <span class="font-bold text-lg">SigProUI</span>
        </div>
      </header>

      <c-drawer .open=${openMenu} @change=${(e) => openMenu(false)}>
        <c-menu cls="menu-lg" .items=${menuConfig} @select=${() => openMenu(false)}></c-menu>
      </c-drawer>

      <main class="p-4 flex flex-col gap-4 mx-auto w-full max-w-7xl">
        <div class="p-4 bg-base-100 rounded-box shadow-sm">${$.router(routes)}</div>
      </main>
    </div>
  `;
}
