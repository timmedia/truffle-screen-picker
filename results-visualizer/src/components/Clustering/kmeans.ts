import { argMin, distance2, randomSubset } from "../../math";
import { Point } from "../../schemas";

export function cluster(points: Point[], aspectRatio: number, kRange = [2, 8]) {
  const [kmin, kmax] = [
    Math.min(kRange[0], points.length),
    Math.min(kRange[1], points.length),
  ];
  const kError = Array(kmax - kmin + 1);
  const results: Array<[Point, Point[], number][]> = [];
  for (let j = 0; j <= kmax - kmin; ++j) {
    const k = j + kmin;
    const data = kmeans(points, k, aspectRatio);
    kError[j] = data
      .map(([center, ps, error]) => error)
      .reduce((total, error) => total + error);
    results.push(data);
  }
  const optimalIndex = argMin(kError);
  return results[optimalIndex];
}

// Returns [center, points beloning to cluster, error]
function kmeans(
  points: Point[],
  k: number,
  aspectRatio: number,
  maxIterations: number = 100
): [Point, Point[], number][] {
  let centers: Point[] = Array(k)
    .fill(0)
    .map(() => [Math.random(), Math.random()]);
  let clusteredPoints: Point[][];
  let clusteredErrors: number[] = Array(k).fill(NaN);
  let prevError: number = Infinity;
  let iteration = 0;
  do {
    clusteredPoints = Array(k)
      .fill(null)
      .map(() => []);
    for (let pi = 0; pi < points.length; ++pi) {
      const point = points[pi];
      const errors = Array(k).fill(NaN);
      for (let i = 0; i < k; ++i) {
        errors[i] = distance2(point, centers[i], aspectRatio);
      }
      const optimalIndex = argMin(errors);
      clusteredPoints[optimalIndex].push(point);
      clusteredErrors[optimalIndex] = errors[optimalIndex];
    }
    let totalError = clusteredErrors
      .map((error, index) => error / clusteredPoints[index].length ** 2)
      .reduce((total, error) => total + error);

    centers = clusteredPoints
      .map((ps, index) =>
        ps.length === 0
          ? centers[index]
          : ps.reduce(([px, py], [x, y]) => [px + x, py + y])
      )
      .map(([x, y], i) => [
        x / clusteredPoints[i].length,
        y / clusteredPoints[i].length,
      ]);
    if (Math.abs(totalError - prevError) < 0.0000001) break;
    prevError = totalError;
    iteration += 1;
  } while (iteration < maxIterations);
  return centers.map((center, index) => [
    center,
    clusteredPoints[index],
    clusteredErrors[index],
  ]);
}
