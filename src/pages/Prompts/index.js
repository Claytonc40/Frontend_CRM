import React, { useContext, useEffect, useReducer, useState } from "react";

import {
  Button,
  IconButton,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  TextField,
  Box,
  Tooltip,
  Chip,
  Fade,
  Divider,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import SettingsIcon from "@material-ui/icons/Settings";
import TokenIcon from "@material-ui/icons/VpnKey";
import QueueIcon from "@material-ui/icons/Queue";
import Skeleton from "@material-ui/lab/Skeleton";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import PromptModal from "../../components/PromptModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(4),
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
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
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  addButton: {
    marginLeft: theme.spacing(2),
    height: 40,
    whiteSpace: "nowrap",
    backgroundColor: "#5D3FD3",
    "&:hover": {
      backgroundColor: "#4b32a8",
    },
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
    },
  },
  redBox: {
    backgroundColor: "rgba(244, 67, 54, 0.08)", 
    padding: theme.spacing(2),
    borderRadius: 10,
    marginBottom: theme.spacing(2),
    border: "1px solid rgba(244, 67, 54, 0.5)",
  },
  redBoxTitle: {
    color: theme.palette.error.main,
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  redBoxText: {
    color: "rgba(0, 0, 0, 0.7)",
    marginBottom: theme.spacing(1),
  },
  linksContainer: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 4,
  },
  linkItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  },
  cardContainer: {
    minWidth: 280,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[5],
    },
  },
  promptCard: {
    position: "relative",
    padding: theme.spacing(2),
    borderRadius: 10,
    border: "1px solid rgba(0, 0, 0, 0.09)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  promptName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: "#5D3FD3",
  },
  promptDetails: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(1),
    flexGrow: 1,
    "& > div": {
      marginBottom: theme.spacing(1),
    },
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#5D3FD3",
      fontSize: 20,
    },
  },
  queueChip: {
    backgroundColor: "rgba(93, 63, 211, 0.1)",
    color: "#5D3FD3",
    fontWeight: 500,
    marginTop: theme.spacing(1),
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingTop: theme.spacing(1),
    marginTop: "auto",
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
  gridContainer: {
    marginTop: theme.spacing(2),
  },
  noPromptsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noPromptsIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noPromptsText: {
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
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const classes = useStyles();

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [displayedPrompts, setDisplayedPrompts] = useState([]);

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const history = useHistory();
  const companyId = user.companyId;

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useOpenAi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Filtrar os prompts com base no searchParam
    if (searchParam.trim() !== "") {
      const filtered = prompts.filter(prompt => 
        prompt.name.toLowerCase().includes(searchParam.toLowerCase())
      );
      setDisplayedPrompts(filtered);
    } else {
      setDisplayedPrompts(prompts);
    }
  }, [searchParam, prompts]);

  useEffect(() => {
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-prompt`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, socketManager]);

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      const { data } = await api.delete(`/prompt/${promptId}`);
      toast.info(i18n.t(data.message));
    } catch (err) {
      toastError(err);
    }
    setSelectedPrompt(null);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedPrompt &&
          `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeletePrompt(selectedPrompt.id)}
      >
        {i18n.t("prompts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <PromptModal
        open={promptModalOpen}
        onClose={handleClosePromptModal}
        promptId={selectedPrompt?.id}
      />
      
      <MainHeader>
        <div className={classes.titleContainer}>
          <Typography className={classes.pageTitle}>
            {i18n.t("prompts.title")}
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerContainer}>
            <div className={classes.searchContainer}>
              <TextField
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                className={classes.searchInput}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.addButton}
                onClick={handleOpenPromptModal}
                startIcon={<AddIcon />}
              >
                {i18n.t("prompts.buttons.add")}
              </Button>
            </div>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      

      <Paper className={classes.mainPaper} variant="outlined">
        {displayedPrompts.length === 0 && !loading ? (
          <div className={classes.noPromptsContainer}>
            <SettingsIcon className={classes.noPromptsIcon} />
            <Typography className={classes.noPromptsText}>
              {searchParam 
                ? "Nenhum prompt encontrado com esse termo."
                : "Nenhum prompt cadastrado. Clique no botão acima para adicionar."}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3} className={classes.gridContainer}>
            {displayedPrompts.map((prompt) => (
              <Fade in={true} key={prompt.id} timeout={500}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card className={classes.cardContainer}>
                    <CardContent className={classes.promptCard}>
                      <Typography variant="h6" className={classes.promptName}>
                        {prompt.name}
                      </Typography>
                      
                      <Chip 
                        label={prompt.queue?.name || "Sem fila"}
                        className={classes.queueChip}
                        size="small"
                        icon={<QueueIcon style={{ fontSize: 16 }} />}
                      />
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <div className={classes.promptDetails}>
                        <Box className={classes.detailItem}>
                          <TokenIcon fontSize="small" />
                          <Typography variant="body2">
                            Máx. Tokens: {prompt.maxTokens}
                          </Typography>
                        </Box>
                        <Box className={classes.detailItem}>
                          <SettingsIcon fontSize="small" />
                          <Typography variant="body2">
                            Temperatura: {prompt.temperature}
                          </Typography>
                        </Box>
                        <Box className={classes.detailItem}>
                          <Typography variant="body2" style={{ color: "#555" }}>
                            Modo: <strong>{prompt.voice === "texto" ? "Texto" : "Voz"}</strong>
                          </Typography>
                        </Box>
                      </div>
                      
                      <CardActions className={classes.cardActions}>
                        <Tooltip title={i18n.t("prompts.table.actions.edit")} arrow placement="top">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditPrompt(prompt)}
                            className={`${classes.actionButton} ${classes.editButton}`}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={i18n.t("prompts.table.actions.delete")} arrow placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setSelectedPrompt(prompt);
                            }}
                            className={`${classes.actionButton} ${classes.deleteButton}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            ))}
            
            {loading && 
              [...Array(3)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <Skeleton 
                    variant="rect" 
                    width="100%" 
                    height={200} 
                    animation="wave" 
                    style={{ borderRadius: 10 }}
                  />
                </Grid>
              ))
            }
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Prompts;
