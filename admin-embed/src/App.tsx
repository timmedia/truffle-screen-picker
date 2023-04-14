import { useEffect, useState } from "react";
import { Add, Stop } from "@mui/icons-material";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { firestore, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import LoadingButton from "@mui/lab/LoadingButton";
import ListItemText from "@mui/material/ListItemText";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { z } from "zod";
import {
  getAccessToken,
  org as orgClient,
  TruffleOrg,
  TruffleUser,
  user as userClient,
} from "@trufflehq/sdk";
import { CreatePollData, StopPollData, StoredSetupSchema } from "./schemas";
import "./App.css";

function App() {
  const [storedSetup, setStoredSetup] = useState<
    z.infer<typeof StoredSetupSchema> | undefined
  >(undefined);

  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);

  const [createNewPollLoading, setCreateNewPollLoading] = useState(false);
  const [stopCurrentPollLoading, setStopCurrentPollLoading] = useState(false);

  useEffect(() => {
    if (org === undefined) return;
    const docRef = doc(collection(firestore, "/admin"), org.id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      const data = StoredSetupSchema.parse(doc.data());
      setStoredSetup(data);
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
        z.infer<typeof CreatePollData>,
        { success: boolean; pollId?: string; error?: Error }
      >(functions, "createPoll");
      const result = await createPoll({
        accessToken: await getAccessToken(),
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
        z.infer<typeof StopPollData>,
        { success: boolean; pollId?: string }
      >(functions, "stopCurrentPoll");
      const result = await stopCurrentPoll({
        accessToken: await getAccessToken(),
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    } finally {
      setStopCurrentPollLoading(false);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: "100%", bgcolor: "black", color: "whitesmoke" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab
              sx={{ color: "white" }}
              label="Information"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ color: "white" }}
              label="Control Poll"
              {...a11yProps(1)}
            />
            <Tab
              sx={{ color: "white" }}
              label="Create Result Overlay"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <List>
            <ListItem>
              <ListItemText
                primary={`Org: ${org?.name}`}
                secondary={org?.id ?? "-"}
                secondaryTypographyProps={{ color: "#888" }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={`User: ${user?.name ?? "-"}`}
                secondary={user?.id ?? "-"}
                secondaryTypographyProps={{ color: "#888" }}
              />
            </ListItem>
          </List>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <List>
            <ListItem>
              <Stack spacing={1} direction="row">
                <LoadingButton
                  disabled={typeof storedSetup?.pollId === "string"}
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
                  disabled={typeof storedSetup?.pollId !== "string"}
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
                primary={`Poll active: ${
                  typeof storedSetup?.pollId === "string" ? "Yes" : "No"
                }`}
                secondary={storedSetup?.pollId ?? "-"}
                secondaryTypographyProps={{ color: "#888" }}
              />
            </ListItem>
          </List>
        </TabPanel>
      </Box>
      <List sx={{ color: "white", bgcolor: "black" }}>
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
          {storedSetup?.pollId && (
            <ListItemText
              primary="Current Poll Results (permalink)"
              secondary={
                <a
                  href={`https://truffle-demos.firebaseapp.com/pollResults?pollId=${storedSetup.pollId}`}
                  target="_blank"
                >
                  {`https://truffle-demos.firebaseapp.com/pollResults?pollId=${storedSetup.pollId}`}
                </a>
              }
            />
          )}
          {!storedSetup?.pollId && (
            <ListItemText
              primary="Current Poll Results (permalink)"
              secondary="-"
              secondaryTypographyProps={{ color: "#888" }}
            />
          )}
        </ListItem>
        {/* <ListItem>
          <Box sx={{ minWidth: "100%", color: "#888", bgcolor: "grey" }}>
            <FormControl fullWidth variant="filled">
              <InputLabel id="demo-simple-select-label">Display</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                // value={age}
                label="Age"
                // onChange={handleChange}
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </ListItem> */}
      </List>
    </>
  );
}

export default App;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
