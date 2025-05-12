import React from "react";
import { Card, CardHeader, Typography, Avatar, Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
    transition: "box-shadow 0.2s, transform 0.2s",
    minWidth: 220,
    minHeight: 120,
    background: "#fff",
    "&:hover": {
      boxShadow: "0 8px 32px rgba(93,63,211,0.18)",
      transform: "translateY(-2px) scale(1.02)",
    },
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  cardHeader: {
    padding: "24px 24px 16px 24px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "none",
  },
  cardAvatar: {
    width: 64,
    height: 64,
    background: "linear-gradient(135deg, #5D3FD3 0%, #8F6FE6 100%)",
    color: "#fff",
    marginBottom: 12,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    border: "4px solid #f7f7fa",
  },
  cardTitle: {
    fontSize: 16,
    color: "#5D3FD3",
    fontWeight: 700,
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  cardSubtitle: {
    color: "#222",
    fontSize: 28,
    fontWeight: 800,
    textAlign: "center",
    marginTop: 2,
    letterSpacing: 0.5,
  },
}));

export default function CardCounter(props) {
  const { icon: Icon, title, value, loading } = props;
  const classes = useStyles();
  return !loading ? (
    <Card className={classes.cardRoot} elevation={0}>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Avatar className={classes.cardAvatar}>
            {Icon && <Icon size={36} color="#fff" />}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="h2" className={classes.cardTitle}>
            {title}
          </Typography>
        }
        subheader={
          <Typography
            variant="subtitle1"
            component="p"
            className={classes.cardSubtitle}
          >
            {value}
          </Typography>
        }
      />
    </Card>
  ) : (
    <Skeleton
      variant="rect"
      height={120}
      style={{ borderRadius: 18, minWidth: 220 }}
    />
  );
}
