import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Bell, BellRing, Megaphone, MessageSquare, User } from "lucide-react";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";

import { toast } from "sonner";
import BackdropLoading from "../components/BackdropLoading";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import { i18n } from "../translate/i18n";
import MainListItems from "./MainListItems";

import { SocketContext } from "../context/Socket/SocketContext";

import { useDate } from "../hooks/useDate";

import ColorModeContext from "../layout/themeContext";

import AnnouncementsPopover from "../components/AnnouncementsPopover";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import ChatPopover from "../pages/Chat/ChatPopover";

const drawerWidth = 280;
const closedDrawerWidth = 80;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.type === "light" ? "#FFF" : "#FFF",
      backgroundColor: theme.palette.type === "light" ? "#5D3FD3" : "#1c1c1c",
      //border: theme.palette.type === 'light' ? '1px solid rgba(0 124 102)' : '1px solid rgba(255, 255, 255, 0.5)',
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.type === "light" ? "#5D3FD3" : "#FFF",
    },
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 24,
    color: theme.palette.dark.main,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0, 1),
      minHeight: 56,
      height: 56,
    },
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor:
      theme.palette.type === "dark" ? theme.palette.fancyBackground : "#FFFFFF",
    color: theme.palette.type === "dark" ? "#FFFFFF" : "#5D3FD3",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 1px 3px rgba(0,0,0,0.15)"
        : "0 1px 3px rgba(0,0,0,0.08)",
    borderBottom:
      theme.palette.type === "dark"
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid rgba(0,0,0,0.06)",
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 15,
    color: theme.palette.type === "dark" ? "#FFFFFF" : "#333",
    fontWeight: 500,
    [theme.breakpoints.down("xs")]: {
      fontSize: 13,
      whiteSpace: "normal",
      lineHeight: 1.2,
    },
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      position: "fixed",
      height: "100%",
      zIndex: theme.zIndex.drawer + 2,
    },
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
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: closedDrawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: closedDrawerWidth,
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  containerWithScroll: {
    flex: 1,
    padding: theme.spacing(1),
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
  },
  NotificationsPopOver: {
    // color: theme.barraSuperior.secondary.main,
  },
  logo: {
    width: "auto",
    height: "32px",
    maxWidth: 120,
    [theme.breakpoints.down("sm")]: {
      width: "auto",
      height: "32px",
      maxWidth: 120,
    },
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark" ? theme.palette.fancyBackground : "#FFFFFF",
    minHeight: 70,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 2px 4px rgba(0,0,0,0.2)"
        : "0 2px 4px rgba(0,0,0,0.03)",
  },
  drawerLogoBox: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
  },
  logoText: {
    fontWeight: 600,
    fontSize: "26px",
    color: theme.palette.type === "dark" ? "#FFFFFF" : "#5D3FD3",
    letterSpacing: "-0.5px",
    transition: "all 0.3s ease",
    "&:hover": {
      color: theme.palette.type === "dark" ? "#e0e0e0" : "#4930A8",
      transform: "scale(1.02)",
    },
  },
  drawerToggleIcon: {
    color: "#757575",
    padding: 6,
    transition: "all 0.2s ease",
    borderRadius: "50%",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
      transform: "rotate(-180deg)",
    },
  },
  appBarButton: {
    color: theme.palette.type === "dark" ? "#5D3FD3" : "#5D3FD3",
    margin: theme.spacing(0, 0.5),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    transition: "all 0.2s ease",
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(0, 0.2),
      padding: theme.spacing(0.7),
    },
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(93, 63, 211, 0.12)"
          : "rgba(93, 63, 211, 0.08)",
      transform: "translateY(-1px)",
    },
  },
  userButton: {
    color: theme.palette.type === "dark" ? "#5D3FD3" : "#5D3FD3",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    transition: "all 0.2s ease",
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(0.3),
      padding: theme.spacing(0.4),
    },
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(93, 63, 211, 0.12)"
          : "rgba(93, 63, 211, 0.08)",
      transform: "scale(1.05)",
    },
  },
  greetingText: {
    fontSize: 15,
    fontWeight: 500,
    color: theme.palette.type === "dark" ? "#FFFFFF" : "#333",
    [theme.breakpoints.down("xs")]: {
      fontSize: 13,
    },
  },
  companyText: {
    fontWeight: 600,
    color: theme.palette.type === "dark" ? "#5D3FD3" : "#5D3FD3",
    transition: "color 0.2s ease",
    "&:hover": {
      color: theme.palette.type === "dark" ? "#7058e6" : "#4930A8",
    },
  },
  dueDateText: {
    fontSize: 13,
    opacity: 0.8,
    color: theme.palette.type === "dark" ? "#CCCCCC" : "#666",
    [theme.breakpoints.down("xs")]: {
      fontSize: 11,
    },
  },
  menuIconOnly: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1.2),
    width: "100%",
    color: theme.palette.type === "dark" ? "#5D3FD3" : "#5D3FD3",
    "& svg": {
      fontSize: 28,
    },
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(93, 63, 211, 0.12)"
          : "rgba(93, 63, 211, 0.04)",
    },
  },
  headerSection: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      transition: "all 0.2s ease",
    },
    [theme.breakpoints.down("xs")]: {
      "& > *:not(:last-child)": {
        marginRight: -6,
      },
    },
  },
  mobileHeaderSection: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
  },
  rightIconsSection: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    "& > *": {
      transition: "all 0.2s ease",
    },
    [theme.breakpoints.down("xs")]: {
      "& > *:not(:last-child)": {
        marginRight: -6,
      },
    },
  },
}));

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();

  // Função para obter o título da página com base na rota atual
  const getPageTitle = () => {
    const path = location.pathname;

    // Mapeamento de rotas para títulos
    const routeTitles = {
      "/": i18n.t("mainDrawer.listItems.dashboard"),
      "/tickets": i18n.t("mainDrawer.listItems.tickets"),
      "/contacts": i18n.t("mainDrawer.listItems.contacts"),
      "/connections": i18n.t("mainDrawer.listItems.connections"),
      "/quick-messages": i18n.t("mainDrawer.listItems.quickMessages"),
      "/tags": i18n.t("mainDrawer.listItems.tags"),
      "/kanban": i18n.t("mainDrawer.listItems.kanban"),
      "/todolist": i18n.t("tickets.toDoList"),
      "/schedules": i18n.t("mainDrawer.listItems.schedules"),
      "/helps": i18n.t("mainDrawer.listItems.helps"),
      "/users": i18n.t("mainDrawer.listItems.users"),
      "/messages-api": i18n.t("mainDrawer.listItems.messagesAPI"),
      "/settings": i18n.t("mainDrawer.listItems.settings"),
      "/queues": i18n.t("mainDrawer.listItems.queues"),
      "/campaigns": i18n.t("mainDrawer.listItems.campaigns"),
      "/announcements": i18n.t("mainDrawer.listItems.annoucements"),
      "/chats": i18n.t("mainDrawer.listItems.chats"),
      "/financeiro": i18n.t("mainDrawer.listItems.financeiro"),
      "/files": i18n.t("mainDrawer.listItems.files"),
      "/prompts": i18n.t("mainDrawer.listItems.prompts"),
      "/queue-integration": i18n.t("mainDrawer.listItems.queueIntegration"),
    };

    // Verifica se a rota existe no mapeamento
    const exactMatch = routeTitles[path];
    if (exactMatch) return exactMatch;

    // Para rotas que possuem parâmetros, verificamos parcialmente
    for (const route in routeTitles) {
      if (path.startsWith(route) && route !== "/") {
        return routeTitles[route];
      }
    }

    // Se não encontrou nenhum título, retorna o padrão
    return i18n.t("mainDrawer.appBar.pageTitle");
  };

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (document.body.offsetWidth > 1200) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toast.error("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(
      () => {
        socket.emit("userStatus");
      },
      1000 * 60 * 5,
    );

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [socketManager]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose,
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.drawerHeader}>
          {drawerOpen ? (
            <>
              <Typography variant="h6" className={classes.logoText}>
                Verity CRM
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(!drawerOpen)}
                className={classes.drawerToggleIcon}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton
              className={classes.menuIconOnly}
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <MenuIcon
                style={{
                  color: theme.palette.type === "dark" ? "#5D3FD3" : "#5D3FD3",
                }}
              />
            </IconButton>
          )}
        </div>
        <Divider />
        <List className={classes.containerWithScroll}>
          <MainListItems drawerClose={drawerClose} collapsed={!drawerOpen} />
        </List>
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="default"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <div className={classes.headerSection}>
            <IconButton
              edge="start"
              variant="contained"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={clsx(
                classes.appBarButton,
                classes.menuButton,
                drawerOpen && classes.menuButtonHidden,
              )}
            >
              <MenuIcon />
            </IconButton>
          </div>

          <div className={classes.rightIconsSection}>
            {!greaterThenSm ? null : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <NotificationsVolume setVolume={setVolume} volume={volume}>
                  <IconButton className={classes.appBarButton} size="medium">
                    <Bell size={24} />
                  </IconButton>
                </NotificationsVolume>
              </div>
            )}

            {user.id && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <NotificationsPopOver volume={volume}>
                  <IconButton className={classes.appBarButton} size="medium">
                    <BellRing size={24} />
                  </IconButton>
                </NotificationsPopOver>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AnnouncementsPopover>
                <IconButton className={classes.appBarButton} size="medium">
                  <Megaphone size={24} />
                </IconButton>
              </AnnouncementsPopover>
            </div>

            {!greaterThenSm ? null : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ChatPopover>
                  <IconButton className={classes.appBarButton} size="medium">
                    <MessageSquare size={24} />
                  </IconButton>
                </ChatPopover>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                variant="contained"
                className={classes.userButton}
                size="medium"
                style={{ marginLeft: 8 }}
              >
                <User size={28} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={menuOpen}
                onClose={handleCloseMenu}
                PaperProps={{
                  style: {
                    borderRadius: 8,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    marginTop: 8,
                    border: "1px solid rgba(93, 63, 211, 0.1)",
                  },
                }}
                MenuListProps={{
                  style: {
                    padding: "8px 4px",
                  },
                }}
              >
                <MenuItem
                  onClick={handleOpenUserModal}
                  style={{
                    margin: "0 4px",
                    padding: "8px 16px",
                    borderRadius: 4,
                    transition: "all 0.2s ease",
                  }}
                >
                  {i18n.t("mainDrawer.appBar.user.profile")}
                </MenuItem>
                <MenuItem
                  onClick={handleClickLogout}
                  style={{
                    margin: "0 4px",
                    padding: "8px 16px",
                    borderRadius: 4,
                    transition: "all 0.2s ease",
                    color: "#F44336",
                  }}
                >
                  {i18n.t("mainDrawer.appBar.user.logout")}
                </MenuItem>
              </Menu>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
