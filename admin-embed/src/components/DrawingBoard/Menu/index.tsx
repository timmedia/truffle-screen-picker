import { ButtonGroup } from "@mui/material";
import FileButton from "./File";
import EditButton from "./Edit";
import AddButton from "./Add";

export default function Menu() {
  return (
    <ButtonGroup variant="contained" aria-label="outlined primary button group">
      <FileButton />
      <EditButton />
      <AddButton />
    </ButtonGroup>
  );
}
