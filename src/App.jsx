import { useState, useEffect, useMemo } from "react";
import { calcularTiempoObra, generarEtapasAutomaticas } from "./utils/calculosTiempo";
import Gantt from "./components/Gantt";
import { calcularMateriales } from "./logic/calcularMateriales";
import MuroCard from "./components/MuroCard";
import Input from "./components/UI/Input";

export default function App() {
  
  const [cuadrillas, setCuadrillas] = useState(1);
  const [modoCalculo, setModoCalculo] = useState(null);
  const [etapasAuto, setEtapasAuto] = useState([]);
  const [etapasEditadas, setEtapasEditadas] = useState(null);

  const personasPorCuadrilla = 2;
  const costoDiarioCuadrilla = 125000;

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
  }, [
    superficieTotal,
    supRevoques,
    supLosa,
    supContrapiso,
    supCarpeta,
    tecnologia,
    cuadrillas,
    personasPorTarea,
    configTareas
  ]);
  
  let duracionTotal = 0;
  let costoManoObra = 0;
  let personas = 0;

  const factorGlobal = 1.05 * 1.1 * 1.05;

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
      {paso === 1 && (
        <>
          <div className="text-center mb-4">
            <button
              onClick={()=>setMuros([...muros, createMuro(`Muro ${muros.length+1}`)])}
              className="bg-yellow-600 px-4 py-2 rounded-xl"
            >
              ➕ Añadir muro
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {muros.map((m, i)=> (
              <MuroCard key={i} muro={m} onDelete={()=>{
                const copy = muros.filter((_,idx)=> idx!==i);
                setMuros(copy);
              }} onChange={(nuevo)=>{
                const copy=[...muros]; copy[i]=nuevo; setMuros(copy);
              }} />
            ))}
          </div>
        </>
      )}

      {/* ================= PASO 2: REVOQUES ================= */}
      {paso === 2 && (
        <>
          <Section title="🧱 Mampostería (resumen)">
            <div className="grid md:grid-cols-5 gap-4">
              <Card title="📐 Superficie" value={`${superficieTotal.toFixed(2)} m²`} />
              <Card title="🧱 Ladrillos" value={Math.ceil(totalLadrillos)} highlight />
              <Card title="🧪 Cemento" value={`${(cementoMuros || 0).toFixed(1)} kg`} />
              <Card title="🏖 Arena" value={`${(arenaMuros || 0).toFixed(2)} m³`} />
              <Card title="🪶 Cal" value={`${(calMuros || 0).toFixed(1)} kg`} />
            </div>
          </Section>

          <Section title="🪨 Revoques (detallado por capa)">

            <div className="grid md:grid-cols-3 gap-4">

              {Object.entries(resultados.revoquesTotales || {}).map(([tipo, data]) => (
                <div key={tipo} className="bg-gray-800 p-4 rounded-xl">

                  <h3 className="font-bold mb-2 capitalize">
                    {tipo}
                  </h3>

                  <div className="text-xs space-y-1">
                    <div>🧪 Cemento: {(data.cemento || 0).toFixed(1)} kg</div>
                    <div>🏖 Arena: {(data.arena || 0).toFixed(2)} m³</div>
                    <div>🪶 Cal: {(data.cal || 0).toFixed(1)} kg</div>
                  </div>

                </div>
              ))}

            </div>

          </Section>

          <Section title="📊 Detalle por Muro">
            <div className="grid md:grid-cols-2 gap-4">

              {resultadosPorMuro.map((r, i) => (
                <div key={i} className="bg-gray-800 p-4 rounded-xl">

                  <h3 className="font-bold mb-2">{r.nombre}</h3>

                  <div className="text-xs mb-2">
                    Superficie: {r.superficie.toFixed(2)} m²
                  </div>

                  {/* 🔹 MAMPOSTERÍA */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>🧱 Ladrillos: {Math.ceil(r.ladrillos)}</div>
                    <div>🧪 Cemento: {(r.muro?.cemento || 0).toFixed(1)} kg</div>
                    <div>🏖 Arena: {(r.muro?.arena || 0).toFixed(2)} m³</div>
                    <div>🪶 Cal: {(r.muro?.cal || 0).toFixed(1)} kg</div>
                  </div>

                  {/* 🔥 REVOQUES POR CAPA */}
                  <div className="border-t border-gray-600 pt-2 space-y-2">

                    {Object.entries(r.revoques).map(([tipo, data]) => {

                      if (!data.exterior && !data.interior) return null;

                      return (
                        <div key={tipo} className="text-xs">

                          <div className="font-semibold capitalize text-yellow-400">
                            {tipo}
                          </div>

                          {/* 🌍 EXTERIOR */}
                          {data.exterior?.superficie > 0 && (
                            <div className="ml-2">
                              <div className="text-gray-400">Exterior</div>
                              <div className="grid grid-cols-2 gap-1">
                                <div>🧱 {data.exterior.superficie.toFixed(2)} m²</div>
                                <div>🧪 {(data.exterior?.cemento || 0).toFixed(1)} kg</div>
                                <div>🏖 {(data.exterior?.arena || 0).toFixed(2)} m³</div>
                                <div>🪶 {(data.exterior?.cal || 0).toFixed(1)} kg</div>
                              </div>
                            </div>
                          )}

                          {/* 🏠 INTERIOR */}
                          {data.interior?.superficie > 0 && (
                            <div className="ml-2 mt-1">
                              <div className="text-gray-400">Interior</div>
                              <div className="grid grid-cols-2 gap-1">
                                <div>🧱 {data.interior.superficie.toFixed(2)} m²</div>
                                <div>🧪 {data.interior.cemento.toFixed(1)} kg</div>
                                <div>🏖 {data.interior.arena.toFixed(2)} m³</div>
                                <div>🪶 {data.interior.cal.toFixed(1)} kg</div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ================= PASO 3: ESTRUCTURA ================= */}
      {paso === 3 && (
        <>
          <Section title="🏗️ Estructura">
            <div className="mb-3">
              <label className="text-sm">Tipo de contrapiso:</label>
              <select
                value={tipoContrapiso}
                onChange={(e)=>setTipoContrapiso(e.target.value)}
                className="bg-gray-800 p-1 rounded ml-2"
              >
                <option value="conCal">Con cal + cemento</option>
                <option value="albanileria">Cemento albañilería</option>
              </select>
            </div>

            <SubBlock title="🧱 Losa" data={losa} setData={setLosa} />
            <SubBlock title="🪨 Contrapiso" data={contrapiso} setData={setContrapiso} />
            <SubBlock title="🧾 Carpeta" data={carpeta} setData={setCarpeta} />
          </Section>

          <Section title="🏗️ Resultados de Estructura">
            <div className="grid md:grid-cols-3 gap-4">
              <Card title="Cemento" value={`${(cementoEstructura || 0).toFixed(1)} kg`} />
              <Card title="Arena" value={`${(arenaEstructura || 0).toFixed(2)} m³`} />
              <Card title="Piedra" value={`${(piedraEstructura || 0).toFixed(2)} m³`} />
            </div>
          </Section>
        </>
      )}

      {/* ================= PASO 4: TOTALES ================= */}
      {paso === 4 && (
        <>
          <Section title="📊 Totales Generales">
            <div className="grid md:grid-cols-5 gap-4">

              {/* 🧱 LADRILLOS */}
              <Card
                title="🧱 Ladrillos"
                value={
                  <div className="flex flex-col items-center">
                    <span>{Math.ceil(totalLadrillos)}</span>
                    <span className="text-xs italic text-gray-300">
                      unidades
                    </span>
                  </div>
                }
                highlight
              />

              {/* 🧪 CEMENTO */}
              <Card
                title="🧪 Cemento"
                value={
                  <div className="flex flex-col items-center">
                    <span>{totalCemento.toFixed(1)} kg</span>
                    <span className="text-xs text-yellow-400">
                      {bolsasCemento} bolsas
                    </span>
                    <span className="text-xs text-green-400">
                      ${costoCemento.toLocaleString("es-AR")}
                    </span>
                  </div>
                }
              />

              {/* 🏖 ARENA */}
              <Card
                title="🏖 Arena"
                value={
                  <div className="flex flex-col items-center">
                    <span>{totalArena.toFixed(2)} m³</span>
                    <span className="text-xs italic text-yellow-400">
                      {bolsonArena} bolsones
                    </span>
                    <span className="text-xs text-green-400">
                      ${costoArena.toLocaleString("es-AR")}
                    </span>
                  </div>
                }
              />

              {/* 🪶 CAL */}
              <Card
                title="🪶 Cal"
                value={
                  <div className="flex flex-col items-center">
                    <span>{totalCal.toFixed(1)} kg</span>
                    <span className="text-xs italic text-yellow-400">
                      {bolsasCal} bolsas
                    </span>
                    <span className="text-xs text-green-400">
                      ${costoCal.toLocaleString("es-AR")}
                    </span>
                  </div>
                }
              />

              {/* 🪨 PIEDRA */}
              <Card
                title="🪨 Piedra"
                value={
                  <div className="flex flex-col items-center">
                    <span>{totalPiedra.toFixed(2)} m³</span>
                    <span className="text-xs italic text-yellow-400">
                      {bolsonPiedra} bolsones
                    </span>
                    <span className="text-xs text-green-400">
                      ${costoPiedra.toLocaleString("es-AR")}
                    </span>
                  </div>
                }
              />

            </div>
            
          </Section>

          <Section title="💰 Precios de Materiales">
            <div className="grid md:grid-cols-4 gap-4">

              <Input
                label="Cemento (bolsa)"
                value={precios.cemento}
                onChange={(v)=>setPrecios({...precios, cemento:v})}
              />

              <Input
                label="Arena (bolsón)"
                value={precios.arena}
                onChange={(v)=>setPrecios({...precios, arena:v})}
              />

              <Input
                label="Cal (bolsa)"
                value={precios.cal}
                onChange={(v)=>setPrecios({...precios, cal:v})}
              />

              <Input
                label="Piedra (bolsón)"
                value={precios.piedra}
                onChange={(v)=>setPrecios({...precios, piedra:v})}
              />

            </div>
            <div className="text-center mt-6">
              <div className="text-lg">💰 Costo Total</div>
              <div className="text-3xl font-bold text-green-500">
                ${costoTotal.toLocaleString("es-AR")}
              </div>
            </div>
          </Section>
      </>
      )}
          {paso === 5 && (
          <>

            {/* ⚙️ CUADRILLAS */}
            <Section title="⚙️ Configuración de cuadrillas">

              <button onClick={() => setShowConfig(!showConfig)}>
                {showConfig ? "Ocultar" : "Ajustar cuadrillas"}
              </button>

              {showConfig && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">

                  {Object.keys(configTareas || {}).map((key) => {
                    const tarea = configTareas[key];
                    const r = tiempos?.rendimientos?.[key];

                    return (
                      <div key={key} className="bg-black/40 border border-gray-700 rounded-xl p-3">

                        <label className="text-xs uppercase text-gray-300">
                          {key}
                        </label>

                        {/* 👷 PERSONAS */}
                        <div className="flex items-center justify-center gap-2 my-2">

                          <button
                            onClick={() =>
                              setConfigTareas({
                                ...configTareas,
                                [key]: {
                                  ...tarea,
                                  personas: Math.max(1, tarea.personas - 1)
                                }
                              })
                            }
                            className="bg-gray-700 px-2 rounded"
                          >
                            −
                          </button>

                          <span className="text-sm">
                            👷 {tarea.personas}
                          </span>

                          <button
                            onClick={() =>
                              setConfigTareas({
                                ...configTareas,
                                [key]: {
                                  ...tarea,
                                  personas: tarea.personas + 1
                                }
                              })
                            }
                            className="bg-gray-700 px-2 rounded"
                          >
                            +
                          </button>

                        </div>

                        {/* 🎚 PRODUCTIVIDAD */}
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={tarea.productividad}
                          onChange={(e) =>
                            setConfigTareas({
                              ...configTareas,
                              [key]: {
                                ...tarea,
                                productividad: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full"
                        />

                        <div className="text-xs text-center mt-1">
                          ⚙️ Prod: {tarea.productividad}
                        </div>

                        {/* 📊 RESULTADO */}
                        {r && (
                          <div className="text-[11px] text-yellow-400 text-center mt-1">
                            {(r.base * tarea.productividad * tarea.personas).toFixed(1)} m²/día
                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              )}
            </Section>

            {/* 📅 PLANIFICACIÓN */}
            <Section title="📅 Planificación de obra">

              {(!etapasMostradas || etapasMostradas.length === 0) && (
                <div className="text-center text-gray-400">
                  No hay etapas generadas todavía.
                </div>
              )}

              <button onClick={() => setShowPlan(!showPlan)}>
                {showPlan ? "Ocultar planificación" : "Editar planificación"}
              </button>

              {showPlan && (
                <div className="space-y-3 mb-6">
                  {(etapasMostradas || []).map((e, i) => (
                    <div key={i} className="flex items-center gap-4">

                      <div className="w-32 text-sm">{e.nombre}</div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => {
                          const copy = [...etapasMostradas];
                          copy[i].inicio = Math.max(0, e.inicio - 1);
                          setEtapasEditadas(copy);
                        }}>◀</button>

                        <div className="w-10 text-center">{e.inicio}</div>

                        <button onClick={() => {
                          const copy = [...etapasMostradas];
                          copy[i].inicio = e.inicio + 1;
                          setEtapasEditadas(copy);
                        }}>▶</button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => {
                          const copy = [...etapasMostradas];
                          copy[i].dias = Math.max(1, e.dias - 1);
                          setEtapasEditadas(copy);
                        }}>−</button>

                        <div className="w-10 text-center">{e.dias}</div>

                        <button onClick={() => {
                          const copy = [...etapasMostradas];
                          copy[i].dias = e.dias + 1;
                          setEtapasEditadas(copy);
                        }}>+</button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              <Gantt etapas={etapasMostradas} setEtapas={setEtapasEditadas} />

              <button onClick={() => setEtapasEditadas(null)}>
                🔄 Recalcular planificación
              </button>

            </Section>

            {/* 👷 MANO DE OBRA */}
            <Section title="👷 Mano de obra">
              <div className="grid md:grid-cols-3 gap-4">

                <Card title="Duración total" value={`${duracionTotal} días`} highlight />

                <Card title="Personas en obra" value={`${personas}`} />

                <Card
                  title="Costo total mano de obra"
                  value={`$ ${costoManoObra.toLocaleString("es-AR")}`}
                  highlight
                />

              </div>
            </Section>

          </>
        )}        
    </div>
  );
}

function Section({ title, children }){
  return <div className="bg-black/40 p-4 rounded-2xl mb-4"><h2 className="mb-2">{title}</h2>{children}</div>;
}

function SubBlock({ title, data, setData }){
  return (
    <div className="mb-3">
      <h3 className="text-sm mb-1">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        <Input label="Largo" value={data.largo} onChange={(v)=>setData({...data,largo:v})} />
        <Input label="Ancho" value={data.ancho} onChange={(v)=>setData({...data,ancho:v})} />
        <Input label="Espesor" value={data.espesor} onChange={(v)=>setData({...data,espesor:v})} />
      </div>
    </div>
  );
}

function SelectorCaras({ caras, setCaras }){
  return (
    <div className="flex gap-4 justify-center mb-2">
      <label><input type="radio" checked={caras===1} onChange={()=>setCaras(1)} /> 1 cara</label>
      <label><input type="radio" checked={caras===2} onChange={()=>setCaras(2)} /> 2 caras</label>
    </div>
  );
}

function createMuro(nombre){
  return {
    nombre,
    largo: 10,
    alto: 2.6,
    tipo: "ladrillo_comun",
    espesor: "15cm",
    tipoMortero: "conCal", // 👈 NUEVO
    aberturas: [{ ancho:1.5, alto:1.2 }],

    // 🔥 NUEVO
    revoques: {
      hidrofugo: { activo: true, caras: 1, espesor: 0.5 },
      grueso: { activo: true, caras: 2, espesor: 1.5 },
      fino: { activo: true, caras: 2, espesor: 0.5 },
    }
  };
}



function Card({ title, value, highlight }){
  return (
    <div className={`p-4 rounded-xl text-center ${highlight?"bg-yellow-600 text-black":"bg-gray-800"}`}>
      <div className="text-xs">{title}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
