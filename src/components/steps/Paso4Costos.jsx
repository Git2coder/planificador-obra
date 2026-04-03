import { Section, Card } from "../UI/Layout";
import Input from "../UI/Input";

export default function Paso4Totales({
  totalLadrillos,
  totalCemento,
  totalArena,
  totalCal,
  totalPiedra,
  bolsasCemento,
  bolsasCal,
  bolsonArena,
  bolsonPiedra,
  costoCemento,
  costoArena,
  costoCal,
  costoPiedra,
  costoTotal,
  precios,
  setPrecios
}) {
  return (
    <>
      <Section title="📊 Totales Generales">
        <div className="grid md:grid-cols-5 gap-4">

          <Card title="🧱 Ladrillos" value={Math.ceil(totalLadrillos)} highlight />

          <Card title="🧪 Cemento" value={`${totalCemento.toFixed(1)} kg`} />

          <Card title="🏖 Arena" value={`${totalArena.toFixed(2)} m³`} />

          <Card title="🪶 Cal" value={`${totalCal.toFixed(1)} kg`} />

          <Card title="🪨 Piedra" value={`${totalPiedra.toFixed(2)} m³`} />

        </div>
      </Section>

      <Section title="💰 Precios de Materiales">
        <div className="grid md:grid-cols-4 gap-4">

          <Input label="Cemento" value={precios.cemento} onChange={(v)=>setPrecios({...precios, cemento:v})} />
          <Input label="Arena" value={precios.arena} onChange={(v)=>setPrecios({...precios, arena:v})} />
          <Input label="Cal" value={precios.cal} onChange={(v)=>setPrecios({...precios, cal:v})} />
          <Input label="Piedra" value={precios.piedra} onChange={(v)=>setPrecios({...precios, piedra:v})} />

        </div>

        <div className="text-center mt-6">
          <div className="text-lg">💰 Costo Total</div>
          <div className="text-3xl font-bold text-green-500">
            ${costoTotal.toLocaleString("es-AR")}
          </div>
        </div>
      </Section>
    </>
  );
}