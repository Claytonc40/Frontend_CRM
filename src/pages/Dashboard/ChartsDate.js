import Typography from "@material-ui/core/Typography";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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
    maxHeight: 320,
  },
}));

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    datalabels: {
      display: true,
      anchor: "end",
      align: "end",
      color: "#5D3FD3",
      font: { size: 16, weight: "bold" },
      formatter: (value) => (value > 0 ? value : ""),
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
      displayColors: false,
      callbacks: {
        label: (context) => `Total: ${context.parsed.y}`,
      },
    },
  },
  layout: { padding: { top: 16, bottom: 8, left: 8, right: 8 } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#5D3FD3", font: { weight: "bold", size: 14 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: "#ece6fa", borderDash: [4, 4] },
      ticks: { color: "#666", font: { size: 13 }, stepSize: 1 },
    },
  },
  animation: { duration: 900, easing: "easeOutQuart" },
  elements: { bar: { borderRadius: 12, borderSkipped: false } },
};

export const ChartsDate = ({ ticketsData }) => {
  const classes = useStyles();
  const chartRef = useRef();

  // Gradiente para as barras
  function getGradient(ctx, chartArea) {
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top,
    );
    gradient.addColorStop(0, "#8F6FE6");
    gradient.addColorStop(1, "#5D3FD3");
    return gradient;
  }

  const dataCharts = React.useMemo(() => {
    let backgroundColor = "#5D3FD3";
    if (
      chartRef.current &&
      chartRef.current.ctx &&
      chartRef.current.chartArea
    ) {
      backgroundColor = getGradient(
        chartRef.current.ctx,
        chartRef.current.chartArea,
      );
    }
    return {
      labels:
        ticketsData &&
        ticketsData?.data.length > 0 &&
        ticketsData?.data.map((item) =>
          item.hasOwnProperty("horario")
            ? `Das ${item.horario}:00 as ${item.horario}:59`
            : item.data,
        ),
      datasets: [
        {
          data:
            ticketsData?.data.length > 0 &&
            ticketsData?.data.map((item) => item.total),
          backgroundColor,
          borderRadius: 12,
          maxBarThickness: 38,
          minBarLength: 2,
        },
      ],
    };
    // eslint-disable-next-line
  }, [ticketsData, chartRef.current]);

  return (
    <div className={classes.chartBox}>
      <Typography
        component="h2"
        variant="h6"
        className={classes.title}
        gutterBottom
      >
        Total de Atendimentos
      </Typography>
      <Bar
        ref={chartRef}
        options={options}
        data={dataCharts}
        className={classes.chart}
        redraw
      />
    </div>
  );
};
