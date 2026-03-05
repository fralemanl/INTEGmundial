import React from "react";

// Mapeo de países a archivos de imágenes locales
const countryData = {
  // CONCACAF
  México: "mx.png",
  "Estados Unidos": "US.png",
  Canadá: "CA.png",
  "Costa Rica": "CR.png", // Por clasificar
  Jamaica: "JM.png", // Por clasificar
  Panamá: "PA.png",
  Honduras: "HN.png", // Por clasificar
  Haití: "Ht.png",
  Curazao: "CW.png",

  // CONMEBOL
  Argentina: "AR.png",
  Brasil: "BR.png",
  Uruguay: "Uy.png",
  Colombia: "CO.png",
  Chile: "CL.png", // Por clasificar
  Ecuador: "EC.png",
  Perú: "PE.png", // Por clasificar
  Paraguay: "PY.png",
  Venezuela: "VE.png", // Por clasificar
  Bolivia: "BO.png", // Por clasificar

  // UEFA (Europa)
  España: "ES.png",
  Alemania: "de.png",
  Francia: "FR.png",
  Italia: "IT.png", // Por clasificar
  Inglaterra: "uk.png",
  Portugal: "Pt.png",
  "Países Bajos": "NL.png",
  Holanda: "NL.png",
  Bélgica: "BE.png",
  Croacia: "hr.png",
  Suiza: "ch.png",
  Dinamarca: "DK.png", // Por clasificar
  Suecia: "SE.png", // Por clasificar
  Polonia: "PL.png", // Por clasificar
  Austria: "AT.png",
  Serbia: "RS.png", // Por clasificar
  Ucrania: "UA.png", // Por clasificar
  Gales: "GB-WLS.png", // Por clasificar
  Escocia: "GB-SCT.png", // Por clasificar
  Noruega: "NO.png",
  "República Checa": "CZ.png", // Por clasificar

  // AFC (Asia)
  Japón: "JP.png",
  "Corea del Sur": "KR.png",
  "Arabia Saudita": "SA.png",
  Irán: "IR.png",
  Australia: "AU.png",
  Qatar: "QA.png",
  Jordania: "JO.png",
  Uzbekistán: "UZ.png",

  // CAF (África)
  Marruecos: "MA.png",
  Senegal: "SN.png",
  Túnez: "TN.png",
  Ghana: "GH.png",
  Camerún: "CM.png", // Por clasificar
  Nigeria: "NG.png", // Por clasificar
  Egipto: "EG.png",
  Argelia: "dz.png",
  "Costa de Marfil": "CI.png",
  "Cabo Verde": "CV.png",
  Sudáfrica: "za.png",
  Seychelles: "SC.png",

  // OFC
  "Nueva Zelanda": "NZ.png",
};

function TeamFlag({team, size = 24, showName = true}) {
  if (!team) return null;

  // Normalizar size: convertir "24px" a 24, o dejar como número
  const numericSize = typeof size === "string" ? parseInt(size) : size;

  const flagFile = countryData[team];

  // Si no encuentra el país en el mapa, mostrar un ícono genérico
  if (!flagFile) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-gray-400" style={{fontSize: `${numericSize}px`}}>
          🏴
        </span>
        {showName && <span>{team}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={`/flags/${flagFile}`}
        width={numericSize}
        height={numericSize * 0.75} // Proporción típica de banderas (3:2)
        alt={`Bandera de ${team}`}
        className="inline-block object-cover shadow-sm"
        style={{minWidth: `${numericSize}px`}}
        onError={(e) => {
          // Fallback a emoji si falla la imagen
          e.target.style.display = "none";
          const fallback = document.createElement("span");
          fallback.textContent = "🏴";
          fallback.className = "text-gray-400";
          fallback.style.fontSize = `${numericSize}px`;
          e.target.parentNode.insertBefore(fallback, e.target);
        }}
      />
      {showName && <span>{team}</span>}
    </span>
  );
}

export default TeamFlag;
