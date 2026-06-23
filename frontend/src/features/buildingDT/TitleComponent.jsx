export default function TitleComponent({ category, goToNextState, previousState, progress}) {
  return (
    <>
      <div className="fixed left-64 right-0 top-0 z-40 h-[10vh]">
        <div className="bg-[#F9FAFB] px-20 pt-3 pb-5">
          <div className="flex items-center rounded-3xl bg-[#111827] px-7 py-2 shadow-md">
            <button
              type="button"
              onClick={() => goToNextState(previousState, undefined)}
              className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-sm hover:bg-blue-700"
            >
              <span className="-mt-1 p-2 text-3xl font-bold leading-none text-white">
                ←
              </span>
            </button>

            <span className="font-bold text-white hidden min-w-0 leading-tight md:block md:text-base lg:text-lg">
              {category}
            </span>
            {progress}
          </div>
          
        </div>
      </div>
    </>
  );
}