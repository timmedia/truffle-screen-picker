import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ImageIcon from "@mui/icons-material/Image";

import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import WorkIcon from "@mui/icons-material/Work";
import { Add, Stop } from "@mui/icons-material";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore, functions } from "./firebase";
import { CreatePollData, StopCurrentPollData, StoredSetup } from "../../models";
import {
  getAccessToken,
  org as orgClient,
  TruffleOrg,
  TruffleUser,
  user as userClient,
  embed,
} from "@trufflehq/sdk";
import "./App.css";
import { httpsCallable } from "firebase/functions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import LoadingButton from "@mui/lab/LoadingButton";
import ListItemText from "@mui/material/ListItemText";
import { ListItemAvatar, Stack } from "@mui/material";

function App() {
  const [storedSetup, setStoredSetup] = useState<StoredSetup | undefined>(
    undefined
  );

  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);

  const [createNewPollLoading, setCreateNewPollLoading] = useState(false);
  const [stopCurrentPollLoading, setStopCurrentPollLoading] = useState(false);

  useEffect(() => {
    if (org === undefined) return;
    const docRef = doc(collection(firestore, "/admin"), org.id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      const data = doc.data() as StoredSetup;
      setStoredSetup(data);
      console.log("new snapshot", data);
    });
    return () => unsubscribe();
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
      const createPoll = httpsCallable<
        CreatePollData,
        { success: boolean; pollId?: string }
      >(functions, "createPoll");
      const result = await createPoll({
        accessToken: await getAccessToken(),
        userId: user.id,
        orgId: org.id,
      });
      console.log(result);
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
      const stopCurrentPoll = httpsCallable<
        StopCurrentPollData,
        { success: boolean; pollId?: string }
      >(functions, "stopCurrentPoll");
      const result = await stopCurrentPoll({
        accessToken: await getAccessToken(),
        userId: user.id,
        orgId: org.id,
      });
      console.log(result);
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
              disabled={typeof storedSetup?.currentPollId === "string"}
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
              disabled={typeof storedSetup?.currentPollId !== "string"}
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
            secondary={org?.id}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`User: ${user?.name}`}
            secondary={user?.id}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Poll active: ${
              typeof storedSetup?.currentPollId === "string" ? "Yes" : "No"
            }`}
            secondary={storedSetup?.currentPollId}
            secondaryTypographyProps={{ color: "#888" }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Current Poll Results"
            secondary={
              <a
                href="https://truffle-demos.web.app/currentPollResults"
                target="_blank"
              >
                https://truffle-demos.web.app/currentPollResults
              </a>
            }
          />
        </ListItem>
      </List>
    </>
  );
}

export default App;
