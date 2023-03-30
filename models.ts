export interface StoredSetup {
  pollId: string | null;
  streamId: string;
}

export interface SubmitVoteData {
  relX: number;
  relY: number;
  accessToken: string;
  userId: string;
  pollId: string;
  streamId: string;
}
