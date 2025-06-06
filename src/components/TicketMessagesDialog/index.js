import React, { useContext, useEffect, useState } from "react";

import { toast } from "sonner";

import api from "../../services/api";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import MessagesList from "../MessagesList";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    background: "#fafbfc",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: theme.spacing(2, 2, 2, 2),
  },
  dialogPaper: {
    borderRadius: 18,
    boxShadow: "0 8px 32px rgba(93,63,211,0.12)",
    background: "#fff",
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    justifyContent: "flex-end",
    background: "#fafbfc",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  closeButton: {
    background: "#5D3FD3",
    color: "#fff",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 16,
    padding: "8px 28px",
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    "&:hover": {
      background: "#4930A8",
    },
  },
  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

export default function TicketMessagesDialog({ open, handleClose, ticketId }) {
  const history = useHistory();
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    let delayDebounceFn = null;
    if (open) {
      setLoading(true);
      delayDebounceFn = setTimeout(() => {
        const fetchTicket = async () => {
          try {
            const { data } = await api.get("/tickets/" + ticketId);
            const { queueId } = data;
            const { queues, profile } = user;

            const queueAllowed = queues.find((q) => q.id === queueId);
            if (queueAllowed === undefined && profile !== "admin") {
              toast.error("Acesso não permitido");
              history.push("/tickets");
              return;
            }

            setContact(data.contact);
            setTicket(data);
            setLoading(false);
          } catch (err) {
            setLoading(false);
            toast.error(err.message);
          }
        };
        fetchTicket();
      }, 500);
    }
    return () => {
      if (delayDebounceFn !== null) {
        clearTimeout(delayDebounceFn);
      }
    };
  }, [ticketId, user, history, open]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    let socket = null;

    if (open) {
      const socket = socketManager.getSocket(companyId);
      socket.on("ready", () => socket.emit("joinChatBox", `${ticket.id}`));

      socket.on(`company-${companyId}-ticket`, (data) => {
        if (data.action === "update" && data.ticket.id === ticket.id) {
          setTicket(data.ticket);
        }

        if (data.action === "delete" && data.ticketId === ticket.id) {
          // toast.success("Ticket deleted sucessfully.");
          history.push("/tickets");
        }
      });

      socket.on(`company-${companyId}-contact`, (data) => {
        if (data.action === "update") {
          setContact((prevState) => {
            if (prevState.id === data.contact?.id) {
              return { ...prevState, ...data.contact };
            }
            return prevState;
          });
        }
      });
    }

    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [ticketId, ticket, history, open, socketManager]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const renderTicketInfo = () => {
    if (ticket.user !== undefined) {
      return (
        <TicketInfo
          contact={contact}
          ticket={ticket}
          onClick={handleDrawerOpen}
        />
      );
    }
  };

  const renderMessagesList = () => {
    return (
      <Box className={classes.root}>
        <MessagesList
          ticket={ticket}
          ticketId={ticket.id}
          isGroup={ticket.isGroup}
        ></MessagesList>
      </Box>
    );
  };

  return (
    <Dialog
      maxWidth="md"
      onClose={handleClose}
      open={open}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <TicketHeader loading={loading}>{renderTicketInfo()}</TicketHeader>
      <ReplyMessageProvider>{renderMessagesList()}</ReplyMessageProvider>
      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleClose}
          className={classes.closeButton}
          startIcon={<CloseIcon />}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
