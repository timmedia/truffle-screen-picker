export type Tuple = [number, number];
export type TupleArray = Array<Tuple>;
export type Label = { points: TupleArray; centroid: Tuple };
export type Labels = { [key: number]: Label };

/**
 * Get random centroids.
 * @param data Input dataset
 * @param k number of centroids
 */
export function getRandomCentroids(data: TupleArray, k: number): TupleArray {
  const centroidsIndex: number[] = [];
  let index;
  while (centroidsIndex.length < k) {
    index = Math.floor(Math.random() * data.length);
    if (centroidsIndex.indexOf(index) === -1) centroidsIndex.push(index);
  }
  const centroids: TupleArray = [];
  for (let i = 0; i < centroidsIndex.length; i++) {
    const centroid: Tuple = [...data[centroidsIndex[i]]];
    centroids.push(centroid);
  }
  return centroids;
}

// Calculate Squared Euclidean Distance
function getDistanceSQ(a: Tuple, b: Tuple) {
  const diffs = [];
  for (let i = 0; i < a.length; i++) {
    diffs.push(a[i] - b[i]);
  }
  return diffs.reduce((r, e) => r + e * e, 0);
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
        prevDistance = getDistanceSQ(a, closestCentroid);
      } else {
        // get distance:
        const distance = getDistanceSQ(a, centroid);
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

function getPointsMean(pointList: TupleArray) {
  const totalPoints = pointList.length;
  const means: Tuple = [0, 0];
  for (let i = 0; i < pointList.length; i++) {
    const point = pointList[i];
    for (let j = 0; j < point.length; j++) {
      const val = point[j];
      means[j] = means[j] + val / totalPoints;
    }
  }
  return means;
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
      newCentroid = getPointsMean(centroidGroup.points);
    } else {
      // get new random centroid
      newCentroid = getRandomCentroids(data, 1)[0];
    }
    newCentroidList.push(newCentroid);
  }
  return newCentroidList;
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

function compareCentroids(a: Tuple, b: Tuple) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function shouldStop(
  oldCentroids: TupleArray,
  centroids: TupleArray,
  iterations: number,
  maxIterations: number
) {
  if (iterations > maxIterations) {
    return true;
  }
  if (!oldCentroids || !oldCentroids.length) {
    return false;
  }
  let sameCount = true;
  for (let i = 0; i < centroids.length; i++) {
    if (!compareCentroids(centroids[i], oldCentroids[i])) {
      sameCount = false;
    }
  }
  return sameCount;
}

function kmeans(
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
      centroids = getRandomCentroids(data, k);
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

    const clusters: Labels = {};
    for (let i = 0; i < k; i++) {
      clusters[i] = labels[i];
      // clusters.push(labels[i]);
    }
    const results = {
      clusters: clusters,
      centroids: centroids,
      iterations: iterations,
      converged: iterations <= maxIterations,
    };
    return results;
  } else {
    throw new Error("Invalid dataset");
  }
}

export default kmeans;
