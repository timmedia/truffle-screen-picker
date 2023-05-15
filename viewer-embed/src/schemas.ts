import { z } from "zod";

const SubmitVoteData = z.object({
  accessToken: z.string(),
  pollId: z.string().uuid(),
  x: z.number().lte(1).gte(0),
  y: z.number().lte(1).gte(0),
});

export type SubmitVoteData = z.infer<typeof SubmitVoteData>;

const PollLayout = z.object({
  name: z.string(),
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

export type PollLayout = z.infer<typeof PollLayout>;

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
  layout: PollLayout.nullable(),
});

export type StoredSetupSchema = z.infer<typeof StoredSetupSchema>;
