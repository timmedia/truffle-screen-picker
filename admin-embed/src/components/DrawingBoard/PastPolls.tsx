import { useEffect, useState } from "react";
import { onCollSnapshot } from "../../firebase";
import { TruffleOrg } from "@trufflehq/sdk";
import { truffle } from "../../truffle";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Delete, OpenInNew } from "@mui/icons-material";
import { StoredPoll } from "../../schemas";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueFormatterParams,
  GridValueGetterParams,
  GridRowSelectionModel,
  GridRowParams,
} from "@mui/x-data-grid";

function PollsToolbar(props: { selectionModel: GridRowSelectionModel }) {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
      <Button
        disabled={props.selectionModel.length === 0}
        startIcon={<Delete />}
      >
        Delete Selection
      </Button>
    </GridToolbarContainer>
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
    });
    return () => unsubscribe();
  }, [org]);

  const deletePoll = (id: string) => {};

  const columns: GridColDef[] = [
    {
      field: "startedAt",
      headerName: "Opened",
      width: 170,
      type: "string",
      valueFormatter: (params) => `${params.value?.toLocaleString()}`,
    },
    {
      field: "stoppedAt",
      headerName: "Closed",
      width: 170,
      valueFormatter: (params) => `${params.value?.toLocaleString()}`,
    },
    {
      field: "id",
      headerName: "Poll ID",
      width: 300,
      type: "string",
      flex: 1,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "layout",
      headerName: "Layout",
      valueFormatter: (params) =>
        params.value === null
          ? "Clustering"
          : `${params.value?.areas?.length} Areas`,
    },
    {
      field: "action",
      width: 150,
      headerName: "",
      sortable: false,
      disableExport: true,
      renderCell: (params) => {
        if (org?.id === undefined) return <></>;
        return (
          <Button
            variant="contained"
            endIcon={<OpenInNew />}
            target="_blank"
            href={`${
              import.meta.env.VITE_FIREBASE_RESULTS_URL
            }/visualizer?orgId=${org.id}&pollId=${params.id}`}
          >
            View Results
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
      {/* {polls === undefined && <CircularProgress style={{ marginTop: 50 }} />} */}
      <DataGrid
        loading={polls === undefined}
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
          },
        }}
        isRowSelectable={(params) => params.row.stoppedAt !== "Ongoing"}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 50, 100]}
        checkboxSelection
        onRowSelectionModelChange={(newSelectionModel) =>
          setSelectionModel(newSelectionModel)
        }
        style={{ height: "665px" }}
      />
      {/* <List>
        {org &&
          polls?.map((poll, index) => (
            <ListItem
              key={poll.id}
              secondaryAction={
                <>
                  <Stack spacing={2} direction="row">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      // disabled={deleteLoading}
                      href={`${
                        import.meta.env.VITE_FIREBASE_RESULTS_URL
                      }/visualizer?orgId=${org.id}&pollId=${poll.id}`}
                      target="_blank"
                      // onClick={() => deletePoll(poll.id)}
                    >
                      <OpenInNew />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      // disabled={deleteLoading}
                      onClick={() => deletePoll(poll.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </>
              }
            >
              <ListItemText
                primary={`${poll.startedAt?.toLocaleString()} - ${poll.stoppedAt?.toLocaleString()}`}
                secondary={
                  <p style={{ margin: "5px 0" }}>
                    {poll.id}
                    <br />
                    {poll.layout === null
                      ? "Clustering"
                      : `${poll.layout.areas.length} Areas`}
                  </p>
                }
              />
            </ListItem>
          ))}
      </List> */}
    </Box>
  );
}
