import { db, firestore } from "./firebase";
import { uuid } from "uuidv4";
import { set, ref, update } from "firebase/database";

interface Arguments {
  n: number;
  pollId: string;
  distribution?: "random" | "clustered";
  nClusters?: number;
  atOnce?: boolean;
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
  nClusters = nClusters ?? 2 + Math.floor(Math.random() * 5);
  const ns = Array(nClusters).fill(Math.floor(n / nClusters));
  ns[ns.length - 1] = n - Math.floor(n / nClusters) * (nClusters - 1);
  for (let i = 0; i < nClusters; ++i) {
    const _n = ns[i];
    const cx = Math.random();
    const cy = Math.random();
    const cr = 0.1 + 0.25 * Math.random();
    for (let j = 0; j < _n; ++j) {
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

args.atOnce =
  typeof args.atOnce === "string" ? args.atOnce.toLowerCase() === "true" : true;

args.distribution =
  args?.distribution.toLowerCase() === "random" ? "random" : "clustered";

args.n = args?.n === undefined ? 1000 : parseInt(args.n);

args = args as Arguments;

const result =
  args.distribution === "random"
    ? randomDistribution(args.n)
    : clusteredDistribution(args.n, parseInt(args?.nClusters));

update(ref(db, `polls/${args.pollId}`), result)
  .then(() => console.log("Done."))
  .catch((error) => console.log(error))
  .finally(() => process.exit());
