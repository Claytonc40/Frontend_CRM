import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { Send } from "lucide-react";
import React, { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
    background: theme.palette.chatlist,
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.palette.chatlist,
    padding: theme.spacing(2, 1, 2, 1),
    display: "flex",
    flexDirection: "column",
  },
  inputArea: {
    position: "relative",
    height: "auto",
    background: "#fff",
    borderTop: "1px solid #eee",
    padding: theme.spacing(1, 2),
  },
  input: {
    padding: "16px",
    fontSize: 15,
    borderRadius: 8,
    background: "#f7f8fa",
  },
  buttonSend: {
    margin: theme.spacing(1),
    color: "#5D3FD3",
    background: "rgba(93,63,211,0.07)",
    borderRadius: 8,
    "&:hover": {
      background: "#5D3FD3",
      color: "#fff",
    },
  },
  boxLeft: {
    padding: "12px 16px 8px 16px",
    margin: "8px 0 8px 8px",
    position: "relative",
    backgroundColor: "#f1f1f7",
    maxWidth: 340,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    border: "1px solid #e0e0e0",
    alignSelf: "flex-start",
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
  },
  boxRight: {
    padding: "12px 16px 8px 16px",
    margin: "8px 8px 8px 0",
    position: "relative",
    backgroundColor: "#5D3FD3",
    color: "#fff",
    textAlign: "right",
    maxWidth: 340,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    border: "1px solid #e0e0e0",
    alignSelf: "flex-end",
    boxShadow: "0 1.5px 6px rgba(93,63,211,0.08)",
  },
  senderName: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 2,
    color: "#5D3FD3",
  },
  senderNameRight: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 2,
    color: "#fff",
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
    wordBreak: "break-word",
  },
  messageTime: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    textAlign: "right",
  },
  messageTimeRight: {
    fontSize: 11,
    color: "#e0e0e0",
    marginTop: 2,
    textAlign: "right",
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();
  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  React.useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            if (item.senderId === user.id) {
              return (
                <Box key={key} className={classes.boxRight}>
                  <Typography className={classes.senderNameRight}>
                    {item.sender.name}
                  </Typography>
                  <div className={classes.messageText}>{item.message}</div>
                  <Typography
                    className={classes.messageTimeRight}
                    display="block"
                  >
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            } else {
              return (
                <Box key={key} className={classes.boxLeft}>
                  <Typography className={classes.senderName}>
                    {item.sender.name}
                  </Typography>
                  <div className={classes.messageText}>{item.message}</div>
                  <Typography className={classes.messageTime} display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            }
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                handleSendMessage(contentMessage);
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    if (contentMessage.trim() !== "") {
                      handleSendMessage(contentMessage);
                      setContentMessage("");
                    }
                  }}
                  className={classes.buttonSend}
                >
                  <Send size={22} />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Paper>
  );
}
