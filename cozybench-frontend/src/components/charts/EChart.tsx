import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import { createEffect, onCleanup, onMount, untrack } from "solid-js";

export default function EChart(props: {
  option: EChartsOption;
  class?: string;
  onDataZoom?: (range: { start: number; end: number }) => void;
}) {
  let host!: HTMLDivElement;
  let chart: echarts.ECharts | undefined;
  let observer: ResizeObserver | undefined;

  onMount(() => {
    chart = echarts.init(host, undefined, { renderer: "canvas" });
    chart.on("datazoom", (event: any) => {
      const range = event.batch?.[0] ?? event;
      props.onDataZoom?.({ start: range.start ?? 0, end: range.end ?? 100 });
    });
    observer = new ResizeObserver(() => chart?.resize());
    observer.observe(host);
  });

  createEffect(() => {
    const option = props.option;
    // ECharts mutates and reads its own model while applying options. Only
    // the incoming option should be tracked by Solid, not that internal work.
    untrack(() => chart?.setOption(option, { notMerge: true }));
  });

  onCleanup(() => {
    observer?.disconnect();
    chart?.dispose();
  });

  return <div ref={host} class={props.class ?? "h-80 w-full"} />;
}
