import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Canvas } from "./Canvas";
import { loadLayout, reset } from "./state";
import { useCallback, useEffect, useState } from "react";
import { TruffleOrg, getAccessToken, org as orgClient } from "@trufflehq/sdk";
import { deletePollLayout, onCollSnapshot } from "../../firebase";
import { PollLayout } from "../../schemas";
import { Close, Dashboard, Delete, Edit, NoteAdd } from "@mui/icons-material";
import toast from "react-hot-toast";
import SaveButton from "./Menu/Save";
import ResetButton from "./Menu/Reset";
import AddButton from "./Menu/Add";
import EditButton from "./Menu/Edit";
import NameInput from "./Menu/Name";

export function DrawingBoard() {
  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [pollLayouts, setPollLayouts] = useState<
    (PollLayout & { id: string })[] | undefined
  >(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const subscription = orgClient.observable.subscribe({
      next: (org) => setOrg(org),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (org === undefined) return;
    const unsubscribe = onCollSnapshot(`/orgs/${org.id}/layouts`, (data) => {
      setPollLayouts(data as (PollLayout & { id: string })[]);
    });
    return () => unsubscribe();
  }, [org]);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const deleteLayout = useCallback(async (layoutId: string) => {
    try {
      setDeleteLoading(true);
      const result = await deletePollLayout({
        accessToken: await getAccessToken(),
        layoutId,
      });
      if (!result.success) throw result?.error;
      toast.custom(
        <Alert severity="success">Layout deleted successfully.</Alert>,
        { duration: 2500 }
      );
    } catch (error) {
      console.log(error);
      toast.custom(
        <Alert severity="error">Error: {(error as Error)?.message}</Alert>,
        {
          duration: 5000,
        }
      );
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const editLayout = useCallback((layout: PollLayout & { id: string }) => {
    loadLayout(layout);
    handleClickOpen();
  }, []);

  return (
    <Box sx={{ minHeight: "500px" }}>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        Available Layouts
      </Typography>
      {pollLayouts === undefined && <CircularProgress />}
      {pollLayouts?.length === 0 && (
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ pt: "9px", pb: "10px", fontStyle: "italic" }}
        >
          This org has no saved layouts.
        </Typography>
      )}
      <List>
        {pollLayouts?.map((layout) => (
          <ListItem
            secondaryAction={
              <>
                <Stack spacing={2} direction="row">
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    disabled={deleteLoading}
                    onClick={() => editLayout(layout)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    disabled={deleteLoading}
                    onClick={() => deleteLayout(layout.id)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <Dashboard />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={layout.name}
              secondary={<span>{layout.areas.length} Areas</span>}
            />
          </ListItem>
        ))}
      </List>
      <Button
        size="large"
        variant="contained"
        endIcon={<NoteAdd />}
        onClick={handleClickOpen}
      >
        Create New Layout
      </Button>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <Stack direction="row" spacing={1} alignItems="center">
              <SaveButton onComplete={handleClose} />
              <ResetButton />
              <AddButton />
              <EditButton />
              <NameInput />
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  handleClose();
                  reset();
                }}
                startIcon={<Close />}
                sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
              >
                Close
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} direction="row" justifyContent="center">
          <Canvas />
        </Stack>
      </Dialog>
    </Box>
  );
}
