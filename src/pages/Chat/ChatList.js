import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { Edit3, Trash2 } from "lucide-react";
import React, { useContext, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "calc(100% - 58px)",
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: theme.palette.boxlist,
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  listItem: {
    cursor: "pointer",
    borderRadius: 10,
    margin: theme.spacing(0.5, 1),
    transition: "background 0.2s, box-shadow 0.2s",
    "&:hover": {
      background: "rgba(93,63,211,0.07)",
      boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
    },
  },
  selectedItem: {
    borderLeft: "6px solid #5D3FD3",
    background: "rgba(93,63,211,0.04)",
  },
  chip: {
    marginLeft: 5,
    fontWeight: 600,
    background: "#5D3FD3",
    color: "#fff",
  },
  actionButton: {
    color: "#5D3FD3",
    "&:hover": {
      color: "#4930A8",
      background: "rgba(93,63,211,0.08)",
    },
    marginRight: 5,
  },
  deleteButton: {
    color: "#F44336",
    "&:hover": {
      color: "#D32F2F",
      background: "rgba(244,67,54,0.08)",
    },
  },
  primaryText: {
    fontWeight: 600,
    color: "#222",
    fontSize: 15,
    display: "flex",
    alignItems: "center",
  },
  secondaryText: {
    color: "#666",
    fontSize: 13,
    marginTop: 2,
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});
  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    const mainText = chat.title;
    const unreads = unreadMessages(chat);
    return (
      <span className={classes.primaryText}>
        {mainText}
        {unreads > 0 && (
          <Chip size="small" label={unreads} className={classes.chip} />
        )}
      </span>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage !== "" ? (
      <span className={classes.secondaryText}>
        {datetimeToClient(chat.updatedAt)}: {chat.lastMessage}
      </span>
    ) : (
      ""
    );
  };

  const getItemStyle = (chat) => {
    return chat.uuid === id ? classes.selectedItem : "";
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => (
                <ListItem
                  onClick={() => goToMessages(chat)}
                  key={key}
                  className={`${classes.listItem} ${getItemStyle(chat)}`}
                  button
                >
                  <ListItemText
                    primary={getPrimaryText(chat)}
                    secondary={getSecondaryText(chat)}
                  />
                  {chat.ownerId === user.id && (
                    <ListItemSecondaryAction>
                      <Tooltip title="Editar" arrow>
                        <IconButton
                          onClick={() => {
                            goToMessages(chat).then(() => {
                              handleEditChat(chat);
                            });
                          }}
                          edge="end"
                          aria-label="edit"
                          size="small"
                          className={classes.actionButton}
                        >
                          <Edit3 size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir" arrow>
                        <IconButton
                          onClick={() => {
                            setSelectedChat(chat);
                            setConfirmModalOpen(true);
                          }}
                          edge="end"
                          aria-label="delete"
                          size="small"
                          className={classes.deleteButton}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
          </List>
        </div>
      </div>
    </>
  );
}
