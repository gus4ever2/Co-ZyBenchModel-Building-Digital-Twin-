export const constructionSetGroups = [
  {
    id: "exteriorSurfaces",
    title: "Exterior Surfaces",
    fields: [
      ["exteriorWall", "Walls"],
      ["exteriorFloor", "Floors"],
      ["exteriorRoof", "Roofs"],
    ],
  },
  {
    id: "interiorSurfaces",
    title: "Interior Surfaces",
    fields: [
      ["interiorWall", "Walls"],
      ["interiorFloor", "Floors"],
      ["interiorCeiling", "Ceilings"],
    ],
  },
  {
    id: "groundContactSurfaces",
    title: "Ground Contact",
    fields: [
      ["groundContactWall", "Walls"],
      ["groundContactFloor", "Floors"],
      ["groundContactCeiling", "Ceilings"],
    ],
  },
  {
    id: "exteriorSubSurfaces",
    title: "Exterior Sub Surfaces",
    fields: [
      ["exteriorFixedWindow", "Fixed Windows"],
      ["exteriorOperableWindow", "Operable Windows"],
      ["exteriorDoor", "Doors"],
      ["exteriorGlassDoor", "Glass Doors"],
      ["exteriorOverheadDoor", "Overhead Doors"],
      ["exteriorSkylight", "Skylights"],
      ["exteriorTubularDaylightDome", "Tubular Daylight Domes"],
      ["exteriorTubularDaylightDiffuser", "Tubular Daylight Diffusers"],
    ],
  },
  {
    id: "interiorSubSurfaces",
    title: "Interior Sub Surfaces",
    fields: [
      ["interiorFixedWindow", "Fixed Windows"],
      ["interiorOperableWindow", "Operable Windows"],
      ["interiorDoor", "Doors"],
    ],
  },
  {
    id: "otherConstructions",
    title: "Other Constructions",
    fields: [
      ["spaceShading", "Space Shading"],
      ["buildingShading", "Building Shading"],
      ["siteShading", "Site Shading"],
      ["interiorPartition", "Interior Partition"],
      ["adiabaticSurface", "Adiabatic Surface"],
    ],
  },
] as const;
