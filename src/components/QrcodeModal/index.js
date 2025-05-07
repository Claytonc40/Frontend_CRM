import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";

import { Dialog, DialogContent, Paper, Typography, useTheme, Button, CircularProgress, Box } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { Refresh as RefreshIcon, Close as CloseIcon, CropFree as QrIcon, Smartphone } from "@material-ui/icons";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose, socketManager]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" scroll="paper" PaperProps={{ style: { borderRadius: 16, background: '#f7f7fa' } }}>
      <DialogContent style={{ padding: 32 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minWidth={340}>
          <QrIcon style={{ fontSize: 40, color: theme.palette.primary.main, marginBottom: 8 }} />
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Escaneie o QR Code
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16, textAlign: 'center' }}>
            Abra o WhatsApp no seu celular <Smartphone style={{ fontSize: 18, verticalAlign: 'middle' }} /> e escaneie o código abaixo para conectar.
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={2}>
            {loading || !qrCode ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ height: 256, width: 256, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <CircularProgress color="primary" />
                <Typography variant="caption" color="textSecondary" style={{ marginTop: 12 }}>
                  Aguardando QR Code...
                </Typography>
              </Box>
            ) : (
              <Box style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 12, marginBottom: 8 }}>
                <QRCode value={qrCode} size={220} />
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              style={{ marginRight: 8, borderRadius: 8 }}
              disabled={loading}
            >
              Novo QR Code
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CloseIcon />}
              onClick={onClose}
              style={{ borderRadius: 8 }}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
