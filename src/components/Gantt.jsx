import { useState } from "react";

export default function Gantt({ etapas, setEtapas }) {

  const [dragging, setDragging] = useState(null);

  const totalDias = Math.max(
    1,
    ...(etapas || []).map(e => e.inicio + e.dias)
  );

  const escala = Array.from({ length: totalDias + 1 }, (_, i) => i);

  const colores = {
    Mampostería: "bg-highlight",
    Revoques: "bg-highlight",
    Losa: "bg-highlight",
    Contrapiso: "bg-highlight",
    Carpeta: "bg-highlight"
  };

  function handleMouseDown(e, index) {
    setDragging({
      index,
      startX: e.clientX,
      inicioOriginal: etapas[index].inicio
    });
  }

  function handleMouseMove(e) {
    if (!dragging) return;

    const deltaX = e.clientX - dragging.startX;

    // 🔥 ancho del contenedor
    const containerWidth = e.currentTarget.offsetWidth;

    const deltaDias = Math.round((deltaX / containerWidth) * totalDias);

    const nuevoInicio = Math.max(
      0,
      dragging.inicioOriginal + deltaDias
    );

    const copy = [...etapas];
    copy[dragging.index].inicio = nuevoInicio;
    if (setEtapas) {
      setEtapas(copy);
    }
  }

  function handleMouseUp() {
    setDragging(null);
  }

  return (
    <div
      className="space-y-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <p className="text-sm text-gray-500">
        Arrastrá las barras para mover las etapas.
      </p>

      {/* Escala */}
      <div className="flex text-xs text-gray-500">
        {escala.map((d) => (
          <div key={d} className="flex-1 text-center">
            {d}
          </div>
        ))}
      </div>

      {(etapas || []).map((e, i) => {
        const left = (e.inicio / totalDias) * 100;
        const width = (e.dias / totalDias) * 100;
        const fin = e.inicio + e.dias;

        return (
          <div key={i} className="space-y-1">

            <div className="flex justify-between text-sm">
              <span>{e.nombre}</span>
              <span>
                Día {e.inicio} → {fin}
              </span>
            </div>

            <div className="relative w-full h-8 bg-gray-200 rounded">

              <div
                onMouseDown={(ev) => handleMouseDown(ev, i)}
                className={`absolute h-8 rounded flex items-center justify-center text-white text-xs font-bold cursor-grab transition-all duration-200 shadow-md ${
                  colores[e.nombre] || "bg-blue-500"
                }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`
                }}
              >
                {e.dias}d
              </div>

            </div>
          </div>
        );
      })}

      <div className="text-right text-sm font-semibold mt-2">
        Duración total: {totalDias} días
      </div>
    </div>
  );
}