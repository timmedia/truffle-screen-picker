import { ChangeEvent, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { setAspectRatio, setBackgroundImageSrc } from "../state";
import { KeyboardArrowDown, AspectRatio, Upload } from "@mui/icons-material";
import { StyledMenu } from "./utils";

export default function EditButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState<number>(NaN);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const uploadBackgroundImage = (e: ChangeEvent<HTMLInputElement>) => {
    closeMenu();
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setAspectRatio(img.width / img.height);
      img.remove();
    };
    setBackgroundImageSrc(src);
  };

  return (
    <>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={openMenu}
        endIcon={<KeyboardArrowDown />}
        sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
        size="small"
      >
        Edit
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            setDialogOpen(true);
          }}
          disableRipple
        >
          <AspectRatio />
          Aspect Ratio
        </MenuItem>
        <Dialog open={dialogOpen}>
          <DialogTitle>Set Aspect Ratio</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              Enter in a format of "16 / 9".
            </DialogContentText>
            <TextField
              autoFocus
              error={Number.isNaN(textFieldValue)}
              margin="dense"
              id="aspectRatio"
              type="email"
              placeholder="16 / 9"
              fullWidth
              variant="standard"
              onChange={(e) => {
                const s = e.target.value.replaceAll(" ", "");
                const [w, h] = s.split("/").map((v) => parseFloat(v));
                if (w > 0 && h > 0) {
                  setTextFieldValue(w / h);
                } else {
                  setTextFieldValue(NaN);
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
              onClick={() => {
                setDialogOpen(false);
                closeMenu();
                setAspectRatio(textFieldValue);
                setTextFieldValue(NaN);
              }}
              disabled={Number.isNaN(textFieldValue)}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <MenuItem
          onClick={() => {
            fileUploadRef?.current?.click();
          }}
          disableRipple
        >
          <Upload />
          Background Image
        </MenuItem>
        <input
          ref={fileUploadRef}
          type="file"
          accept="image/*"
          hidden
          onChange={uploadBackgroundImage}
        />
      </StyledMenu>
    </>
  );
}
