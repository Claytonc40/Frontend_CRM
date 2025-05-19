import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputAdornment from "@material-ui/core/InputAdornment";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import { CalendarDays, Edit3, PlusCircle, Trash2 } from "lucide-react";
import moment from "moment";
import "moment/locale/pt-br";
import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "sonner";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

import Container from "@material-ui/core/Container";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import "./Schedules.css";
import "./SchedulesCalendar.css";

// Defina a função getUrlParam antes de usá-la
function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "15px",
  fontWeight: 600,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#222",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const localizer = momentLocalizer(moment);
var defaultMessages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Todo",
  week: "Semana",
  work_week: "Agendamentos",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há agendamentos no período.",
  showMore: function showMore(total) {
    return "+" + total + " mais";
  },
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    return [...state, ...action.payload];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;
    return state.filter((s) => s.id !== scheduleId);
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    background: "#faf9fd",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(93,63,211,0.07)",
    marginTop: theme.spacing(2),
  },
  emptyBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 320,
    color: "#888",
    gap: 12,
    background: "#fff",
    borderRadius: 12,
    margin: theme.spacing(4, 0),
    boxShadow: "0 1px 6px rgba(93,63,211,0.06)",
  },
  addButton: {
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 16,
    padding: "10px 24px",
    textTransform: "none",
    background: "#5D3FD3",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.15)",
    transition: "all 0.2s",
    "&:hover": {
      background: "#4930A8",
      boxShadow: "0 4px 12px rgba(93, 63, 211, 0.2)",
    },
    marginLeft: theme.spacing(2),
  },
  searchInput: {
    borderRadius: 10,
    background: "#fff",
    fontSize: 15,
    minWidth: 220,
    marginRight: theme.spacing(2),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}));

const Schedules = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules/", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    handleOpenScheduleModalFromContactId();
    const socket = socketManager.getSocket(user.companyId);

    socket.on(`company${user.companyId}-schedule`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [handleOpenScheduleModalFromContactId, socketManager, user]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
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
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        reload={fetchSchedules}
        aria-labelledby="form-dialog-title"
        scheduleId={selectedSchedule && selectedSchedule.id}
        contactId={contactId}
        cleanContact={cleanContact}
      />
      <MainHeader>
        <Title>
          {i18n.t("schedules.title")} ({schedules.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            className={classes.searchInput}
            variant="outlined"
            size="small"
            aria-label="Buscar agendamento"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenScheduleModal}
            className={classes.addButton}
            startIcon={<PlusCircle size={22} />}
            aria-label="Adicionar agendamento"
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={400}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : schedules.length === 0 ? (
          <Box className={classes.emptyBox}>
            <CalendarDays size={48} />
            <Typography
              variant="h6"
              style={{ color: "#5D3FD3", fontWeight: 600 }}
            >
              Nenhum agendamento encontrado
            </Typography>
            <Typography variant="body2">
              Clique em "Adicionar" para criar um novo agendamento.
            </Typography>
          </Box>
        ) : (
          <Calendar
            messages={defaultMessages}
            formats={{
              agendaDateFormat: "DD/MM ddd",
              weekdayFormat: "dddd",
            }}
            localizer={localizer}
            events={schedules.map((schedule) => ({
              title: (
                <div className="event-container">
                  <span style={eventTitleStyle}>{schedule.contact.name}</span>
                  <span className="event-icons">
                    <span
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSchedule(schedule);
                        setScheduleModalOpen(true);
                      }}
                    >
                      <Edit3 size={18} />
                    </span>
                    <span
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchedule(schedule.id);
                      }}
                    >
                      <Trash2 size={18} />
                    </span>
                  </span>
                </div>
              ),
              start: new Date(schedule.sendAt),
              end: new Date(schedule.sendAt),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default Schedules;
