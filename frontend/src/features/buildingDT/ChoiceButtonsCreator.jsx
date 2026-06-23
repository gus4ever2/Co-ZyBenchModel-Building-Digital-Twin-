import TitleComponent from "./TitleComponent.jsx"
import { Boxes, Layers, House, BrickWall, Settings, Sprout, Cuboid, Building2, PanelsTopLeft, HardHat } from "lucide-react";

const iconMap = {
  BrickWall,
  Settings,
  Sprout,
  Cuboid,
  PanelsTopLeft,
  HardHat 
};

function ButtonCreator({goToNextState, option}){

  const Icon = iconMap[option.icon];

  return (
    <button
      key={option.title}
      type="button"
      onClick={() => goToNextState(option.nextState, option.key)}
      className="
        group relative w-full overflow-hidden rounded-3xl
        border border-slate-200 bg-white
        px-6 py-5 text-left shadow-sm transition
        hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md
      "
    >
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-2xl bg-slate-950 text-white shadow-sm
              transition group-hover:scale-105
            "
          >
            {Icon && <Icon className="h-6 w-6" />}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {option.title}
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {option.description}
            </p>
          </div>
        </div>

        <div
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full bg-slate-50 text-slate-400
            ring-1 ring-slate-200
            transition-all duration-300
            group-hover:bg-blue-600 group-hover:text-white
            group-hover:ring-blue-600 group-hover:scale-105
          "
        >
          →
        </div>
      </div>
    </button>
);

}

export default function ChoiceButtonsCreator({category, goToNextState, arrayOfOptions, previousState}) {

  return (
    <>
      <section className="mt-6 grid gap-5 md:grid-cols-3 pt-[80px] px-6">
        {arrayOfOptions.map((option) => (
          <ButtonCreator goToNextState={goToNextState} option={option} />
        ))}
      </section>
    </>
  );
}