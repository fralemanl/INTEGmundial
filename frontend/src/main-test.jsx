// Test simple
console.log("1️⃣ main.jsx cargando...");

import React from "react";
import ReactDOM from "react-dom/client";

console.log("2️⃣ Imports OK");
console.log("3️⃣ React:", React);
console.log("4️⃣ ReactDOM:", ReactDOM);

const root = document.getElementById("root");
console.log("5️⃣ Root element:", root);

const TestApp = () => {
  return (
    <div style={{padding: "20px"}}>
      <h1 style={{color: "green"}}>✅ React funciona!</h1>
      <p>Si ves esto, React está bien configurado.</p>
    </div>
  );
};

console.log("6️⃣ Montando React...");

try {
  ReactDOM.createRoot(root).render(<TestApp />);
  console.log("7️⃣ ✅ React montado exitosamente!");
} catch (error) {
  console.error("❌ ERROR al montar React:", error);
}
