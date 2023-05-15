import { db } from "./firebase";
import { uuid } from "uuidv4";
import { ref, update } from "firebase/database";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Arguments {
  n: number;
  pollId: string;
  distribution?: "random" | "clustered";
  nClusters?: number;
  duration?: number; // duration in ms
}

function randomDistribution(n: number): {
  [key: string]: { 0: number; 1: number };
} {
  let result: { [key: string]: { 0: number; 1: number } } = {};
  for (let i = 0; i < args.n; ++i) {
    const userId = uuid();
    result[userId] = {
      0: Math.random(),
      1: Math.random(),
    };
  }
  return result;
}

function clusteredDistribution(
  n: number,
  nClusters?: number
): {
  [key: string]: { 0: number; 1: number };
} {
  let result: { [key: string]: { 0: number; 1: number } } = {};
  nClusters ??= 2 + Math.floor(Math.random() * 5);
  const ns = Array(nClusters).fill(Math.floor(n / nClusters));
  ns[ns.length - 1] = n - Math.floor(n / nClusters) * (nClusters - 1);
  for (let i = 0; i < nClusters; ++i) {
    const cx = Math.random();
    const cy = Math.random();
    const cr = 0.1 + 0.25 * Math.random();
    for (let j = 0; j < ns[i]; ++j) {
      const r = cr * (1 - Math.random()) ** 1.5;
      const a = Math.random() * 2 * Math.PI;
      const x = Math.max(0, Math.min(1, cx + r * Math.cos(a)));
      const y = Math.max(0, Math.min(1, cy + r * Math.sin(a)));
      result[uuid()] = {
        0: x,
        1: y,
      };
    }
  }
  return result;
}

function truffleDemoDistribution(n: number) {
  let result: { [key: string]: { 0: number; 1: number } } = {};
  const clusters = [
    [0.48, 0.3, 0.01, 0.3], // x, y, spread, percentage
    [0.24, 0.35, 0.03, 0.59],
    [0.81, 0.69, 0.03, 0.09],
    [0.35, 0.55, 0.03, 0.02],
  ];
  for (const [cx, cy, cr, p] of clusters) {
    for (let j = 0; j < p * n; ++j) {
      const r = cr * (1 - Math.random()) ** 1.5;
      const a = Math.random() * 2 * Math.PI;
      const x = Math.max(0, Math.min(1, cx + r * Math.cos(a)));
      const y = Math.max(0, Math.min(1, cy + r * Math.sin(a)));
      result[uuid()] = {
        0: x,
        1: y,
      };
    }
  }
  return result;
}

function resultByMethod(method: string, n: number) {
  return method === "random"
    ? randomDistribution(n)
    : method === "clustered"
    ? clusteredDistribution(n, parseInt(args?.nClusters))
    : truffleDemoDistribution(n);
}

let args = process.argv
  .slice(2)
  .map((arg) => arg.split("="))
  .reduce(
    (prev, arg) => ({
      ...prev,
      [arg[0]]: arg[1],
    }),
    {}
  ) as any;

if (args?.pollId === undefined) throw Error("Must supply `pollId`.");

args.duration = args?.duration === undefined ? 0 : parseInt(args.duration);

args.distribution =
  args?.distribution?.toLowerCase() === "random"
    ? "random"
    : args?.distribution?.toLowerCase() === "demo"
    ? "demo"
    : "clustered";

args.n = args?.n === undefined ? 1000 : parseInt(args.n);

args = args as Arguments;

if (args.duration === 0) {
  const result = resultByMethod(args.distribution, args.n);
  update(ref(db, `polls/${args.pollId}`), result)
    .then(() => console.log("Done."))
    .catch((error) => console.log(error))
    .finally(() => process.exit());
} else {
  const nBatches = Math.floor(args.duration / 500); // only update once every 250ms
  const nEntriesPerBatch = Math.floor(Math.max(args.n / nBatches, 1));
  const promises = [];
  for (let i = 0; i < nBatches; ++i) {
    const result = resultByMethod(args.distribution, nEntriesPerBatch);
    promises.push(
      delay(500 * i)
        .then(() => update(ref(db, `polls/${args.pollId}`), result))
        .then(() => console.log(`Batch ${i} done.`))
        .catch((error) => console.log(error))
    );
  }
  Promise.all(promises).then(() => process.exit());
}
