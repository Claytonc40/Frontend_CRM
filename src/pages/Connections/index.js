import { format, parseISO } from "date-fns";
import React, { useCallback, useContext, useState } from "react";
import { toast } from "sonner";

import {
	Box,
	Button,
	Card,
	CircularProgress,
	Fade,
	Paper,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import {
	CheckCircle2,
	MessageSquare,
	Pencil,
	Plus as PlusIcon,
	QrCode,
	RefreshCw,
	Trash2,
	WifiOff,
} from "lucide-react";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import WhatsAppModal from "../../components/WhatsAppModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import { Can } from "../../components/Can";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderRadius: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: "#5D3FD3",
  },
  pageTitle: {
    color: "#333",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: 8,
  },
  pageSubtitle: {
    color: "#666",
    fontSize: "0.9rem",
    marginBottom: theme.spacing(2),
  },
  addButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    borderRadius: 10,
    padding: theme.spacing(1, 3),
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  connectionCard: {
    borderRadius: 16,
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    background: "#fafbfc",
    padding: 0,
    transition: "all 0.2s ease",
    position: "relative",
    border: "1px solid #f0f0f0",
    "&:hover": {
      boxShadow: "0 8px 32px rgba(93,63,211,0.10)",
      transform: "translateY(-2px)",
    },
  },
  connectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 3, 1, 3),
    borderBottom: "1px solid #f0f0f0",
  },
  connectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  connectionName: {
    fontWeight: 700,
    fontSize: "1.15rem",
    color: "#222",
    marginRight: theme.spacing(1),
  },
  connectionBadge: {
    padding: theme.spacing(0.3, 1),
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
    color: "#0288d1",
    fontSize: "0.70rem",
    marginLeft: theme.spacing(0.5),
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: 1,
  },
  connectionBody: {
    padding: theme.spacing(2),
  },
  connectionInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#666",
    },
    "& span": {
      color: "#666",
      fontSize: "0.9rem",
    },
  },
  connectionStatus: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  connectionActions: {
    display: "flex",
    gap: theme.spacing(1.5),
    justifyContent: "flex-end",
    padding: theme.spacing(2, 3, 2, 3),
    background: "#f7f7fa",
    borderTop: "1px solid #f0f0f0",
  },
  actionButton: {
    borderRadius: 10,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: theme.spacing(1, 2.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    boxShadow: "none",
    textTransform: "none",
  },
  disconnectButton: {
    backgroundColor: "#ffb3a7",
    color: "#b71c1c",
    border: "none",
    "&:hover": {
      backgroundColor: "#ff867c",
      color: "#b71c1c",
    },
  },
  editButton: {
    backgroundColor: "#5D3FD3",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  deleteButton: {
    backgroundColor: "#ffb3a7",
    color: "#b71c1c",
    border: "none",
    "&:hover": {
      backgroundColor: "#ff867c",
      color: "#b71c1c",
    },
  },
  connectedStatus: {
    backgroundColor: green[50],
    color: green[800],
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 16,
    fontSize: "0.85rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  connectedTimestamp: {
    fontSize: "0.75rem",
    color: "#888",
    marginLeft: theme.spacing(1),
  },
  updateButton: {
    color: "#5D3FD3",
    backgroundColor: "white",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    padding: theme.spacing(0.5, 2),
    fontSize: "0.875rem",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
    marginLeft: "auto",
  },
  sessionButton: {
    borderRadius: 8,
    padding: theme.spacing(0.75, 2),
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    boxShadow: "none",
    margin: theme.spacing(0, 0.5),
  },
  syncButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  pageTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "40%",
      height: 3,
      bottom: -5,
      left: 0,
      backgroundColor: "#5D3FD3",
      borderRadius: 2,
    },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  loadingText: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
}));

const CustomToolTip = ({ title, content, children }) => {
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        tooltip: classes.tooltip,
        popper: classes.tooltipPopper,
      }}
      title={
        <React.Fragment>
          <Typography gutterBottom color="inherit">
            {title}
          </Typography>
          {content && <Typography>{content}</Typography>}
        </React.Fragment>
      }
    >
      {children}
    </Tooltip>
  );
};

