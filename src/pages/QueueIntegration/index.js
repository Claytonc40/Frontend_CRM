import {
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Edit,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "react-toastify";
import dialogflow from "../../assets/dialogflow.png";
import n8n from "../../assets/n8n.png";
import typebot from "../../assets/typebot.jpg";
import webhooks from "../../assets/webhook.png";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import IntegrationModal from "../../components/QueueIntegrationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  if (action.type === "LOAD_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const newIntegrations = [];

    queueIntegration.forEach((integration) => {
      const integrationIndex = state.findIndex((u) => u.id === integration.id);
      if (integrationIndex !== -1) {
        state[integrationIndex] = integration;
      } else {
        newIntegrations.push(integration);
      }
    });

    return [...state, ...newIntegrations];
  }

  if (action.type === "UPDATE_INTEGRATIONS") {
    const queueIntegration = action.payload;
    const integrationIndex = state.findIndex(
      (u) => u.id === queueIntegration.id
    );

    if (integrationIndex !== -1) {
      state[integrationIndex] = queueIntegration;
      return [...state];
    } else {
      return [queueIntegration, ...state];
    }
  }

  if (action.type === "DELETE_INTEGRATION") {
    const integrationId = action.payload;

    const integrationIndex = state.findIndex((u) => u.id === integrationId);
    if (integrationIndex !== -1) {
      state.splice(integrationIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    minHeight: "100vh",
  },
  avatar: {
    width: "140px",
    height: "40px",
    borderRadius: 4,
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
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
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
  noIntegrationsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noIntegrationsIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noIntegrationsText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: "1.1rem",
    maxWidth: 300,
    textAlign: "center",
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
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    borderRadius: 22,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(3),
    margin: "0 auto",
    transition: "all 0.3s",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing(2),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardType: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    padding: "6px 14px",
    fontWeight: 600,
    fontSize: 13,
    background: "#e3e6fd",
    color: "#5D3FD3",
    boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: theme.spacing(2),
  },
}));

const QueueIntegration = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [queueIntegration, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const companyId = user.companyId;
  const history = useHistory();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useIntegrations) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchIntegrations = async () => {
        try {
          const { data } = await api.get("/queueIntegration/", {
            params: { searchParam, pageNumber },
          });
          dispatch({
            type: "LOAD_INTEGRATIONS",
            payload: data.queueIntegrations,
          });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchIntegrations();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-queueIntegration`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({
          type: "UPDATE_INTEGRATIONS",
          payload: data.queueIntegration,
        });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_INTEGRATION", payload: +data.integrationId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenUserModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(true);
  };

  const handleCloseIntegrationModal = () => {
    setSelectedIntegration(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditIntegration = (queueIntegration) => {
    setSelectedIntegration(queueIntegration);
    setUserModalOpen(true);
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await api.delete(`/queueIntegration/${integrationId}`);
      toast.success(i18n.t("queueIntegration.toasts.deleted"));
    } catch (err) {
      toastError(err);
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
          title={deletingUser && `Excluir integração ${deletingUser.name}?`}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteIntegration(deletingUser.id)}
        >
          Essa ação não pode ser desfeita. Deseja continuar?
        </ConfirmationModal>
        <IntegrationModal
          open={userModalOpen}
          onClose={handleCloseIntegrationModal}
          integrationId={selectedIntegration && selectedIntegration.id}
        />
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Settings size={32} style={{ color: "#5D3FD3" }} />
          <Typography className={classes.pageTitle} component="h1">
            Integrações{" "}
            <span style={{ color: "#888", fontWeight: 400 }}>
              ({queueIntegration.length})
            </span>
          </Typography>
        </Box>
        {queueIntegration.length === 0 && !loading ? (
          <div className={classes.noIntegrationsContainer}>
            <Settings className={classes.noIntegrationsIcon} />
            <Typography className={classes.noIntegrationsText}>
              {searchParam
                ? "Nenhuma integração encontrada com esse termo."
                : "Nenhuma integração cadastrada. Clique no botão abaixo para adicionar."}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {queueIntegration.map((integration) => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <Paper className={classes.card}>
                  <div className={classes.cardHeader}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={
                          integration.type === "dialogflow"
                            ? dialogflow
                            : integration.type === "n8n"
                            ? n8n
                            : integration.type === "webhook"
                            ? webhooks
                            : typebot
                        }
                        className={classes.avatar}
                        variant="rounded"
                      />
                      <span className={classes.cardTitle}>
                        {integration.name}
                      </span>
                    </Box>
                    <span className={classes.cardType}>{integration.type}</span>
                  </div>
                  <Divider style={{ margin: "10px 0" }} />
                  <Box className={classes.actions}>
                    <Tooltip title="Editar" arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleEditIntegration(integration)}
                      >
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir" arrow placement="top">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingUser(integration);
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default QueueIntegration;
