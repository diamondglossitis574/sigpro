/**
 * UI Demo/Test - Para probar componentes localmente sin hacer release
 * 
 * Ejecutar:
 * 1. Crear un archivo index.html que importe este archivo
 * 2. O usar con Vite: bun add -d vite && bun vite UI/app.js
 * 
 * Alternativamente, simplemente copiar las partes que necesitas a tu proyecto
 */
import { $, html, effect } from "../../index.js";
import { Button, Input, Card, Drawer, Menu, Dropdown, Fab, Dialog, Loading } from "./index.js";

// Importar la función helper de loading
import { loading } from "./components/Loading.js";

// Estado para la demo
const state = {
  inputValue: $(""),
  checkboxValue: $(false),
  radioValue: $("option1"),
  rangeValue: $(50),
  showDialog: $(false),
  openDrawer: $(false),
};

// Menú de navegación
const menuItems = [
  { label: "Home", icon: "icon-[lucide--home]", href: "#/home" },
  { label: "About", icon: "icon-[lucide--info]", href: "#/about" },
  { 
    label: "Components", 
    icon: "icon-[lucide--box]", 
    open: false,
    sub: [
      { label: "Button", href: "#/button" },
      { label: "Input", href: "#/input" },
      { label: "Card", href: "#/card" },
      { label: "Forms", href: "#/forms" },
    ]
  },
];

// Demo page principal
export default function App() {
  effect(() => {
    console.log("Input value:", state.inputValue());
  });

  return html`
    <div class="min-h-screen bg-base-100 text-base-content p-4">
      <header class="navbar bg-base-200 shadow-xl px-4 mb-6 rounded-lg">
        <div class="flex-1">
          <span class="text-xl font-bold">SigProUI Test</span>
        </div>
        <div class="flex-none">
          <c-button @click=${() => state.openDrawer(!state.openDrawer())}>
            <span class="icon-[lucide--menu]"></span>
          </c-button>
        </div>
      </header>

      <c-drawer .open=${state.openDrawer}>
        <c-menu .items=${menuItems}></c-menu>
      </c-drawer>

      <main class="max-w-4xl mx-auto space-y-8">
        
        <!-- Buttons Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Buttons</h2>
          <div class="flex flex-wrap gap-2">
            <c-button @click=${() => console.log("Primary clicked")}>Primary</c-button>
            <c-button ui="btn-secondary">Secondary</c-button>
            <c-button ui="btn-accent">Accent</c-button>
            <c-button ui="btn-ghost">Ghost</c-button>
            <c-button ui="btn-link">Link</c-button>
            <c-button .loading=${true}>Loading</c-button>
            <c-button .disabled=${true}>Disabled</c-button>
            <c-button .badge=${"5"}>With Badge</c-button>
            <c-button .tooltip=${"I'm a tooltip!"}>With Tooltip</c-button>
          </div>
        </section>

        <!-- Input Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Input</h2>
          <div class="flex flex-col gap-4 max-w-md">
            <c-input 
              label="Username" 
              .value=${state.inputValue}
              @input=${(v) => state.inputValue(v)}
              placeholder="Enter username"
            ></c-input>
            
            <c-input 
              label="Email" 
              type="email" 
              placeholder="email@example.com"
              icon="icon-[lucide--mail]"
            ></c-input>
            
            <c-input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              icon="icon-[lucide--lock]"
            ></c-input>
          </div>
          <p class="text-sm opacity-70">Current input value: "${state.inputValue()}"</p>
        </section>

        <!-- Card Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Card</h2>
          <c-card bordered>
            <span slot="title">Card Title</span>
            <p>This is a basic card with some content.</p>
            <div slot="actions">
              <c-button ui="btn-sm btn-primary">Accept</c-button>
              <c-button ui="btn-sm">Cancel</c-button>
            </div>
          </c-card>
          
          <c-card .img=${"https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"} bordered>
            <span slot="title">Card with Image</span>
            <p>Beautiful flower image</p>
            <div slot="actions">
              <c-button ui="btn-primary">Buy Now</c-button>
            </div>
          </c-card>
        </section>

        <!-- Forms Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Form Controls</h2>
          <div class="flex flex-wrap gap-6">
            
            <c-check 
              .checked=${state.checkboxValue}
              label="Accept terms"
              @change=${(v) => state.checkboxValue(v)}
            ></c-check>
            <p class="text-sm">Checkbox value: ${() => state.checkboxValue() ? "checked" : "unchecked"}</p>
            
            <div class="flex flex-col gap-2">
              <c-radio 
                name="radio-demo" 
                .checked=${() => state.radioValue() === "option1"}
                .value=${"option1"} 
                label="Option 1"
                @change=${(v) => state.radioValue(v)}
              ></c-radio>
              <c-radio 
                name="radio-demo" 
                .checked=${() => state.radioValue() === "option2"}
                .value=${"option2"} 
                label="Option 2"
                @change=${(v) => state.radioValue(v)}
              ></c-radio>
              <c-radio 
                name="radio-demo" 
                .checked=${() => state.radioValue() === "option3"}
                .value=${"option3"} 
                label="Option 3"
                @change=${(v) => state.radioValue(v)}
              ></c-radio>
            </div>
            <p class="text-sm">Radio value: "${state.radioValue()}"</p>
            
            <div class="w-full max-w-xs">
              <c-range 
                .value=${state.rangeValue}
                min="0" max="100"
                @change=${(v) => state.rangeValue(Number(v))}
              ></c-range>
              <p class="text-sm">Range value: ${state.rangeValue()}</p>
            </div>
          
          </div>
        </section>

        <!-- Loading Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Loading</h2>
          <div class="flex gap-4">
            <c-button @click=${() => loading(true, "Loading...")}>
              Show Loading
            </c-button>
            <c-button @click=${() => loading(false)}>
              Hide Loading
            </c-button>
          </div>
        </section>

        <!-- Dialog Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Dialog</h2>
          <c-button @click=${() => state.showDialog(true)}>Open Dialog</c-button>
          
          <c-dialog .open=${state.showDialog} @close=${() => state.showDialog(false)}>
            <span slot="title" class="font-bold text-lg">Confirm Action</span>
            <p>Are you sure you want to proceed?</p>
            <div slot="buttons" class="flex gap-2 justify-end">
              <c-button ui="btn-ghost" @click=${() => state.showDialog(false)}>Cancel</c-button>
              <c-button ui="btn-primary" @click=${() => { console.log("Confirmed!"); state.showDialog(false); }}>Confirm</c-button>
            </div>
          </c-dialog>
        </section>

        <!-- Dropdown Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">Dropdown</h2>
          <c-dropdown>
            <c-button slot="trigger">Open Dropdown</c-button>
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </c-dropdown>
        </section>

        <!-- FAB Section -->
        <section class="space-y-4">
          <h2 class="text-2xl font-bold">FAB (Floating Action Button)</h2>
          <c-fab 
            .actions=${[
              { label: "Add", icon: "icon-[lucide--plus]", ui: "btn-secondary" },
              { label: "Edit", icon: "icon-[lucide--edit]", ui: "btn-accent" },
              { label: "Message", icon: "icon-[lucide--message]", ui: "btn-info" },
            ]}
          ></c-fab>
        </section>

      </main>
    </div>
  `;
}

// Mount the app
if (typeof document !== "undefined") {
  const root = document.getElementById("app");
  if (root) {
    root.appendChild(App());
  }
}
