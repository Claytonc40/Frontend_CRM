import {
  Avatar,
  Badge,
  Box,
  Collapse,
  List,
  Typography,
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import { isArray } from "lodash";
import {
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Code,
  DollarSign,
  File,
  FileText,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  List as ListIcon,
  LogOut,
  Megaphone,
  MessageSquare,
  MessageSquare as MessageSquareIcon,
  Network,
  Phone,
  RefreshCw,
  Settings,
  Sparkles,
  Table,
  Tag,
  Users,
  Users as UsersIcon,
  Zap,
} from "lucide-react";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Can } from "../components/Can";
import { AuthContext } from "../context/Auth/AuthContext";
import { SocketContext } from "../context/Socket/SocketContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import api from "../services/api";
import { i18n } from "../translate/i18n";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "-10px",
  },
  userProfile: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(3, 2.5, 2, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "background-color 0.2s ease",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 1.5, 1.5, 1.5),
    },
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.03)",
    },
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
  },
  userTextContainer: {
    marginLeft: theme.spacing(2.5),
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: "#5D3FD3", // Roxo conforme a imagem
    color: "#FFFFFF",
    fontSize: 20,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 3px 10px rgba(93, 63, 211, 0.2)",
    },
  },
  userName: {
    fontWeight: 600,
    fontSize: 17,
    color: "#000",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#5D3FD3",
    },
  },
  userRole: {
    fontSize: 13,
    color: "#4CAF50", // Verde semelhante à imagem
    display: "block",
    marginTop: 2,
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 0.8,
    },
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
    display: "inline-block",
    marginLeft: theme.spacing(0.5),
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  menuSection: {
    marginTop: theme.spacing(1),
  },
  menuItem: {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1.5),
    padding: theme.spacing(0.9, 1.5),
    transition: "all 0.2s ease-in-out",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.2, 1),
      padding: theme.spacing(1, 1.2),
    },
    "&.Mui-selected": {
      backgroundColor: "#5D3FD3",
      boxShadow: "0 2px 8px rgba(93, 63, 211, 0.2)",
      "& .MuiListItemIcon-root": {
        color: "#FFFFFF",
      },
      "& .MuiListItemText-primary": {
        color: "#FFFFFF",
        fontWeight: 500,
      },
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 4,
        height: "70%",
        backgroundColor: "#FFFFFF",
        borderRadius: "0 4px 4px 0",
      },
    },
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      transform: "translateX(3px)",
      "& .MuiListItemIcon-root": {
        color: "#5D3FD3",
        transform: "scale(1.1)",
      },
      "& .MuiListItemText-primary": {
        color: "#5D3FD3",
      },
    },
  },
  menuIcon: {
    minWidth: 46,
    color: "#616161",
    transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
  },
  logoutItem: {
    margin: theme.spacing(1, 1.5),
    borderRadius: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    color: "#666",
    padding: theme.spacing(0.75, 1),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(244, 67, 54, 0.08)",
      color: "#F44336",
      transform: "translateX(3px)",
      "& .MuiListItemIcon-root": {
        color: "#F44336",
      },
    },
  },
  logoutIcon: {
    color: "#666",
    minWidth: 36,
    marginRight: theme.spacing(1),
    transition: "color 0.2s ease",
  },
  badge: {
    marginRight: theme.spacing(1),
  },
  categoryHeader: {
    fontSize: 13,
    fontWeight: 500,
    color: "#757575",
    padding: theme.spacing(1.5, 2.5, 0.8, 2.5),
    marginTop: theme.spacing(1),
    letterSpacing: "0.5px",
    transition: "color 0.2s ease",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2, 0.5, 2),
      fontSize: 12,
    },
    "&:hover": {
      color: "#5D3FD3",
    },
  },
  versionText: {
    fontSize: 11,
    textAlign: "center",
    opacity: 0.7,
    padding: theme.spacing(1),
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 1,
    },
  },
  menuContainer: {
    flex: 1,
    overflowY: "auto",
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
    [theme.breakpoints.down("sm")]: {
      paddingBottom: theme.spacing(8),
    },
  },
  collapsedMenuItem: {
    justifyContent: "center",
    padding: theme.spacing(1.5),
    margin: theme.spacing(1, 0),
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      backgroundColor: "rgba(93, 63, 211, 0.1)",
      "& .MuiListItemIcon-root": {
        color: "#5D3FD3",
      },
    },
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      transform: "scale(1.1)",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "auto",
      margin: 0,
      fontSize: 24,
      transition: "transform 0.2s ease",
    },
  },
  collapsedCategorySpace: {
    height: theme.spacing(2),
  },
  collapsedUserProfile: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.03)",
    },
  },
  collapsedAvatar: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    backgroundColor: "#5D3FD3",
    color: "#FFFFFF",
    fontSize: 16,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 2px 8px rgba(93, 63, 211, 0.25)",
    },
  },
}));

