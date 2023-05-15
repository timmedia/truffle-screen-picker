import { Save } from "@mui/icons-material";
import { saveDiagram, useDrawingBoard } from "../state";
import { Alert, LoadingButton } from "@mui/lab";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export default function SaveButton(props: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false);
  const disabled = useDrawingBoard(
    (state) =>
      state.name.length === 0 || Object.values(state.areas).length === 0
  );

  const save = useCallback(async () => {
    try {
      setLoading(true);
      const result = await saveDiagram();
      if (!result.success) throw result?.error;
      toast.custom(
        <Alert severity="success">Layout saved successfully.</Alert>,
        { duration: 2500 }
      );
      props.onComplete?.();
    } catch (error) {
      console.log(error);
      toast.custom(
        <Alert severity="error">
          Error: {(error as Error)?.message || `${error}`}
        </Alert>,
        {
          duration: 2500,
        }
      );
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <LoadingButton
      variant="contained"
      size="small"
      endIcon={<Save />}
      sx={{ borderRadius: 2, bgcolor: "#151515", color: "white" }}
      loading={loading}
      disabled={disabled}
      onClick={save}
    >
      Save
    </LoadingButton>
  );
}
