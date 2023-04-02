export type Tuple = [number, number];
export type TupleArray = Array<Tuple>;
export type Label = { points: TupleArray; centroid: Tuple };
export type Labels = { [key: number]: Label };

/* Get a random subset of an array. */
function randomSubset<T>(array: T[], k: number) {
  const shuffled = array.slice(0);
  let index;
  for (let i = array.length; i > array.length - k; --i) {
    index = Math.floor((i + 1) * Math.random());
    [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
  }
  return shuffled.slice(array.length - k);
}

/* Check whether two array contain the same values. */
function arraysEqual<T extends Array<any>>(a: T, b: T) {
  return a.length === b.length && a.every((ai, i) => ai === b[i]);
}

/* Get the euclidean distance squared between two points. */
function distance2(a: Tuple, b: Tuple, aspectRatio: number = 16 / 9) {
  return (aspectRatio * (a[0] - b[0])) ** 2 + (a[1] - b[1]) ** 2;
  // return a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0);
}

/* Calculate mean point of an array containing tuples. */
function mean<S extends number[], T extends Array<S>>(points: T) {
  const n = points.length;
  const d = points[0].length;
  return points.reduce(
    (mean, a) => a.map((ai, i) => mean[i] + ai / n),
    Array<number>(d).fill(0)
  ) as S;
}

function calcMeanCentroid(data: TupleArray, start: number, end: number) {
  const features = data[0].length;
  const n = end - start;
  let mean: Tuple = [0, 0];
  for (let i = start; i < end; i++) {
    for (let j = 0; j < features; j++) {
      mean[j] = mean[j] + data[i][j] / n;
    }
  }
  return mean;
}

// Returns a label for each piece of data in the dataset.
function getLabels(data: TupleArray, centroids: TupleArray) {
  // prep data structure:
  const labels: Labels = {};
  for (let c = 0; c < centroids.length; c++) {
    labels[c] = {
      points: [],
      centroid: centroids[c],
    };
  }
  // For each element in the dataset, choose the closest centroid.
  // Make that centroid the element's label.
  for (let i = 0; i < data.length; i++) {
    const a = data[i];
    let closestCentroid: Tuple,
      closestCentroidIndex: number = 0,
      prevDistance: number = NaN;
    for (let j = 0; j < centroids.length; j++) {
      let centroid = centroids[j];
      if (j === 0) {
        closestCentroid = centroid;
        closestCentroidIndex = j;
        prevDistance = distance2(a, closestCentroid);
      } else {
        // get distance:
        const distance = distance2(a, centroid);
        if (Number.isNaN(prevDistance) || distance < prevDistance) {
          prevDistance = distance;
          closestCentroid = centroid;
          closestCentroidIndex = j;
        }
      }
    }
    // add point to centroid labels:
    labels[closestCentroidIndex].points.push(a);
  }
  return labels;
}

function recalculateCentroids(data: TupleArray, labels: Labels, k: number) {
  // Each centroid is the geometric mean of the points that
  // have that centroid's label. Important: If a centroid is empty (no points have
  // that centroid's label) you should randomly re-initialize it.
  let newCentroid: Tuple;
  const newCentroidList: TupleArray = [];
  for (const k in labels) {
    const centroidGroup = labels[k];
    if (centroidGroup.points.length > 0) {
      // find mean:
      newCentroid = mean(centroidGroup.points);
    } else {
      // get new random centroid
      newCentroid = randomSubset(data, 1)[0];
    }
    newCentroidList.push(newCentroid);
  }
  return newCentroidList;
}

function getRandomCentroidsNaiveSharding(data: TupleArray, k: number) {
  // implementation of a variation of naive sharding centroid initialization method
  // (not using sums or sorting, just dividing into k shards and calc mean)
  // https://www.kdnuggets.com/2017/03/naive-sharding-centroid-initialization-method.html
  const numSamples = data.length;
  // Divide dataset into k shards:
  const step = Math.floor(numSamples / k);
  const centroids: TupleArray = [];
  for (let i = 0; i < k; i++) {
    const start = step * i;
    let end = step * (i + 1);
    if (i + 1 === k) {
      end = numSamples;
    }
    centroids.push(calcMeanCentroid(data, start, end));
  }
  return centroids;
}

function shouldStop(
  oldCentroids: TupleArray,
  centroids: TupleArray,
  iterations: number,
  maxIterations: number
) {
  if (iterations > maxIterations) return true;
  if (!oldCentroids || !oldCentroids.length) return false;

  let sameCount = true;
  for (let i = 0; i < centroids.length; i++) {
    if (!arraysEqual(centroids[i], oldCentroids[i])) {
      sameCount = false;
    }
  }
  return sameCount;
}

export function kmeans(
  data: TupleArray,
  k: number,
  maxIterations: number = 100,
  useNaiveSharding = true
) {
  if (data.length && data[0].length && data.length > k) {
    // Initialize book keeping variables
    let iterations = 0;
    let oldCentroids: TupleArray = [],
      labels: Labels = {},
      centroids: TupleArray;

    // Initialize centroids randomly
    if (useNaiveSharding) {
      centroids = getRandomCentroidsNaiveSharding(data, k);
    } else {
      centroids = randomSubset(data, k);
    }

    // Run the main k-means algorithm
    while (!shouldStop(oldCentroids, centroids, iterations, maxIterations)) {
      // Save old centroids for convergence test.
      oldCentroids = [...centroids];
      iterations++;

      // Assign labels to each datapoint based on centroids
      labels = getLabels(data, centroids);
      centroids = recalculateCentroids(data, labels, k);
    }

    const results = {
      clusters: Object.values(labels),
      centroids: centroids,
      iterations: iterations,
      converged: iterations <= maxIterations,
    };
    return results;
  } else {
    throw new Error("Invalid dataset");
  }
}

export function optimalKMeans(
  data: TupleArray,
  maxIterations: number = 100,
  useNaiveSharding = true,
  kmax: number = 10
) {
  const results = Array<ReturnType<typeof kmeans>>(kmax);
  const sses = Array<number>(kmax);
  for (let k = 0; k < kmax; ++k) {
    results[k] = kmeans(data, k + 1, maxIterations, useNaiveSharding);
    const { clusters } = results[k];
    sses[k] = Object.values(clusters).reduce(
      (total, { points, centroid }) =>
        total +
        points.reduce((sum, point) => distance2(point, centroid) + sum, 0),
      0
    );
  }
  const minSse = Math.min(...sses);
  const chosenIndex = sses.findIndex((sse) => sse <= 1.3 * minSse);
  return results[chosenIndex];
}
