import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import React, { useRef } from "react";
import { Pie } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  chartBox: {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
    padding: theme.spacing(3, 3, 2, 3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxWidth: "100%",
  },
  title: {
    color: "#5D3FD3",
    fontWeight: 700,
    fontSize: 20,
    marginBottom: theme.spacing(2),
  },
  filterStack: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    flexWrap: "wrap",
  },
  dateInput: {
    borderRadius: 10,
    background: "#faf9fd",
    minWidth: 120,
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
  },
  button: {
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 18px",
    background: "#5D3FD3",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    textTransform: "none",
    "&:hover": {
      background: "#4930A8",
    },
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  chart: {
    maxWidth: "100%",
    maxHeight: 340,
  },
}));

const PIE_COLORS = [
  "#5D3FD3",
  "#8F6FE6",
  "#A3A1FB",
  "#B5B2FF",
  "#C7C6FF",
  "#E0DFFF",
  "#F3F0FA",
  "#6AD1E3",
  "#FFB86B",
  "#FF6B81",
  "#FFD36B",
  "#6BFFB8",
  "#6B8EFF",
  "#FF6BCE",
];

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "right",
      labels: {
        color: "#5D3FD3",
        font: { size: 15, weight: "bold" },
        padding: 18,
      },
    },
    datalabels: {
      color: "#fff",
      font: { weight: "bold", size: 15 },
      formatter: (value, ctx) => (value > 0 ? value : ""),
    },
    tooltip: {
      backgroundColor: "#fff",
      titleColor: "#5D3FD3",
      bodyColor: "#222",
      borderColor: "#ece6fa",
      borderWidth: 1,
      padding: 12,
      caretSize: 8,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context) => `${context.label}: ${context.parsed} conversas`,
      },
    },
  },
  animation: {
    animateRotate: true,
    duration: 1200,
    easing: "easeOutQuart",
  },
};

export const ChatsUser = ({ ticketsData, loading }) => {
  const classes = useStyles();
  const chartRef = useRef();

  const dataPie = React.useMemo(() => {
    if (!ticketsData || !ticketsData.data || ticketsData.data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      };
    }

    const labels = ticketsData.data.map((item) => item.nome);
    const values = ticketsData.data.map((item) => item.quantidade);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: PIE_COLORS.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  }, [ticketsData]);

  if (loading) {
    return (
      <div className={classes.chartBox}>
        <Typography
          component="h2"
          variant="h6"
          className={classes.title}
          gutterBottom
        >
          Total de Conversas por Usuários
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <Typography>Carregando...</Typography>
        </div>
      </div>
    );
  }

  if (!ticketsData || !ticketsData.data || ticketsData.data.length === 0) {
    return (
      <div className={classes.chartBox}>
        <Typography
          component="h2"
          variant="h6"
          className={classes.title}
          gutterBottom
        >
          Total de Conversas por Usuários
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <Typography>
            Nenhum dado disponível para o período selecionado
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.chartBox}>
      <Typography
        component="h2"
        variant="h6"
        className={classes.title}
        gutterBottom
      >
        Total de Conversas por Usuários
      </Typography>
      <Pie
        ref={chartRef}
        options={options}
        data={dataPie}
        className={classes.chart}
        plugins={[ChartDataLabels]}
        redraw
      />
    </div>
  );
};
