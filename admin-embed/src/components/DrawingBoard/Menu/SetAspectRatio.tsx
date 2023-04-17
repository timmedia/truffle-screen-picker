import { AspectRatio } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  SxProps,
  TextField,
  Theme,
} from "@mui/material";
import { useState } from "react";

export function SetAspectRatio({ sx }: { sx: SxProps<Theme> }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Fab
        size="small"
        color="primary"
        onClick={handleClickOpen}
        aria-label="delete"
        sx={sx}
      >
        <AspectRatio />
      </Fab>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Set Aspect Ratio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="width"
            type="number"
            variant="standard"
            placeholder="16"
          />
          <TextField
            autoFocus
            margin="dense"
            id="height"
            type="number"
            variant="standard"
            placeholder="9"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
