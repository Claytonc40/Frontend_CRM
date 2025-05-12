import React, { useState, useEffect } from "react";
import { useTheme, makeStyles } from "@material-ui/core/styles";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const useStyles = makeStyles((theme) => ({
  chartCard: {
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
}));

const Chart = ({ queueTicket }) => {
  const theme = useTheme();
  const classes = useStyles();

  const { tickets, count } = useTickets({
    queueIds: queueTicket ? `[${queueTicket}]` : "[]",
  });

  const [chartData, setChartData] = useState([
    { time: "00:00", amount: 0 },
    { time: "01:00", amount: 0 },
    { time: "02:00", amount: 0 },
    { time: "03:00", amount: 0 },
    { time: "04:00", amount: 0 },
    { time: "05:00", amount: 0 },
    { time: "06:00", amount: 0 },
    { time: "07:00", amount: 0 },
    { time: "08:00", amount: 0 },
    { time: "09:00", amount: 0 },
    { time: "10:00", amount: 0 },
    { time: "11:00", amount: 0 },
    { time: "12:00", amount: 0 },
    { time: "13:00", amount: 0 },
    { time: "14:00", amount: 0 },
    { time: "15:00", amount: 0 },
    { time: "16:00", amount: 0 },
    { time: "17:00", amount: 0 },
    { time: "18:00", amount: 0 },
    { time: "19:00", amount: 0 },
    { time: "20:00", amount: 0 },
    { time: "21:00", amount: 0 },
    { time: "22:00", amount: 0 },
    { time: "23:00", amount: 0 },
  ]);

  useEffect(() => {
    setChartData((prevState) => {
      let aux = prevState.map((a) => ({ ...a, amount: 0 }));
      tickets.forEach((ticket) => {
        const hour = format(startOfHour(parseISO(ticket.createdAt)), "HH:mm");
        const idx = aux.findIndex((a) => a.time === hour);
        if (idx !== -1) aux[idx].amount++;
      });
      return aux;
    });
  }, [tickets]);

  return (
    <div className={classes.chartCard}>
      <Title
        className={classes.title}
      >{`Atendimentos Criados: ${count}`}</Title>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ece6fa" />
          <XAxis dataKey="time" stroke="#b3a6e7" fontSize={13} />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke="#b3a6e7"
            fontSize={13}
          >
            <Label
              angle={270}
              position="left"
              style={{ textAnchor: "middle", fill: "#5D3FD3", fontWeight: 600 }}
            >
              Tickets
            </Label>
          </YAxis>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              background: "#faf9fd",
              border: "1px solid #ece6fa",
              color: "#222",
            }}
            labelStyle={{ color: "#5D3FD3", fontWeight: 700 }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#5D3FD3"
            strokeWidth={3}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
