import { SyntheticEvent, useEffect, useState } from "react";
import { hostingBaseURL, onDocSnapshot } from "./firebase";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import {
  Chip,
  CssBaseline,
  Stack,
  ThemeProvider,
  Tooltip,
  createTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import { z } from "zod";
import { TruffleOrg, TruffleUser } from "@trufflehq/sdk";
import { StoredSetupSchema } from "./schemas";
import "./App.css";
import { DrawingBoard } from "./components/DrawingBoard/DrawingBoard";
import CreatePollButton from "./components/CreatePollButton";
import { StopPollButton } from "./components/StopPollButton";
import { Toaster } from "react-hot-toast";
import { embed, truffle } from "./truffle";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#272727",
    },
    primary: {
      main: "rgb(146, 227, 227)",
    },
    secondary: {
      main: "rgb(255, 147, 192)",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          boxShadow: ["none"],
          ":hover": {
            boxShadow: ["none"],
          },
          textTransform: "none",
        },
        startIcon: {
          paddingLeft: "5px",
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: ["none"],
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: "8px 0px",
        },
      },
    },
  },
});

function App() {
  const [storedSetup, setStoredSetup] = useState<
    z.infer<typeof StoredSetupSchema> | undefined
  >(undefined);

  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [user, setUser] = useState<TruffleUser | undefined>(undefined);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    embed.setStyles({
      height: `${document.body.scrollHeight}px`,
      margin: "24px 0px",
      "border-radius": "12px",
    });
  }, [document.body.scrollHeight, tabIndex]);

  useEffect(() => {
    if (org === undefined) return;
    const unsubscribe = onDocSnapshot("/orgs", org.id, (data) =>
      setStoredSetup(StoredSetupSchema.parse(data))
    );
    return () => unsubscribe();
  }, [org]);

  useEffect(() => {
    const subscription = truffle.org.observable.subscribe({
      next: (org) => setOrg(org),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = truffle.user.observable.subscribe({
      next: (user) => setUser(user),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ width: "100%", color: "whitesmoke", p: 0, m: 0 }}>
          {/* <Stack
            spacing={1}
            direction="row"
            sx={{ py: 2, px: 0, bgcolor: "transparent" }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => setTabIndex(0)}
              sx={{
                borderRadius: 2,
                bgcolor: "#333",
                color: "white",
                textTransform: "none",
                fontSize: "14px",
                ":disabled": { bgcolor: "white", color: "#151515" },
                ":hover": { bgcolor: "#444" },
              }}
              disabled={tabIndex === 0}
            >
              Control Poll
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setTabIndex(1)}
              sx={{
                borderRadius: 2,
                bgcolor: "#333",
                color: "white",
                textTransform: "none",
                fontSize: "14px",
                ":disabled": { bgcolor: "white", color: "#151515" },
                ":hover": { bgcolor: "#444" },
              }}
              disabled={tabIndex === 1}
            >
              Manage Layouts
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setTabIndex(2)}
              sx={{
                borderRadius: 2,
                bgcolor: "#333",
                color: "white",
                textTransform: "none",
                fontSize: "14px",
                ":disabled": { bgcolor: "white", color: "#151515" },
                ":hover": { bgcolor: "#444" },
              }}
              disabled={tabIndex === 2}
            >
              Information
            </Button>
          </Stack> */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              aria-label="main menu"
            >
              <Tab label="Control Poll" {...a11yProps(0)} />
              <Tab label="Poll Layouts" {...a11yProps(1)} />
              <Tab label="Information" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <Box>
            <TabPanel value={tabIndex} index={0}>
              <List sx={{ pt: 0, mt: 0 }}>
                <ListItem>
                  <Stack spacing={1} direction="row">
                    <CreatePollButton
                      orgId={org?.id}
                      userId={user?.id}
                      pollId={storedSetup?.pollId}
                    />
                    <StopPollButton
                      orgId={org?.id}
                      userId={user?.id}
                      pollId={storedSetup?.pollId}
                    />
                  </Stack>
                </ListItem>
                <ListItem>
                  <Box
                    sx={{
                      bgcolor: "lightgrey",
                      width: "100vw",
                      height: "calc(100vw / 16 * 9)",
                      backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                        linear-gradient(135deg, #ccc 25%, transparent 25%),
                                        linear-gradient(45deg, transparent 75%, #ccc 75%),
                                        linear-gradient(135deg, transparent 75%, #ccc 75%)`,
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 10px 0, 10px -10px, 0px 10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {!storedSetup?.pollId && (
                      <h1
                        style={{
                          textAlign: "center",
                          color: "grey",
                          userSelect: "none",
                          fontSize: "10vw",
                        }}
                      >
                        Result Preview
                      </h1>
                    )}
                    {storedSetup?.pollId && org?.id && (
                      <iframe
                        style={{
                          width: "100%",
                          height: "100%",
                          colorScheme: "normal",
                        }}
                        src={`${
                          import.meta.env.VITE_FIREBASE_RESULTS_URL
                        }/visualizer?orgId=${org.id}&pollId=${
                          storedSetup.pollId
                        }`}
                        frameBorder="0"
                        referrerPolicy="no-referrer"
                        allowTransparency={true}
                      ></iframe>
                    )}
                  </Box>
                </ListItem>
                <ListItem>
                  {org?.id && (
                    <ListItemText
                      primary="Most Recent Poll Results"
                      secondary={
                        <a
                          href={`${
                            import.meta.env.VITE_FIREBASE_RESULTS_URL
                          }/latest?orgId=${org.id}`}
                          target="_blank"
                        >
                          {`${
                            import.meta.env.VITE_FIREBASE_RESULTS_URL
                          }/latest?orgId=${org.id}`}
                        </a>
                      }
                    />
                  )}
                </ListItem>
                <ListItem>
                  {org?.id && storedSetup?.pollId && (
                    <ListItemText
                      primary="Current Poll Results (permalink)"
                      secondary={
                        <a
                          href={`${
                            import.meta.env.VITE_FIREBASE_RESULTS_URL
                          }/visualizer?orgId=${org.id}&pollId=${
                            storedSetup.pollId
                          }`}
                          target="_blank"
                        >
                          {`${
                            import.meta.env.VITE_FIREBASE_RESULTS_URL
                          }/visualizer?orgId=${org.id}&pollId=${
                            storedSetup.pollId
                          }`}
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
              </List>
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <DrawingBoard />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
              <List sx={{ m: 0, p: 0 }} dense>
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
              <Stack spacing={1} direction="row">
                <Tooltip title="App Version">
                  <Chip label={import.meta.env.VITE_APP_VERSION} />
                </Tooltip>
                <Tooltip title="Mode">
                  <Chip label={import.meta.env.MODE} />
                </Tooltip>
                <Tooltip title="Firebase Project ID">
                  <Chip label={import.meta.env.VITE_FIREBASE_PROJECT_ID} />
                </Tooltip>
              </Stack>
            </TabPanel>
          </Box>
        </Box>
        <Toaster position="bottom-center" />
      </ThemeProvider>
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
          <Typography component={"span"}>{children}</Typography>
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
