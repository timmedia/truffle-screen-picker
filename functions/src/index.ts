import { initializeApp } from "firebase-admin/app";

initializeApp();

import createPoll from "./create-poll";
import latestPollResults from "./latest-poll-results";
import stopCurrentPoll from "./stop-current-poll";
import submitVote from "./submit-vote";
import savePollLayout from "./save-poll-layout";
import deletePollLayout from "./delete-poll-layout";

export const screenPoll = {
  createPoll,
  latestPollResults,
  stopCurrentPoll,
  submitVote,
  savePollLayout,
  deletePollLayout,
};
