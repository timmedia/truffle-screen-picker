import { z } from "zod";

export const PollLayout = z.object({
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

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
  layout: PollLayout.nullable(),
});

export type StoredSetupSchema = z.infer<typeof StoredSetupSchema>;
