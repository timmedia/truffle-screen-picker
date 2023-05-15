import { Stop } from "@mui/icons-material";
import { Alert, LoadingButton } from "@mui/lab";
import { useCallback, useState } from "react";
import { stopCurrentPoll } from "../firebase";
import { getAccessToken } from "@trufflehq/sdk";
import toast from "react-hot-toast";

export function StopPollButton(props: {
  orgId: string | undefined;
  userId: string | undefined;
  pollId: string | undefined | null;
}) {
  const [loading, setLoading] = useState(false);

  const stop = useCallback(async () => {
    setLoading(true);
    try {
      if (props.userId === undefined || props.orgId === undefined) return;
      const accessToken = await getAccessToken();
      const result = await stopCurrentPoll(accessToken);
      console.log(result);
      if (!result.success) throw result?.error;
      toast.custom(<Alert severity="success">Poll stopped.</Alert>, {
        duration: 2500,
      });
    } catch (error) {
      console.log(error);
      toast.custom(
        <Alert severity="error">
          Could not stop poll.{" "}
          <code>{(error as Error).message || `${error}`}</code>.
        </Alert>,
        { duration: 2500 }
      );
    } finally {
      setLoading(false);
    }
  }, [props]);

  const disabled =
    typeof props.pollId !== "string" ||
    props.orgId === undefined ||
    props.userId === undefined;

  return (
    <LoadingButton
      disabled={disabled}
      loading={loading}
      color="error"
      loadingPosition="start"
      onClick={stop}
      startIcon={<Stop />}
      variant="contained"
    >
      Stop Poll
    </LoadingButton>
  );
}
