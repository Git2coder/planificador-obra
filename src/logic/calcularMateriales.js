import { MUROS, REVOQUES_BASE, LOSA, CONTRAPISO, CARPETA } from "../data/materiales";

  function calcularSupNeta(m) {
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

    return Math.max(superficieMuro - supAberturas, 0);
  }

  export function calcularMateriales({
    muros = [],
    losa = { largo: 0, ancho: 0, espesor: 0 },
    contrapiso = { largo: 0, ancho: 0, espesor: 0 },
    carpeta = { largo: 0, ancho: 0, espesor: 0 },
    tipoContrapiso = "conCal",
    modoCalculo,
    precios = { cemento: 0, arena: 0, cal: 0, piedra: 0 }
  }) {

  // ================== INICIO ==================
  let ladrillosMuros = 0;
  let calMuros = 0;
  let cementoMuros = 0;
  let arenaMuros = 0;

  let cementoEstructura = 0;
  let arenaEstructura = 0;
  let piedraEstructura = 0;

  const revoquesTotales = {
    hidrofugo: { cemento: 0, arena: 0, cal: 0 },
    grueso: { cemento: 0, arena: 0, cal: 0 },
    fino: { cemento: 0, arena: 0, cal: 0 }
  };

  // ================== MUROS FOR EACH ==================
  muros.forEach((m, i) => {
    const supNeta = calcularSupNeta(m);

    const baseMuro = MUROS[m.tipo].opciones[m.espesor];
    const espesorMuro = parseFloat(m.espesor) / 100; // si está en cm
    const mortero = baseMuro[m.tipoMortero];
    
    // 🔹 MAMPOSTERÍA
    ladrillosMuros += supNeta * baseMuro.ladrillos_m2;
    calMuros += supNeta * (mortero.cal || 0);
    cementoMuros += supNeta * (mortero.cemento || 0);
    arenaMuros += supNeta * (mortero.arena || 0);

    // 🔥 🔥 🔥 REVOQUES POR MURO
    Object.entries(m.revoques).forEach(([key, config]) => {
      if (config.activo) {
        const baseRevoque = REVOQUES_BASE[key];
        const factor = config.espesor / baseRevoque.espesor;
        const espesorMuro = parseFloat(m.espesor) / 100;
        let superficie = 0;

        if (config.caras === 1) {
          superficie = supNeta;
        }

        if (config.caras === 2) {
          const exterior = supNeta;

          let largoInterior;

          if (modoCalculo === "simple") {
            largoInterior = Math.max(m.largo - (2 * espesorMuro), 0);
          } else {
            

            const anterior = muros[i - 1] || muros[muros.length - 1];
            const siguiente = muros[i + 1] || muros[0];

            const e1 = espesorMuro;
            const eAnt = parseFloat(anterior.espesor) / 100;
            const eSig = parseFloat(siguiente.espesor) / 100;

            const ajusteInicio = (e1 + eAnt) / 2;
            const ajusteFin = (e1 + eSig) / 2;

            largoInterior = Math.max(
              m.largo - ajusteInicio - ajusteFin,
              0
            );
          }

          const interior = Math.max(largoInterior * m.alto - (m.largo * m.alto - supNeta), 0);
          
          superficie = exterior + interior;
        }

        revoquesTotales[key].cemento += superficie * (baseRevoque.cemento * factor);
        revoquesTotales[key].arena += superficie * (baseRevoque.arena * factor);
        revoquesTotales[key].cal += superficie * ((baseRevoque.cal || 0) * factor);
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

   // ================== CALCULO POR MURO ==================
      const resultadosPorMuro = muros.map((m, i) => {
        const supNeta = calcularSupNeta(m);
    
            const base = MUROS[m.tipo].opciones[m.espesor];
            const mortero = base[m.tipoMortero];
    
            let ladrillos = supNeta * base.ladrillos_m2;
            let cal = supNeta * (mortero.cal || 0);
            let cemento = supNeta * (mortero.cemento || 0);
            let arena = supNeta * (mortero.arena || 0);
    
            // 🔹 REVOQUES
            const revoquesMuro = {
              hidrofugo: { exterior: null, interior: null },
              grueso: { exterior: null, interior: null },
              fino: { exterior: null, interior: null }
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
    
                const exterior = supNeta;
    
                // 🔥 cara interior REAL
                let largoInterior;
    
                if (modoCalculo === "simple") {
                  largoInterior = Math.max(m.largo - (2 * espesorMuro), 0);
                } else {
                  const anterior = muros[i - 1] || muros[muros.length - 1];
                  const siguiente = muros[i + 1] || muros[0];
    
                  const e1 = espesorMuro;
                  const eAnt = parseFloat(anterior.espesor) / 100;
                  const eSig = parseFloat(siguiente.espesor) / 100;
    
                  const ajusteInicio = (e1 + eAnt) / 2;
                  const ajusteFin = (e1 + eSig) / 2;
    
                  largoInterior = Math.max(
                    m.largo - ajusteInicio - ajusteFin,
                    0
                  );
                }
    
                const interior = Math.max(largoInterior * m.alto - (m.largo * m.alto - supNeta), 0);
    
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
      const supNeta = calcularSupNeta(m);
      return acc + supNeta;
    }, 0);
  
    const costoCemento = bolsasCemento * precios.cemento;
    const costoArena = bolsonArena * precios.arena;
    const costoCal = bolsasCal * precios.cal;
    const costoPiedra = bolsonPiedra * precios.piedra;
  
    const costoTotal = costoCemento + costoArena + costoCal + costoPiedra;
    

  return {
    // 🔹 SUPERFICIES
    superficieTotal,
    supLosa,
    supContrapiso,
    supCarpeta,

    // 🔹 MUROS
    totalLadrillos,
    cementoMuros,
    arenaMuros,
    calMuros,


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

    // 🔹 ESTRUCTURA
    cementoEstructura,
    arenaEstructura,
    piedraEstructura,

    // 🔹 COSTOS
    costoTotal,
    costoCemento,
    costoArena,
    costoCal,
    costoPiedra,

    // 🔹 DETALLE
    revoquesTotales,
    resultadosPorMuro
  };
}