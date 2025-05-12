import React from "react";

import { Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const useStyles = makeStyles((theme) => ({
  ticketHeader: {
    display: "flex",
    background: "#fff",
    flex: "none",
    alignItems: "center",
    borderBottom: "3px solid #5D3FD3",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: "0 2px 12px rgba(93,63,211,0.06)",
    padding: theme.spacing(2, 3),
    minHeight: 64,
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      padding: theme.spacing(1, 1),
      minHeight: 48,
    },
  },
}));

const TicketHeader = ({ loading, children }) => {
  const classes = useStyles();

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card square className={classes.ticketHeader}>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
