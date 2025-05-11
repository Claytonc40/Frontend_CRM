import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { format } from "date-fns";
import { isArray, isEmpty } from "lodash";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../../services/api";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import Chart from "./Chart";
import { ChartsDate } from "./ChartsDate";
import { ChatsUser } from "./ChartsUser";
import Filters from "./Filters";
import Title from "./Title";

import { AuthContext } from "../../context/Auth/AuthContext";
import useContacts from "../../hooks/useContacts";
import useDashboard from "../../hooks/useDashboard";

// Lucide React Icons
import {
  CheckCircle,
  Clock,
  Hourglass,
  MessageCircle,
  PhoneCall,
  Store,
  UserPlus,
} from "lucide-react";

const useStyles = makeStyles((theme) => ({
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
  cardGrid: {
    marginBottom: theme.spacing(3),
  },
  cardWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    width: "100%",
  },
  sectionPaper: {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
    padding: theme.spacing(3, 3, 2, 3),
    marginBottom: theme.spacing(3),
    width: "100%",
    maxWidth: 1800,
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(
    moment().subtract(7, "days").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  const [queueTicket, setQueueTicket] = useState(false);
  const { user } = useContext(AuthContext);

  // Dados dos gráficos
  const [ticketsUserData, setTicketsUserData] = useState({ data: [] });
  const [ticketsDateData, setTicketsDateData] = useState({ data: [] });

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
      await fetchChartsData();
    }
    firstLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchChartsData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, queueTicket]);

  async function fetchChartsData() {
    try {
      setLoading(true);
      // Gráfico por usuário
      const companyId = localStorage.getItem("companyId");
      const resUser = await api.get(
        `/dashboard/ticketsUsers?initialDate=${format(
          new Date(dateFrom),
          "yyyy-MM-dd"
        )}&finalDate=${format(
          new Date(dateTo),
          "yyyy-MM-dd"
        )}&companyId=${companyId}`
      );
      setTicketsUserData(resUser.data);

      // Gráfico por data
      const resDate = await api.get(
        `/dashboard/ticketsDay?initialDate=${format(
          new Date(dateFrom),
          "yyyy-MM-dd"
        )}&finalDate=${format(
          new Date(dateTo),
          "yyyy-MM-dd"
        )}&companyId=${companyId}`
      );
      setTicketsDateData(resDate.data);

      setLoading(false);
    } catch (error) {
      toast.error("Erro ao carregar dados dos gráficos");
      setLoading(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      let params = {};
      if (period > 0) {
        params = { days: period };
      }
      if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
        params = {
          ...params,
          date_from: moment(dateFrom).format("YYYY-MM-DD"),
        };
      }
      if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
        params = { ...params, date_to: moment(dateTo).format("YYYY-MM-DD") };
      }
      if (Object.keys(params).length === 0) {
        toast.error("Parametrize o filtro");
        setLoading(false);
        return;
      }
      const data = await find(params);
      setCounters(data.counters);
      if (isArray(data.attendants)) {
        setAttendants(data.attendants);
      } else {
        setAttendants([]);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  // Cards de Métricas
  const metricCards = [
    user.super && {
      title: "Conexões Ativas",
      value: counters.totalWhatsappSessions,
      icon: PhoneCall,
      loading,
    },
    user.super && {
      title: "Empresas",
      value: counters.totalCompanies,
      icon: Store,
      loading,
    },
    {
      title: "Em Conversa",
      value: counters.supportHappening,
      icon: MessageCircle,
      loading,
    },
    {
      title: "Aguardando",
      value: counters.supportPending,
      icon: Hourglass,
      loading,
    },
    {
      title: "Finalizados",
      value: counters.supportFinished,
      icon: CheckCircle,
      loading,
    },
    {
      title: "Novos Contatos",
      value: GetContacts(true),
      icon: UserPlus,
      loading,
    },
    {
      title: "T.M. de Conversa",
      value: formatTime(counters.avgSupportTime),
      icon: Clock,
      loading,
    },
    {
      title: "T.M. de Espera",
      value: formatTime(counters.avgWaitTime),
      icon: Clock,
      loading,
    },
  ].filter(Boolean);

  return (
    <div>
      <Container maxWidth="xl" className={classes.container}>
        {/* Filtro Único no Topo */}
        <Filters
          setQueueTicket={setQueueTicket}
          queueTicket={queueTicket}
          setDateStartTicket={setDateFrom}
          setDateEndTicket={setDateTo}
          dateStartTicket={dateFrom}
          dateEndTicket={dateTo}
          loading={loading}
        />

        {/* Cards de Métricas Modernos */}
        <Grid container spacing={4} className={classes.cardGrid}>
          {metricCards.map((card, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              lg={3}
              xl={2}
              key={idx}
              className={classes.cardWrapper}
            >
              <CardCounter
                icon={card.icon}
                title={card.title}
                value={card.value}
                loading={loading}
              />
            </Grid>
          ))}
        </Grid>

        {/* Gráfico de Atendimentos por Hora */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <div className={classes.sectionPaper}>
              <Title>Atendimentos por Hora</Title>
              <Chart
                queueTicket={queueTicket}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className={classes.sectionPaper}>
              <ChatsUser ticketsData={ticketsUserData} loading={loading} />
            </div>
          </Grid>
        </Grid>

        {/* Tabela de Atendentes */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className={classes.sectionPaper}>
              <Title>Status dos Atendentes</Title>
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            </div>
          </Grid>
        </Grid>

        {/* Gráfico de Atendimentos por Data */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className={classes.sectionPaper}>
              <ChartsDate ticketsData={ticketsDateData} loading={loading} />
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
