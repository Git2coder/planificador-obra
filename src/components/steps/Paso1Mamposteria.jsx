import MuroCard from "../MuroCard";
import { createMuro } from "../../utils/createMuro";

export default function Paso1Muros({ muros, setMuros }) {
  return (
    <>
      <div className="text-center mb-4">
        <button
          onClick={() =>
            setMuros([...muros, createMuro(`Muro ${muros.length + 1}`)])
          }
          className="bg-yellow-600 px-4 py-2 rounded-xl"
        >
          ➕ Añadir muro
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {muros.map((m, i) => (
          <MuroCard
            key={i}
            muro={m}
            onDelete={() => {
              const copy = muros.filter((_, idx) => idx !== i);
              setMuros(copy);
            }}
            onChange={(nuevo) => {
              const copy = [...muros];
              copy[i] = nuevo;
              setMuros(copy);
            }}
          />
        ))}
      </div>
    </>
  );
}