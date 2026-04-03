import { MUROS } from "../data/materiales";
import Input from "./UI/Input";

export default function MuroCard({ muro, onChange, onDelete }){

  const superficie = muro.largo * muro.alto;
  const supAberturas = muro.aberturas.reduce((a,b)=>a + b.ancho*b.alto,0);
  const neta = Math.max(superficie - supAberturas,0);

  return (
    <div className="bg-black/40 p-4 rounded-2xl relative">
      <button onClick={onDelete} className="absolute top-2 right-2 text-red-400">✖</button>

      <h3 className="font-bold mb-2">{muro.nombre}</h3>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <Input label="Largo" value={muro.largo} onChange={(v)=>onChange({...muro,largo:v})} />
        <Input label="Alto" value={muro.alto} onChange={(v)=>onChange({...muro,alto:v})} />
      </div>

      <select value={muro.tipo} onChange={(e)=>{
        const t = e.target.value;
        onChange({...muro, tipo:t, espesor:Object.keys(MUROS[t].opciones)[0]});
      }} className="w-full bg-gray-800 p-1 rounded mb-1">
        {Object.entries(MUROS).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
      </select>

      <select value={muro.espesor} onChange={(e)=>onChange({...muro,espesor:e.target.value})} className="w-full bg-gray-800 p-1 rounded mb-2">
        {Object.keys(MUROS[muro.tipo].opciones).map(opt=> <option key={opt}>{opt}</option>)}
      </select>

      <select
        value={muro.tipoMortero}
        onChange={(e)=>onChange({...muro, tipoMortero:e.target.value})}
        className="w-full bg-gray-800 p-1 rounded mb-2"
      >
        <option value="conCal">Mortero con cal</option>
        <option value="albanileria">Cemento albañilería</option>
      </select>

      <div className="mb-2">
        <h4 className="text-sm mb-1">🪟 Aberturas</h4>
        {muro.aberturas.map((a,i)=> (
          <div key={i} className="flex gap-1 mb-1 items-center">

            {/* 🔹 TIPO */}
            <select
              value={a.tipo || "rectangular"}
              onChange={(e)=>{
                const copy=[...muro.aberturas];

                const tipo = e.target.value;

                copy[i] =
                  tipo === "circular"
                    ? { tipo, diametro: 1 }
                    : { tipo, ancho: 1, alto: 1 };

                onChange({...muro, aberturas: copy});
              }}
              className="bg-gray-800 p-1 rounded text-xs"
            >
              <option value="rectangular">⬛ Rect</option>
              <option value="circular">⚪ Circular</option>
            </select>

            {/* 🔹 INPUTS DINÁMICOS */}
            {(!a.tipo || a.tipo === "rectangular") ? (
              <>
                <input
                  type="number"
                  value={a.ancho}
                  onChange={(e)=>{
                    const copy=[...muro.aberturas];
                    copy[i].ancho=Number(e.target.value);
                    onChange({...muro,aberturas:copy});
                  }}
                  className="bg-gray-800 p-1 rounded"
                  placeholder="Ancho"
                />

                <input
                  type="number"
                  value={a.alto}
                  onChange={(e)=>{
                    const copy=[...muro.aberturas];
                    copy[i].alto=Number(e.target.value);
                    onChange({...muro,aberturas:copy});
                  }}
                  className="bg-gray-800 p-1 rounded"
                  placeholder="Alto"
                />
              </>
            ) : (
              <input
                type="number"
                value={a.diametro}
                onChange={(e)=>{
                  const copy=[...muro.aberturas];
                  copy[i].diametro=Number(e.target.value);
                  onChange({...muro,aberturas:copy});
                }}
                className="bg-gray-800 p-1 rounded"
                placeholder="Diámetro"
              />
            )}

          </div>
        ))}
        <button
          onClick={() =>
            onChange({
              ...muro,
              aberturas: [
                ...muro.aberturas,
                { tipo: "rectangular", ancho: 1, alto: 1 }
              ]
            })
          }
          className="text-xs bg-yellow-600 px-2 py-1 rounded"
        >
          + agregar
        </button>
      </div>

      <div className="mb-2">
        <h4 className="text-sm mb-1">🪨 Revoques</h4>

        {Object.entries(muro.revoques).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1 mb-1">

            <input
              type="checkbox"
              checked={config.activo}
              onChange={()=>{
                onChange({
                  ...muro,
                  revoques:{
                    ...muro.revoques,
                    [key]:{...config, activo:!config.activo}
                  }
                });
              }}
            />

            <span className="text-xs w-16">{key}</span>

            <input
              type="number"
              value={config.espesor}
              onChange={(e)=>{
                onChange({
                  ...muro,
                  revoques:{
                    ...muro.revoques,
                    [key]:{...config, espesor:Number(e.target.value)}
                  }
                });
              }}
              className="w-12 bg-gray-800 text-xs"
            />

            <select
              value={config.caras}
              onChange={(e)=>{
                onChange({
                  ...muro,
                  revoques:{
                    ...muro.revoques,
                    [key]:{...config, caras:Number(e.target.value)}
                  }
                });
              }}
              className="bg-gray-800 text-xs"
            >
              <option value={1}>1C</option>
              <option value={2}>2C</option>
            </select>

          </div>
        ))}
      </div>

      <div className="text-xs text-gray-300">
        m² netos: {neta.toFixed(2)}
      </div>
    </div>
  );
}