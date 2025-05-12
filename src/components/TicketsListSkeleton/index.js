import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Divider from "@material-ui/core/Divider";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  skeletonItem: {
    display: "flex",
    alignItems: "center",
    padding: "18px 20px",
    borderRadius: 14,
    background: "#fff",
    marginBottom: 14,
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.07)",
    [theme.breakpoints.down("xs")]: {
      padding: "12px 10px",
      marginBottom: 10,
    },
  },
  avatar: {
    marginRight: 18,
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.10)",
    borderRadius: "50%",
    background: "#f3f0fa",
  },
  text: {
    flex: 1,
  },
  divider: {
    border: 0,
    height: 8,
    background: "transparent",
  },
}));

const TicketsSkeleton = () => {
  const classes = useStyles();
  return (
    <>
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <Box className={classes.skeletonItem}>
            <div className={classes.avatar}>
              <Skeleton
                animation="wave"
                variant="circle"
                width={48}
                height={48}
                style={{ background: "#e5e0fa" }}
              />
            </div>
            <div className={classes.text}>
              <Skeleton
                animation="wave"
                height={22}
                width={90}
                style={{ borderRadius: 8, background: "#e5e0fa" }}
              />
              <Skeleton
                animation="wave"
                height={18}
                width={140}
                style={{ marginTop: 8, borderRadius: 8, background: "#f3f0fa" }}
              />
            </div>
          </Box>
          {i < 3 && <div className={classes.divider} />}
        </React.Fragment>
      ))}
    </>
  );
};

export default TicketsSkeleton;
