import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onCleanup, onMount } from "solid-js";
import {
  climateZonesByCode,
  type DashboardLocation,
} from "./dashboardMockData";

export default function ClimateMap(props: { locations: DashboardLocation[] }) {
  let container!: HTMLDivElement;

  onMount(() => {
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    props.locations.forEach((location) => {
      const climateZone = climateZonesByCode[location.climateZone];
      bounds.extend(location.coordinates);
      const icon = L.divIcon({
        className: "",
        html: `<span class="cozy-map-marker" style="--marker-color:${climateZone.color}"><span></span></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -16],
      });
      L.marker(location.coordinates, { icon, title: location.city })
        .addTo(map)
        .bindPopup(
          `<strong>${location.city}</strong><br>Zone ${climateZone.code} · ${climateZone.label}<br>${location.simulations} simulations`,
        );
    });
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 5 });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    onCleanup(() => map.remove());
  });

  return (
    <div
      ref={container}
      class="h-full min-h-64 w-full"
      aria-label="Map showing CozyBench climate locations"
    />
  );
}
