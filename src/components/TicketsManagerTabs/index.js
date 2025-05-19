import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import Badge from "@material-ui/core/Badge";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { CheckSquare, Inbox, Search } from "lucide-react";

import NewTicketModal from "../NewTicketModal";
import TabPanel from "../TabPanel";
import TicketsList from "../TicketsListCustom";

import { Button } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import { Can } from "../Can";
import { TagsFilter } from "../TagsFilter";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { UsersFilter } from "../UsersFilter";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 8,
    background: "#faf9fd",
    boxShadow: "0 2px 12px rgba(93,63,211,0.06)",
    padding: theme.spacing(0.5, 0, 0.5, 0),
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: theme.spacing(0.5, 0.5, 0, 0.5),
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    padding: theme.spacing(0.25, 0.25, 0.25, 0.25),
  },

  tabsInternal: {
    flex: "none",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: theme.spacing(0.5, 0.5, 0, 0.5),
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    padding: theme.spacing(0.25, 0.25, 0.25, 0.25),
  },

  tab: {
    minWidth: 70,
    width: 70,
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    borderRadius: 6,
    margin: "0 2px",
    padding: "4px 6px",
    transition: "all 0.2s",
    "& .MuiTab-wrapper": {
      flexDirection: "row",
      gap: 4,
    },
    "& svg": {
      width: 16,
      height: 16,
    },
    "&.Mui-selected": {
      color: "#5D3FD3",
      background: "#f3f0fa",
    },
  },

  internalTab: {
    minWidth: 70,
    width: 70,
    fontSize: 13,
    padding: 4,
    fontWeight: 600,
    color: "#666",
    borderRadius: 6,
    margin: "0 2px",
    transition: "all 0.2s",
    "&.Mui-selected": {
      color: "#5D3FD3",
      background: "#f3f0fa",
    },
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: theme.spacing(0.75, 1, 0.75, 1),
    borderRadius: 8,
    margin: theme.spacing(0.5, 0.5, 0.5, 0.5),
    boxShadow: "0 1px 4px rgba(93,63,211,0.04)",
    gap: 8,
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      gap: 8,
      padding: theme.spacing(1, 0.75, 1, 0.75),
    },
  },

  serachInputWrapper: {
    flex: 1,
    background: "#fff",
    display: "flex",
    borderRadius: 6,
    padding: 2,
    marginRight: theme.spacing(0.5),
    boxShadow: "0 1px 4px rgba(93,63,211,0.06)",
    border: "1px solid #5D3FD3",
    transition: "box-shadow 0.2s",
    "&:focus-within": {
      boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    },
  },

  searchIcon: {
    color: "#5D3FD3",
    marginLeft: 8,
    marginRight: 8,
    alignSelf: "center",
    width: 18,
    height: 18,
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 4,
    padding: "8px 12px",
    outline: "none",
    fontSize: 14,
    background: "transparent",
    color: "#333",
  },

  badge: {
    right: 0,
    background: "#5D3FD3",
    color: "#fff",
    fontWeight: 600,
    fontSize: 12,
    padding: "0 6px",
    borderRadius: 6,
    boxShadow: "0 1px 4px rgba(93,63,211,0.10)",
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },

  insiderTabPanel: {
    height: "100%",
    marginTop: "-72px",
    paddingTop: "72px",
  },

  insiderDoubleTabPanel: {
    display: "flex",
    flexDirection: "column",
    marginTop: "-72px",
    paddingTop: "72px",
    height: "100%",
  },

  labelContainer: {
    width: "auto",
    padding: 0,
  },
  iconLabelWrapper: {
    flexDirection: "row",
    "& > *:first-child": {
      marginBottom: "3px !important",
      marginRight: 16,
    },
  },
  insiderTabLabel: {
    [theme.breakpoints.down(1600)]: {
      display: "none",
    },
  },
  smallFormControl: {
    "& .MuiOutlinedInput-input": {
      padding: "12px 10px",
    },
    "& .MuiInputLabel-outlined": {
      marginTop: "-6px",
    },
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<Inbox size={16} />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<CheckSquare size={16} />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            icon={<Search size={16} />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        {tab === "search" ? (
          <div className={classes.serachInputWrapper}>
            <Search size={18} className={classes.searchIcon} />
            <InputBase
              className={classes.searchInput}
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <Button
              variant="contained"
              style={{
                background: "#5D3FD3",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 6,
                padding: "6px 16px",
                fontSize: 14,
                boxShadow: "0 1px 4px rgba(93,63,211,0.10)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          className={classes.tabsInternal}
          TabIndicatorProps={{ style: { height: 0 } }}
        >
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
            classes={{ root: classes.internalTab }}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
            classes={{ root: classes.internalTab }}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          tags={selectedTags}
          users={selectedUsers}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
