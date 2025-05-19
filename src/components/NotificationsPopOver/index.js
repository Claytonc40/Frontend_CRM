import React, { useContext, useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import { useHistory } from "react-router-dom";
import { SocketContext } from "../../context/Socket/SocketContext";

import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import ChatIcon from "@material-ui/icons/Chat";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { toast } from "sonner";
import useSound from "use-sound";

import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import TicketListItem from "../TicketListItemCustom";

const useStyles = makeStyles((theme) => ({
  tabContainer: {
    overflowY: "auto",
    maxHeight: 350,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#5D3FD3",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "rgba(93, 63, 211, 0.05)",
    },
  },
  popoverPaper: {
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      maxWidth: 270,
    },
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    overflow: "hidden",
    border: "1px solid rgba(93, 63, 211, 0.1)",
    animation: "$slideIn 0.3s ease-out",
  },
  "@keyframes slideIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(-10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  noShadow: {
    boxShadow: "none !important",
  },
  notificationHeader: {
    background: "linear-gradient(145deg, #5D3FD3 0%, #7058e6 100%)",
    padding: theme.spacing(1.8, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#FFFFFF",
  },
  notificationTitle: {
    fontWeight: 600,
    color: "#FFFFFF",
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      fontSize: 20,
    },
  },
  notificationIcon: {
    color: "#FFFFFF",
    opacity: 0.9,
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 1,
      transform: "scale(1.1)",
    },
  },
  emptyNotifications: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: "#666",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: theme.spacing(2),
    transition: "all 0.3s ease",
  },
  emptyNotificationsIcon: {
    fontSize: 48,
    color: "#5D3FD3",
    opacity: 0.6,
    marginBottom: theme.spacing(2),
    animation: "$pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
      opacity: 0.6,
    },
    "50%": {
      transform: "scale(1.1)",
      opacity: 0.8,
    },
    "100%": {
      transform: "scale(1)",
      opacity: 0.6,
    },
  },
  badge: {
    backgroundColor: "#5D3FD3",
    transition: "all 0.3s ease",
    "&.MuiBadge-badge": {
      transform: "scale(1) translate(40%, -40%)",
    },
  },
  buttonIcon: {
    color: "#5D3FD3",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#4930A8",
    },
  },
  readAllBtn: {
    margin: theme.spacing(1),
    fontSize: 13,
    color: "#5D3FD3",
    borderColor: "#5D3FD3",
    borderRadius: 20,
    padding: theme.spacing(0.5, 2),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      borderColor: "#4930A8",
      color: "#4930A8",
    },
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1),
    borderTop: "1px solid rgba(0,0,0,0.05)",
  },
  notificationItem: {
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.05)",
    },
  },
}));

