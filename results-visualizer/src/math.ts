import { Area, Point } from "./schemas";

export function areaContains(area: Area, [x, y]: Point) {
  return (
    area.x <= x &&
    area.y <= y &&
    area.x + area.width >= x &&
    area.y + area.height >= y
  );
}

export function pointsInArea(area: Area, points: Point[]) {
  return points
    .map((point) => (areaContains(area, point) ? 1 : 0) as number)
    .reduce((tot, curr) => tot + curr, 0);
}
