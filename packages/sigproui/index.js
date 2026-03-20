// index.js
import "./sigproui.css";

import "./components/Button.js";
import "./components/Card.js";
import "./components/Checkbox.js";
import "./components/ColorPicker.js";
import "./components/DatePicker.js";
import "./components/Dialog.js";
import "./components/Drawer.js";
import "./components/Dropdown.js";
import "./components/Fab.js";
import "./components/Input.js";
import "./components/Loading.js";
import "./components/Menu.js";
import "./components/Radio.js";
import "./components/Range.js";
import "./components/Rating.js";
import "./components/Tab.js";
import "./components/Toast.js";


export { default as Button } from "./components/Button.js";
export { default as Card } from "./components/Card.js";
export { default as Checkbox } from "./components/Checkbox.js";
export { default as ColorPicker } from "./components/ColorPicker.js";
export { default as DatePicker } from "./components/DatePicker.js";
export { default as Dialog } from "./components/Dialog.js";
export { default as Drawer } from "./components/Drawer.js";
export { default as Dropdown } from "./components/Dropdown.js";
export { default as Fab } from "./components/Fab.js";
export { default as Input } from "./components/Input.js";
export { default as Loading } from "./components/Loading.js";
export { default as Menu } from "./components/Menu.js";
export { default as Radio } from "./components/Radio.js";
export { default as Range } from "./components/Range.js";
export { default as Rating } from "./components/Rating.js";
export { default as Tab } from "./components/Tab.js";
export { default as Toast } from "./components/Toast.js";

export const components = [
  "Button",
  "Card",
  "Checkbox",
  "ColorPicker",
  "DatePicker",
  "Dialog",
  "Drawer",
  "Dropdown",
  "Fab",
  "Input",
  "Loading",
  "Menu",
  "Radio",
  "Range",
  "Rating",
  "Tab",
  "Toast",
];

// Exportar versión
export const version = "1.0.0";
export const name = "SigProUI";

export default {
  version,
  name,
  description: "Biblioteca de componentes UI basada en SigPro, Tailwind CSS y DaisyUI",
  components,
};