const NotificationsPopOver = (volume) => {
  const classes = useStyles();

  const history = useHistory();
  const { user } = useContext(AuthContext);
  const ticketIdUrl = +history.location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [showPendingTickets, setShowPendingTickets] = useState(false);

  const [, setDesktopNotifications] = useState([]);

  const { tickets } = useTickets({ withUnreadMessages: "true" });

  const [play] = useSound(alertSound, volume);
  const soundAlertRef = useRef();

  const historyRef = useRef(history);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (user.allTicket === "enable") {
          setShowPendingTickets(true);
        }
      } catch (err) {
        toast.error(err?.message || "Erro desconhecido");
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    const processNotifications = () => {
      if (showPendingTickets) {
        setNotifications(tickets);
      } else {
        const newNotifications = tickets.filter(
          (ticket) => ticket.status !== "pending"
        );

        setNotifications(newNotifications);
      }
    };

    processNotifications();
  }, [tickets, showPendingTickets]);

  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on("ready", () => socket.emit("joinNotification"));

    socket.on(`company-${user.companyId}-ticket`, (data) => {
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticketId
          );
          if (ticketIndex !== -1) {
            prevState.splice(ticketIndex, 1);
            return [...prevState];
          }
          return prevState;
        });

        setDesktopNotifications((prevState) => {
          const notfiticationIndex = prevState.findIndex(
            (n) => n.tag === String(data.ticketId)
          );
          if (notfiticationIndex !== -1) {
            prevState[notfiticationIndex].close();
            prevState.splice(notfiticationIndex, 1);
            return [...prevState];
          }
          return prevState;
        });
      }
    });

    socket.on(`company-${user.companyId}-appMessage`, (data) => {
      if (
        data.action === "create" &&
        !data.message.fromMe &&
        data.ticket.status !== "pending" &&
        (!data.message.read || data.ticket.status === "pending") &&
        (data.ticket.userId === user?.id || !data.ticket.userId) &&
        (user?.queues?.some((queue) => queue.id === data.ticket.queueId) ||
          !data.ticket.queueId)
      ) {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticket.id
          );
          if (ticketIndex !== -1) {
            prevState[ticketIndex] = data.ticket;
            return [...prevState];
          }
          return [data.ticket, ...prevState];
        });

        const shouldNotNotificate =
          (data.message.ticketId === ticketIdRef.current &&
            document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id) ||
          data.ticket.isGroup;

        if (shouldNotNotificate) return;

        handleNotifications(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, showPendingTickets, socketManager, user.allTicket]);

  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;

    const options = {
      body: `${message.body} - ${format(new Date(), "HH:mm")}`,
      icon: contact.urlPicture,
      tag: ticket.id,
      renotify: true,
    };

    const notification = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      options,
    );

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      historyRef.current.push(`/tickets/${ticket.uuid}`);
      // handleChangeTab(null, ticket.isGroup? "group" : "open");
    };

    setDesktopNotifications((prevState) => {
      const notfiticationIndex = prevState.findIndex(
        (n) => n.tag === notification.tag,
      );
      if (notfiticationIndex !== -1) {
        prevState[notfiticationIndex] = notification;
        return [...prevState];
      }
      return [notification, ...prevState];
    });

    soundAlertRef.current();
  };

  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const NotificationTicket = ({ children }) => {
    return <div onClick={handleClickAway}>{children}</div>;
  };

  return (
    <>
      <Tooltip
        title="Notificações"
        arrow
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
      >
        <IconButton
          onClick={handleClick}
          ref={anchorEl}
          aria-label="Open Notifications"
          color="inherit"
          className={classes.buttonIcon}
          size="medium"
        >
          <Badge
            overlap="rectangular"
            badgeContent={notifications.length}
            color="secondary"
            classes={{ badge: classes.badge }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >
        <div className={classes.notificationHeader}>
          <Typography className={classes.notificationTitle}>
            <NotificationsIcon fontSize="small" />
            Notificações
          </Typography>
          <Badge
            overlap="rectangular"
            badgeContent={notifications.length}
            color="error"
          >
            <IconButton size="small" className={classes.notificationIcon}>
              <ChatIcon fontSize="small" />
            </IconButton>
          </Badge>
        </div>
        <div className={classes.tabContainer}>
          {notifications.length === 0 ? (
            <div className={classes.emptyNotifications}>
              <ChatIcon className={classes.emptyNotificationsIcon} />
              <Typography variant="body2" align="center">
                Nenhuma notificação
              </Typography>
            </div>
          ) : (
            <List>
              {notifications.map((ticket) => (
                <NotificationTicket key={ticket.id}>
                  <div className={classes.notificationItem}>
                    <TicketListItem ticket={ticket} />
                  </div>
                </NotificationTicket>
              ))}
            </List>
          )}
        </div>
        {notifications.length > 0 && (
          <div className={classes.footer}>
            <Button
              variant="outlined"
              size="small"
              className={classes.readAllBtn}
              onClick={handleClickAway}
            >
              Ler todas
            </Button>
          </div>
        )}
      </Popover>
    </>
  );
};

export default NotificationsPopOver;
