export default function InputDate({ fieldName, fieldConfig, value, updateField }) {
  return (
    <>
      <input
        key={fieldName + value}
        name={fieldName}
        type="date"
        defaultValue={value ?? fieldConfig.defaultValue ?? ""}
        required={fieldConfig.required ?? false}
        onChange={(e) => updateField(fieldName, e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2"
      />

      <p className="mt-1 text-[11px] leading-snug text-slate-500">
        {fieldConfig.description}
      </p>
    </>
  );
}