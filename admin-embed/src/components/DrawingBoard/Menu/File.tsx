import * as React from "react";
import { Button, MenuItem, Divider } from "@mui/material";
import { reset, saveDiagram } from "../state";
import { Replay, Save, KeyboardArrowDown } from "@mui/icons-material";
import { StyledMenu } from "./utils";

export default function FileButton() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
      >
        File
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            saveDiagram();
          }}
          disableRipple
        >
          <Save />
          Save & Upload
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            handleClose();
            reset();
          }}
          disableRipple
        >
          <Replay />
          Reset
        </MenuItem>
      </StyledMenu>
    </>
  );
}
