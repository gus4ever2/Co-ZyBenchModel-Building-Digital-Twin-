import type {
  Fenestration,
  PhysicalWall,
  Point2D,
  Space,
} from "../domain/types";

export const GEOMETRY_EPSILON = 1e-6;

export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= GEOMETRY_EPSILON;
}

export function pointsEqual(a: Point2D, b: Point2D): boolean {
  return nearlyEqual(a.x, b.x) && nearlyEqual(a.y, b.y);
}

export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function snapPoint(point: Point2D, gridSize: number): Point2D {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

export function getSpaceVertices(space: Space): Point2D[] {
  return [
    { x: space.x, y: space.y },
    { x: space.x + space.width, y: space.y },
    { x: space.x + space.width, y: space.y + space.depth },
    { x: space.x, y: space.y + space.depth },
  ];
}

export function wallLength(wall: Pick<PhysicalWall, "start" | "end">): number {
  return Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
}

type Axis = "H" | "V";

type Boundary = {
  space: Space;
  axis: Axis;
  coordinate: number;
  from: number;
  to: number;
};

function boundariesForSpace(space: Space): Boundary[] {
  return [
    {
      space,
      axis: "H",
      coordinate: space.y,
      from: space.x,
      to: space.x + space.width,
    },
    {
      space,
      axis: "V",
      coordinate: space.x + space.width,
      from: space.y,
      to: space.y + space.depth,
    },
    {
      space,
      axis: "H",
      coordinate: space.y + space.depth,
      from: space.x,
      to: space.x + space.width,
    },
    {
      space,
      axis: "V",
      coordinate: space.x,
      from: space.y,
      to: space.y + space.depth,
    },
  ];
}

function includesInterval(
  boundary: Boundary,
  start: number,
  end: number,
): boolean {
  return (
    boundary.from <= start + GEOMETRY_EPSILON &&
    boundary.to >= end - GEOMETRY_EPSILON
  );
}

function uniqueSorted(values: number[]): number[] {
  return values
    .sort((a, b) => a - b)
    .filter((value, index, sorted) =>
      index === 0 ? true : !nearlyEqual(value, sorted[index - 1]),
    );
}

function stableNumber(value: number): string {
  return value.toFixed(6);
}

/**
 * Builds physical walls from rectangular space edges. Edges are split wherever
 * the adjacent-space relationship changes, so partial overlaps remain one
 * exterior and one shared piece rather than duplicated user-facing walls.
 */
export function buildPhysicalWalls(spaces: Space[]): PhysicalWall[] {
  const boundaries = spaces.flatMap(boundariesForSpace);
  const groups: Boundary[][] = [];

  for (const boundary of boundaries) {
    const existing = groups.find(
      (group) =>
        group[0].axis === boundary.axis &&
        group[0].space.storyId === boundary.space.storyId &&
        nearlyEqual(group[0].coordinate, boundary.coordinate),
    );
    if (existing) existing.push(boundary);
    else groups.push([boundary]);
  }

  const walls: PhysicalWall[] = [];

  for (const group of groups) {
    const [first] = group;
    const cuts = uniqueSorted(
      group.flatMap((boundary) => [boundary.from, boundary.to]),
    );

    for (let index = 0; index < cuts.length - 1; index += 1) {
      const from = cuts[index];
      const to = cuts[index + 1];
      if (to - from <= GEOMETRY_EPSILON) continue;

      const owners = group
        .filter((boundary) => includesInterval(boundary, from, to))
        .map((boundary) => boundary.space)
        .sort((a, b) => a.id.localeCompare(b.id));

      if (owners.length === 0) continue;
      const [spaceA, spaceB] = owners;
      const start =
        first.axis === "H"
          ? { x: from, y: first.coordinate }
          : { x: first.coordinate, y: from };
      const end =
        first.axis === "H"
          ? { x: to, y: first.coordinate }
          : { x: first.coordinate, y: to };
      const ownerKey = owners
        .slice(0, 2)
        .map((space) => space.id)
        .join("-");

      walls.push({
        id: `wall:${first.space.storyId}:${first.axis}:${stableNumber(first.coordinate)}:${stableNumber(from)}:${stableNumber(to)}:${ownerKey}`,
        storyId: first.space.storyId,
        start,
        end,
        height: spaceB ? Math.min(spaceA.height, spaceB.height) : spaceA.height,
        spaceAId: spaceA.id,
        spaceBId: spaceB?.id,
        fenestrationIds: [],
      });
    }
  }

  return walls;
}

export function attachFenestrations(
  walls: PhysicalWall[],
  fenestrations: Fenestration[],
): PhysicalWall[] {
  return walls.map((wall) => ({
    ...wall,
    fenestrationIds: fenestrations
      .filter((fenestration) => fenestration.wallId === wall.id)
      .map((fenestration) => fenestration.id),
  }));
}

export function validateFenestration(
  fenestration: Omit<Fenestration, "id"> | Fenestration,
  wall: PhysicalWall,
  existing: Fenestration[],
): string | null {
  const length = wallLength(wall);
  if (fenestration.distanceFromLeft < 0)
    return "Distance from left cannot be negative.";
  if (fenestration.width <= 0) return "Opening width must be greater than 0.";
  if (fenestration.height <= 0) return "Opening height must be greater than 0.";
  if (fenestration.sillHeight < 0) return "Sill height cannot be negative.";
  if (
    fenestration.distanceFromLeft + fenestration.width >
    length + GEOMETRY_EPSILON
  ) {
    return `The opening exceeds the right edge of the wall by ${(fenestration.distanceFromLeft + fenestration.width - length).toFixed(2)} m.`;
  }
  if (
    fenestration.sillHeight + fenestration.height >
    wall.height + GEOMETRY_EPSILON
  ) {
    return "The opening exceeds the wall height.";
  }

  const candidateRight = fenestration.distanceFromLeft + fenestration.width;
  const candidateTop = fenestration.sillHeight + fenestration.height;
  const collision = existing.some((other) => {
    if (
      other.wallId !== wall.id ||
      ("id" in fenestration && other.id === fenestration.id)
    ) {
      return false;
    }
    return (
      fenestration.distanceFromLeft <
        other.distanceFromLeft + other.width - GEOMETRY_EPSILON &&
      candidateRight > other.distanceFromLeft + GEOMETRY_EPSILON &&
      fenestration.sillHeight <
        other.sillHeight + other.height - GEOMETRY_EPSILON &&
      candidateTop > other.sillHeight + GEOMETRY_EPSILON
    );
  });

  return collision
    ? "The opening overlaps another fenestration on this wall."
    : null;
}

export function pointAlongWall(wall: PhysicalWall, distance: number): Point2D {
  const length = wallLength(wall);
  if (length <= GEOMETRY_EPSILON) return wall.start;
  const ratio = distance / length;
  return {
    x: wall.start.x + (wall.end.x - wall.start.x) * ratio,
    y: wall.start.y + (wall.end.y - wall.start.y) * ratio,
  };
}
