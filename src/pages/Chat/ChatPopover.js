import {
  Badge,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import { isArray } from "lodash";
import { MessageSquare } from "lucide-react";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

import useSound from "use-sound";
import notifySound from "../../assets/chat_notify.mp3";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 400,
    maxWidth: 360,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderRadius: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    border: "1px solid rgba(93, 63, 211, 0.1)",
    animation: "$slideIn 0.3s ease-out",
    background: "#fff",
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
  chatHeader: {
    padding: theme.spacing(2),
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "linear-gradient(145deg, #5D3FD3 0%, #7058e6 100%)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& svg": {
      fontSize: 22,
    },
  },
  buttonIcon: {
    color: "#5D3FD3",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#4930A8",
    },
  },
  badge: {
    backgroundColor: "#5D3FD3",
    transition: "all 0.3s ease",
    fontWeight: 600,
    fontSize: 13,
    padding: "0 4px",
  },
  chatItem: {
    margin: theme.spacing(1, 0),
    transition: "all 0.2s ease",
    borderRadius: 8,
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.07)",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
      cursor: "pointer",
    },
  },
  chatName: {
    fontWeight: 600,
    color: "#333",
    fontSize: 14,
  },
  chatDate: {
    fontSize: 12,
    color: "#666",
    marginRight: theme.spacing(1),
  },
  emptyChats: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: "#666",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: theme.spacing(2),
  },
  emptyIcon: {
    fontSize: 48,
    color: "#5D3FD3",
    opacity: 0.6,
    marginBottom: theme.spacing(2),
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

export default function ChatPopover() {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { socketConnection } = useContext(SocketContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!socketConnection) return;

    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const socket = socketConnection.getSocket(companyId);
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (!isMounted) return;

      try {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
          play();
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      } catch (err) {
        console.error("Erro ao processar mensagem:", err);
      }
    };

    socket.on(`company-${companyId}-chat`, handleNewMessage);

    return () => {
      if (socket) {
        socket.off(`company-${companyId}-chat`, handleNewMessage);
      }
    };
  }, [socketConnection, isMounted, play]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isMounted) {
        fetchChats();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, isMounted]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      if (isMounted) {
        dispatch({ type: "LOAD_CHATS", payload: data.records });
        setHasMore(data.records.length > 0);
      }
    } catch (err) {
      if (isMounted) {
        if (err.response?.status === 401) {
          // Redirecionar para login se não estiver autenticado
          history.push("/login");
        } else {
          toast.error(err.response?.data?.error || "Erro ao carregar chats");
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && isMounted) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToMessages = (chat) => {
    handleClose();
    history.push(`/chats/${chat.id}`);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Tooltip
        title="Chat Interno"
        arrow
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
      >
        <IconButton
          aria-describedby={id}
          variant="contained"
          onClick={handleClick}
          className={classes.buttonIcon}
          size="medium"
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={invisible}
            classes={{ badge: classes.badge }}
          >
            <MessageSquare size={22} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
        >
          <div className={classes.chatHeader}>
            <Typography className={classes.headerTitle}>
              <MessageSquare size={20} />
              Chat Interno
            </Typography>
            <Badge
              color="error"
              badgeContent={chats.length}
              max={99}
              classes={{ badge: classes.badge }}
            >
              <MessageSquare size={20} />
            </Badge>
          </div>
          <List component="nav" aria-label="chat list">
            {isArray(chats) && chats.length > 0 ? (
              chats.map((chat) => {
                let showUnreadBadge = false;
                let unreadsCount = 0;
                if (chat.users && isArray(chat.users)) {
                  for (let chatUser of chat.users) {
                    if (chatUser.userId === user.id) {
                      showUnreadBadge = chatUser.unreads > 0;
                      unreadsCount = chatUser.unreads;
                    }
                  }
                }
                return (
                  <ListItem
                    key={chat.id}
                    className={classes.chatItem}
                    button
                    onClick={() => goToMessages(chat)}
                  >
                    <ListItemText
                      primary={
                        <Typography className={classes.chatName}>
                          {chat.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          component="span"
                          className={classes.chatDate}
                        >
                          {datetimeToClient(chat.updatedAt)}
                        </Typography>
                      }
                    />
                    {showUnreadBadge && (
                      <Badge
                        color="secondary"
                        badgeContent={unreadsCount}
                        style={{ marginRight: 8 }}
                        classes={{ badge: classes.badge }}
                      ></Badge>
                    )}
                  </ListItem>
                );
              })
            ) : (
              <div className={classes.emptyChats}>
                <MessageSquare className={classes.emptyIcon} />
                <Typography>Nenhuma conversa</Typography>
              </div>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
