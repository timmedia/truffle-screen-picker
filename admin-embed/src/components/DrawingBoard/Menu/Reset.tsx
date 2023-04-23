import { Replay } from "@mui/icons-material";
import { Button } from "@mui/material";
import { reset } from "../state";

export default function () {
  return (
    <Button
      variant="contained"
      startIcon={<Replay />}
      onClick={() => reset()}
      sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
      size="small"
    >
      Reset
    </Button>
  );
}
