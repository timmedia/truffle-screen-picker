import { db, firestore } from "./firebase";
import { uuid } from "uuidv4";
import { set, ref, update } from "firebase/database";

interface Arguments {
  n: number;
  pollId: string;
  atOnce?: boolean;
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

args.n = args?.n === undefined ? 1000 : parseInt(args.n);

args = args as Arguments;

let result: any = {};
for (let i = 0; i < args.n; ++i) {
  const userId = uuid();
  result[userId] = {
    "0": Math.random(),
    "1": Math.random(),
  };
}

update(ref(db, `polls/${args.pollId}`), result)
  .then(() => console.log("Done."))
  .catch((error) => console.log(error))
  .finally(() => process.exit());
