import React, { useContext, useEffect, useState } from "react";

import {
  Badge,
  Button,
  FormControlLabel,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Switch,
} from "@material-ui/core";

import {
  MarkChatUnreadRounded,
  PendingActionsRounded,
  MarkChatReadRounded,
  SearchRounded,
  AddRounded,
} from "@material-ui/icons";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { TagsFilter } from "../TagsFilter";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: "#faf9fd",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.08)",
    padding: theme.spacing(2, 0, 2, 0),
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: theme.spacing(2, 2, 0, 2),
    boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
    padding: theme.spacing(0.5, 1, 0.5, 1),
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
    fontWeight: 700,
    fontSize: 17,
    color: "#888",
    borderRadius: 12,
    margin: "0 4px",
    transition: "background 0.2s",
    "&.Mui-selected": {
      color: "#5D3FD3",
      background: "#f3f0fa",
    },
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 16,
    margin: theme.spacing(2, 2, 2, 2),
    boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
    gap: 16,
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      gap: 10,
      padding: theme.spacing(2, 1, 2, 1),
    },
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2, 2, 0, 2),
    borderBottom: "none",
    background: "transparent",
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
    boxShadow: "0 1.5px 6px rgba(93,63,211,0.10)",
    border: "1.5px solid #5D3FD3",
    transition: "box-shadow 0.2s",
    "&:focus-within": {
      boxShadow: "0 2px 12px rgba(93,63,211,0.15)",
    },
  },

  searchIcon: {
    color: "#5D3FD3",
    marginLeft: 10,
    marginRight: 10,
    alignSelf: "center",
    fontSize: 28,
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 25,
    padding: "12px 16px",
    outline: "none",
    fontSize: 17,
    background: "transparent",
    color: "#333",
  },

  badge: {
    right: 0,
    background: "#5D3FD3",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    padding: "0 8px",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },
}));

const TicketsManager = () => {
  const classes = useStyles();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const { user } = useContext(AuthContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    setSearchParam(searchedTerm);
    if (searchedTerm === "") {
      setTab("open");
    } else if (tab !== "search") {
      setTab("search");
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <Paper elevation={0} square className={classes.searchContainer}>
        <div className={classes.serachInputWrapper}>
          <SearchRounded className={classes.searchIcon} />
          <input
            type="text"
            placeholder={i18n.t("tickets.search.placeholder")}
            className={classes.searchInput}
            value={searchParam}
            onChange={handleSearch}
          />
        </div>
      </Paper>
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
          TabIndicatorProps={{ style: { height: 0 } }}
        >
          <Tab
            value={"open"}
            icon={<MarkChatUnreadRounded style={{ fontSize: 32 }} />}
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                overlap="rectangular"
                color="primary"
              >
                {i18n.t("tickets.tabs.open.title")}
              </Badge>
            }
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"pending"}
            icon={<PendingActionsRounded style={{ fontSize: 32 }} />}
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                overlap="rectangular"
                color="primary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<MarkChatReadRounded style={{ fontSize: 32 }} />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <Button
          variant="contained"
          style={{
            background: "#5D3FD3",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 12,
            padding: "12px 28px",
            fontSize: 17,
            boxShadow: "0 2px 8px rgba(93,63,211,0.12)",
            transition: "all 0.2s",
          }}
          startIcon={<AddRounded />}
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
                  onChange={() => setShowAllTickets((prevState) => !prevState)}
                  name="showAllTickets"
                  color="primary"
                />
              }
            />
          )}
        />
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
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

      <TabPanel value={tab} name="pending" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          status="pending"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
        />
      </TabPanel>

      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        <TicketsList
          searchParam={searchParam}
          tags={selectedTags}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManager;
