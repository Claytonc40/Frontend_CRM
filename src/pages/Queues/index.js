import React, { useEffect, useReducer, useState, useContext } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Fade,
  Chip
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import CircularProgress from "@material-ui/core/CircularProgress";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import {
  DeleteOutline,
  Edit,
  Settings as SettingsIcon,
  People as PeopleIcon,
  FormatAlignLeft as OrderIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon
} from "@material-ui/icons";
import QueueModal from "../../components/QueueModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  noQueuesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noQueuesIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noQueuesText: {
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
  colorPreview: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
  queueCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 10,
    transition: "all 0.2s ease-in-out",
    border: "1px solid rgba(0, 0, 0, 0.09)",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[4],
    },
  },
  queueCardContent: {
    padding: theme.spacing(3),
    flexGrow: 1,
  },
  queueCardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  queueColorBar: {
    width: 8,
    alignSelf: "stretch",
    borderRadius: "10px 0 0 10px",
  },
  queueName: {
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#303030",
  },
  queueId: {
    fontWeight: 400,
    fontSize: "0.8rem",
    color: "rgba(0, 0, 0, 0.5)",
    marginLeft: theme.spacing(1),
  },
  propertyItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1.5),
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#5D3FD3",
      fontSize: 18,
    },
    "& .MuiTypography-root": {
      color: "rgba(0, 0, 0, 0.7)",
      fontSize: "0.9rem",
    },
  },
  cardActions: {
    padding: theme.spacing(1.5),
    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
    display: "flex",
    justifyContent: "flex-end",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  truncate: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  orderChip: {
    backgroundColor: "rgba(93, 63, 211, 0.1)",
    color: "#5D3FD3",
    fontWeight: 500,
    borderRadius: 20,
    marginLeft: "auto",
    height: 22,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const classes = useStyles();

  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-queue`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success("Fila excluída com sucesso!");
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedQueue &&
          `Excluir fila ${selectedQueue.name}?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        Essa ação não pode ser desfeita. Deseja continuar?
      </ConfirmationModal>
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
      />
      <MainHeader>
        <div className={classes.titleContainer}>
          <Typography className={classes.pageTitle}>
            Filas de Atendimento
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenQueueModal}
            className={classes.addButton}
          >
            Nova Fila
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        {queues.length === 0 && !loading ? (
          <div className={classes.noQueuesContainer}>
            <SettingsIcon className={classes.noQueuesIcon} />
            <Typography className={classes.noQueuesText}>
              Nenhuma fila cadastrada. Clique no botão acima para adicionar.
            </Typography>
          </div>
        ) : loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={40} color="primary" />
            <Typography style={{ marginTop: 16 }}>
              Carregando filas...
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {queues.map((queue) => (
              <Fade in={true} key={queue.id} timeout={500}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card className={classes.queueCard}>
                    <Box display="flex">
                      <Box
                        className={classes.queueColorBar}
                        style={{ backgroundColor: queue.color }}
                      />
                      <CardContent className={classes.queueCardContent}>
                        <div className={classes.queueCardHeader}>
                          <Typography className={classes.queueName}>
                            {queue.name}
                          </Typography>
                          <Typography className={classes.queueId}>
                            #{queue.id}
                          </Typography>
                          {queue.orderQueue && (
                            <Chip
                              size="small"
                              label={`Prioridade: ${queue.orderQueue}`}
                              className={classes.orderChip}
                            />
                          )}
                        </div>

                        <div>
                          <Box className={classes.propertyItem}>
                            <OrderIcon />
                            <Typography>
                              Prioridade: {queue.orderQueue || "Não definida"}
                            </Typography>
                          </Box>

                          {queue.greetingMessage && (
                            <Box className={classes.propertyItem}>
                              <ChatIcon />
                              <Tooltip title={queue.greetingMessage} arrow placement="top">
                                <Typography className={classes.truncate}>
                                  {queue.greetingMessage.length > 60
                                    ? `${queue.greetingMessage.substring(0, 60)}...`
                                    : queue.greetingMessage}
                                </Typography>
                              </Tooltip>
                            </Box>
                          )}

                          {queue.outOfHoursMessage && (
                            <Box className={classes.propertyItem}>
                              <TimeIcon />
                              <Tooltip title={queue.outOfHoursMessage} arrow placement="top">
                                <Typography className={classes.truncate}>
                                  {queue.outOfHoursMessage.length > 60
                                    ? `${queue.outOfHoursMessage.substring(0, 60)}...`
                                    : queue.outOfHoursMessage}
                                </Typography>
                              </Tooltip>
                            </Box>
                          )}
                        </div>
                      </CardContent>
                    </Box>

                    <CardActions className={classes.cardActions}>
                      <Tooltip title="Editar" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQueue(queue)}
                          className={`${classes.actionButton} ${classes.editButton}`}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Excluir" arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedQueue(queue);
                            setConfirmModalOpen(true);
                          }}
                          className={`${classes.actionButton} ${classes.deleteButton}`}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Queues;
