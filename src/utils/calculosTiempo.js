import { RENDIMIENTOS } from "../data/rendimientos";

// 🔹 Sueldos por día
const SUELDOS = {
  oficial: 75000,
  ayudante: 50000
};

export function calcularTiempoObra(data = {}) {
  const {
    superficieMuros = 0,
    superficieRevoques = 0,
    supLosa = 0,
    supContrapiso = 0,
    supCarpeta = 0,
    tecnologia = {}, // 🔹 default vacío
    configTareas = {} // 🔹 default vacío
  } = data;

  // valores seguros por defecto
  const tec = {
    mamposteria: tecnologia.mamposteria || "manual",
    revoque: tecnologia.revoque || "manual",
    losa: tecnologia.losa || "manual",
    contrapiso: tecnologia.contrapiso || "manual",
    carpeta: tecnologia.carpeta || "manual"
  };

  const tareas = {
    mamposteria: configTareas.mamposteria || { personas: 1, productividad: 1 },
    revoque: configTareas.revoque || { personas: 1, productividad: 1 },
    losa: configTareas.losa || { personas: 1, productividad: 1 },
    contrapiso: configTareas.contrapiso || { personas: 1, productividad: 1 },
    carpeta: configTareas.carpeta || { personas: 1, productividad: 1 }
  };

  const sueldoPromedio = SUELDOS.oficial + SUELDOS.ayudante;

  // ================== HELPERS ==================
  function calcDias(superficie, rendimientoBase, config) {
    const produccion = rendimientoBase * config.productividad * config.personas;
    return superficie / (produccion || 1); // evita division por cero
  }

  function calcCosto(dias, config) {
    return dias * config.personas * sueldoPromedio;
  }

  // ================== TIEMPOS ==================
  const diasMamposteria = calcDias(
    superficieMuros,
    RENDIMIENTOS.mamposteria[tec.mamposteria],
    tareas.mamposteria
  );

  const diasRevoque = calcDias(
    superficieRevoques,
    RENDIMIENTOS.revoque[tec.revoque],
    tareas.revoque
  );

  const diasLosa = calcDias(
    supLosa,
    RENDIMIENTOS.losa[tec.losa],
    tareas.losa
  );

  const diasContrapiso = calcDias(
    supContrapiso,
    RENDIMIENTOS.contrapiso[tec.contrapiso],
    tareas.contrapiso
  );

  const diasCarpeta = calcDias(
    supCarpeta,
    RENDIMIENTOS.carpeta[tec.carpeta],
    tareas.carpeta
  );

  // ================== LÓGICA DE OBRA ==================
  const avanceParaRevoque = 0.6;
  const inicioRevoque = diasMamposteria * avanceParaRevoque;

  const totalDias =
    inicioRevoque +
    diasRevoque +
    diasLosa +
    diasContrapiso +
    diasCarpeta;

  // ================== COSTOS ==================
  const costoMamposteria = calcCosto(diasMamposteria, tareas.mamposteria);
  const costoRevoque = calcCosto(diasRevoque, tareas.revoque);
  const costoLosa = calcCosto(diasLosa, tareas.losa);
  const costoContrapiso = calcCosto(diasContrapiso, tareas.contrapiso);
  const costoCarpeta = calcCosto(diasCarpeta, tareas.carpeta);

  const costoTotal =
    costoMamposteria +
    costoRevoque +
    costoLosa +
    costoContrapiso +
    costoCarpeta;

  // ================== PERSONAS ==================
  const totalPersonas = Object.values(tareas).reduce(
    (acc, t) => acc + t.personas,
    0
  );

  // ================== RETURN ==================
  return {
    totalDias: Math.round(totalDias),
    personas: totalPersonas,
    costoTotal: Math.round(costoTotal),

    desglose: {
      mamposteria: Math.round(diasMamposteria),
      revoques: Math.round(diasRevoque),
      losa: Math.round(diasLosa),
      contrapiso: Math.round(diasContrapiso),
      carpeta: Math.round(diasCarpeta)
    },

    rendimientos: {
      mamposteria: {
        base: RENDIMIENTOS.mamposteria[tec.mamposteria],
        factor: tareas.mamposteria.productividad,
        personas: tareas.mamposteria.personas,
        final:
          RENDIMIENTOS.mamposteria[tec.mamposteria] *
          tareas.mamposteria.productividad *
          tareas.mamposteria.personas
      },
      revoque: {
        base: RENDIMIENTOS.revoque[tec.revoque],
        factor: tareas.revoque.productividad,
        personas: tareas.revoque.personas,
        final:
          RENDIMIENTOS.revoque[tec.revoque] *
          tareas.revoque.productividad *
          tareas.revoque.personas
      },
      losa: {
        base: RENDIMIENTOS.losa[tec.losa],
        factor: tareas.losa.productividad,
        personas: tareas.losa.personas,
        final:
          RENDIMIENTOS.losa[tec.losa] *
          tareas.losa.productividad *
          tareas.losa.personas
      },
      contrapiso: {
        base: RENDIMIENTOS.contrapiso[tec.contrapiso],
        factor: tareas.contrapiso.productividad,
        personas: tareas.contrapiso.personas,
        final:
          RENDIMIENTOS.contrapiso[tec.contrapiso] *
          tareas.contrapiso.productividad *
          tareas.contrapiso.personas
      },
      carpeta: {
        base: RENDIMIENTOS.carpeta[tec.carpeta],
        factor: tareas.carpeta.productividad,
        personas: tareas.carpeta.personas,
        final:
          RENDIMIENTOS.carpeta[tec.carpeta] *
          tareas.carpeta.productividad *
          tareas.carpeta.personas
      }
    }
  };
}

export function generarEtapasAutomaticas(desglose = {}) {
  const {
    mamposteria = 0,
    revoques = 0,
    losa = 0,
    contrapiso = 0,
    carpeta = 0
  } = desglose;

  const avanceParaRevoque = 0.6;

  const inicioMamposteria = 0;
  const inicioRevoque = mamposteria * avanceParaRevoque;

  const inicioLosa = inicioRevoque + revoques;
  const inicioContrapiso = inicioLosa + losa;
  const inicioCarpeta = inicioContrapiso + contrapiso;

  return [
    { nombre: "Mampostería", inicio: Math.round(inicioMamposteria), dias: mamposteria },
    { nombre: "Revoques", inicio: Math.round(inicioRevoque), dias: revoques },
    { nombre: "Losa", inicio: Math.round(inicioLosa), dias: losa },
    { nombre: "Contrapiso", inicio: Math.round(inicioContrapiso), dias: contrapiso },
    { nombre: "Carpeta", inicio: Math.round(inicioCarpeta), dias: carpeta }
  ];
}