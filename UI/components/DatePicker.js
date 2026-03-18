import { $, html } from "sigpro";

$.component(
  "c-datepicker",
  (props, { emit }) => {
    const viewDate = $(new Date());
    const hoveredDate = $(null);
    const todayISO = new Date().toLocaleDateString("en-CA");

    const toISOLocal = (date) => {
      if (!date) return null;
      return date.toISOString().split("T")[0];
    };

    // Función unificada para navegar tiempo
    const navigate = (type, offset) => {
      hoveredDate(null);
      const d = viewDate();
      if (type === "month") {
        viewDate(new Date(d.getFullYear(), d.getMonth() + offset, 1));
      } else if (type === "year") {
        viewDate(new Date(d.getFullYear() + offset, d.getMonth(), 1));
      }
    };

    const selectDate = (dateObj) => {
      const isoDate = toISOLocal(dateObj);
      const isRange = props.range() === "true" || props.range() === true;
      const currentVal = typeof props.value === "function" ? props.value() : props.value;

      let result;
      if (!isRange) {
        result = isoDate;
      } else {
        const s = currentVal?.start || null;
        const e = currentVal?.end || null;
        if (!s || (s && e)) {
          result = { start: isoDate, end: null };
        } else {
          result = isoDate < s ? { start: isoDate, end: s } : { start: s, end: isoDate };
        }
      }

      if (typeof props.value === "function") {
        props.value(isRange ? { ...result } : result);
      }
      emit("change", result);
    };

    const handleGridClick = (e) => {
      const btn = e.target.closest("button[data-date]");
      if (!btn) return;
      selectDate(new Date(btn.getAttribute("data-date")));
    };

    const days = $(() => {
      const d = viewDate();
      const year = d.getFullYear();
      const month = d.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const offset = firstDay === 0 ? 6 : firstDay - 1;
      const total = new Date(year, month + 1, 0).getDate();
      let grid = Array(offset).fill(null);
      for (let i = 1; i <= total; i++) grid.push(new Date(year, month, i));
      return grid;
    });

    const getWeekNumber = (d) => {
      const t = new Date(d.valueOf());
      t.setDate(t.getDate() - ((d.getDay() + 6) % 7) + 3);
      const firstThurs = t.valueOf();
      t.setMonth(0, 1);
      if (t.getDay() !== 4) t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
      return 1 + Math.ceil((firstThurs - t.getTime()) / 604800000);
    };

    return html`
      <div class="card bg-base-100 shadow-xl border border-base-300 w-80 p-4 pb-6 rounded-box select-none">
        <div class="flex justify-between items-center mb-4 gap-1">
          <div class="flex gap-0.5">
            <button type="button" class="btn btn-ghost btn-xs px-1" @click=${() => navigate("year", -1)}>
              <span class="icon-[lucide--chevrons-left] w-4 h-4 opacity-50"></span>
            </button>
            <button type="button" class="btn btn-ghost btn-xs px-1" @click=${() => navigate("month", -1)}>
              <span class="icon-[lucide--chevron-left] w-4 h-4"></span>
            </button>
          </div>

          <span class="text-xs font-bold capitalize flex-1 text-center">
            ${() => viewDate().toLocaleString("es-ES", { month: "long" }).toUpperCase()}
            <span class="opacity-50 ml-1">${() => viewDate().getFullYear()}</span>
          </span>

          <div class="flex gap-0.5">
            <button type="button" class="btn btn-ghost btn-xs px-1" @click=${() => navigate("month", 1)}>
              <span class="icon-[lucide--chevron-right] w-4 h-4"></span>
            </button>
            <button type="button" class="btn btn-ghost btn-xs px-1" @click=${() => navigate("year", 1)}>
              <span class="icon-[lucide--chevrons-right] w-4 h-4 opacity-50"></span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-8 gap-1 px-1" @click=${handleGridClick}>
          <div class="flex items-center justify-center text-[10px] opacity-40 font-bold uppercase"></div>
          ${() =>
            ["L", "M", "X", "J", "V", "S", "D"].map(
              (l) => html`
                <div class="flex items-center justify-center text-[10px] opacity-40 font-bold uppercase">${l}</div>
              `,
            )}
          ${() =>
            days().map((date, i) => {
              const isFirstCol = i % 7 === 0;
              const iso = date ? toISOLocal(date) : null;

              const btnClass = () => {
                if (!date) return "";
                const val = typeof props.value === "function" ? props.value() : props.value;
                const isR = props.range() === "true" || props.range() === true;
                const sDate = isR ? val?.start : typeof val === "string" ? val : val?.start;
                const eDate = isR ? val?.end : null;
                const hDate = hoveredDate();

                const isSel = iso === sDate || iso === eDate;
                const tEnd = eDate || hDate;
                const inRange = isR && sDate && tEnd && !isSel && ((iso > sDate && iso < tEnd) || (iso < sDate && iso > tEnd));

                return `btn btn-xs p-0 aspect-square min-h-0 h-auto font-normal rounded-md relative 
                      ${isSel ? "btn-primary !text-primary-content shadow-md" : "btn-ghost"} 
                      ${inRange ? "!bg-primary/20 !text-base-content" : ""}`;
              };

              return html`
                ${isFirstCol
                  ? html`
                      <div class="flex items-center justify-center text-[10px] opacity-30 italic bg-base-200/50 rounded-md aspect-square">
                        ${date ? getWeekNumber(date) : days()[i + 6] ? getWeekNumber(days()[i + 6]) : ""}
                      </div>
                    `
                  : ""}
                ${date
                  ? html`
                      <button
                        type="button"
                        class="${btnClass}"
                        data-date="${date.toISOString()}"
                        @mouseenter=${() => hoveredDate(iso)}
                        @mouseleave=${() => hoveredDate(null)}>
                        ${iso === todayISO
                          ? html`
                              <span class="absolute -inset-px border-2 border-primary/60 rounded-md pointer-events-none"></span>
                            `
                          : ""}
                        <span class="relative z-10 pointer-events-none">${date.getDate()}</span>
                      </button>
                    `
                  : html`
                      <div class="aspect-square"></div>
                    `}
              `;
            })}
        </div>
      </div>
    `;
  },
  ["range", "value"],
);
