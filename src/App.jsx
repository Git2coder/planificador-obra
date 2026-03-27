import { useState, useEffect, useMemo } from "react";
import { calcularTiempoObra, generarEtapasAutomaticas } from "./utils/calculosTiempo";
import Gantt from "./components/Gantt";

// ================== DATA ==================
const MUROS = {
  ladrillo_comun: {
    label: "🧱 Ladrillo común",
    opciones: {
      "10cm": {
        ladrillos_m2: 30,
        conCal: { cal: 2.0, cemento: 2.1, arena: 0.010 },
        albanileria: { cemento: 2.2, arena: 0.012 }
      },
      "15cm": {
        ladrillos_m2: 60,
        conCal: { cal: 7.3, cemento: 7.5, arena: 0.035 },
        albanileria: { cemento: 7.7, arena: 0.043 }
      },
      "20cm": {
        ladrillos_m2: 90,
        conCal: { cal: 13.2, cemento: 6.9, arena: 0.065 },
        albanileria: { cemento: 10.9, arena: 0.080 }
      },
      "30cm": {
        ladrillos_m2: 120,
        conCal: { cal: 19.1, cemento: 9.9, arena: 0.090 },
        albanileria: { cemento: 15.2, arena: 0.115 }
      }
    }
  },

  hueco: {
    label: "🧱 Ladrillo hueco",
    opciones: {
      "10cm": {
        ladrillos_m2: 17,
        conCal: { cal: 2.5, cemento: 2.6, arena: 0.012 },
        albanileria: { cemento: 2.8, arena: 0.015 }
      },
      "20cm": {
        ladrillos_m2: 17,
        conCal: { cal: 7.8, cemento: 8.0, arena: 0.037 },
        albanileria: { cemento: 8.5, arena: 0.046 }
      }
    }
  },

  portante: {
    label: "🧱 Bloque cerámico portante",
    opciones: {
      "15cm": {
        ladrillos_m2: 13,
        conCal: { cal: 2.5, cemento: 0.65, arena: 0.012 },
        albanileria: { cemento: 2.5, arena: 0.013 }
      },
      "20cm": {
        ladrillos_m2: 13,
        conCal: { cal: 3.0, cemento: 0.78, arena: 0.015 },
        albanileria: { cemento: 3.0, arena: 0.016 }
      }
    }
  },

  bloque_hormigon: {
    label: "🧱 Bloque de hormigón",
    opciones: {
      "10cm": {
        ladrillos_m2: 13,
        conCal: { cal: 1.9, cemento: 1.95, arena: 0.013 },
        albanileria: { cemento: 3.95, arena: 0.017 }
      },
      "20cm": {
        ladrillos_m2: 13,
        conCal: { cal: 1.5, cemento: 3.3, arena: 0.015 },
        albanileria: { cemento: 4.75, arena: 0.013 }
      }
    }
  }
};

const REVOQUES_BASE = {
  hidrofugo: { cemento: 2.7, arena: 0.006, espesor: 0.5 },
  grueso: { cal: 3.6, cemento: 1.81, arena: 0.017, espesor: 1.5 },
  fino: { cal: 1.6, cemento: 0.45, arena: 0.006, espesor: 0.5 },
};

const LOSA = {
  cemento: 33,
  arena: 0.072,
  piedra: 0.072,
  espesorBase: 0.11
};

const CONTRAPISO = {
  conCal: {
    cal: 81,
    cemento: 38.4,
    arena: 0.515,
    cascote: 0.77
  },
  albanileria: {
    cemento: 105,
    arena: 0.45,
    cascote: 0.9
  }
};

const CARPETA = {
  cemento: 10.8,
  arena: 0.024,
  espesorBase: 0.02
};

