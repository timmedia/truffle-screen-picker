import { z } from "zod";

export const StoredSetupSchema = z.object({
  pollId: z.string().uuid().nullable(),
  previousPollId: z.array(z.string().uuid()),
});
