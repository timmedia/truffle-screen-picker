import { useEffect, useState } from "react";
import { Add, Stop } from "@mui/icons-material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import LoadingButton from "@mui/lab/LoadingButton";
import ListItemText from "@mui/material/ListItemText";
import { Stack } from "@mui/material";
import { supabase } from "./supabase-client";
import {
  getAccessToken,
  org as orgClient,
  TruffleOrg,
  TruffleUser,
  user as userClient,
} from "@trufflehq/sdk";
import "./App.css";

function App() {
  // string: poll is ongoing; null: no active poll; undefined: we don't know, wait for supabase
  const [pollId, setPollId] = useState<string | null | undefined>(undefined);

  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);

  const [createNewPollLoading, setCreateNewPollLoading] = useState(false);
  const [stopCurrentPollLoading, setStopCurrentPollLoading] = useState(false);

  // continously listen to changed
  useEffect(() => {
    if (!org?.id) return;
    const channel = supabase
      .channel("poll-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Poll",
          filter: `org_id=eq.${org.id}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" &&
            payload.new?.ended_at === null
          ) {
            setPollId(payload.new.id);
          } else if (
            payload.eventType === "UPDATE" &&
            payload.new?.id === pollId &&
            payload.new?.ended_at !== null
          ) {
            setPollId(null);
          }
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [org, pollId]);

  useEffect(() => {
    if (org === undefined) return;
    // const docRef = doc(collection(firestore, "/admin"), org.id);
    // const unsubscribe = onSnapshot(docRef, (doc) => {
    //   const data = doc.data() as StoredSetup;
    //   setStoredSetup(data);
    // });
    // return () => unsubscribe();
  }, [org]);

  useEffect(() => {
    const subscription = orgClient.observable.subscribe({
      next: (org) => setOrg(org),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = userClient.observable.subscribe({
      next: (user) => setUser(user),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  const createNewPoll = async () => {
    setCreateNewPollLoading(true);
    try {
      if (user === undefined || org === undefined) return;
      // TODO
    } catch (error) {
      console.log(error);
    } finally {
      setCreateNewPollLoading(false);
    }
  };

  const stopCurrentPoll = async () => {
    setStopCurrentPollLoading(true);
    try {
      if (user === undefined || org === undefined) return;
      // TODO
    } catch (error) {
      console.log(error);
    } finally {
      setStopCurrentPollLoading(false);
    }
  };

  return (
    <>
      <List sx={{ color: "white", bgcolor: "black" }}>
        <ListItem>
          <Stack spacing={1} direction="row">
            <LoadingButton
              disabled={pollId !== null}
              loading={createNewPollLoading}
              color="success"
              loadingPosition="start"
              onClick={createNewPoll}
              sx={{ ":disabled": { bgcolor: "#555" } }}
              startIcon={<Add />}
              variant="contained"
            >
              Create New Poll
            </LoadingButton>
            <LoadingButton
              disabled={typeof pollId !== "string"}
              loading={stopCurrentPollLoading}
              color="error"
              loadingPosition="start"
              onClick={stopCurrentPoll}
              sx={{ ":disabled": { bgcolor: "#555" } }}
              startIcon={<Stop />}
              variant="contained"
            >
              Stop Current Poll
            </LoadingButton>
          </Stack>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Org: ${org?.name}`}
            secondary={org?.id ?? "-"}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`User: ${user?.name ?? "no name"}`}
            secondary={user?.id ?? "-"}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Poll active: ${
              typeof pollId === "string" ? "Yes" : "No"
            }`}
            secondary={pollId ?? "-"}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          {org?.id && (
            <ListItemText
              primary="Latest Poll Results"
              secondary={
                <a
                  href={`https://truffle-demos.firebaseapp.com/latestPollResults?orgId=${org.id}`}
                  target="_blank"
                >
                  {`https://truffle-demos.firebaseapp.com/latestPollResults?orgId=${org.id}`}
                </a>
              }
            />
          )}
        </ListItem>
        <ListItem>
          {pollId && (
            <ListItemText
              primary="Current Poll Results (permalink)"
              secondary={
                <a
                  href={`https://truffle-demos.firebaseapp.com/pollResults?pollId=${pollId}`}
                  target="_blank"
                >
                  {`https://truffle-demos.firebaseapp.com/pollResults?pollId=${pollId}`}
                </a>
              }
            />
          )}
          {!pollId && (
            <ListItemText
              primary="Current Poll Results (permalink)"
              secondary="-"
              secondaryTypographyProps={{ color: "#888" }}
            />
          )}
        </ListItem>
      </List>
    </>
  );
}

export default App;
