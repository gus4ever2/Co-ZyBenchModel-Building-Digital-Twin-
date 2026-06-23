export default function InputDetails({type, category, children}){
    return(
        <>
            <details
                name={category}
                key={type.enumValue}
                className="w-full my-1 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
                <summary className="list-none cursor-pointer">
                    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">
                    <h3 className="text-xs font-bold leading-tight text-slate-800">
                        {type.displayName}
                    </h3>

                    <span className="text-xs text-slate-500">
                        ▼
                    </span>
                    </div>
                </summary>
                {children}
            </details>
        </>
    );
}