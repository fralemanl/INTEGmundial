import React from "react";

export default function Mundial() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-black flex flex-col items-center justify-center px-4 py-10">
      <img
        src="/img/mundial2026.png"
        alt="Logo Mundial 2026"
        className="w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-xl animate-fade-in"
        style={{ objectFit: "contain" }}
      />
      <h1 className="text-4xl md:text-5xl font-black text-green-400 mb-6 drop-shadow-lg text-center">
        El Mundial 2026
      </h1>
      <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl text-center">
        Pronto podrás visualizar aquí los grupos y equipos del Mundial. ¡Espéralo muy pronto!
      </p>
    </div>
  );
}
