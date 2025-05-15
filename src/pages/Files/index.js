import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { toast } from "sonner";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import ConfirmationModal from "../../components/ConfirmationModal";
import FileModal from "../../components/FileModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import Container from "@material-ui/core/Container";

const reducer = (state, action) => {
  if (action.type === "LOAD_FILES") {
    const files = action.payload;
    const newFiles = [];

    files.forEach((fileList) => {
      const fileListIndex = state.findIndex((s) => s.id === fileList.id);
      if (fileListIndex !== -1) {
        state[fileListIndex] = fileList;
      } else {
        newFiles.push(fileList);
      }
    });

    return [...state, ...newFiles];
  }

  if (action.type === "UPDATE_FILES") {
    const fileList = action.payload;
    const fileListIndex = state.findIndex((s) => s.id === fileList.id);

    if (fileListIndex !== -1) {
      state[fileListIndex] = fileList;
      return [...state];
    } else {
      return [fileList, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const fileListId = action.payload;

    const fileListIndex = state.findIndex((s) => s.id === fileListId);
    if (fileListIndex !== -1) {
      state.splice(fileListIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(4),
    background: "#faf9fd",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(93,63,211,0.07)",
    minHeight: 400,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  searchInput: {
    minWidth: 240,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  addButton: {
    marginLeft: theme.spacing(2),
    height: 40,
    whiteSpace: "nowrap",
    backgroundColor: "#5D3FD3",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
    transition: "background 0.2s, box-shadow 0.2s",
    "&:hover": {
      backgroundColor: "#4b32a8",
      boxShadow: "0 4px 16px rgba(93,63,211,0.12)",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
    },
  },
  tableHead: {
    background: "#f3f0fa",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#f8f6fc",
    },
    "&:hover": {
      backgroundColor: "#ede7fa",
    },
  },
  actionCell: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  iconButton: {
    color: "#5D3FD3",
    background: "#f3f0fa",
    borderRadius: 8,
    transition: "background 0.2s, color 0.2s",
    "&:hover": {
      background: "#e0d7fa",
      color: "#4b32a8",
    },
  },
}));

const FileLists = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedFileList, setSelectedFileList] = useState(null);
  const [deletingFileList, setDeletingFileList] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [files, dispatch] = useReducer(reducer, []);
  const [fileListModalOpen, setFileListModalOpen] = useState(false);

  const fetchFileLists = useCallback(async () => {
    try {
      const { data } = await api.get("/files/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_FILES", payload: data.files });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  }, [searchParam, pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchFileLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchFileLists]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on(`company-${user.companyId}-file`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_FILES", payload: data.files });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.fileId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenFileListModal = () => {
    setSelectedFileList(null);
    setFileListModalOpen(true);
  };

  const handleCloseFileListModal = () => {
    setSelectedFileList(null);
    setFileListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditFileList = (fileList) => {
    setSelectedFileList(fileList);
    setFileListModalOpen(true);
  };

  const handleDeleteFileList = async (fileListId) => {
    try {
      await api.delete(`/files/${fileListId}`);
      toast.success(i18n.t("files.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingFileList(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchFileLists();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={
          deletingFileList && `${i18n.t("files.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteFileList(deletingFileList.id)}
      >
        {i18n.t("files.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <FileModal
        open={fileListModalOpen}
        onClose={handleCloseFileListModal}
        reload={fetchFileLists}
        aria-labelledby="form-dialog-title"
        fileListId={selectedFileList && selectedFileList.id}
      />
      
      <MainHeader>
        <div className={classes.header}>
          <Title>
            {i18n.t("files.title")} ({files.length})
          </Title>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              className={classes.searchInput}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.addButton}
              onClick={handleOpenFileListModal}
              startIcon={<EditIcon />}
            >
              {i18n.t("files.buttons.add")}
            </Button>
          </div>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell align="center">{i18n.t("files.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("files.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {files.map((fileList) => (
                <TableRow key={fileList.id} className={classes.tableRow}>
                  <TableCell align="center">{fileList.name}</TableCell>
                  <TableCell align="center" className={classes.actionCell}>
                    <IconButton
                      size="small"
                      className={classes.iconButton}
                      onClick={() => handleEditFileList(fileList)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      className={classes.iconButton}
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingFileList(fileList);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default FileLists;
