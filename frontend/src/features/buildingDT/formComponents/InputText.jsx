export default function InputText({fieldName, fieldConfig, value, updateField={updateField}}){
    return (
        <>
            <input
                key={fieldName + value}
                name={fieldName}
                type="text"
                defaultValue={value}
                placeholder={fieldConfig.display}
                onChange={(e)=>{updateField(fieldName, e.target.value)}}
                className="rounded-lg border border-gray-300 px-3 py-2"
            />

            <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {fieldConfig.description}
            </p>
        </>

    );
}