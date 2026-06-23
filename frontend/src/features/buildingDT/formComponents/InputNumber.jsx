export default function InputNumber({fieldName, fieldConfig, value, updateField}){

    return (
        <>
            <input
                key={fieldName + value}
                type="number"
                defaultValue={value}
                placeholder={fieldConfig.display}
                step={fieldConfig.step ?? "any"}
                onChange={(e)=>{updateField(fieldName, e.target.value)}}
                className="rounded-lg border border-gray-300 px-3 py-2"
            />

            <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {fieldConfig.description}
            </p>
      </>
    );
}