import React, { useContext, useEffect, useRef, useState } from "react";

import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { green, grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { format, isSameDay, parseISO } from "date-fns";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "sonner";

import { i18n } from "../../translate/i18n";

import { Tooltip } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";

import AndroidIcon from "@material-ui/icons/Android";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import LockOpenRoundedIcon from "@material-ui/icons/LockOpenRounded";
import LockRoundedIcon from "@material-ui/icons/LockRounded";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ContactTag from "../ContactTag";
import TicketMessagesDialog from "../TicketMessagesDialog";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    borderRadius: 14,
    margin: "10px 0",
    boxShadow: "0 2px 12px rgba(93,63,211,0.06)",
    transition: "box-shadow 0.2s, border 0.2s",
    border: "2px solid transparent",
    "&:hover": {
      boxShadow: "0 4px 24px rgba(93,63,211,0.12)",
      border: "2px solid #5D3FD3",
    },
    "&.Mui-selected": {
      border: "2px solid #5D3FD3",
      boxShadow: "0 4px 24px rgba(93,63,211,0.16)",
      background: "#f7f7fa",
    },
    background: "#fff",
    minHeight: 80,
    alignItems: "center",
    padding: "0 8px",
  },

  pendingTicket: {
    cursor: "unset",
  },
  queueTag: {
    background: "#FCFCFC",
    color: "#000",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  newMessagesCount: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "10px",
    left: "20px",
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.8em",
    whiteSpace: "nowrap",
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
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
    fontWeight: 700,
    fontSize: 18,
    maxWidth: 140,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    top: -21,
    background: "#333333",
    color: "#ffffff",
    border: "1px solid #3a3b6c",
    borderRadius: 5,
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: "0.9em",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "0%",
    marginLeft: "5px",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: green[500],
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  ticketInfo: {
    position: "relative",
    top: -13,
  },
  secondaryContentSecond: {
    display: "flex",
    // marginTop: 5,
    //marginLeft: "5px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },
  ticketInfo1: {
    position: "relative",
    top: 13,
    right: 0,
  },
  Radiusdot: {
    "& .MuiBadge-badge": {
      borderRadius: 2,
      position: "inherit",
      height: 16,
      margin: 2,
      padding: 3,
    },
    "& .MuiBadge-anchorOriginTopRightRectangle": {
      transform: "scale(1) translate(0%, -40%)",
    },
  },
  actionButtonsWrapper: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 0,
    flexWrap: "wrap",
    position: "static",
  },
  compactButton: {
    minWidth: 0,
    padding: "4px 12px",
    fontSize: 13,
    borderRadius: 16,
    fontWeight: 600,
    boxShadow: "0 1px 4px rgba(93,63,211,0.07)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [tag, setTag] = useState([]);
  const [lastInteractionLabel, setLastInteractionLabel] = useState("");
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const [verpreview] = useState(false);
  const { profile } = user;

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name?.toUpperCase());
    }
    setTag(ticket?.tags);

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseTicket = async (id) => {
    setTag(ticket?.tags);
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null,
      });
    } catch (err) {
      setLoading(false);
      toast.errorr(err.message);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  useEffect(() => {
    let timeoutId;
    const renderLastInteractionLabel = () => {
      let labelColor = "";
      let labelText = "";

      if (!ticket.lastMessage) return { labelText: "", labelColor: "" };

      const lastInteractionDate = parseISO(ticket.updatedAt);
      const currentDate = new Date();
      const timeDifference = currentDate - lastInteractionDate;
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      if (minutesDifference >= 3 && minutesDifference <= 10) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = "green";
      } else if (minutesDifference >= 30 && minutesDifference < 60) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = "Orange";
      } else if (minutesDifference > 60 && hoursDifference < 24) {
        labelText = `(${hoursDifference} h atrás)`;
        labelColor = "red";
      } else if (hoursDifference >= 24) {
        labelText = `(${Math.floor(hoursDifference / 24)} dias atrás)`;
        labelColor = "red";
      }

      return { labelText, labelColor };
    };

    // Função para atualizar o estado do componente
    const updateLastInteractionLabel = () => {
      const { labelText, labelColor } = renderLastInteractionLabel();
      if (isMounted.current) {
        setLastInteractionLabel(
          <Badge
            className={classes.lastInteractionLabel}
            style={{ color: labelColor }}
          >
            {labelText}
          </Badge>
        );
        // Agendando a próxima atualização após 30 segundos
        timeoutId = setTimeout(updateLastInteractionLabel, 30 * 1000);
      }
    };

    // Inicializando a primeira atualização
    updateLastInteractionLabel();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [ticket, classes.lastInteractionLabel]);

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
      });
    } catch (err) {
      setLoading(false);
      toast.errorr(err.message);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get("/settings/");

        settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
        toast.errorr(err.message);
      }

      if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
        handleSendMessage(ticket.id);
      }
    } catch (err) {
      setLoading(false);

      toast.errorr(err.message);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    // handleChangeTab(null, "tickets");
    // handleChangeTab(null, "open");
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `*Mensagem Automática:*\n${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toast.errorr(err.message);
    }
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const renderTicketInfo = () => {
    if (ticketUser) {
      return (
        <>
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {/* </span> */}
        </>
      );
    } else {
      return (
        <>
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}
        </>
      );
    }
  };

  return (
    <React.Fragment key={ticket.id}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
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
          title={ticket.queue?.name?.toUpperCase() || "SEM FILA"}
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
              width: 52,
              height: 52,
              border: "2px solid #5D3FD3",
              borderRadius: "50%",
              objectFit: "cover",
              background: "#fff",
              marginTop: 0,
              marginLeft: 0,
              color: "#5D3FD3",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            {!ticket?.contact?.profilePicUrl && ticket?.contact?.name
              ? ticket.contact.name.charAt(0).toUpperCase()
              : null}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
              >
                <strong>
                  {ticket.contact.name} {lastInteractionLabel}
                </strong>
                {profile === "admin" && (
                  <Tooltip title="Espiar Conversa">
                    <VisibilityIcon
                      onClick={() => setOpenTicketMessageDialog(true)}
                      fontSize="small"
                      style={{
                        color: "#5D3FD3",
                        cursor: "pointer",
                        marginLeft: 10,
                        verticalAlign: "middle",
                      }}
                    />
                  </Tooltip>
                )}
              </Typography>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {" "}
                {ticket.lastMessage &&
                ticket.lastMessage.includes("data:image/png;base64") ? (
                  <MarkdownWrapper> Localização</MarkdownWrapper>
                ) : (
                  <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                )}
                {ticket.lastMessage && verpreview ? (
                  <>
                    {ticket.lastMessage.includes("VCARD") ? (
                      <MarkdownWrapper>Novo Contato recebido</MarkdownWrapper>
                    ) : ticket.lastMessage.includes("data:image") ? (
                      <MarkdownWrapper>Localização recebida</MarkdownWrapper>
                    ) : (
                      <MarkdownWrapper>
                        {ticket.lastMessage.slice(0, 20) + "..."}
                      </MarkdownWrapper>
                    )}
                  </>
                ) : (
                  <MarkdownWrapper>---</MarkdownWrapper>
                )}
                <span className={classes.secondaryContentSecond}>
                  {ticket?.whatsapp?.name ? (
                    <Badge className={classes.connectionTag}>
                      {ticket?.whatsapp?.name?.toUpperCase()}
                    </Badge>
                  ) : (
                    <br></br>
                  )}
                  {ticketUser ? (
                    <Badge
                      style={{ backgroundColor: "#000000" }}
                      className={classes.connectionTag}
                    >
                      {ticketUser}
                    </Badge>
                  ) : (
                    <br></br>
                  )}
                  <Badge
                    style={{
                      backgroundColor: ticket.queue?.color || "#7c7c7c",
                    }}
                    className={classes.connectionTag}
                  >
                    {ticket.queue?.name?.toUpperCase() || "SEM FILA"}
                  </Badge>
                </span>
                <span
                  style={{ paddingTop: "2px" }}
                  className={classes.secondaryContentSecond}
                >
                  {tag?.map((tag) => {
                    return (
                      <ContactTag
                        tag={tag}
                        key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
                      />
                    );
                  })}
                </span>
              </Typography>
              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </span>
          }
        />
        <ListItemSecondaryAction>
          <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
          {ticket.lastMessage && (
            <>
              <Typography
                className={classes.lastMessageTime}
                component="span"
                variant="body2"
                color="textSecondary"
              >
                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>
              <br />
            </>
          )}
          <span className={classes.actionButtonsWrapper}>
            {ticket.status === "pending" && (
              <ButtonWithSpinner
                style={{ backgroundColor: "#43a047", color: "white" }}
                variant="contained"
                className={classes.compactButton}
                size="small"
                loading={loading}
                onClick={(e) => handleAcepptTicket(ticket.id)}
                startIcon={<CheckCircleRoundedIcon style={{ fontSize: 18 }} />}
              >
                {i18n.t("ticketsList.buttons.accept")}
              </ButtonWithSpinner>
            )}
            {ticket.status !== "closed" && (
              <ButtonWithSpinner
                style={{ backgroundColor: "#e53935", color: "white" }}
                variant="contained"
                className={classes.compactButton}
                size="small"
                loading={loading}
                onClick={(e) => handleCloseTicket(ticket.id)}
                startIcon={<LockRoundedIcon style={{ fontSize: 18 }} />}
              >
                {i18n.t("ticketsList.buttons.closed")}
              </ButtonWithSpinner>
            )}
            {ticket.status === "closed" && (
              <ButtonWithSpinner
                style={{ backgroundColor: "#e53935", color: "white" }}
                variant="contained"
                className={classes.compactButton}
                size="small"
                loading={loading}
                onClick={(e) => handleReopenTicket(ticket.id)}
                startIcon={<LockOpenRoundedIcon style={{ fontSize: 18 }} />}
              >
                {i18n.t("ticketsList.buttons.reopen")}
              </ButtonWithSpinner>
            )}
          </span>
        </ListItemSecondaryAction>
      </ListItem>
    </React.Fragment>
  );
};

export default TicketListItemCustom;
