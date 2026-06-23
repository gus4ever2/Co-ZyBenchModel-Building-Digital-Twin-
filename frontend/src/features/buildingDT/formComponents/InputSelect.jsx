export default function InputSelect({fieldName, fieldConfig, value, updateField}) {
    
    return(
        <>
            <select
                key={fieldName + value}
                name={fieldName}
                defaultValue={value}
                onChange={(e)=>{updateField(fieldName, e.target.value)}}
                className="rounded-lg border border-gray-300 px-3 py-2"
                >
                
                <option
                    defaultValue=""
                >
                    Select {fieldConfig.display}
                </option>

                {fieldConfig.options.map((option) => (
                    <option 
                        key={fieldName + option}
                        defaultValue={option}>
                            {option}
                    </option>
                ))}

            </select>

            <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {fieldConfig.description}
            </p>
        </>
    );
}