function ListItemLink(props) {
  const classes = useStyles();
  const { icon, primary, to, className, selected, onClick, collapsed } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} onClick={onClick} />
      )),
    [to, onClick],
  );

  return (
    <li>
      <ListItem
        button
        dense
        component={renderLink}
        className={`${classes.menuItem} ${className || ""} ${
          collapsed ? classes.collapsedMenuItem : ""
        }`}
        selected={selected}
      >
        {icon ? (
          <ListItemIcon className={classes.menuIcon}>
            {React.cloneElement(icon, {
              style: { fontSize: collapsed ? 24 : 22 },
            })}
          </ListItemIcon>
        ) : null}
        {!collapsed && (
          <ListItemText
            primary={primary}
            primaryTypographyProps={{
              style: { fontSize: 15, transition: "color 0.2s ease" },
            }}
          />
        )}
      </ListItem>
    </li>
  );
}

const initialState = {
  chats: [],
  version: null,
  ticketsUnread: 0,
  chatsUnread: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      const chats = action.payload;
      const newChats = [];

      if (isArray(chats)) {
        chats.forEach((chat) => {
          const chatIndex = state.chats.findIndex((u) => u.id === chat.id);
          if (chatIndex !== -1) {
            state.chats[chatIndex] = chat;
          } else {
            newChats.push(chat);
          }
        });
      }

      return {
        ...state,
        chats: [...state.chats, ...newChats],
      };

    case "UPDATE_CHATS":
      const chat = action.payload;
      const chatIndex = state.chats.findIndex((u) => u.id === chat.id);

      if (chatIndex !== -1) {
        state.chats[chatIndex] = chat;
        return {
          ...state,
          chats: [...state.chats],
        };
      } else {
        return {
          ...state,
          chats: [chat, ...state.chats],
        };
      }

    case "DELETE_CHAT":
      const chatId = action.payload;
      const deleteIndex = state.chats.findIndex((u) => u.id === chatId);

      if (deleteIndex !== -1) {
        state.chats.splice(deleteIndex, 1);
      }

      return {
        ...state,
        chats: [...state.chats],
      };

    case "RESET":
      return initialState;

    case "CHANGE_CHAT":
      const changedChats = state.chats.map((chat) => {
        if (chat.id === action.payload.chat.id) {
          return action.payload.chat;
        }
        return chat;
      });
      return {
        ...state,
        chats: changedChats,
      };

    case "SET_VERSION":
      return {
        ...state,
        version: action.payload,
      };

    case "SET_TICKETS_UNREAD":
      return {
        ...state,
        ticketsUnread: action.payload,
      };

    case "SET_CHATS_UNREAD":
      return {
        ...state,
        chatsUnread: action.payload,
      };

    default:
      return state;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose, collapsed } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, initialState);
  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  const { socketConnection } = useContext(SocketContext);

  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    async function fetchVersion() {
      try {
        const { data } = await api.get("/version");
        if (isMounted) {
          dispatch({ type: "SET_VERSION", payload: data.version });
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchVersion();
  }, [isMounted]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user || !user.companyId) {
          console.error("ID da empresa não disponível");
          return;
        }

        const companyId = user.companyId;
        const planConfigs = await getPlanCompany(undefined, companyId);

        if (planConfigs && planConfigs.plan) {
          setShowCampaigns(planConfigs.plan.useCampaigns || false);
          setShowKanban(planConfigs.plan.useKanban || false);
          setShowOpenAi(planConfigs.plan.useOpenAi || false);
          setShowIntegrations(planConfigs.plan.useIntegrations || false);
          setShowSchedules(planConfigs.plan.useSchedules || false);
          setShowInternalChat(planConfigs.plan.useInternalChat || false);
          setShowExternalApi(planConfigs.plan.useExternalApi || false);
        } else {
          console.error("Configurações do plano não disponíveis");
        }
      } catch (err) {
        console.error("Erro ao buscar configurações do plano:", err);
      }
    }

    if (user && user.companyId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!socketConnection) return;

    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    const socket = socketConnection.getSocket(companyId);
    if (!socket) return;

    const handleChatUpdate = (data) => {
      try {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      } catch (err) {
        console.error("Erro ao processar atualização do chat:", err);
      }
    };

    socket.on(`company-${companyId}-chat`, handleChatUpdate);

    return () => {
      if (socket) {
        socket.off(`company-${companyId}-chat`, handleChatUpdate);
      }
    };
  }, [socketConnection]);

  useEffect(() => {
    if (!socketConnection) return;

    const handleTicketUpdate = (data) => {
      try {
        if (isMounted) {
          dispatch({ type: "SET_TICKETS_UNREAD", payload: data });
        }
      } catch (err) {
        console.error("Erro ao processar atualização do ticket:", err);
      }
    };

    const handleChatUpdate = (data) => {
      try {
        if (isMounted) {
          dispatch({ type: "SET_CHATS_UNREAD", payload: data });
        }
      } catch (err) {
        console.error("Erro ao processar atualização do chat:", err);
      }
    };

    socketConnection.on("ticket:update", handleTicketUpdate);
    socketConnection.on("chat:update", handleChatUpdate);

    return () => {
      if (socketConnection) {
        socketConnection.off("ticket:update", handleTicketUpdate);
        socketConnection.off("chat:update", handleChatUpdate);
      }
    };
  }, [socketConnection, isMounted]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.chats.length > 0) {
      for (let chat of chats.chats) {
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
  }, [chats.chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      if (isMounted) {
        dispatch({ type: "LOAD_CHATS", payload: data.records });
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
    }
  };

  const handleClickLogout = () => {
    handleLogout();
  };

  // Update selectedItem whenever location changes
  useEffect(() => {
    setSelectedItem(location.pathname);

    // Open campaign submenu if current route is related to campaigns
    if (
      location.pathname.includes("/campaigns") ||
      location.pathname.includes("/contact-lists")
    ) {
      setOpenCampaignSubmenu(true);
    }
  }, [location]);

  // Listen for navigation events
  useEffect(() => {
    const handleRouteChange = () => {
      setSelectedItem(window.location.pathname);
    };

    // Listen for history changes
    history.listen(handleRouteChange);

    // Set initial value
    setSelectedItem(window.location.pathname);

    return () => {
      // Cleanup not needed for history.listen in react-router-dom v5
      // but good practice for potential future updates
    };
  }, [history]);

  // Helper function to get first initial of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Handle click on menu item - update active state immediately
  const handleMenuItemClick = (path) => {
    setSelectedItem(path);
    if (document.body.offsetWidth < 600) {
      drawerClose();
    }
  };

  return (
    <div onClick={drawerClose} className={classes.menuContainer}>
      {!collapsed ? (
        <Box className={classes.userProfile}>
          <div className={classes.userInfo}>
            <Avatar className={classes.avatar}>{getInitials(user.name)}</Avatar>
            <div className={classes.userTextContainer}>
              <Typography variant="subtitle1" className={classes.userName}>
                {user.name}
                <span className={classes.onlineIndicator}></span>
              </Typography>
              <Typography variant="body2" className={classes.userRole}>
                {user.profile}
              </Typography>
            </div>
          </div>
        </Box>
      ) : (
        <Box className={classes.collapsedUserProfile}>
          <Avatar className={classes.collapsedAvatar}>
            {getInitials(user.name)}
          </Avatar>
        </Box>
      )}

      <Divider />

      {!collapsed && (
        <Typography className={classes.categoryHeader}>Principal</Typography>
      )}
      {collapsed && <div className={classes.collapsedCategorySpace} />}

      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/"
            primary="Dashboard"
            icon={<LayoutDashboard size={22} />}
            selected={selectedItem === "/"}
            onClick={() => handleMenuItemClick("/")}
            collapsed={collapsed}
          />
        )}
      />

      <ListItemLink
        to="/tickets"
        primary="Atendimentos"
        icon={<MessageSquare size={22} />}
        selected={selectedItem === "/tickets"}
        onClick={() => handleMenuItemClick("/tickets")}
        collapsed={collapsed}
      />

      {showKanban && (
        <ListItemLink
          to="/kanban"
          primary="Kanban"
          icon={<Table size={22} />}
          selected={selectedItem === "/kanban"}
          onClick={() => handleMenuItemClick("/kanban")}
          collapsed={collapsed}
        />
      )}

      <ListItemLink
        to="/contacts"
        primary="Contatos"
        icon={<Phone size={22} />}
        selected={selectedItem === "/contacts"}
        onClick={() => handleMenuItemClick("/contacts")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/chats"
        primary="Chat Interno"
        icon={
          <Badge
            color="secondary"
            variant="dot"
            invisible={invisible}
            className={classes.badge}
          >
            <MessageSquareIcon size={22} />
          </Badge>
        }
        selected={selectedItem === "/chats"}
        onClick={() => handleMenuItemClick("/chats")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary="Respostas Rápidas"
        icon={<Zap size={22} />}
        selected={selectedItem === "/quick-messages"}
        onClick={() => handleMenuItemClick("/quick-messages")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/todolist"
        primary="Tarefas"
        icon={<FileText size={22} />}
        selected={selectedItem === "/todolist"}
        onClick={() => handleMenuItemClick("/todolist")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/schedules"
        primary="Agendamentos"
        icon={<Calendar size={22} />}
        selected={selectedItem === "/schedules"}
        onClick={() => handleMenuItemClick("/schedules")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/tags"
        primary="Tags"
        icon={<Tag size={22} />}
        selected={selectedItem === "/tags"}
        onClick={() => handleMenuItemClick("/tags")}
        collapsed={collapsed}
      />

      <ListItemLink
        to="/helps"
        primary="Ajuda"
        icon={<HelpCircle size={22} />}
        selected={selectedItem === "/helps"}
        onClick={() => handleMenuItemClick("/helps")}
        collapsed={collapsed}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider style={{ margin: "16px 0 8px 0" }} />

            {!collapsed && (
              <Typography className={classes.categoryHeader}>
                Administração
              </Typography>
            )}
            {collapsed && <div className={classes.collapsedCategorySpace} />}

            {showCampaigns && (
              <>
                <ListItem
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                  className={classes.menuItem}
                  selected={
                    selectedItem.includes("/campaigns") ||
                    selectedItem.includes("/contact-lists")
                  }
                >
                  <ListItemIcon className={classes.menuIcon}>
                    <CalendarCheck size={22} />
                  </ListItemIcon>
                  <ListItemText primary="Campanhas" />
                  {openCampaignSubmenu ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem
                      onClick={() => {
                        history.push("/campaigns");
                        handleMenuItemClick("/campaigns");
                      }}
                      button
                      className={classes.menuItem}
                      selected={selectedItem === "/campaigns"}
                    >
                      <ListItemIcon className={classes.menuIcon}>
                        <ListIcon size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </ListItem>
                    <ListItem
                      onClick={() => {
                        history.push("/contact-lists");
                        handleMenuItemClick("/contact-lists");
                      }}
                      button
                      className={classes.menuItem}
                      selected={selectedItem === "/contact-lists"}
                    >
                      <ListItemIcon className={classes.menuIcon}>
                        <UsersIcon size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>
                    <ListItem
                      onClick={() => {
                        history.push("/campaigns-config");
                        handleMenuItemClick("/campaigns-config");
                      }}
                      button
                      className={classes.menuItem}
                      selected={selectedItem === "/campaigns-config"}
                    >
                      <ListItemIcon className={classes.menuIcon}>
                        <Settings size={22} />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary="Informativos"
                icon={<Megaphone size={22} />}
                selected={selectedItem === "/announcements"}
                onClick={() => handleMenuItemClick("/announcements")}
                collapsed={collapsed}
              />
            )}

            {showOpenAi && (
              <ListItemLink
                to="/prompts"
                primary="Open.AI"
                icon={<Sparkles size={22} />}
                selected={selectedItem === "/prompts"}
                onClick={() => handleMenuItemClick("/prompts")}
                collapsed={collapsed}
              />
            )}

            {showIntegrations && (
              <ListItemLink
                to="/queue-integration"
                primary="Integrações"
                icon={<Network size={22} />}
                selected={selectedItem === "/queue-integration"}
                onClick={() => handleMenuItemClick("/queue-integration")}
                collapsed={collapsed}
              />
            )}

            <ListItemLink
              to="/connections"
              primary="Conexões"
              icon={
                <Badge
                  badgeContent={connectionWarning ? "!" : 0}
                  color="error"
                  className={classes.badge}
                >
                  <RefreshCw size={22} />
                </Badge>
              }
              selected={selectedItem === "/connections"}
              onClick={() => handleMenuItemClick("/connections")}
              collapsed={collapsed}
            />

            {/* <ListItemLink
              to="/files"
              primary="Lista de arquivos"
              icon={<File size={22} />}
              selected={selectedItem === "/files"}
              onClick={() => handleMenuItemClick("/files")}
              collapsed={collapsed}
            /> */}

            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<GitBranch size={22} />}
              selected={selectedItem === "/queues"}
              onClick={() => handleMenuItemClick("/queues")}
              collapsed={collapsed}
            />

            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<Users size={22} />}
              selected={selectedItem === "/users"}
              onClick={() => handleMenuItemClick("/users")}
              collapsed={collapsed}
            />

            {showExternalApi && (
              <ListItemLink
                to="/messages-api"
                primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                icon={<Code size={22} />}
                selected={selectedItem === "/messages-api"}
                onClick={() => handleMenuItemClick("/messages-api")}
                collapsed={collapsed}
              />
            )}

            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<DollarSign size={22} />}
              selected={selectedItem === "/financeiro"}
              onClick={() => handleMenuItemClick("/financeiro")}
              collapsed={collapsed}
            />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<Settings size={22} />}
              selected={selectedItem === "/settings"}
              onClick={() => handleMenuItemClick("/settings")}
              collapsed={collapsed}
            />

            {!collapsed && (
              <>
                <Divider style={{ margin: "16px 0 8px 0" }} />
                <Typography className={classes.versionText}>
                  {`${chats.version}`}
                </Typography>
              </>
            )}
          </>
        )}
      />

      {!collapsed && (
        <>
          <Divider style={{ margin: "16px 0 8px 0" }} />
          <ListItem
            button
            onClick={handleClickLogout}
            className={classes.logoutItem}
          >
            <ListItemIcon className={classes.logoutIcon}>
              <LogOut size={22} />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItem>
        </>
      )}
    </div>
  );
};

export default MainListItems;
