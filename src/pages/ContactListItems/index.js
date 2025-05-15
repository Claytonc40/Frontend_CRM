import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { useHistory, useParams } from "react-router-dom";
import { toast } from "sonner";

import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";

import IconButton from "@material-ui/core/IconButton";
import BlockIcon from "@material-ui/icons/Block";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactListItemModal from "../../components/ContactListItemModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";

import { Grid } from "@material-ui/core";
import { Can } from "../../components/Can";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import { AuthContext } from "../../context/Auth/AuthContext";

import useContactLists from "../../hooks/useContactLists";
import { i18n } from "../../translate/i18n";

import EventIcon from "@material-ui/icons/Event";
import LabelIcon from "@material-ui/icons/Label";
import planilhaExemplo from "../../assets/planilha.xlsx";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
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
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  contactCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(2),
    margin: "0 auto",
    transition: "all 0.3s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 120,
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
    marginBottom: theme.spacing(1),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardStatus: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 12,
    padding: "2px 10px",
    background: "#f7f8fa",
  },
  cardInfo: {
    marginBottom: theme.spacing(1),
    color: "#444",
    fontSize: 15,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
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
    padding: theme.spacing(2.5, 3),
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.13)",
    minHeight: 64,
    gap: theme.spacing(2),
  },
  headerTitleBlock: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 22,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerTag: {
    display: "flex",
    alignItems: "center",
    background: "#f7f8fa",
    color: "#5D3FD3",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    padding: "2px 10px",
    marginLeft: 8,
    gap: 4,
  },
  headerDate: {
    display: "flex",
    alignItems: "center",
    color: "#888",
    fontWeight: 500,
    fontSize: 14,
    marginLeft: 12,
    gap: 4,
  },
  headerActions: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
  },
  searchField: {
    minWidth: 220,
    maxWidth: 320,
    background: "#f7f8fa",
    borderRadius: 12,
    marginRight: theme.spacing(2),
  },
  headerButton: {
    borderRadius: 12,
    fontWeight: 600,
    minWidth: 100,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    textTransform: "none",
    fontSize: 15,
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

const ContactListItems = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);
  const { contactListId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactListItemModalOpen, setContactListItemModalOpen] =
    useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [contactList, setContactList] = useState({});
  const fileUploadRef = useRef(null);

  const { findById: findContactList } = useContactLists();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    findContactList(contactListId).then((data) => {
      setContactList(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactListId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`contact-list-items`, {
            params: { searchParam, pageNumber, contactListId },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, contactListId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ContactListItem`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.record });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.id });
      }

      if (data.action === "reload") {
        dispatch({ type: "LOAD_CONTACTS", payload: data.records });
      }
    });

    socket.on(
      `company-${companyId}-ContactListItem-${contactListId}`,
      (data) => {
        if (data.action === "reload") {
          dispatch({ type: "LOAD_CONTACTS", payload: data.records });
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [contactListId, socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(true);
  };

  const handleCloseContactListItemModal = () => {
    setSelectedContactId(null);
    setContactListItemModalOpen(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactListItemModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contact-list-items/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleImportContacts = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({
        url: `contact-lists/${contactListId}/upload`,
        method: "POST",
        data: formData,
      });
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

  const goToContactLists = () => {
    history.push("/contact-lists");
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <ContactListItemModal
        open={contactListItemModalOpen}
        onClose={handleCloseContactListItemModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contactListItems.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contactListItems.confirmationModal.importTitle")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={() =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleImportContacts()
        }
      >
        {deletingContact ? (
          `${i18n.t("contactListItems.confirmationModal.deleteMessage")}`
        ) : (
          <>
            {i18n.t("contactListItems.confirmationModal.importMessage")}
            <a href={planilhaExemplo} download="planilha.xlsx">
              Clique aqui para baixar planilha exemplo.
            </a>
          </>
        )}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.headerContainer}>
          <div className={classes.headerTitleBlock}>
            <CheckCircleIcon className={classes.headerIcon} />
            <span className={classes.headerTitle}>{contactList.name}</span>
            {contactList.tag && (
              <span className={classes.headerTag}>
                <LabelIcon style={{ fontSize: 18 }} /> TAG: {contactList.tag}
              </span>
            )}
            {contactList.createdAt && (
              <span className={classes.headerDate}>
                <EventIcon style={{ fontSize: 18 }} />
                {new Date(contactList.createdAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div className={classes.headerActions}>
            <TextField
              placeholder={i18n.t("contactListItems.searchPlaceholder")}
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
              onClick={goToContactLists}
              className={classes.headerButton}
            >
              {i18n.t("contactListItems.buttons.lists")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                fileUploadRef.current.value = null;
                fileUploadRef.current.click();
              }}
              className={classes.headerButton}
            >
              {i18n.t("contactListItems.buttons.import")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenContactListItemModal}
              className={classes.headerButton}
            >
              {i18n.t("contactListItems.buttons.add")}
            </Button>
          </div>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <input
          style={{ display: "none" }}
          id="upload"
          name="file"
          type="file"
          accept=".xls,.xlsx"
          onChange={() => {
            setConfirmOpen(true);
          }}
          ref={fileUploadRef}
        />
        <Grid container spacing={3} className={classes.cardGrid}>
          {contacts.length === 0 && !loading ? (
            <Grid item xs={12}>
              <div className={classes.emptyState}>
                <CheckCircleIcon className={classes.emptyStateIcon} />
                <span style={{ fontSize: 18 }}>
                  {i18n.t("contactListItems.emptyState")}
                </span>
                <div style={{ marginTop: 8 }}>
                  {i18n.t("contactListItems.emptyStateSubtitle")}
                </div>
              </div>
            </Grid>
          ) : (
            contacts.map((contact) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                <div className={classes.contactCard}>
                  <div className={classes.cardHeader}>
                    <span className={classes.cardTitle}>{contact.name}</span>
                    <span className={classes.cardStatus}>
                      {contact.isWhatsappValid ? (
                        <CheckCircleIcon
                          style={{ color: "green" }}
                          fontSize="small"
                        />
                      ) : (
                        <BlockIcon style={{ color: "grey" }} fontSize="small" />
                      )}
                      {contact.isWhatsappValid ? "WhatsApp válido" : "Inválido"}
                    </span>
                  </div>
                  <div className={classes.cardInfo}>
                    <span>
                      <b>Número:</b> {contact.number}
                    </span>
                    <span>
                      <b>Email:</b> {contact.email}
                    </span>
                  </div>
                  <div className={classes.cardActions}>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditContact(contact.id)}
                      className={classes.actionButton}
                      title="Editar Contato"
                    >
                      <EditIcon />
                    </IconButton>
                    <Can
                      role={user.profile}
                      perform="contacts-page:deleteContact"
                      yes={() => (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmOpen(true);
                            setDeletingContact(contact);
                          }}
                          className={classes.deleteButton}
                          title="Excluir Contato"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    />
                  </div>
                </div>
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
    </MainContainer>
  );
};

export default ContactListItems;
