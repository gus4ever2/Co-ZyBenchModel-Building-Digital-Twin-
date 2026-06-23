export default function FormErrorBox({ errors }) {
  const errorEntries = Object.entries(errors ?? {});

  console.log("errors");
  console.log(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          !
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">
            Please fix the following errors
          </h3>

          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {errorEntries.map(([fieldName, message]) => (
              <li key={fieldName} className="flex gap-2">
                <span className="mt-[2px]">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}