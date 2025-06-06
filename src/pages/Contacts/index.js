import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import EmailIcon from "@material-ui/icons/Email";
import GetAppIcon from "@material-ui/icons/GetApp";
import GridOnIcon from "@material-ui/icons/GridOn";
import InfoIcon from "@material-ui/icons/Info";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import PhoneIcon from "@material-ui/icons/Phone";
import SearchIcon from "@material-ui/icons/Search";
import SyncIcon from "@material-ui/icons/Sync";
import ViewListIcon from "@material-ui/icons/ViewList";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { useHistory } from "react-router-dom";
import Flag from "react-world-flags";
import { toast } from "sonner";

import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactDetailsModal from "../../components/ContactDetailsModal";
import ContactModal from "../../components/ContactModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import api from "../../services/api";

import { Can } from "../../components/Can";
import MainHeader from "../../components/MainHeader";
import NewTicketModal from "../../components/NewTicketModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

import { i18n } from "../../translate/i18n";

import Container from "@material-ui/core/Container";
import { CSVLink } from "react-csv";

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
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  contactCard: {
    position: "relative",
    marginBottom: theme.spacing(2),
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
  },
  contactCardContent: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  contactHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1.5),
  },
  contactInfo: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tagsContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  contactDetailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
    marginTop: "auto",
  },
  contactActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    marginRight: theme.spacing(1),
  },
  statusChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontWeight: "bold",
  },
  tagChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
  },
  viewButtons: {
    display: "flex",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: theme.shape.borderRadius,
  },
  viewButton: {
    padding: theme.spacing(0.5),
    minWidth: "auto",
    color: theme.palette.text.secondary,
    "&.active": {
      color: "#5D3FD3",
      backgroundColor: "rgba(93, 63, 211, 0.08)",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  filtersContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  filterSelect: {
    minWidth: 120,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    "& .MuiSelect-select": {
      paddingTop: 9,
      paddingBottom: 9,
    },
  },
  emailPhone: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  companyInfo: {
    fontSize: "0.875rem",
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
  },
  jobTitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  revenue: {
    marginTop: theme.spacing(1),
  },
  tableContainer: {
    overflowX: "auto",
  },
  actionsColumn: {
    width: 120,
  },
  nameColumn: {
    minWidth: 200,
  },
  searchInput: {
    margin: 0,
    width: 300,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  pageTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(2),
    position: "relative",
    display: "inline-block",
    marginTop: theme.spacing(4),
    "&::after": {
      content: '""',
      position: "absolute",
      width: "40%",
      height: 3,
      bottom: -5,
      left: 0,
      backgroundColor: "#5D3FD3",
      borderRadius: 2,
    },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  upperHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    margin: theme.spacing(2, 0),
    gap: theme.spacing(1),
  },
  actionButton: {
    borderRadius: 10,
    padding: theme.spacing(1, 2),
    textTransform: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    fontWeight: 600,
    fontSize: "0.8rem",
    color: "white",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },
  addButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  importButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  exportButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  importExcelButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  filterAndButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  actionButtonsContainer: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  controlsContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  countryFlag: {
    marginRight: theme.spacing(0.75),
    width: 16,
    height: 12,
    boxShadow: "0 0 1px rgba(0,0,0,0.2)",
    borderRadius: 2,
  },
  phoneWithFlag: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(0.5),
  },
  actionMenuItem: {
    padding: theme.spacing(1, 2),
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  menuPaper: {
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
    minWidth: 180,
  },
  actionsButton: {
    color: theme.palette.text.secondary,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s ease",
    padding: 6,
    marginLeft: theme.spacing(1),
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
      color: theme.palette.primary.main,
      transform: "scale(1.1)",
    },
  },
  tagFilterButton: {
    marginLeft: theme.spacing(1),
    borderRadius: 10,
    borderColor: "#5D3FD3",
    color: "#5D3FD3",
    backgroundColor: "rgba(93, 63, 211, 0.04)",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      borderColor: "#5D3FD3",
    },
  },
  tagFilterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: "rgba(93, 63, 211, 0.02)",
    borderLeft: "4px solid #5D3FD3",
  },
  searchAndFilterContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
}));

