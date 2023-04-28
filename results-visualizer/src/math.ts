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

/* Get a random subset of an array. */
export function randomSubset<T>(array: T[], n: number) {
  const shuffled = array.slice(0);
  let index;
  for (let i = array.length; i > array.length - n; --i) {
    index = Math.floor((i + 1) * Math.random());
    [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
  }
  return shuffled.slice(array.length - n + 1);
}

/* Check whether two array contain the same values. */
export function equal(a: Point, b: Point) {
  return a.length === b.length && a.every((ai, i) => ai === b[i]);
}

/* Get the euclidean distance squared between two points. */
export function distance2(a: Point, b: Point, aspectRatio: number) {
  return (aspectRatio * (a[0] - b[0])) ** 2 + (a[1] - b[1]) ** 2;
}

/* Calculate mean point of an array containing tuples. */
export function mean<S extends number[], T extends Array<S>>(points: T) {
  const n = points.length;
  const d = points[0].length;
  return points.reduce(
    (mean, a) => a.map((ai, i) => mean[i] + ai / n),
    Array<number>(d).fill(0)
  ) as S;
}

export function argMin(array: number[]) {
  return array
    .map((v, i) => [v, i])
    .reduce(([v0, i0], [v1, i1]) => (v0 < v1 ? [v0, i0] : [v1, i1]))[1];
}
