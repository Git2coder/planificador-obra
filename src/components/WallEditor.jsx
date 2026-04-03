import { useState } from "react";

const SCALE = 40; // px por metro

export default function WallEditor({ walls, setWalls }) {
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  function handleClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / SCALE;
    const y = (e.clientY - rect.top) / SCALE;

    const SNAP_DISTANCE = 0.5; // 👈 mover arriba

    let newPoint = { x, y };

    const first = points[0]; // 👈 UNA SOLA VEZ

    // SNAP AL PRIMER PUNTO
    if (first) {
      const dxSnap = x - first.x;
      const dySnap = y - first.y;
      const distSnap = Math.hypot(dxSnap, dySnap);

      if (distSnap < SNAP_DISTANCE) {
        newPoint = { x: first.x, y: first.y };
      }
    }

    // PRIMER CLICK
    if (!isDrawing) {
      setPoints([newPoint]);
      setIsDrawing(true);
      return;
    }

    // DISTANCIA PARA CIERRE
    const dx = newPoint.x - first.x;
    const dy = newPoint.y - first.y;
    const distance = Math.hypot(dx, dy);

    // CERRAR FIGURA
    if (points.length > 2 && distance < SNAP_DISTANCE) {
      generarMuros(points);
      setPoints([]);
      setIsDrawing(false);
      return;
    }

    // AGREGAR PUNTO
    setPoints([...points, newPoint]);
  }

  function generarMuros(points) {
    const nuevosMuros = [];

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];

      nuevosMuros.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        alto: 2.6,
        espesor: "15cm", // 👈 CAMBIO IMPORTANTE (antes era string)
        tipo: "ladrillo_comun",
        tipoMortero: "conCal",
        aberturas: [],
        revoques: {
          hidrofugo: { activo: true, caras: 1, espesor: 0.5 },
          grueso: { activo: true, caras: 2, espesor: 1.5 },
          fino: { activo: true, caras: 2, espesor: 0.5 },
        }
      });
    }

    setWalls([...walls, ...nuevosMuros]);
  }

  function calcularAreaPoligono(points) {
    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    return Math.abs(area / 2);
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className="bg-gray-900 border border-gray-600"
        style={{ width: 600, height: 400 }}
      >
        <svg width="600" height="400">

          {/* muros */}
          {walls.map((w, i) => {
            const dx = w.x2 - w.x1;
            const dy = w.y2 - w.y1;
            const length = Math.hypot(dx, dy).toFixed(2);
            const altura = w.alto || 2.6;
            const areaCara = (length * altura).toFixed(2);
            const areaTotal = (areaCara * 2).toFixed(2);

            return (
              <g key={i}>
                <line
                  x1={w.x1 * SCALE}
                  y1={w.y1 * SCALE}
                  x2={w.x2 * SCALE}
                  y2={w.y2 * SCALE}
                  stroke="yellow"
                  strokeWidth={(parseFloat(w.espesor || 0) * SCALE) / 100}
                  strokeLinecap="round"

                  // 👇 IMPORTANTE
                  style={{ cursor: "pointer" }}
                  pointerEvents="stroke"

                  onClick={(e) => {
                    e.stopPropagation(); // 👈 evita conflicto con handleClick

                    const nuevaLongitud = prompt("Nueva longitud del muro (m):");
                    if (!nuevaLongitud || isNaN(nuevaLongitud)) return;

                    const dx = w.x2 - w.x1;
                    const dy = w.y2 - w.y1;
                    const angle = Math.atan2(dy, dx);

                    const newX2 = w.x1 + Math.cos(angle) * parseFloat(nuevaLongitud);
                    const newY2 = w.y1 + Math.sin(angle) * parseFloat(nuevaLongitud);

                    const nuevosMuros = [...walls];
                    nuevosMuros[i] = { ...w, x2: newX2, y2: newY2 };

                    setWalls(nuevosMuros);
                  }}
                />

                {/* TEXTO DE LONGITUD */}
                <text
                  x={((w.x1 + w.x2) / 2) * SCALE}
                  y={((w.y1 + w.y2) / 2) * SCALE}
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {length} m
                </text>

                <text
                  x={((w.x1 + w.x2) / 2) * SCALE}
                  y={((w.y1 + w.y2) / 2) * SCALE + 12}
                  fill="cyan"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {areaCara} m² / cara
                </text>
              </g>
            );
        })}

          {/* dibujo en proceso */}
          {points.length > 0 && (
            <polyline
              points={points.map(p => `${p.x * SCALE},${p.y * SCALE}`).join(" ")}
              fill="none"
              stroke="red"
              strokeWidth={2}
            />
          )}

          {/* línea de cierre visual */}
          {points.length > 2 && (
            <line
              x1={points[points.length - 1].x * SCALE}
              y1={points[points.length - 1].y * SCALE}
              x2={points[0].x * SCALE}
              y2={points[0].y * SCALE}
              stroke="lime"
              strokeDasharray="4"
            />
          )}
          

        </svg>
      </div>

      <div className="text-white mt-2">
        Área recinto: {calcularAreaPoligono(points).toFixed(2)} m²
      </div>

      <div className="text-xs mt-2 text-gray-400">
        Dibujá el contorno. Cerrá tocando el punto inicial.
      </div>
    </div>
  );
}