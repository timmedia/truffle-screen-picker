import { z } from "zod";

const LayoutArea = z.object({
  x: z.number().gte(0).lte(1),
  y: z.number().gte(0).lte(1),
  width: z.number().gte(0).lte(1),
  height: z.number().gte(0).lte(1),
});

const PollLayout = z.object({
  name: z.string(),
  areas: z.array(LayoutArea).min(1),
});

export type PollLayout = z.infer<typeof PollLayout>;

const CreatePollData = z.object({
  accessToken: z.string(),
  layout: PollLayout.nullable(),
});

export type CreatePollData = z.infer<typeof CreatePollData>;

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
});

export const StoredPoll = z.object({
  authorId: z.string().uuid(),
  id: z.string().uuid(),
  layout: z.null().or(PollLayout),
  startedAt: z.date(),
  stoppedAt: z.date(),
});

export type StoredPoll = z.infer<typeof StoredPoll>;

export const StopPollData = z.object({
  accessToken: z.string(),
});

const SavePollLayoutData = z.object({
  accessToken: z.string(),
  name: z.string(),
  id: z.string().uuid(),
  areas: z
    .array(
      z.object({
        x: z.number().gte(0).lte(1),
        y: z.number().gte(0).lte(1),
        width: z.number().gte(0).lte(1),
        height: z.number().gte(0).lte(1),
      })
    )
    .min(1),
});

const DeletePollsData = z.object({
  accessToken: z.string(),
  ids: z.array(z.string().uuid()),
});

export type DeletePollsData = z.infer<typeof DeletePollsData>;

export const DeletePollLayoutData = z.object({
  accessToken: z.string(),
  layoutId: z.string().uuid(),
});

export type DeletePollLayoutData = z.infer<typeof DeletePollLayoutData>;

export type SavePollLayoutData = z.infer<typeof SavePollLayoutData>;

export type StopPollData = z.infer<typeof StopPollData>;
