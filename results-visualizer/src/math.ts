import { Area, Point } from "./schemas";

export function areaContains(area: Area, [x, y]: Point) {
  return (
    area.x <= x &&
    area.y <= y &&
    area.x + area.width > x &&
    area.y + area.height > y
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
  for (let i = array.length - 1; i >= array.length - n; --i) {
    index = Math.floor(i * Math.random());
    [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
  }
  return shuffled.slice(array.length - n);
}

/* Check whether two array contain the same values. */
export function equal(a: Point, b: Point) {
  return a.length === b.length && a.every((ai, i) => ai === b[i]);
}

/* Get the euclidean distance squared between two points. */
export function distance2(a: Point, b: Point, aspectRatio: number) {
  return (a[0] - b[0]) ** 2 + (aspectRatio * (a[1] - b[1])) ** 2;
}

/* Get the euclidean distance between two points. */
export function distance(a: Point, b: Point, aspectRatio: number) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (aspectRatio * (a[1] - b[1])) ** 2);
}

/* Huber loss function centered around 0. */
export function huber(x: number, delta: number) {
  return Math.abs(x) <= delta
    ? 0.5 * x ** 2
    : delta * (Math.abs(x) - 0.5 * delta);
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

export function std(array: number[]) {
  const mu = array.reduce((a, b) => a + b) / array.length;
  const variance =
    array.reduce((tot, x) => (x - mu) ** 2 + tot, 0) / array.length;
  return Math.sqrt(variance);
}

export function argMin(array: number[]) {
  return array
    .map((v, i) => [v, i])
    .reduce(([v0, i0], [v1, i1]) => (v0 < v1 ? [v0, i0] : [v1, i1]))[1];
}

export function rgba2hsla(r: number, g: number, b: number, a: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  const f = 1 - Math.abs(v + v - c - 1);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [
    60 * (h < 0 ? h + 6 : h),
    f ? (c / f) * 100 : 0,
    ((v + v - c) / 2) * 100,
    a,
  ];
}
