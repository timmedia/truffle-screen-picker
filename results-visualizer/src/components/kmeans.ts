import { argMin, distance, distance2, huber, randomSubset, std } from "../math";
import { Point } from "../schemas";

const REGULARIZATION_LAMBDA = 0.0005;

// PRE: `points` must not be empty
export function cluster(points: Point[], aspectRatio: number, kRange = [2, 9]) {
  const [kmin, kmax] = [
    Math.min(kRange[0], points.length),
    Math.min(kRange[1], points.length),
  ];
  console.log(
    `[kmeans] Attempting for ${points.length} Points with k ∈ [${kmin}, ${kmax}]`
  );
  const kError = Array(kmax - kmin + 1);
  const results: Array<[Point, Point[], number, number][]> = [];
  for (let j = 0; j <= kmax - kmin; ++j) {
    const k = j + kmin;
    const data = kmeans(points, k, aspectRatio);
    kError[j] = data
      .map(([center, ps, error, sigma]) => error)
      .reduce((total, error) => total + error);
    results.push(data);
    console.log(`[kmeans] k=${k} has error ${kError[j]}`);
  }
  const optimalIndex = argMin(kError);
  console.log(`[kmeans] Chose k=${argMin(kError) + kmin}`);
  results[optimalIndex].sort(
    ([centerA], [centerB]) =>
      distance(centerA, [0, 0], aspectRatio) -
      distance(centerB, [0, 0], aspectRatio)
  );
  return results[optimalIndex];
}

// Returns [center, points beloning to cluster, error, std dev of point distributon]
function kmeans(
  points: Point[],
  k: number,
  aspectRatio: number,
  maxIterations: number = 100
): [Point, Point[], number, number][] {
  let centers: Point[] = Array(k)
    .fill(0)
    .map(() => randomSubset(points, 1)[0]);
  let clusteredPoints: Point[][];
  // If a centroid with index 0 <= i <= k has no memebers, its error will be `Infinity`
  // and therefore not used when looking for the optimal `k`
  let clusteredErrors: number[] = Array(k).fill(Infinity);
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
        const radius = distance(point, centers[i], aspectRatio);
        errors[i] = huber(radius, 0.1);
      }
      const optimalIndex = argMin(errors);
      clusteredPoints[optimalIndex].push(point);
      clusteredErrors[optimalIndex] = errors[optimalIndex];
    }
    let totalError = clusteredErrors.reduce((total, error) => total + error, 0);

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
  const sigma = std(clusteredPoints.map((points) => points.length));
  return centers.map((center, index) => [
    center,
    clusteredPoints[index],
    clusteredErrors[index] + REGULARIZATION_LAMBDA * k + 0.001 * sigma,
    sigma,
  ]);
}
