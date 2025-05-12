import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tabPanel: {
    background: "#faf9fd",
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(93, 63, 211, 0.04)",
    padding: "16px 12px",
    minHeight: 120,
    transition: "box-shadow 0.2s, background 0.2s",
    [theme.breakpoints.down("xs")]: {
      padding: "12px 6px",
      borderRadius: 6,
    },
  },
  internalTab: {
    minWidth: 70,
    width: 70,
    padding: 4,
    fontWeight: 600,
    fontSize: 13,
    color: "#666",
    borderRadius: 6,
    margin: "0 2px",
    transition: "all 0.2s",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    "&.Mui-selected": {
      color: "#fff",
      background: "#5D3FD3",
      boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    },
  },
  badgeSelected: {
    background: "#fff",
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: 13,
    padding: "0 8px",
    borderRadius: 6,
    boxShadow: "0 1px 4px rgba(93,63,211,0.10)",
    marginLeft: 8,
  },
  tabGroup: {
    display: "flex",
    gap: 8,
    background: "#fff",
    borderRadius: 8,
    padding: 4,
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tabButton: {
    position: "relative",
    minWidth: 70,
    fontWeight: 600,
    fontSize: 13,
    borderRadius: 6,
    padding: "6px 12px",
    background: "#f3f0fa",
    color: "#5D3FD3",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    "&.selected": {
      background: "#5D3FD3",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    },
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    background: "#fff",
    color: "#5D3FD3",
    fontWeight: 700,
    fontSize: 13,
    padding: "0 7px",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    border: "2px solid #5D3FD3",
  },
}));

const TabPanel = ({ children, value, name, ...rest }) => {
  const classes = useStyles();
  if (value === name) {
    return (
      <div
        role="tabpanel"
        id={`simple-tabpanel-${name}`}
        aria-labelledby={`simple-tab-${name}`}
        className={classes.tabPanel}
        {...rest}
      >
        <>{children}</>
      </div>
    );
  } else return null;
};

export default TabPanel;
