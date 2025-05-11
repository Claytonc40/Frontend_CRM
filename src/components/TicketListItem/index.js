import { Tooltip } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { format, isSameDay, parseISO } from "date-fns";
import { CheckCircle } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    borderRadius: 8,
    margin: "6px 0",
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    transition: "all 0.2s",
    border: "1px solid transparent",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
      border: "1px solid #5D3FD3",
    },
    "&.Mui-selected": {
      border: "1px solid #5D3FD3",
      boxShadow: "0 2px 8px rgba(93,63,211,0.12)",
      background: "#f7f7fa",
    },
    background: "#fff",
    minHeight: 64,
    alignItems: "center",
    padding: "0 6px",
  },

  pendingTicket: {
    cursor: "unset",
    opacity: 0.7,
  },

  noTicketsDiv: {
    display: "flex",
    height: "80px",
    margin: 24,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  noTicketsText: {
    textAlign: "center",
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  contactName: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: 14,
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  lastMessageTime: {
    color: "#666",
    fontSize: 12,
    marginLeft: 8,
    minWidth: 48,
    textAlign: "right",
  },

  closedBadge: {
    alignSelf: "center",
    marginLeft: 6,
    background: "#5D3FD3",
    color: "#fff",
    fontWeight: 600,
    fontSize: 11,
    borderRadius: 4,
    padding: "1px 8px",
  },

  contactLastMessage: {
    color: "#666",
    fontSize: 13,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  newMessagesCount: {
    marginLeft: 8,
    background: "#5D3FD3",
    color: "#fff",
    fontWeight: 600,
    fontSize: 12,
    borderRadius: 4,
    padding: "1px 6px",
    minWidth: 24,
    textAlign: "center",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#5D3FD3",
    color: "#fff",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 13,
    boxShadow: "0 1px 4px rgba(93,63,211,0.10)",
    padding: "6px 16px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    "&:hover": {
      background: "#4930A8",
    },
  },

  ticketQueueColor: {
    flex: "none",
    width: "4px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
}));

const TicketListItem = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (ticket) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
    toast.error;
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };
  console.log("🚀 Console Log : ticket.lastMessage", ticket.lastMessage);

  const handleSelectTicket = (ticket) => {
    history.push(`/tickets/${ticket.uuid}`);
  };

  return (
    <React.Fragment key={ticket.id}>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || "Sem fila"}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          <Avatar
            src={ticket?.contact?.profilePicUrl}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #5D3FD3",
              borderRadius: "50%",
              objectFit: "cover",
              background: "#fff",
            }}
          />
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <span className={classes.contactName}>{ticket.contact.name}</span>
              {ticket.status === "closed" && (
                <span className={classes.closedBadge}>Fechado</span>
              )}
              {ticket.lastMessage && (
                <span className={classes.lastMessageTime}>
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </span>
              )}
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <span className={classes.contactLastMessage}>
                {ticket.lastMessage ? (
                  ticket.lastMessage.includes("VCARD") ? (
                    "Novo contato recebido..."
                  ) : (
                    <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                  )
                ) : (
                  <br />
                )}
              </span>
              {ticket.unreadMessages > 0 && (
                <span className={classes.newMessagesCount}>
                  {ticket.unreadMessages}
                </span>
              )}
            </span>
          }
        />
        {ticket.status === "pending" && (
          <ButtonWithSpinner
            color="primary"
            variant="contained"
            className={classes.acceptButton}
            size="small"
            loading={loading}
            onClick={(e) => handleAcepptTicket(ticket)}
            startIcon={<CheckCircle size={16} />}
          >
            {i18n.t("ticketsList.buttons.accept")}
          </ButtonWithSpinner>
        )}
      </ListItem>
    </React.Fragment>
  );
};

export default TicketListItem;
