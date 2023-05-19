import { LoadingButton } from "@mui/lab";
import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@trufflehq/sdk";
import { Add, KeyboardArrowDown } from "@mui/icons-material";
import {
  Alert,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { createPoll, onCollSnapshot } from "../firebase";
import toast from "react-hot-toast";
import { PollLayout } from "../schemas";

export default function CreatePollButton(props: {
  orgId: string | undefined;
  userId: string | undefined;
  pollId: string | undefined | null;
}) {
  const [loading, setLoading] = useState(false);
  const [pollLayouts, setPollLayouts] = useState<
    (PollLayout & { id: string })[] | undefined
  >(undefined);
  const [selectedPollLayout, setSelectedPollLayout] = useState<
    null | (PollLayout & { id: string })
  >(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = onCollSnapshot(
      `/orgs/${props.orgId}/layouts`,
      (data) => {
        setPollLayouts(data as (PollLayout & { id: string })[]);
      }
    );
    return () => unsubscribe();
  }, [props.orgId]);

  const createNewPoll = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const result = await createPoll({
        accessToken,
        layout: selectedPollLayout,
      });
      if (!result.success) throw new Error(JSON.stringify(result?.error));
      toast.custom(
        <Alert severity="success">
          Poll started with id <code>{result.pollId}</code>.
        </Alert>,
        { duration: 2500 }
      );
      console.log(result);
    } catch (error) {
      console.log(error);
      toast.custom(
        <Alert severity="error">
          Could not start poll.{" "}
          <code>{(error as Error).message || `${JSON.stringify(error)}`}</code>.
        </Alert>,
        { duration: 2500 }
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPollLayout]);

  const disabled =
    typeof props.pollId === "string" ||
    props.orgId === undefined ||
    props.userId === undefined;

  const open = Boolean(anchorEl);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <ButtonGroup>
      <LoadingButton
        disabled={disabled}
        loading={loading}
        color="success"
        loadingPosition="start"
        onClick={createNewPoll}
        startIcon={<Add />}
        variant="contained"
      >
        Start New Poll
      </LoadingButton>
      <Tooltip title="Select Poll Layout" sx={{ width: "200px" }}>
        <>
          <Button
            color="success"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            disabled={loading || disabled}
            endIcon={<KeyboardArrowDown />}
          >
            <strong>{selectedPollLayout?.name ?? "Clustering"}</strong>
          </Button>
        </>
      </Tooltip>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            setSelectedPollLayout(null);
          }}
        >
          <em>Clustering</em>
        </MenuItem>
        {pollLayouts?.map((layout) => (
          <MenuItem
            key={layout.id}
            onClick={() => {
              handleClose();
              setSelectedPollLayout(layout);
            }}
          >
            {layout.name}
          </MenuItem>
        ))}
      </Menu>
    </ButtonGroup>
  );
}
