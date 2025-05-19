/* eslint-disable no-unused-vars */

import React, { useContext, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

import { useHistory } from "react-router-dom";

import {
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import DescriptionIcon from "@material-ui/icons/Description";
import EditIcon from "@material-ui/icons/Edit";
import CampaignIcon from "@material-ui/icons/Flag";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";

import MainHeader from "../../components/MainHeader";

import { isArray } from "lodash";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { SocketContext } from "../../context/Socket/SocketContext";

import { useDate } from "../../hooks/useDate";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    ...theme.scrollbarStyles,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2.5, 3),
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.13)",
    minHeight: 64,
  },
  headerIcon: {
    color: "#5D3FD3",
    fontSize: 32,
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 24,
    color: "#5D3FD3",
    letterSpacing: 0.2,
  },
  searchField: {
    minWidth: 220,
    maxWidth: 320,
    background: "#f7f8fa",
    borderRadius: 12,
    marginRight: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      background: "#fff",
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
    },
  },
  addButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    minWidth: 120,
    boxShadow: "0 4px 12px rgba(93,63,211,0.15)",
    fontSize: 15,
    background: "#5D3FD3",
    color: "#fff",
    "&:hover": {
      background: "#4930A8",
    },
    padding: "10px 24px",
  },
  campaignCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(3),
    margin: "0 auto",
    transition: "all 0.3s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 220,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing(2),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardStatus: {
    fontWeight: 600,
    fontSize: 14,
    color: "#666",
    background: "#f8f7ff",
    borderRadius: 10,
    padding: "6px 16px",
    marginLeft: 8,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: theme.spacing(2),
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#666",
    fontSize: 14,
    background: "#f8f7ff",
    borderRadius: 10,
    padding: "8px 16px",
    "& b": {
      color: "#5D3FD3",
      fontWeight: 600,
    },
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: "auto",
    justifyContent: "flex-end",
    paddingTop: theme.spacing(2),
    borderTop: "1px solid rgba(93,63,211,0.1)",
  },
  actionButton: {
    color: "#666",
    "&:hover": {
      background: "rgba(93,63,211,0.1)",
      color: "#5D3FD3",
    },
  },
  pauseButton: {
    color: "#ff9800",
    "&:hover": {
      background: "rgba(255,152,0,0.1)",
    },
  },
  playButton: {
    color: "#4caf50",
    "&:hover": {
      background: "rgba(76,175,80,0.1)",
    },
  },
  deleteButton: {
    color: "#ff4d4f",
    "&:hover": {
      background: "rgba(255,77,79,0.1)",
    },
  },
}));

const Campaigns = () => {
  const classes = useStyles();

  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);

  const { datetimeToClient } = useDate();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toast.error(err.message);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${
            deletingCampaign.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModal
        resetPagination={() => {
          setPageNumber(1);
          fetchCampaigns();
        }}
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        aria-labelledby="form-dialog-title"
        campaignId={selectedCampaign && selectedCampaign.id}
      />
      <MainHeader>
        <div className={classes.headerContainer}>
          <CampaignIcon className={classes.headerIcon} />
          <span className={classes.headerTitle}>
            {i18n.t("campaigns.title")}
          </span>
          <TextField
            placeholder={i18n.t("campaigns.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#5D3FD3" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleOpenCampaignModal}
            color="primary"
            className={classes.addButton}
          >
            {i18n.t("campaigns.buttons.add")}
          </Button>
        </div>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id}>
              <Paper className={classes.campaignCard} elevation={0}>
                <div className={classes.cardHeader}>
                  <Typography className={classes.cardTitle}>
                    {campaign.name}
                  </Typography>
                  <span className={classes.cardStatus}>
                    {formatStatus(campaign.status)}
                  </span>
                </div>
                <div className={classes.infoList}>
                  <div className={classes.infoItem}>
                    <b>{i18n.t("campaigns.table.contactList")}:</b>&nbsp;
                    {campaign.contactListId
                      ? campaign.contactList.name
                      : "Não definida"}
                  </div>
                  <div className={classes.infoItem}>
                    <b>{i18n.t("campaigns.table.whatsapp")}:</b>&nbsp;
                    {campaign.whatsappId
                      ? campaign.whatsapp.name
                      : "Não definido"}
                  </div>
                  <div className={classes.infoItem}>
                    <b>{i18n.t("campaigns.table.scheduledAt")}:</b>&nbsp;
                    {campaign.scheduledAt
                      ? datetimeToClient(campaign.scheduledAt)
                      : "Sem agendamento"}
                  </div>
                  <div className={classes.infoItem}>
                    <b>{i18n.t("campaigns.table.completedAt")}:</b>&nbsp;
                    {campaign.completedAt
                      ? datetimeToClient(campaign.completedAt)
                      : "Não concluída"}
                  </div>
                </div>
                <div className={classes.actions}>
                  {campaign.status === "EM_ANDAMENTO" && (
                    <IconButton
                      onClick={() => cancelCampaign(campaign)}
                      title="Parar Campanha"
                      size="small"
                      className={classes.pauseButton}
                    >
                      <PauseCircleOutlineIcon />
                    </IconButton>
                  )}
                  {campaign.status === "CANCELADA" && (
                    <IconButton
                      onClick={() => restartCampaign(campaign)}
                      title="Reiniciar Campanha"
                      size="small"
                      className={classes.playButton}
                    >
                      <PlayCircleOutlineIcon />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() =>
                      history.push(`/campaign-report/${campaign.id}`)
                    }
                    size="small"
                    className={classes.actionButton}
                  >
                    <DescriptionIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditCampaign(campaign)}
                    className={classes.actionButton}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingCampaign(campaign);
                    }}
                    className={classes.deleteButton}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </div>
              </Paper>
            </Grid>
          ))}
          {loading && (
            <Grid item xs={12}>
              <table>
                <tbody>
                  <TableRowSkeleton columns={8} />
                </tbody>
              </table>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Campaigns;
