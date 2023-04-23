import { TextField } from "@mui/material";
import { setName, useDrawingBoard } from "../state";
import { ChangeEvent } from "react";

export default function () {
  const name = useDrawingBoard((state) => state.name);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setName(event.target.value);
  };
  return (
    <TextField
      id="standard-basic"
      label="Name"
      size="small"
      variant="outlined"
      value={name}
      onChange={onChange}
      error={name.length === 0}
    />
  );
}