const Connections = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      setIsLoadingQR(true);
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = useCallback((whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  }, []);

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, []);

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toast.error(err.message);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toast.error(err.message);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      <QrcodeModal
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
      />
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />
      <MainHeader>
        <div>
          <Typography className={classes.pageTitle}>
            Conexões WhatsApp
          </Typography>
          <Typography className={classes.pageSubtitle}>
            Gerencie suas contas e conexões do WhatsApp
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <Can
            role={user.profile}
            perform="connections-page:addConnection"
            yes={() => (
              <Button
                variant="contained"
                className={classes.addButton}
                startIcon={<PlusIcon size={20} />}
                onClick={handleOpenWhatsAppModal}
              >
                Adicionar
              </Button>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {loading ? (
        <Paper className={classes.mainPaper}>
          <Box className={classes.loadingContainer}>
            <CircularProgress color="primary" />
            <Typography className={classes.loadingText}>
              Carregando conexões...
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          {whatsApps?.length > 0 ? (
            whatsApps.map((whatsApp, index) => (
              <Fade
                in={true}
                key={whatsApp.id}
                timeout={300}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className={classes.connectionCard}>
                  <div className={classes.connectionHeader}>
                    <div className={classes.connectionTitle}>
                      <MessageSquare size={28} />
                      <Typography className={classes.connectionName}>
                        {whatsApp.name}
                      </Typography>
                      {whatsApp.isDefault && (
                        <div className={classes.connectionBadge}>PADRÃO</div>
                      )}
                    </div>
                    <div className={classes.connectionStatus}>
                      {whatsApp.status === "CONNECTED" && (
                        <div className={classes.connectedStatus}>
                          <CheckCircle2 size={18} color={green[700]} />
                          Conectado
                          <span className={classes.connectedTimestamp}>
                            Atualizado em:{" "}
                            {format(
                              parseISO(whatsApp.updatedAt),
                              "dd/MM/yy HH:mm"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={classes.connectionActions}>
                    {whatsApp.status === "CONNECTED" && (
                      <Button
                        variant="contained"
                        className={`${classes.actionButton} ${classes.disconnectButton}`}
                        startIcon={<WifiOff size={20} />}
                        onClick={() =>
                          handleOpenConfirmationModal("disconnect", whatsApp.id)
                        }
                      >
                        Desconectar
                      </Button>
                    )}
                    {whatsApp.status === "DISCONNECTED" && (
                      <>
                        <Button
                          variant="contained"
                          className={`${classes.actionButton} ${classes.editButton}`}
                          startIcon={<RefreshCw size={20} />}
                          onClick={() =>
                            handleStartWhatsAppSession(whatsApp.id)
                          }
                        >
                          Reconectar
                        </Button>
                        <Button
                          variant="contained"
                          className={`${classes.actionButton} ${classes.disconnectButton}`}
                          startIcon={<QrCode size={20} />}
                          onClick={() => handleRequestNewQrCode(whatsApp.id)}
                          disabled={isLoadingQR}
                        >
                          {isLoadingQR ? "Carregando..." : "Novo QR Code"}
                        </Button>
                      </>
                    )}
                    {whatsApp.status === "qrcode" && (
                      <Button
                        variant="contained"
                        className={`${classes.actionButton} ${classes.editButton}`}
                        startIcon={<QrCode size={20} />}
                        onClick={() => handleOpenQrModal(whatsApp)}
                      >
                        QR Code
                      </Button>
                    )}
                    <Can
                      role={user.profile}
                      perform="connections-page:editOrDeleteConnection"
                      yes={() => (
                        <>
                          <Button
                            variant="contained"
                            className={`${classes.actionButton} ${classes.editButton}`}
                            startIcon={<Pencil size={20} />}
                            onClick={() => handleEditWhatsApp(whatsApp)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="contained"
                            className={`${classes.actionButton} ${classes.deleteButton}`}
                            startIcon={<Trash2 size={20} />}
                            onClick={() =>
                              handleOpenConfirmationModal("delete", whatsApp.id)
                            }
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                    />
                  </div>
                </Card>
              </Fade>
            ))
          ) : (
            <Paper className={classes.mainPaper}>
              <Typography align="center" color="textSecondary">
                Nenhuma conexão configurada
              </Typography>
            </Paper>
          )}
        </>
      )}
    </MainContainer>
  );
};

export default Connections;
