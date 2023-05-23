import { useCallback, useEffect, useState } from "react";
import { TruffleOrg, getAccessToken } from "@trufflehq/sdk";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { Delete, OpenInNew } from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import toast from "react-hot-toast";
import { truffle } from "../truffle";
import { deletePastPolls, onCollSnapshot } from "../firebase";
import type { StoredPoll } from "../schemas";

function PollsToolbar(props: {
  selectionModel: GridRowSelectionModel;
  loadingSetter: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <GridToolbarContainer>
        <GridToolbarExport />
        <Button
          disabled={props.selectionModel.length === 0}
          startIcon={<Delete />}
          onClick={handleClickOpen}
        >
          Delete Selection
        </Button>
      </GridToolbarContainer>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        hideBackdrop
      >
        <DialogTitle id="alert-dialog-title">
          Delete selected poll{props.selectionModel.length > 1 ? "s" : ""}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will permanently remove the {props.selectionModel.length}{" "}
            selected poll{props.selectionModel.length > 1 ? "s" : ""} from your
            org. The votes cast in{" "}
            {props.selectionModel.length > 1 ? "these" : "this"} poll
            {props.selectionModel.length > 1 ? "s" : ""} will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={async () => {
              handleClose();
              props.loadingSetter(true);
              let toastId;
              try {
                toastId = toast.custom(
                  <Alert severity="info">
                    Deleting {props.selectionModel.length} Poll
                    {props.selectionModel.length > 1 ? "s" : ""}...
                  </Alert>,
                  { duration: Infinity }
                );
                const result = await deletePastPolls({
                  accessToken: await getAccessToken(),
                  ids: props.selectionModel.map((id) => `${id.valueOf()}`),
                });
                if (!result.success)
                  throw new Error(JSON.stringify(result?.error));
                toast.custom(
                  <Alert severity="success">
                    Poll{props.selectionModel.length > 1 ? "s" : ""} deleted
                    successfully.
                  </Alert>,
                  { duration: 2500 }
                );
              } catch (error) {
                console.log(error);
                toast.custom(
                  <Alert severity="error">
                    Error:{" "}
                    {(error as Error)?.message || `${JSON.stringify(error)}`}
                  </Alert>,
                  {
                    duration: 5000,
                  }
                );
              } finally {
                if (toastId) toast.dismiss(toastId);
                props.loadingSetter(false);
              }
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function NoRowsOverlay() {
  return (
    <Typography
      variant="subtitle1"
      component="div"
      sx={{ pt: "9px", pb: "10px", fontStyle: "italic" }}
    >
      This org has not yet created any polls.
    </Typography>
  );
}

export function PastPolls(props: {}) {
  const [org, setOrg] = useState<TruffleOrg | undefined>(undefined);
  const [polls, setPolls] = useState<StoredPoll[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );

  useEffect(() => {
    const subscription = truffle.org.observable.subscribe({
      next: (org) => setOrg(org),
      error: (error) => console.log(error),
      complete: () => void null,
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (org === undefined) return;
    const unsubscribe = onCollSnapshot(`/orgs/${org.id}/polls`, (data) => {
      setPolls(
        data
          .map((poll) => ({
            ...poll,
            startedAt: poll?.startedAt?.toDate() as Date,
            stoppedAt: (poll?.stoppedAt?.toDate() as Date) ?? "Ongoing",
          }))
          .sort(
            ({ startedAt: startedAtA }, { startedAt: startedAtB }) =>
              startedAtB?.getTime() - startedAtA?.getTime()
          ) as StoredPoll[]
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, [org]);

  const loadingSetter = useCallback(
    (value: boolean) => setLoading(value),
    [setLoading]
  );

  const columns: GridColDef[] = [
    {
      field: "startedAt",
      headerName: "Opened",
      width: 160,
      minWidth: 150,
      flex: 4,
      type: "string",
      valueFormatter: (params) => `${params.value?.toLocaleString()}`,
    },
    {
      field: "stoppedAt",
      headerName: "Closed",
      width: 160,
      minWidth: 150,
      flex: 4,
      type: "string",
      valueFormatter: (params) => `${params.value?.toLocaleString()}`,
    },
    {
      field: "numVotes",
      headerName: "Votes",
      type: "number",
      align: "right",
      headerAlign: "right",
      width: 50,
      flex: 0,
    },
    {
      field: "layout",
      headerName: "Layout",
      width: 150,
      flex: 2,
      minWidth: 50,
      valueFormatter: (params) =>
        params.value === null
          ? "Clustering"
          : params.value?.name ?? `${params.value?.areas?.length} Areas`,
    },
    {
      field: "id",
      headerName: "Poll ID",
      width: 300,
      type: "string",
      flex: 5,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "action",
      width: 110,
      headerName: "",
      sortable: false,
      disableColumnMenu: true,
      disableExport: true,
      renderCell: (params) => {
        if (org?.id === undefined) return <></>;
        return (
          <Button
            variant="contained"
            startIcon={<OpenInNew />}
            target="_blank"
            href={`${
              import.meta.env.VITE_FIREBASE_RESULTS_URL
            }/visualizer?orgId=${org.id}&pollId=${params.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            Results
          </Button>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "670px",
        maxHeight: "670px",
        overflowY: "scroll",
        padding: "0px !important",
      }}
    >
      <DataGrid
        loading={loading}
        rows={polls ?? []}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        slots={{
          loadingOverlay: LinearProgress,
          toolbar: PollsToolbar,
          noRowsOverlay: NoRowsOverlay,
        }}
        slotProps={{
          toolbar: {
            selectionModel,
            loadingSetter,
          },
        }}
        isRowSelectable={(params) =>
          !loading && params.row.stoppedAt !== "Ongoing"
        }
        disableRowSelectionOnClick
        pageSizeOptions={[10, 50, 100]}
        checkboxSelection
        onRowSelectionModelChange={(newSelectionModel) =>
          setSelectionModel(newSelectionModel)
        }
        style={{ height: "665px" }}
      />
    </Box>
  );
}
