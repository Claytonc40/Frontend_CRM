import React, { useContext, useEffect, useReducer, useState } from "react";
import { useHistory } from "react-router-dom";
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

import { isArray } from "lodash";
import AnnouncementModal from "../../components/AnnouncementModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import SpeakerIcon from "@material-ui/icons/Speaker";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
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
    overflowY: "scroll",
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(4),
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
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2.5, 3),
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.13)",
    minHeight: 64,
  },
  headerIcon: {
    color: "#5D3FD3",
    fontSize: 32,
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 24,
    color: "#5D3FD3",
    letterSpacing: 0.2,
  },
  searchContainer: {
    flex: 1,
    maxWidth: 480,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  searchInput: {
    flex: 1,
    background: "#f7f8fa",
    borderRadius: 12,
    marginRight: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    },
  },
  addButton: {
    borderRadius: 12,
    fontWeight: 600,
    minWidth: 120,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    textTransform: "none",
    fontSize: 15,
    background: "#5D3FD3",
    color: "#fff",
    marginLeft: theme.spacing(2),
    height: 40,
    "&:hover": {
      background: "#4930A8",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
      marginTop: theme.spacing(1),
    },
  },
  table: {
    background: "#f7f8fa",
    borderRadius: 12,
    marginTop: theme.spacing(2),
  },
  tableHead: {
    background: "#e5e0fa",
  },
  tableCell: {
    fontWeight: 600,
    color: "#5D3FD3",
    fontSize: 15,
  },
}));

const Announcements = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  // trava para nao acessar pagina que não pode
  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-announcement`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.companyId]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(true);
  };

  const handleCloseAnnouncementModal = () => {
    setSelectedAnnouncement(null);
    setAnnouncementModalOpen(false);
    fetchAnnouncements();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement) => {
    try {
      if (announcement.mediaName) {
        await api.delete(`/announcements/${announcement.id}/media-upload`);
      }

      await api.delete(`/announcements/${announcement.id}`);

      dispatch({ type: "DELETE_ANNOUNCEMENT", payload: announcement.id });

      toast.success(i18n.t("announcements.toasts.deleted"));
      setDeletingAnnouncement(null);
      setConfirmModalOpen(false);

      setPageNumber(1);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.message);
    }
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

  const translatePriority = (val) => {
    if (val === 1) {
      return "Alta";
    }
    if (val === 2) {
      return "Média";
    }
    if (val === 3) {
      return "Baixa";
    }
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={
          deletingAnnouncement &&
          `${i18n.t("announcements.confirmationModal.deleteTitle")} ${
            deletingAnnouncement.name
          }?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteAnnouncement(deletingAnnouncement)}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <AnnouncementModal
        open={announcementModalOpen}
        onClose={handleCloseAnnouncementModal}
        aria-labelledby="form-dialog-title"
        announcementId={selectedAnnouncement && selectedAnnouncement.id}
        reload={fetchAnnouncements}
      />
      <MainHeader>
        <div className={classes.headerContainer}>
          <SpeakerIcon className={classes.headerIcon} />
          <span className={classes.headerTitle}>
            {i18n.t("announcements.title")} ({announcements.length})
          </span>
          <div className={classes.searchContainer}>
            <TextField
              placeholder={i18n.t("announcements.searchPlaceholder")}
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
              onClick={handleOpenAnnouncementModal}
              startIcon={<AddIcon />}
            >
              {i18n.t("announcements.buttons.add")}
            </Button>
          </div>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small" className={classes.table}>
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("announcements.table.title")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("announcements.table.priority")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("announcements.table.mediaName")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("announcements.table.status")}
              </TableCell>
              <TableCell align="center" className={classes.tableCell}>
                {i18n.t("announcements.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell align="center">{announcement.title}</TableCell>
                  <TableCell align="center">
                    {translatePriority(announcement.priority)}
                  </TableCell>
                  <TableCell align="center">
                    {announcement.mediaName ??
                      i18n.t("quickMessages.noAttachment")}
                  </TableCell>
                  <TableCell align="center">
                    {announcement.status
                      ? i18n.t("announcements.active")
                      : i18n.t("announcements.inactive")}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingAnnouncement(announcement);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default Announcements;

