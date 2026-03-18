import App from "./App.js";
import "./app.css";
import "./daisyui.css";
const root = document.getElementById("app");
root.appendChild(App());

if (import.meta.hot) {
  import.meta.hot.accept("./App.js", (newModule) => {
    if (newModule) {
      root.innerHTML = "";
      root.appendChild(newModule.default());
      console.log("🚀 SigPro: App re-renderizada");
    }
  });
}