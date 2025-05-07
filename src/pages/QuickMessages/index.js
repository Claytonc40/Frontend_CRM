import React, { useContext, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import ChatIcon from "@material-ui/icons/Chat";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import SearchIcon from "@material-ui/icons/Search";
import Skeleton from "@material-ui/lab/Skeleton";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import { Tooltip } from "@material-ui/core";
import { isArray } from "lodash";
import ConfirmationModal from "../../components/ConfirmationModal";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex(
      (u) => u.id === quickemessage.id
    );

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
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
  cardContainer: {
    minWidth: 280,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[5],
    },
  },
  quickMessageCard: {
    position: "relative",
    padding: theme.spacing(2),
    borderRadius: 10,
    border: "1px solid rgba(0, 0, 0, 0.09)",
  },
  shortcode: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    textShadow: "1px 1px 1px rgba(0,0,0,0.2)",
  },
  messageContent: {
    height: 100,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
    fontSize: "0.9rem",
    color: "rgba(0, 0, 0, 0.7)",
    marginBottom: theme.spacing(1),
  },
  mediaIndicator: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.8rem",
    color: "#555",
    marginTop: theme.spacing(1),
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingTop: 0,
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
  noMessagesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noMessagesIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noMessagesText: {
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

const Quickemessages = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickemessage, setSelectedQuickemessage] = useState(null);
  const [deletingQuickemessage, setDeletingQuickemessage] = useState(null);
  const [quickemessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickemessages, dispatch] = useReducer(reducer, []);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickemessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    // Filtrar as mensagens com base no searchParam
    if (searchParam.trim() !== "") {
      const filtered = quickemessages.filter(
        (msg) =>
          msg.shortcode.toLowerCase().includes(searchParam.toLowerCase()) ||
          (msg.message &&
            msg.message.toLowerCase().includes(searchParam.toLowerCase()))
      );
      setDisplayedMessages(filtered);
    } else {
      setDisplayedMessages(quickemessages);
    }
  }, [searchParam, quickemessages]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);

    socket.on(`company${companyId}-quickemessage`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager, user.companyId]);

  const fetchQuickemessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber, userId: user.id },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickemessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickemessage = (quickemessage) => {
    setSelectedQuickemessage(quickemessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickemessage = async (quickemessageId) => {
    try {
      await api.delete(`/quick-messages/${quickemessageId}`);
      toast.success(i18n.t("quickemessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickemessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickemessages();
    dispatch({ type: "RESET" });
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

  // Função para gerar uma cor aleatória suave, porém baseada em tons de roxo
  const getRandomPurpleColor = () => {
    const colors = [
      "#5D3FD3", // Roxo base
      "#6A5ACD", // Slate Blue
      "#9370DB", // Medium Purple
      "#8A2BE2", // Blue Violet
      "#9932CC", // Dark Orchid
      "#BA55D3", // Medium Orchid
      "#7B68EE", // Medium Slate Blue
      "#4B0082", // Indigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingQuickemessage &&
          `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${
            deletingQuickemessage.shortcode
          }?`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteQuickemessage(deletingQuickemessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickemessages();
        }}
        open={quickemessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickemessageId={selectedQuickemessage && selectedQuickemessage.id}
      />
      <MainHeader>
        <div className={classes.titleContainer}>
          <Typography className={classes.pageTitle}>
            {i18n.t("quickMessages.title")}
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerContainer}>
            <div className={classes.searchContainer}>
              <TextField
                placeholder={i18n.t("quickMessages.searchPlaceholder")}
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
                onClick={handleOpenQuickMessageDialog}
                startIcon={<AddIcon />}
              >
                {i18n.t("quickMessages.buttons.add")}
              </Button>
            </div>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        {displayedMessages.length === 0 && !loading ? (
          <div className={classes.noMessagesContainer}>
            <ChatIcon className={classes.noMessagesIcon} />
            <Typography className={classes.noMessagesText}>
              {searchParam
                ? i18n.t("quickMessages.noMessagesFound")
                : i18n.t("quickMessages.noMessages")}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3} className={classes.gridContainer}>
            {displayedMessages.map((quickmessage) => {
              const color = getRandomPurpleColor();
              return (
                <Fade in={true} key={quickmessage.id} timeout={500}>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card
                      className={classes.cardContainer}
                      style={{
                        borderLeft: `5px solid ${color}`,
                      }}
                    >
                      <CardContent
                        className={classes.quickMessageCard}
                        style={{ backgroundColor: `${color}15` }} // Cor com 15% de opacidade
                      >
                        <Typography
                          variant="h6"
                          className={classes.shortcode}
                          style={{ color: color }}
                        >
                          /{quickmessage.shortcode}
                        </Typography>

                        <Typography className={classes.messageContent}>
                          {quickmessage.message ||
                            i18n.t("quickMessages.noMessage")}
                        </Typography>

                        {quickmessage.mediaName && (
                          <div className={classes.mediaIndicator}>
                            <CheckCircleIcon
                              style={{
                                fontSize: "1rem",
                                marginRight: "4px",
                                color: color,
                              }}
                            />
                            {quickmessage.mediaName}
                          </div>
                        )}
                      </CardContent>
                      <CardActions className={classes.cardActions}>
                        <Tooltip
                          title={i18n.t("quickMessages.buttons.edit")}
                          arrow
                          placement="top"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditQuickemessage(quickmessage)
                            }
                            className={`${classes.actionButton} ${classes.editButton}`}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={i18n.t("quickMessages.buttons.delete")}
                          arrow
                          placement="top"
                        >
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setDeletingQuickemessage(quickmessage);
                            }}
                            className={`${classes.actionButton} ${classes.deleteButton}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                </Fade>
              );
            })}

            {loading &&
              [...Array(4)].map((_, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`skeleton-${index}`}
                >
                  <Skeleton
                    variant="rect"
                    width="100%"
                    height={160}
                    animation="wave"
                    style={{ borderRadius: 10 }}
                  />
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Quickemessages;
