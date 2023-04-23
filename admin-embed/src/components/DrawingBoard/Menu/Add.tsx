import { Button } from "@mui/material";
import { createRectangle } from "../state";
import { Add } from "@mui/icons-material";

export default function AddButton() {
  return (
    <Button
      variant="contained"
      onClick={() => createRectangle(0.5, 0.5)}
      startIcon={<Add />}
      sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
      size="small"
    >
      Add area
    </Button>
  );
}
