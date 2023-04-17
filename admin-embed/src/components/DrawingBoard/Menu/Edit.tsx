import * as React from "react";
import { Button, MenuItem } from "@mui/material";
import { saveDiagram } from "../state";
import { KeyboardArrowDown, AspectRatio, Upload } from "@mui/icons-material";
import { StyledMenu } from "./utils";

export default function EditButton() {
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
        Edit
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
          <AspectRatio />
          Set Aspect Ratio
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            saveDiagram();
          }}
          disableRipple
        >
          <Upload />
          Add Background Image
        </MenuItem>
      </StyledMenu>
    </>
  );
}
