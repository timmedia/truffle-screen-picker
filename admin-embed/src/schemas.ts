import { z } from "zod";

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

const CreatePollData = z.object({
  accessToken: z.string(),
  layout: PollLayout.nullable(),
});

export type CreatePollData = z.infer<typeof CreatePollData>;

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
});

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

export const DeletePollLayoutData = z.object({
  accessToken: z.string(),
  layoutId: z.string().uuid(),
});

export type DeletePollLayoutData = z.infer<typeof DeletePollLayoutData>;

export type SavePollLayoutData = z.infer<typeof SavePollLayoutData>;

export type StopPollData = z.infer<typeof StopPollData>;
