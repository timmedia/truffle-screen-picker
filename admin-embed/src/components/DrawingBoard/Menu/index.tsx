import { ButtonGroup } from "@mui/material";
import EditButton from "./Edit";
import AddButton from "./Add";
import SaveButton from "./Save";
import ResetButton from "./Reset";
import Name from "./Name";

export default function Menu() {
  return (
    <>
      <SaveButton />
      <ResetButton />
      <AddButton />
      <EditButton />
      <Name />
    </>
  );
}
