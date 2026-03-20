import { $, html } from "sigpro";

$.component(
  "c-rating",
  (props, { emit }) => {
    const count = () => parseInt(props.count() ?? 5);

    const getVal = () => {
      const v = props.value();
      return v === false || v == null ? 0 : Number(v);
    };

    return html`
      <div .class=${() => `rating ${props.mask() ?? ""}`}>
        ${() =>
          Array.from({ length: count() }).map((_, i) => {
            const radioValue = i + 1;
            return html`
              <input
                type="radio"
                .name=${() => props.name()}
                .class=${() => `mask ${props.mask() ?? "mask-star"}`}
                .checked=${() => getVal() === radioValue}
                @change=${() => {
                  if (typeof props.value === "function") props.value(radioValue);
                  emit("change", radioValue);
                }} />
            `;
          })}
      </div>
    `;
  },
  ["value", "count", "name", "mask"],
);
