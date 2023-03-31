export interface StoredSetup {
  currentPollId: string | null;
  previousPollIds: string[];
}

export interface CreatePollData {
  accessToken: string;
  userId: string;
  orgId: string;
}

export interface SubmitVoteData {
  relX: number;
  relY: number;
  accessToken: string;
  userId: string;
  pollId: string;
  orgId: string;
}

export interface StopCurrentPollData {
  accessToken: string;
  userId: string;
  orgId: string;
}
