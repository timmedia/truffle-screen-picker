export type Point = [number, number];

export type Area = { x: number; y: number; width: number; height: number };

export type PollLayout = {
  name: string;
  areas: Area[];
};

export type SavedPoll = {
  authorId: string;
  layout: PollLayout | null;
  startedAt: number;
  stoppedAt: number;
};
