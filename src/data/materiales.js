// ================== DATA ==================
export const MUROS = {
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

export const REVOQUES_BASE = {
  hidrofugo: { cemento: 2.7, arena: 0.006, espesor: 0.5 },
  grueso: { cal: 3.6, cemento: 1.81, arena: 0.017, espesor: 1.5 },
  fino: { cal: 1.6, cemento: 0.45, arena: 0.006, espesor: 0.5 },
};

export const LOSA = {
  cemento: 33,
  arena: 0.072,
  piedra: 0.072,
  espesorBase: 0.11
};

export const CONTRAPISO = {
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

export const CARPETA = {
  cemento: 10.8,
  arena: 0.024,
  espesorBase: 0.02
};