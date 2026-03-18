import { $, html } from "sigpro";

const p1 = ["#000", "#1A1A1A", "#333", "#4D4D4D", "#666", "#808080", "#B3B3B3", "#FFF"];
const p2 = ["#450a0a", "#7f1d1d", "#991b1b", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5"];
const p3 = ["#431407", "#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#ffedd5"];
const p4 = ["#713f12", "#a16207", "#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a", "#fff9c4"];
const p5 = ["#064e3b", "#065f46", "#059669", "#10b981", "#34d399", "#4ade80", "#84cc16", "#d9f99d"];
const p6 = ["#082f49", "#075985", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#22d3ee", "#cffafe"];
const p7 = ["#1e1b4b", "#312e81", "#4338ca", "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#e0e7ff"];
const p8 = ["#2e1065", "#4c1d95", "#6d28d9", "#7c3aed", "#8b5cf6", "#a855f7", "#d946ef", "#fae8ff"];

const palette = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7, ...p8];

$.component(
  "c-colorpicker",
  (props, { emit }) => {
    const handleSelect = (c) => {
      if (typeof props.color === "function") props.color(c);
      emit("select", c);
    };

    const getColor = () => props.color() ?? "#000000";

    return html`
      <div class="card bg-base-200 border-base-300 w-fit border p-2 shadow-sm select-none">
        <div class="grid grid-cols-8 gap-0.5">
          ${() =>
            palette.map(
              (c) => html`
                <button
                  type="button"
                  .style=${`background-color: ${c}`}
                  .class=${() => {
                    const active = getColor() === c;
                    return `size-5 rounded-xs cursor-pointer transition-all hover:scale-125 hover:z-10 active:scale-90 outline-none border border-black/5 ${
                      active ? "ring-2 ring-offset-1 ring-primary z-10 scale-110" : ""
                    }`;
                  }}
                  @click=${() => handleSelect(c)}></button>
              `,
            )}
        </div>

        <div class="flex items-center gap-1 mt-2">
          <input
            type="text"
            class="input input-bordered input-xs h-6 px-1 font-mono text-[10px] w-full"
            .value=${() => props.color()}
            @input=${(e) => handleSelect(e.target.value)} />

          <div class="tooltip" data-tip="Copiar">
            <button
              type="button"
              class="btn btn-xs btn-square border border-base-content/20 shadow-inner"
              .style=${() => `background-color: ${getColor()}`}
              @click=${() => navigator.clipboard.writeText(getColor())}>
              <span class="icon-[lucide--copy] text-white mix-blend-difference"></span>
            </button>
          </div>
        </div>
      </div>
    `;
  },
  ["color"],
);
