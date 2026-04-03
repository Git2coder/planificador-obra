import Input from "./Input";

export default function SubBlock({ title, data, setData }){
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