export default function App() {
  
  const [cuadrillas, setCuadrillas] = useState(1);

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

  // 🔹 MAMPOSTERÍA
  let ladrillosMuros = 0;
  let calMuros = 0;
  let cementoMuros = 0;
  let arenaMuros = 0;

  // 🔹 REVOQUES
  let calRevoque = 0;
  let cementoRevoque = 0;
  let arenaRevoque = 0;

  // 🔹 ESTRUCTURA
  let cementoEstructura = 0;
  let arenaEstructura = 0;
  let piedraEstructura = 0;

  const revoquesTotales = {
    hidrofugo: { cemento: 0, arena: 0, cal: 0 },
    grueso: { cemento: 0, arena: 0, cal: 0 },
    fino: { cemento: 0, arena: 0, cal: 0 }
  };

  muros.forEach(m => {
    const superficieMuro = m.largo * m.alto;
    const supAberturas = (m.aberturas || []).reduce((acc, a) => {

      // 🔹 si NO tiene tipo → asumir rectangular (compatibilidad)
      if (!a.tipo || a.tipo === "rectangular") {
        return acc + (a.ancho * a.alto);
      }

      if (a.tipo === "circular") {
        const radio = a.diametro / 2;
        return acc + Math.PI * radio * radio;
      }

      return acc;

    }, 0);
    const supNeta = Math.max(superficieMuro - supAberturas,0);

    const base = MUROS[m.tipo].opciones[m.espesor];
    const espesorMuro = m.espesor / 100; // si está en cm
    const mortero = base[m.tipoMortero];
    
    // 🔹 MAMPOSTERÍA
    ladrillosMuros += supNeta * base.ladrillos_m2;
    calMuros += supNeta * (mortero.cal || 0);
    cementoMuros += supNeta * (mortero.cemento || 0);
    arenaMuros += supNeta * (mortero.arena || 0);

    // 🔥 🔥 🔥 REVOQUES POR MURO
    Object.entries(m.revoques).forEach(([key, config]) => {
      if (config.activo) {
        const base = REVOQUES_BASE[key];
        const factor = config.espesor / base.espesor;
        const espesorMuro = parseFloat(m.espesor) / 100;
        let superficie = 0;

if (config.caras === 1) {
  superficie = supNeta;
}

if (config.caras === 2) {
  const perimetroMuro = 2 * (m.largo + m.alto);

  const exterior = supNeta;

  const interior = Math.max(
    supNeta - (perimetroMuro * espesorMuro),
    0
  );

  superficie = exterior + interior;
}

        revoquesTotales[key].cemento += superficie * (base.cemento * factor);
        revoquesTotales[key].arena += superficie * (base.arena * factor);
        revoquesTotales[key].cal += superficie * ((base.cal || 0) * factor);
      }
    });

  });

  // ================== LOSA ==================
  const supLosa = losa.largo * losa.ancho;
  const volLosa = supLosa * losa.espesor; 
  const factorLosa = losa.espesor / LOSA.espesorBase;

  const cementoLosa = supLosa * LOSA.cemento * factorLosa;
  const arenaLosa = supLosa * LOSA.arena * factorLosa;
  const piedraLosa = supLosa * LOSA.piedra * factorLosa;

  // ================== CONTRAPISO ==================
  const supContrapiso = contrapiso.largo * contrapiso.ancho;
  const volContrapiso = contrapiso.largo * contrapiso.ancho * contrapiso.espesor;
  const dataContrapiso = CONTRAPISO[tipoContrapiso];

  const cementoContrapiso = volContrapiso * dataContrapiso.cemento;
  const arenaContrapiso = volContrapiso * dataContrapiso.arena;
  const cascoteContrapiso = volContrapiso * dataContrapiso.cascote;
  const calContrapiso = dataContrapiso.cal ? volContrapiso * dataContrapiso.cal : 0;

  // ================== CARPETA ==================
  const supCarpeta = carpeta.largo * carpeta.ancho;
  const factorCarpeta = carpeta.espesor / CARPETA.espesorBase;

  const cementoCarpeta = supCarpeta * CARPETA.cemento * factorCarpeta;
  const arenaCarpeta = supCarpeta * CARPETA.arena * factorCarpeta;

  // ================== SUMATORIA ==================
  cementoEstructura = cementoLosa + cementoContrapiso + cementoCarpeta;
  arenaEstructura = arenaLosa + arenaContrapiso + arenaCarpeta;
  piedraEstructura = piedraLosa + cascoteContrapiso;
  const calEstructura = calContrapiso;

  // ================== CALCULO POR MUROS ==================
  const resultadosPorMuro = muros.map(m => {
    const superficieMuro = m.largo * m.alto;
    const supAberturas = (m.aberturas || []).reduce((acc, a) => {

  if (!a.tipo || a.tipo === "rectangular") {
    return acc + (a.ancho * a.alto);
  }

  if (a.tipo === "circular") {
    const radio = a.diametro / 2;
    return acc + Math.PI * radio * radio;
  }

  return acc;

}, 0);
    const supNeta = Math.max(superficieMuro - supAberturas,0);

    const base = MUROS[m.tipo].opciones[m.espesor];
    const mortero = base[m.tipoMortero];

    let ladrillos = supNeta * base.ladrillos_m2;
    let cal = supNeta * (mortero.cal || 0);
    let cemento = supNeta * (mortero.cemento || 0);
    let arena = supNeta * (mortero.arena || 0);

    // 🔹 REVOQUES
    const revoquesMuro = {
      hidrofugo: {},
      grueso: {},
      fino: {}
    };

    Object.entries(m.revoques).forEach(([key, config]) => {
      if (config.activo) {
        const baseRevoque = REVOQUES_BASE[key];
const factor = config.espesor / baseRevoque.espesor;
const espesorMuro = parseFloat(m.espesor) / 100;

// ⚠️ IMPORTANTE: cambiar estructura inicial si aún no existe
if (!revoquesMuro[key].exterior) {
  revoquesMuro[key] = {
    exterior: { superficie: 0, cemento: 0, arena: 0, cal: 0 },
    interior: { superficie: 0, cemento: 0, arena: 0, cal: 0 }
  };
}

const perimetroMuro = 2 * (m.largo + m.alto);

const exterior = supNeta;

const interior = Math.max(
  supNeta - (perimetroMuro * espesorMuro),
  0
);

// 🔹 EXTERIOR
if (config.caras >= 1) {
  revoquesMuro[key].exterior.superficie += exterior;
  revoquesMuro[key].exterior.cemento += exterior * (baseRevoque.cemento * factor);
  revoquesMuro[key].exterior.arena += exterior * (baseRevoque.arena * factor);
  revoquesMuro[key].exterior.cal += exterior * ((baseRevoque.cal || 0) * factor);
}

// 🔹 INTERIOR
if (config.caras === 2) {
  revoquesMuro[key].interior.superficie += interior;
  revoquesMuro[key].interior.cemento += interior * (baseRevoque.cemento * factor);
  revoquesMuro[key].interior.arena += interior * (baseRevoque.arena * factor);
  revoquesMuro[key].interior.cal += interior * ((baseRevoque.cal || 0) * factor);
}
      }
    });

    return {
      nombre: m.nombre,
      superficie: supNeta,

      ladrillos,

      // 🔹 SOLO MAMPOSTERÍA
      muro: {
        cemento,
        arena,
        cal
      },

      // 🔥 REVOQUES SEPARADOS
      revoques: revoquesMuro
    };
  });

  // ================== TOTALES ==================
  const totalLadrillos = ladrillosMuros;

  const totalRevoqueCemento = Object.values(revoquesTotales)
    .reduce((acc, r) => acc + r.cemento, 0);

  const totalRevoqueArena = Object.values(revoquesTotales)
    .reduce((acc, r) => acc + r.arena, 0);

  const totalRevoqueCal = Object.values(revoquesTotales)
    .reduce((acc, r) => acc + r.cal, 0);

  const totalCemento = cementoMuros + totalRevoqueCemento + cementoEstructura;
  const totalArena = arenaMuros + totalRevoqueArena + arenaEstructura;
  const totalCal = calMuros + totalRevoqueCal + calEstructura;
  const totalPiedra = piedraEstructura;

  const bolsasCemento = Math.ceil(totalCemento / 25);
  const bolsasCal = Math.ceil(totalCal / 25);
  const bolsonArena = Math.ceil(totalArena);
  const bolsonPiedra = Math.ceil(totalPiedra);

  const superficieTotal = muros.reduce((acc, m) => {
    const superficieMuro = m.largo * m.alto;
    const supAberturas = (m.aberturas || []).reduce((acc, a) => {
      if (!a.tipo || a.tipo === "rectangular") {
        return acc + (a.ancho * a.alto);
      }

      if (a.tipo === "circular") {
        const radio = a.diametro / 2;
        return acc + Math.PI * radio * radio;
      }

      return acc;
    }, 0);
    return acc + Math.max(superficieMuro - supAberturas,0);
  }, 0);

  const costoCemento = bolsasCemento * precios.cemento;
  const costoArena = bolsonArena * precios.arena;
  const costoCal = bolsasCal * precios.cal;
  const costoPiedra = bolsonPiedra * precios.piedra;

  const costoTotal = costoCemento + costoArena + costoCal + costoPiedra;
  
  const supRevoques = superficieTotal * 2;

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
            {muros.map((m,i)=> (
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
              <Card title="🧪 Cemento" value={`${cementoMuros.toFixed(1)} kg`} />
              <Card title="🏖 Arena" value={`${arenaMuros.toFixed(2)} m³`} />
              <Card title="🪶 Cal" value={`${calMuros.toFixed(1)} kg`} />
            </div>
          </Section>

          <Section title="🪨 Revoques (detallado por capa)">

            <div className="grid md:grid-cols-3 gap-4">

              {Object.entries(revoquesTotales).map(([tipo, data]) => (
                <div key={tipo} className="bg-gray-800 p-4 rounded-xl">

                  <h3 className="font-bold mb-2 capitalize">
                    {tipo}
                  </h3>

                  <div className="text-xs space-y-1">
                    <div>🧪 Cemento: {data.cemento.toFixed(1)} kg</div>
                    <div>🏖 Arena: {data.arena.toFixed(2)} m³</div>
                    <div>🪶 Cal: {data.cal.toFixed(1)} kg</div>
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
          <div>🧪 Cemento: {r.muro.cemento.toFixed(1)} kg</div>
          <div>🏖 Arena: {r.muro.arena.toFixed(2)} m³</div>
          <div>🪶 Cal: {r.muro.cal.toFixed(1)} kg</div>
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
              <div>🧪 {data.exterior.cemento.toFixed(1)} kg</div>
              <div>🏖 {data.exterior.arena.toFixed(2)} m³</div>
              <div>🪶 {data.exterior.cal.toFixed(1)} kg</div>
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
              <Card title="Cemento" value={`${cementoEstructura.toFixed(1)} kg`} />
              <Card title="Arena" value={`${arenaEstructura.toFixed(2)} m³`} />
              <Card title="Piedra" value={`${piedraEstructura.toFixed(2)} m³`} />
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

function MuroCard({ muro, onChange, onDelete }){

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

function Input({ label, value, onChange }){
  return (
    <div className="flex flex-col text-xs">
      <span>{label}</span>
      <input type="number" value={value} onChange={(e)=>onChange(Number(e.target.value))} className="bg-gray-800 p-1 rounded" />
    </div>
  );
}

function Card({ title, value, highlight }){
  return (
    <div className={`p-4 rounded-xl text-center ${highlight?"bg-yellow-600 text-black":"bg-gray-800"}`}>
      <div className="text-xs">{title}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}