const ContactCard = ({
  contact,
  onMenuClick,
  onEditContact,
  getCountryCode,
  formatPhoneNumber,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactDetailsModalOpen, setContactDetailsModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    onMenuClick(contact);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenContactDetailsModal = () => {
    setContactDetailsModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseContactDetailsModal = () => {
    setContactDetailsModalOpen(false);
  };

  const handleOpenNewTicket = () => {
    setNewTicketModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseNewTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleDeleteContact = async () => {
    try {
      await api.delete(`/contacts/${contact.id}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingContact(null);
    handleCloseMenu();
  };

  return (
    <Card className={classes.contactCard}>
      <CardContent className={classes.contactCardContent}>
        <div className={classes.contactHeader}>
          <Avatar src={contact.profilePicUrl} className={classes.avatar} />
          <div className={classes.contactInfo}>
            <Typography variant="h6" component="h2">
              {contact.name}
            </Typography>
            <Typography className={classes.jobTitle}>
              {contact.extraInfo?.jobTitle || "CEO"} at{" "}
              {contact.extraInfo?.company ||
                contact.name.split(" ")[0] + " Enterprises"}
            </Typography>
          </div>
          <IconButton
            size="small"
            onClick={handleOpenMenu}
            aria-controls={`contact-menu-${contact.id}`}
            aria-haspopup="true"
            className={classes.actionsButton}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            id={`contact-menu-${contact.id}`}
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              className: classes.menuPaper,
              elevation: 2,
            }}
          >
            <MenuItem
              onClick={handleOpenContactDetailsModal}
              className={classes.actionMenuItem}
            >
              <InfoIcon
                fontSize="small"
                style={{ marginRight: 8, color: "#2196F3" }}
              />
              Detalhes do Contato
            </MenuItem>
            <MenuItem
              onClick={handleOpenNewTicket}
              className={classes.actionMenuItem}
            >
              <WhatsAppIcon
                fontSize="small"
                style={{ marginRight: 8, color: "#25D366" }}
              />
              Enviar mensagem
            </MenuItem>
            <MenuItem
              onClick={() => {
                onEditContact(contact.id);
                handleCloseMenu();
              }}
              className={classes.actionMenuItem}
            >
              <EditIcon
                fontSize="small"
                style={{ marginRight: 8, color: "#5D3FD3" }}
              />
              Editar contato
            </MenuItem>
            <Can
              role={user.profile}
              perform="contacts-page:deleteContact"
              yes={() => (
                <MenuItem
                  onClick={() => {
                    setConfirmOpen(true);
                    setDeletingContact(contact);
                    handleCloseMenu();
                  }}
                  style={{ color: "#f44336" }}
                  className={classes.actionMenuItem}
                >
                  <DeleteOutlineIcon
                    fontSize="small"
                    style={{ marginRight: 8 }}
                  />
                  Excluir contato
                </MenuItem>
              )}
            />
          </Menu>
        </div>

        <div className={classes.contactDetailsSection}>
          <div className={classes.emailPhone}>
            <PhoneIcon fontSize="small" />
            <div className={classes.phoneWithFlag}>
              <Flag
                code={getCountryCode(contact.number)}
                className={classes.countryFlag}
              />
              <Typography variant="body2">
                {formatPhoneNumber(contact.number)}
              </Typography>
            </div>
          </div>
          <div className={classes.emailPhone}>
            <EmailIcon fontSize="small" />
            <Typography variant="body2">{contact.email}</Typography>
          </div>

          {contact.extraInfo?.revenue && (
            <Typography variant="body2" className={classes.revenue}>
              Receita Média: R$ {contact.extraInfo.revenue || "15.000"}
            </Typography>
          )}

          {contact.tickets && contact.tickets.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              Tickets: {contact.tickets.length}
            </Typography>
          )}

          {contact.schedules && contact.schedules.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              Agendamentos: {contact.schedules.length}
            </Typography>
          )}
        </div>
      </CardContent>

      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contact}
        onClose={handleCloseNewTicket}
      />

      <ContactDetailsModal
        open={contactDetailsModalOpen}
        onClose={handleCloseContactDetailsModal}
        contactId={contact.id}
      />

      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitle")}`
        }
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteContact}
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
    </Card>
  );
};

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactDetailsModalOpen, setContactDetailsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const fileUploadRef = useRef(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" ou "table"
  const [anchorEl, setAnchorEl] = useState(null);

  const formatPhoneNumber = (number) => {
    if (!number) return "-";

    if (number.startsWith("+")) {
      return number;
    }

    let countryCode = "55";
    let formattedNumber = number;

    if (number.startsWith("1")) {
      countryCode = "1";
    } else if (number.startsWith("351")) {
      countryCode = "351";
    } else if (number.startsWith("55")) {
      countryCode = "55";
    } else if (number.startsWith("54")) {
      countryCode = "54";
    } else if (number.startsWith("598")) {
      countryCode = "598";
    } else if (number.startsWith("595")) {
      countryCode = "595";
    } else if (number.startsWith("591")) {
      countryCode = "591";
    } else if (number.startsWith("56")) {
      countryCode = "56";
    } else if (number.startsWith("51")) {
      countryCode = "51";
    } else if (number.startsWith("57")) {
      countryCode = "57";
    } else if (number.startsWith("58")) {
      countryCode = "58";
    }

    let nationalNumber = formattedNumber.substring(countryCode.length);
    if (nationalNumber.length > 8) {
      if (countryCode === "55" && nationalNumber.length === 11) {
        return `+${countryCode} ${nationalNumber.substring(
          0,
          2
        )} ${nationalNumber.substring(2, 7)}-${nationalNumber.substring(7)}`;
      }
      return `+${countryCode} ${nationalNumber.replace(
        /(\d{3})(\d{3})(\d{4})/,
        "$1 $2 $3"
      )}`;
    }

    return `+${countryCode} ${nationalNumber}`;
  };

  const getCountryCode = (number) => {
    if (!number) return "br";

    if (number.startsWith("1")) return "us";
    if (number.startsWith("351")) return "pt";
    if (number.startsWith("55")) return "br";
    if (number.startsWith("54")) return "ar";
    if (number.startsWith("598")) return "uy";
    if (number.startsWith("595")) return "py";
    if (number.startsWith("591")) return "bo";
    if (number.startsWith("56")) return "cl";
    if (number.startsWith("51")) return "pe";
    if (number.startsWith("57")) return "co";
    if (number.startsWith("58")) return "ve";

    return "br";
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: {
              searchParam,
              pageNumber,
              pageSize: 20,
            },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toast.error(err.message);
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socketInstance = socketManager.getSocket(companyId);

    socketInstance.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [socketManager]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleOpenContactDetailsModal = (contactId) => {
    setSelectedContact(contactId);
    setContactDetailsModalOpen(true);
  };

  const handleCloseContactDetailsModal = () => {
    setSelectedContact(null);
    setContactDetailsModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleScroll = (e) => {
    const { target } = e;
    if (!hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollHeight - scrollTop - clientHeight <= 300) {
      loadMore();
    }
  };

  const paperRef = useRef(null);

  useEffect(() => {
    const paperElement = paperRef.current;
    if (paperElement) {
      paperElement.addEventListener("scroll", handleScroll);
      return () => paperElement.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, loading, contacts]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPageNumber((prevState) => prevState + 1);
    }
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      toast.success("Contatos do WhatsApp importados com sucesso!");
      history.go(0);
    } catch (err) {
      toast.error(err.message || "Erro ao importar contatos do WhatsApp");
    }
  };

  const handleImportExcel = async () => {
    try {
      if (fileUploadRef.current.files[0]) {
        const formData = new FormData();
        formData.append("file", fileUploadRef.current.files[0]);
        await api.request({
          url: `/contacts/upload`,
          method: "POST",
          data: formData,
        });
        toast.success("Contatos importados com sucesso!");
        history.go(0);
      } else {
        toast.error("Por favor, selecione um arquivo Excel para importar");
      }
    } catch (err) {
      toast.error(err.message || "Erro ao importar contatos do Excel");
    }
  };

  const handleOpenMenu = (event, contact) => {
    setAnchorEl(event.currentTarget);
    setContactTicket(contact);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setContactTicket({});
  };

  const getStatusColor = (status) => {
    if (status === "Customer") return "#4caf50";
    if (status === "Lead") return "#ff9800";
    if (status === "Prospect") return "#2196f3";
    if (status === "Inactive") return "#9e9e9e";
    return "#9e9e9e";
  };

  const getStatusLabel = (status) => {
    return status || "Não definido";
  };

  const filteredContacts = contacts;

  return (
    <Container maxWidth="xl" className={classes.container}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ContactDetailsModal
        open={contactDetailsModalOpen}
        onClose={handleCloseContactDetailsModal}
        contactId={selectedContact}
      />
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitle")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : handleimportContact()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.headerContent}>
          <div className={classes.upperHeader}>
            <div className={classes.titleContainer}>
              <Typography className={classes.pageTitle}>
                {i18n.t("contacts.title")}
              </Typography>
            </div>
            <div className={classes.viewButtons}>
              <IconButton
                className={`${classes.viewButton} ${
                  viewMode === "cards" ? "active" : ""
                }`}
                onClick={() => setViewMode("cards")}
              >
                <GridOnIcon />
              </IconButton>
              <IconButton
                className={`${classes.viewButton} ${
                  viewMode === "table" ? "active" : ""
                }`}
                onClick={() => setViewMode("table")}
              >
                <ViewListIcon />
              </IconButton>
            </div>
          </div>

          <div className={classes.controlsContainer}>
            <div className={classes.searchAndFilterContainer}>
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
            </div>

            <div className={classes.actionButtonsContainer}>
              <Button
                variant="contained"
                color="primary"
                className={`${classes.actionButton} ${classes.addButton}`}
                onClick={handleOpenContactModal}
                startIcon={<AddIcon className={classes.buttonIcon} />}
                size="small"
              >
                Adicionar
              </Button>

              <Button
                variant="contained"
                color="primary"
                className={`${classes.actionButton} ${classes.importButton}`}
                onClick={handleimportContact}
                startIcon={<SyncIcon className={classes.buttonIcon} />}
                size="small"
              >
                Importar do WhatsApp
              </Button>

              <Button
                variant="contained"
                color="primary"
                className={`${classes.actionButton} ${classes.importExcelButton}`}
                onClick={() => {
                  fileUploadRef.current.value = null;
                  fileUploadRef.current.click();
                }}
                startIcon={<CloudUploadIcon className={classes.buttonIcon} />}
                size="small"
              >
                Importar Excel
              </Button>

              <CSVLink
                style={{ textDecoration: "none" }}
                separator=";"
                filename={"varity_crm.csv"}
                data={contacts.map((contact) => ({
                  name: contact.name,
                  number: formatPhoneNumber(contact.number),
                  email: contact.email,
                  status: contact.status || "Customer",
                  company:
                    contact.extraInfo?.company ||
                    contact.name.split(" ")[0] + " Enterprises",
                }))}
              >
                <Button
                  variant="contained"
                  color="primary"
                  className={`${classes.actionButton} ${classes.exportButton}`}
                  startIcon={<GetAppIcon className={classes.buttonIcon} />}
                  size="small"
                >
                  Exportar
                </Button>
              </CSVLink>
            </div>
          </div>
        </div>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" ref={paperRef}>
        <>
          <input
            style={{ display: "none" }}
            id="upload"
            name="file"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleImportExcel}
            ref={fileUploadRef}
          />
        </>

        {viewMode === "cards" ? (
          <Grid container spacing={2}>
            {filteredContacts.map((contact) => (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={contact.id}>
                <ContactCard
                  contact={contact}
                  onMenuClick={handleOpenMenu}
                  onEditContact={hadleEditContact}
                  getCountryCode={getCountryCode}
                  formatPhoneNumber={formatPhoneNumber}
                />
              </Grid>
            ))}
            {loading && (
              <Grid item xs={12}>
                <Table>
                  <TableBody>
                    <TableRowSkeleton avatar columns={3} />
                  </TableBody>
                </Table>
              </Grid>
            )}
            {!loading && hasMore && (
              <Grid item xs={12} style={{ textAlign: "center", padding: 16 }}>
                <Button variant="outlined" color="primary" onClick={loadMore}>
                  Carregar mais contatos
                </Button>
              </Grid>
            )}
          </Grid>
        ) : (
          <div className={classes.tableContainer}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center" className={classes.actionsColumn}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className={classes.nameColumn}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={contact.profilePicUrl}
                          style={{ marginRight: 8 }}
                        />
                        <div>
                          <Typography
                            variant="body1"
                            style={{ fontWeight: 500 }}
                          >
                            {contact.name}
                          </Typography>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Flag
                              code={getCountryCode(contact.number)}
                              className={classes.countryFlag}
                            />
                            <Typography variant="body2" color="textSecondary">
                              {formatPhoneNumber(contact.number)}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>
                      {contact.extraInfo?.company ||
                        contact.name.split(" ")[0] + " Enterprises"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(contact.status || "Customer")}
                        size="small"
                        style={{
                          backgroundColor: getStatusColor(
                            contact.status || "Customer"
                          ),
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        aria-controls={`contact-menu-${contact.id}`}
                        aria-haspopup="true"
                        onClick={(e) => handleOpenMenu(e, contact)}
                        className={classes.actionsButton}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        id={`contact-menu-${contact.id}`}
                        anchorEl={anchorEl}
                        keepMounted
                        open={
                          Boolean(anchorEl) && contactTicket.id === contact.id
                        }
                        onClose={handleCloseMenu}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          className: classes.menuPaper,
                          elevation: 2,
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleOpenContactDetailsModal(contact.id);
                            handleCloseMenu();
                          }}
                          className={classes.actionMenuItem}
                        >
                          <InfoIcon
                            fontSize="small"
                            style={{ marginRight: 8, color: "#2196F3" }}
                          />
                          Detalhes do Contato
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setNewTicketModalOpen(true);
                            handleCloseMenu();
                          }}
                          className={classes.actionMenuItem}
                        >
                          <WhatsAppIcon
                            fontSize="small"
                            style={{ marginRight: 8, color: "#25D366" }}
                          />
                          Enviar mensagem
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            hadleEditContact(contact.id);
                            handleCloseMenu();
                          }}
                          className={classes.actionMenuItem}
                        >
                          <EditIcon
                            fontSize="small"
                            style={{ marginRight: 8, color: "#5D3FD3" }}
                          />
                          Editar contato
                        </MenuItem>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <MenuItem
                              onClick={(e) => {
                                setConfirmOpen(true);
                                setDeletingContact(contact);
                                handleCloseMenu();
                              }}
                              style={{ color: "#f44336" }}
                              className={classes.actionMenuItem}
                            >
                              <DeleteOutlineIcon
                                fontSize="small"
                                style={{ marginRight: 8 }}
                              />
                              Excluir contato
                            </MenuItem>
                          )}
                        />
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton avatar columns={5} />}
                {!loading && hasMore && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", padding: 16 }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={loadMore}
                      >
                        Carregar mais contatos
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Paper>
    </Container>
  );
};

export default Contacts;
