function SelectorCaras({ caras, setCaras }){
  return (
    <div className="flex gap-4 justify-center mb-2">
      <label><input type="radio" checked={caras===1} onChange={()=>setCaras(1)} /> 1 cara</label>
      <label><input type="radio" checked={caras===2} onChange={()=>setCaras(2)} /> 2 caras</label>
    </div>
  );
}
