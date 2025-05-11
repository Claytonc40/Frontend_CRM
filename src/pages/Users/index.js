import {
  Avatar,
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { Edit, Plus, Trash2, Users as UsersIcon } from "lucide-react";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import UserModal from "../../components/UserModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    minHeight: "100vh",
  },
  searchContainer: {
    flex: 1,
    maxWidth: 480,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  searchInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  addButton: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    borderRadius: "50%",
    width: 56,
    height: 56,
    background: "linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)",
    boxShadow: "0 4px 12px rgba(93,63,211,0.15)",
    "&:hover": {
      background: "linear-gradient(90deg, #4930A8 0%, #6A5ACD 100%)",
    },
    zIndex: 10,
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  pageTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(2),
    position: "relative",
    display: "inline-block",
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
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(2),
    height: "100%",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  userAvatar: {
    width: 48,
    height: 48,
    background: "linear-gradient(45deg, #5D3FD3 30%, #7B68EE 90%)",
    fontSize: "1.2rem",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 600,
    color: "#333",
    fontSize: "1.1rem",
    marginBottom: 2,
  },
  userEmail: {
    color: "#666",
    fontSize: "0.9rem",
  },
  cardContent: {
    padding: theme.spacing(1, 0),
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    "&:last-child": {
      marginBottom: 0,
    },
  },
  infoLabel: {
    color: "#666",
    fontSize: "0.9rem",
    width: 80,
  },
  infoValue: {
    color: "#333",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid #e3e6fd",
  },
  actionButton: {
    padding: theme.spacing(1),
    color: "#555",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      transform: "scale(1.1)",
    },
  },
  editButton: {
    color: "#5D3FD3",
    "&:hover": {
      color: "#4930A8",
    },
  },
  deleteButton: {
    color: "#F44336",
    "&:hover": {
      color: "#D32F2F",
    },
  },
  noUsersContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noUsersIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noUsersText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: "1.1rem",
    maxWidth: 300,
    textAlign: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Users = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          const usersWithData = data.users.map((user) => ({
            ...user,
            whatsapp: user.whatsapp || null,
            allTicket: user.allTicket || "desabled",
            queues: user.queues || [],
          }));
          dispatch({ type: "LOAD_USERS", payload: usersWithData });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-user`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingUser(null);
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <MainContainer>
      <Paper className={classes.mainPaper} elevation={0}>
        <IconButton
          className={classes.addButton}
          color="primary"
          onClick={handleOpenUserModal}
        >
          <Plus size={24} color="#fff" />
        </IconButton>
        <ConfirmationModal
          title={
            deletingUser &&
            `${i18n.t("users.confirmationModal.deleteTitle")} ${
              deletingUser.name
            }?`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteUser(deletingUser.id)}
        >
          {i18n.t("users.confirmationModal.deleteMessage")}
        </ConfirmationModal>
        <UserModal
          open={userModalOpen}
          onClose={handleCloseUserModal}
          aria-labelledby="form-dialog-title"
          userId={selectedUser && selectedUser.id}
        />
        <Box className={classes.headerContainer}>
          <Box display="flex" alignItems="center" gap={2}>
            <UsersIcon size={32} style={{ color: "#5D3FD3" }} />
            <Typography className={classes.pageTitle} component="h1">
              {i18n.t("users.title")}{" "}
              <span style={{ color: "#888", fontWeight: 400 }}>
                ({users.length})
              </span>
            </Typography>
          </Box>
          <Box className={classes.searchContainer}>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              className={classes.searchInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {users.length === 0 && !loading ? (
          <div className={classes.noUsersContainer}>
            <UsersIcon className={classes.noUsersIcon} />
            <Typography className={classes.noUsersText}>
              {searchParam
                ? "Nenhum usuário encontrado com esse termo."
                : "Nenhum usuário cadastrado. Clique no botão abaixo para adicionar."}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Paper className={classes.card}>
                  <div className={classes.cardHeader}>
                    <Avatar className={classes.userAvatar}>
                      {getInitials(user.name)}
                    </Avatar>
                    <div className={classes.userInfo}>
                      <Typography className={classes.userName}>
                        {user.name}
                      </Typography>
                      <Typography className={classes.userEmail}>
                        {user.email}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.cardContent}>
                    <div className={classes.infoRow}>
                      <Typography className={classes.infoLabel}>
                        Perfil:
                      </Typography>
                      <Typography className={classes.infoValue}>
                        {user.profile === "admin" ? "Administrador" : "Usuário"}
                      </Typography>
                    </div>
                    <div className={classes.infoRow}>
                      <Typography className={classes.infoLabel}>
                        Filas:
                      </Typography>
                      <Typography className={classes.infoValue}>
                        {user.queues && user.queues.length > 0
                          ? user.queues.map((queue) => queue.name).join(", ")
                          : "Nenhuma fila"}
                      </Typography>
                    </div>
                    <div className={classes.infoRow}>
                      <Typography className={classes.infoLabel}>
                        Conexão:
                      </Typography>
                      <Typography className={classes.infoValue}>
                        {user.whatsapp && user.whatsapp.name
                          ? user.whatsapp.name
                          : "Sem conexão"}
                      </Typography>
                    </div>
                    <div className={classes.infoRow}>
                      <Typography className={classes.infoLabel}>
                        Tickets sem fila:
                      </Typography>
                      <Typography className={classes.infoValue}>
                        {user.allTicket === "enabled"
                          ? "Permitido"
                          : "Não permitido"}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.cardActions}>
                    <Tooltip title="Editar" arrow placement="top">
                      <IconButton
                        size="small"
                        className={`${classes.actionButton} ${classes.editButton}`}
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir" arrow placement="top">
                      <IconButton
                        size="small"
                        className={`${classes.actionButton} ${classes.deleteButton}`}
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingUser(user);
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Users;
