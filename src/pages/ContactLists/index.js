import React, { useContext, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DownloadIcon from "@material-ui/icons/GetApp";
import PeopleIcon from "@material-ui/icons/People";

import MainHeader from "../../components/MainHeader";

import { Grid } from "@material-ui/core";
import ConfirmationModal from "../../components/ConfirmationModal";
import ContactListDialog from "../../components/ContactListDialog";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTLISTS") {
    const contactLists = action.payload;
    const newContactLists = [];

    contactLists.forEach((contactList) => {
      const contactListIndex = state.findIndex((u) => u.id === contactList.id);
      if (contactListIndex !== -1) {
        state[contactListIndex] = contactList;
      } else {
        newContactLists.push(contactList);
      }
    });

    return [...state, ...newContactLists];
  }

  if (action.type === "UPDATE_CONTACTLIST") {
    const contactList = action.payload;
    const contactListIndex = state.findIndex((u) => u.id === contactList.id);

    if (contactListIndex !== -1) {
      state[contactListIndex] = contactList;
      return [...state];
    } else {
      return [contactList, ...state];
    }
  }

  if (action.type === "DELETE_CONTACTLIST") {
    const contactListId = action.payload;

    const contactListIndex = state.findIndex((u) => u.id === contactListId);
    if (contactListIndex !== -1) {
      state.splice(contactListIndex, 1);
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
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      background: "#fff",
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
    },
  },
  addButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 24px",
    boxShadow: "0 4px 12px rgba(93,63,211,0.15)",
    "&:hover": {
      boxShadow: "0 6px 16px rgba(93,63,211,0.2)",
    },
  },
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  contactListCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(3),
    margin: "0 auto",
    transition: "all 0.3s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 160,
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing(2),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardContacts: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#666",
    fontWeight: 600,
    fontSize: 16,
    background: "rgba(93,63,211,0.1)",
    padding: "4px 12px",
    borderRadius: 20,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid rgba(0,0,0,0.05)",
  },
  actionButton: {
    color: "#666",
    "&:hover": {
      background: "rgba(93,63,211,0.1)",
      color: "#5D3FD3",
    },
  },
  deleteButton: {
    color: "#ff4d4f",
    "&:hover": {
      background: "rgba(255,77,79,0.1)",
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  headerIcon: {
    color: "#5D3FD3",
    fontSize: 32,
  },
  headerText: {
    fontWeight: 700,
    fontSize: 24,
    color: "#5D3FD3",
  },
  headerActions: {
    display: "flex",
    gap: theme.spacing(2),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#666",
  },
  emptyStateIcon: {
    fontSize: 64,
    color: "#5D3FD3",
    marginBottom: theme.spacing(2),
  },
}));

const ContactLists = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedContactList, setSelectedContactList] = useState(null);
  const [deletingContactList, setDeletingContactList] = useState(null);
  const [contactListModalOpen, setContactListModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contactLists, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContactLists = async () => {
        try {
          const { data } = await api.get("/contact-lists/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_CONTACTLISTS", payload: data.records });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchContactLists();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactList`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTLIST", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACTLIST", payload: +data.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(true);
  };

  const handleCloseContactListModal = () => {
    setSelectedContactList(null);
    setContactListModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditContactList = (contactList) => {
    setSelectedContactList(contactList);
    setContactListModalOpen(true);
  };

  const handleDeleteContactList = async (contactListId) => {
    try {
      await api.delete(`/contact-lists/${contactListId}`);
      toast.success(i18n.t("contactLists.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingContactList(null);
    setSearchParam("");
    setPageNumber(1);
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

  const goToContacts = (id) => {
    history.push(`/contact-lists/${id}/contacts`);
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={
          deletingContactList &&
          `${i18n.t("contactLists.confirmationModal.deleteTitle")} ${
            deletingContactList.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteContactList(deletingContactList.id)}
      >
        {i18n.t("contactLists.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ContactListDialog
        open={contactListModalOpen}
        onClose={handleCloseContactListModal}
        aria-labelledby="form-dialog-title"
        contactListId={selectedContactList && selectedContactList.id}
      />
      <MainHeader>
        <div className={classes.headerContainer}>
          <div className={classes.headerTitle}>
            <PeopleIcon className={classes.headerIcon} />
            <Typography className={classes.headerText}>
              {i18n.t("contactLists.title")}
            </Typography>
          </div>
          <div className={classes.headerActions}>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              className={classes.searchField}
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
              onClick={handleOpenContactListModal}
              className={classes.addButton}
              startIcon={<PeopleIcon />}
            >
              {i18n.t("contactLists.buttons.add")}
            </Button>
          </div>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Grid container spacing={3} className={classes.cardGrid}>
          {contactLists.length === 0 && !loading ? (
            <Grid item xs={12}>
              <div className={classes.emptyState}>
                <PeopleIcon className={classes.emptyStateIcon} />
                <Typography variant="h6">
                  {i18n.t("contactLists.emptyState")}
                </Typography>
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  {i18n.t("contactLists.emptyStateSubtitle")}
                </Typography>
              </div>
            </Grid>
          ) : (
            contactLists.map((contactList) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={contactList.id}>
                <Card
                  className={classes.contactListCard}
                  elevation={0}
                  onClick={() => goToContacts(contactList.id)}
                >
                  <div className={classes.cardHeader}>
                    <Typography className={classes.cardTitle}>
                      {contactList.name}
                    </Typography>
                    <div className={classes.cardContacts}>
                      <PeopleIcon style={{ color: "#5D3FD3" }} />
                      {contactList.contactsCount || 0}
                    </div>
                  </div>
                  <CardContent style={{ padding: 0 }}>
                    {/* Espaço para descrição ou outras infos futuramente */}
                  </CardContent>
                  <div className={classes.cardActions}>
                    <a
                      href={planilhaExemplo}
                      download="planilha.xlsx"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        title="Baixar Planilha Exemplo"
                        className={classes.actionButton}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </a>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContactList(contactList);
                      }}
                      title="Editar Lista"
                      className={classes.actionButton}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModalOpen(true);
                        setDeletingContactList(contactList);
                      }}
                      title="Excluir Lista"
                      className={classes.deleteButton}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </div>
                </Card>
              </Grid>
            ))
          )}
          {loading && (
            <Grid item xs={12}>
              <TableRowSkeleton columns={3} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ContactLists;
