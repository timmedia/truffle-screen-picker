import { ChangeEvent, useRef, useState } from "react";
import { Button, MenuItem } from "@mui/material";
import { saveDiagram, setBackgroundImageSrc } from "../state";
import { KeyboardArrowDown, AspectRatio, Upload } from "@mui/icons-material";
import { StyledMenu } from "./utils";

export default function EditButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileUploadRef = useRef<any>();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const uploadBackgroundImage = (e: ChangeEvent<HTMLInputElement>) => {
    handleClose();
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];
    const src = URL.createObjectURL(file);
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
            fileUploadRef.current.click();
          }}
          disableRipple
        >
          <Upload />
          Set Background Image
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
