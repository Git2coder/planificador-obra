import { useState, useEffect, useMemo } from "react";
import { calcularTiempoObra, generarEtapasAutomaticas } from "./utils/calculosTiempo";
import { calcularMateriales } from "./logic/calcularMateriales";
import { createMuro } from "./utils/createMuro";
import Paso1Muros from "./components/steps/Paso1Mamposteria";
import Paso2Revoques from "./components/steps/Paso2Revoques";
import Paso3Estructura from "./components/steps/Paso3Estructura";
import Paso4Totales from "./components/steps/Paso4Costos";
import Paso5Planificacion from "./components/steps/Paso5Planificacion";

export default function App() {
  
  const [cuadrillas, setCuadrillas] = useState(1);
  const [modoCalculo, setModoCalculo] = useState(null);
  const [etapasAuto, setEtapasAuto] = useState([]);
  const [etapasEditadas, setEtapasEditadas] = useState(null);

  const [tecnologia, setTecnologia] = useState({
    mamposteria: "manual",
    revoque: "manual",
    losa: "manual",
    contrapiso: "manual",
    carpeta: "manual"
  });

  const [precios, setPrecios] = useState({
    cemento: 6875,   // por bolsa
    arena: 37600,     // por bolsón
    cal: 7400,       // por bolsa
    piedra: 82200     // por bolsón
  });

  const [muros, setMuros] = useState([createMuro("Muro 1")]);
  const [paso, setPaso] = useState(1);
  const [losa, setLosa] = useState({ largo: 0, ancho: 0, espesor: 0.12 });
  const [contrapiso, setContrapiso] = useState({ largo: 11.5, ancho: 9.6, espesor: 0.11 });
  const [carpeta, setCarpeta] = useState({ largo: 11.5, ancho: 9.6, espesor: 0.02 });

  const [tipoContrapiso, setTipoContrapiso] = useState("conCal");
  const [personasPorTarea, setPersonasPorTarea] = useState({
    mamposteria: 1,
    revoque: 1,
    losa: 1,
    contrapiso: 1,
    carpeta: 1
  });

  const [showConfig, setShowConfig] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [configTareas, setConfigTareas] = useState({
    mamposteria: { personas: 2, productividad: 1 },
    revoque: { personas: 2, productividad: 1 },
    losa: { personas: 3, productividad: 1 },
    contrapiso: { personas: 2, productividad: 1 },
    carpeta: { personas: 2, productividad: 1 }
  });

  const etapasMostradas =
  etapasEditadas !== null ? etapasEditadas : etapasAuto;

  function calcDias(superficie, rendimientoBase, config) {
    const produccion =
      rendimientoBase *
      config.productividad *
      config.personas;

    return superficie / produccion;
  }

  // CALCULOS
  const resultados = useMemo(() =>
    calcularMateriales({
      muros,
      losa,
      contrapiso,
      carpeta,
      tipoContrapiso,
      modoCalculo,
      precios,
      
    }),
  [muros, losa, contrapiso, carpeta, tipoContrapiso, modoCalculo, precios]);

  const {
    superficieTotal,
    supLosa,
    supContrapiso,
    supCarpeta,
    cementoEstructura,
    arenaEstructura,
    piedraEstructura,

    // 🔹 MUROS
    totalLadrillos,
    cementoMuros,
    calMuros,
    arenaMuros,

    // 🔹 MATERIALES
    totalCemento,
    totalArena,
    totalCal,
    totalPiedra,

    // 🔹 UNIDADES
    bolsasCemento,
    bolsasCal,
    bolsonArena,
    bolsonPiedra,

    // 🔹 COSTOS
    costoTotal,
    costoCemento,
    costoArena,
    costoCal,
    costoPiedra,

    // 🔹 DETALLES
    resultadosPorMuro

  } = resultados;

  const supRevoques = (superficieTotal || 0) * 2;

  const tiempos = useMemo(() => {
    return calcularTiempoObra({
      superficieMuros: superficieTotal,
      superficieRevoques: supRevoques,
      supLosa,
      supContrapiso,
      supCarpeta,
      tecnologia,
      cuadrillas,
      personasPorTarea,
      configTareas
    });
  }, 
    [
      superficieTotal,
      supRevoques,
      supLosa,
      supContrapiso,
      supCarpeta,
      tecnologia,
      cuadrillas,
      personasPorTarea,
      configTareas
    ]
  );
  
  let duracionTotal = 0;
  let costoManoObra = 0;
  let personas = 0;

  duracionTotal = tiempos.totalDias;

  personas = Object.values(configTareas).reduce(
    (acc, t) => acc + t.personas,
    0
  );

  costoManoObra = tiempos.costoTotal;
  
  useEffect(() => {
    if (!tiempos?.desglose) return;

    const nuevas = generarEtapasAutomaticas(tiempos.desglose);

    setEtapasAuto((prev) => {
      if (!prev) return nuevas;

      if (JSON.stringify(prev) === JSON.stringify(nuevas)) {
        return prev;
      }

      return nuevas;
    });

  }, [tiempos]);

  if (!modoCalculo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-[400px] text-center">

          <h1 className="text-2xl font-bold mb-2">
            ¿Qué querés construir?
          </h1>

          <p className="text-gray-400 text-sm mb-6">
            Elegí el tipo de cálculo que necesitás
          </p>

          <div className="flex flex-col gap-4">

            <button
              onClick={() => setModoCalculo("simple")}
              className="bg-blue-600 hover:bg-blue-500 transition p-3 rounded-xl"
            >
              🧱 Muro individual
              <div className="text-xs text-blue-200">
                Cálculo rápido sin precisión de encuentros
              </div>
            </button>

            <button
              onClick={() => setModoCalculo("preciso")}
              className="bg-green-600 hover:bg-green-500 transition p-3 rounded-xl"
            >
              🏠 Recinto / Vivienda
              <div className="text-xs text-green-200">
                Considera encuentros entre muros
              </div>
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-white p-4">

      <h1 className="text-4xl text-center font-bold mb-6">🏗️ Calculadora de materiales</h1>

      <div className="flex justify-center gap-2 mb-6">
        {[1,2,3,4,5].map(p => (
          <button
            key={p}
            onClick={()=>setPaso(p)}
            className={`px-3 py-1 rounded ${
              paso === p ? "bg-yellow-600" : "bg-gray-700"
            }`}
          >
            {["Mamposteria","Muros y revoques","Estructura","Costos","Planificacion"][p-1]}
          </button>
        ))}
      </div>

      {/* ================= PASO 1: MUROS ================= */}

      {paso === 1 && <Paso1Muros muros={muros} setMuros={setMuros} />}

      {/* ================= PASO 2: REVOQUES ================= */}

      {paso === 2 && (
        <Paso2Revoques
          superficieTotal={superficieTotal}
          totalLadrillos={totalLadrillos}
          cementoMuros={cementoMuros}
          arenaMuros={arenaMuros}
          calMuros={calMuros}
          resultados={resultados}
          resultadosPorMuro={resultadosPorMuro}
        />
      )}
          
      {/* ================= PASO 3: ESTRUCTURA ================= */}

      {paso === 3 && (
        <Paso3Estructura
          tipoContrapiso={tipoContrapiso}
          setTipoContrapiso={setTipoContrapiso}
          losa={losa}
          setLosa={setLosa}
          contrapiso={contrapiso}
          setContrapiso={setContrapiso}
          carpeta={carpeta}
          setCarpeta={setCarpeta}
          cementoEstructura={cementoEstructura}
          arenaEstructura={arenaEstructura}
          piedraEstructura={piedraEstructura}
        />
      )}

      {/* ================= PASO 4: TOTALES ================= */}

      {paso === 4 && (
        <Paso4Totales
          totalLadrillos={totalLadrillos}
          totalCemento={totalCemento}
          totalArena={totalArena}
          totalCal={totalCal}
          totalPiedra={totalPiedra}
          bolsasCemento={bolsasCemento}
          bolsasCal={bolsasCal}
          bolsonArena={bolsonArena}
          bolsonPiedra={bolsonPiedra}
          costoCemento={costoCemento}
          costoArena={costoArena}
          costoCal={costoCal}
          costoPiedra={costoPiedra}
          costoTotal={costoTotal}
          precios={precios}
          setPrecios={setPrecios}
        />
      )}

      {/* ================= PASO 5: PLANIFICACION ================= */}

      {paso === 5 && (
        <Paso5Planificacion
          showConfig={showConfig}
          setShowConfig={setShowConfig}
          configTareas={configTareas}
          setConfigTareas={setConfigTareas}
          tiempos={tiempos}
          etapasMostradas={etapasMostradas}
          setEtapasEditadas={setEtapasEditadas}
          showPlan={showPlan}
          setShowPlan={setShowPlan}
          duracionTotal={duracionTotal}
          personas={personas}
          costoManoObra={costoManoObra}
        />
      )}     
    </div>
  );
}