import { Section, Card } from "../UI/Layout";

export default function Paso2Revoques({
  superficieTotal,
  totalLadrillos,
  cementoMuros,
  arenaMuros,
  calMuros,
  resultados,
  resultadosPorMuro
}) {

  return (
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
  );
}