import { z } from "zod";

export const CreatePollData = z.object({
  accessToken: z.string(),
});

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
  previousPollId: z.array(z.string().uuid()),
});

export const StopPollData = z.object({
  accessToken: z.string(),
});
