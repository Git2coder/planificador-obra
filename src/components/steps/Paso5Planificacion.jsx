import { Section, Card } from "../UI/Layout";
import Gantt from "../Gantt";

export default function Paso5Planificacion({
  configTareas,
  setConfigTareas,
  tiempos,
  showConfig,
  setShowConfig,
  etapasMostradas,
  setEtapasEditadas,
  showPlan,
  setShowPlan,
  duracionTotal,
  personas,
  costoManoObra
}) 

{
  return (
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
  );
}