import { RENDIMIENTOS } from "../data/rendimientos";

// 🔹 Sueldos por día
const SUELDOS = {
  oficial: 75000,
  ayudante: 50000
};

export function calcularTiempoObra(data) {
  const {
    superficieMuros,
    superficieRevoques,
    supLosa,
    supContrapiso,
    supCarpeta,
    tecnologia,
    configTareas // ✅ ESTE ES EL NUEVO CORE
  } = data;

  const sueldoPromedio = SUELDOS.oficial + SUELDOS.ayudante;

  // ================== HELPERS ==================

  function calcDias(superficie, rendimientoBase, config) {
    const produccion =
      rendimientoBase *
      config.productividad *
      config.personas;

    return superficie / produccion;
  }

  function calcCosto(dias, config) {
    return dias * config.personas * sueldoPromedio;
  }

  // ================== TIEMPOS ==================

  const diasMamposteria = calcDias(
    superficieMuros,
    RENDIMIENTOS.mamposteria[tecnologia.mamposteria],
    configTareas.mamposteria
  );

  const diasRevoque = calcDias(
    superficieRevoques,
    RENDIMIENTOS.revoque[tecnologia.revoque],
    configTareas.revoque
  );

  const diasLosa = calcDias(
    supLosa,
    RENDIMIENTOS.losa[tecnologia.losa],
    configTareas.losa
  );

  const diasContrapiso = calcDias(
    supContrapiso,
    RENDIMIENTOS.contrapiso[tecnologia.contrapiso],
    configTareas.contrapiso
  );

  const diasCarpeta = calcDias(
    supCarpeta,
    RENDIMIENTOS.carpeta[tecnologia.carpeta],
    configTareas.carpeta
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

  const costoMamposteria = calcCosto(diasMamposteria, configTareas.mamposteria);
  const costoRevoque = calcCosto(diasRevoque, configTareas.revoque);
  const costoLosa = calcCosto(diasLosa, configTareas.losa);
  const costoContrapiso = calcCosto(diasContrapiso, configTareas.contrapiso);
  const costoCarpeta = calcCosto(diasCarpeta, configTareas.carpeta);

  const costoTotal =
    costoMamposteria +
    costoRevoque +
    costoLosa +
    costoContrapiso +
    costoCarpeta;

  // ================== PERSONAS ==================

  const totalPersonas = Object.values(configTareas).reduce(
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
        base: RENDIMIENTOS.mamposteria[tecnologia.mamposteria],
        factor: configTareas.mamposteria.productividad,
        personas: configTareas.mamposteria.personas,
        final:
          RENDIMIENTOS.mamposteria[tecnologia.mamposteria] *
          configTareas.mamposteria.productividad *
          configTareas.mamposteria.personas
      },
      revoque: {
        base: RENDIMIENTOS.revoque[tecnologia.revoque],
        factor: configTareas.revoque.productividad,
        personas: configTareas.revoque.personas,
        final:
          RENDIMIENTOS.revoque[tecnologia.revoque] *
          configTareas.revoque.productividad *
          configTareas.revoque.personas
      },
      losa: {
        base: RENDIMIENTOS.losa[tecnologia.losa],
        factor: configTareas.losa.productividad,
        personas: configTareas.losa.personas,
        final:
          RENDIMIENTOS.losa[tecnologia.losa] *
          configTareas.losa.productividad *
          configTareas.losa.personas
      },
      contrapiso: {
        base: RENDIMIENTOS.contrapiso[tecnologia.contrapiso],
        factor: configTareas.contrapiso.productividad,
        personas: configTareas.contrapiso.personas,
        final:
          RENDIMIENTOS.contrapiso[tecnologia.contrapiso] *
          configTareas.contrapiso.productividad *
          configTareas.contrapiso.personas
      },
      carpeta: {
        base: RENDIMIENTOS.carpeta[tecnologia.carpeta],
        factor: configTareas.carpeta.productividad,
        personas: configTareas.carpeta.personas,
        final:
          RENDIMIENTOS.carpeta[tecnologia.carpeta] *
          configTareas.carpeta.productividad *
          configTareas.carpeta.personas
      }
    }
  };
}

export function generarEtapasAutomaticas(desglose) {
  const {
    mamposteria,
    revoques,
    losa,
    contrapiso,
    carpeta
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