export function createMuro(nombre){
  return {
    nombre,
    largo: 10,
    alto: 2.6,
    tipo: "ladrillo_comun",
    espesor: "15cm",
    tipoMortero: "conCal",
    aberturas: [{ ancho:1.5, alto:1.2 }],

    revoques: {
      hidrofugo: { activo: true, caras: 1, espesor: 0.5 },
      grueso: { activo: true, caras: 2, espesor: 1.5 },
      fino: { activo: true, caras: 2, espesor: 0.5 },
    }
  };
}