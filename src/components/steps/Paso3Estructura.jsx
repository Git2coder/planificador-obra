import { Section, Card } from "../UI/Layout";
import SubBlock from "../UI/SubBlock";

export default function Paso3Estructura({
  tipoContrapiso,
  setTipoContrapiso,
  losa,
  setLosa,
  contrapiso,
  setContrapiso,
  carpeta,
  setCarpeta,
  cementoEstructura,
  arenaEstructura,
  piedraEstructura
}) {
  return (
    <>
      <Section title="🏗️ Estructura">
        <div className="mb-3">
          <label className="text-sm">Tipo de contrapiso:</label>
          <select
            value={tipoContrapiso}
            onChange={(e) => setTipoContrapiso(e.target.value)}
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
  );
}