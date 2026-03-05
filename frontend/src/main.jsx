console.log("🚀 Iniciando aplicación...");

import React from "react";
import ReactDOM from "react-dom/client";

console.log("✅ React importado:", React);
console.log("✅ ReactDOM importado:", ReactDOM);

import App from "./App.jsx";
console.log("✅ App importado:", App);

import "./index.css";
console.log("✅ CSS importado");

const rootElement = document.getElementById("root");
console.log("✅ Root element:", rootElement);

if (!rootElement) {
  console.error("❌ ERROR: No se encontró el elemento #root");
} else {
  try {
    console.log("🔄 Intentando renderizar...");
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log("✅ ¡Aplicación renderizada exitosamente!");
  } catch (error) {
    console.error("❌ ERROR al renderizar:", error);
    console.error("Stack:", error.stack);
  }
}
