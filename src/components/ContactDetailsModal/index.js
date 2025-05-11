import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Business as BusinessIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  LocalOffer as LocalOfferIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  WhatsApp as WhatsAppIcon,
  Work as WorkIcon,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import Flag from "react-world-flags";
import { toast } from "sonner";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TagModal from "../TagModal";
import { TagsContainer } from "../TagsContainer";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  dialogPaper: {
    borderRadius: 12,
    padding: theme.spacing(1),
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    maxWidth: 700,
    width: "100%",
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2, 2, 1),
    "& h2": {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
  },
  closeButton: {
    color: theme.palette.grey[700],
    padding: 8,
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: 40,
      height: 3,
      bottom: -5,
      left: 0,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 2,
    },
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    fontSize: "2rem",
    backgroundColor: theme.palette.primary.main,
  },
  contactName: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  contactTitle: {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  contactInfoItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1.5),
    "& .MuiSvgIcon-root": {
      marginRight: theme.spacing(1.5),
      color: theme.palette.primary.main,
    },
  },
  infoText: {
    fontSize: "0.95rem",
  },
  infoLabel: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.25),
  },
  tagChip: {
    margin: theme.spacing(0.5),
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
  addTagButton: {
    margin: theme.spacing(0.5),
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
    },
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
  },
  fieldBox: {
    marginBottom: theme.spacing(2),
  },
  countryFlag: {
    marginRight: theme.spacing(0.75),
    width: 20,
    height: 15,
    boxShadow: "0 0 1px rgba(0,0,0,0.2)",
    borderRadius: 2,
  },
  phoneWithFlag: {
    display: "flex",
    alignItems: "center",
  },
  extraInfoItem: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    padding: theme.spacing(1.5),
    borderRadius: 8,
    marginBottom: theme.spacing(1.5),
  },
  extraInfoName: {
    fontSize: "0.9rem",
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
  },
  extraInfoValue: {
    fontSize: "1rem",
  },
  notesContainer: {
    marginTop: theme.spacing(2),
  },
  notesPaper: {
    padding: theme.spacing(2),
    backgroundColor: "rgba(255, 243, 224, 0.2)",
    border: "1px solid rgba(255, 167, 38, 0.2)",
    borderRadius: 8,
  },
  notesInput: {
    marginBottom: theme.spacing(1),
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  actionButton: {
    borderRadius: 8,
    textTransform: "none",
    padding: theme.spacing(0.75, 2),
    fontSize: "0.9rem",
  },
  saveButton: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  editButton: {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
}));

const ContactDetailsModal = ({ open, onClose, contactId }) => {
  const classes = useStyles();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [notes, setNotes] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);

  useEffect(() => {
    const fetchContact = async () => {
      if (!open || !contactId) {
        setContact(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get(`/contacts/${contactId}`);
        setContact(data);
        setNotes(data.notes || "");
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(err.message);
      }
    };

    fetchContact();
  }, [open, contactId]);

  const handleSaveNotes = async () => {
    try {
      await api.put(`/contacts/${contactId}`, {
        ...contact,
        notes,
      });
      toast.success(
        i18n.t("contactModal.success") || "Notas salvas com sucesso"
      );
      setEditingNotes(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleOpenTagModal = (tagId = null) => {
    setSelectedTagId(tagId);
  };

  const handleCloseTagModal = () => {
    setSelectedTagId(null);
    setTagModalOpen(false);
  };

  const reloadContact = async () => {
    try {
      const { data } = await api.get(`/contacts/${contactId}`);
      setContact(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getCountryCode = (number) => {
    if (!number) return "br";
    if (number.startsWith("1")) return "us";
    if (number.startsWith("351")) return "pt";
    if (number.startsWith("55")) return "br";
    if (number.startsWith("54")) return "ar";
    if (number.startsWith("598")) return "uy";
    if (number.startsWith("595")) return "py";
    if (number.startsWith("591")) return "bo";
    if (number.startsWith("56")) return "cl";
    if (number.startsWith("51")) return "pe";
    if (number.startsWith("57")) return "co";
    if (number.startsWith("58")) return "ve";

    return "br"; // Padrão: Brasil
  };

  const formatPhoneNumber = (number) => {
    if (!number) return "-";

    // Verifica se o número já tem um código de país
    if (number.startsWith("+")) {
      return number;
    }

    // Extrai código do país e formato para exibição
    let countryCode = "55"; // Brasil como padrão
    let formattedNumber = number;

    if (number.startsWith("1")) {
      countryCode = "1";
    } else if (number.startsWith("351")) {
      countryCode = "351";
    } else if (number.startsWith("55")) {
      countryCode = "55";
    } else if (number.startsWith("54")) {
      countryCode = "54";
    } else if (number.startsWith("598")) {
      countryCode = "598";
    } else if (number.startsWith("595")) {
      countryCode = "595";
    } else if (number.startsWith("591")) {
      countryCode = "591";
    } else if (number.startsWith("56")) {
      countryCode = "56";
    } else if (number.startsWith("51")) {
      countryCode = "51";
    } else if (number.startsWith("57")) {
      countryCode = "57";
    } else if (number.startsWith("58")) {
      countryCode = "58";
    }

    // Formatar para exibição legível
    let nationalNumber = formattedNumber.substring(countryCode.length);
    if (nationalNumber.length > 8) {
      // Formato para números de celular brasileiros: +55 XX XXXXX-XXXX
      if (countryCode === "55" && nationalNumber.length === 11) {
        return `+${countryCode} ${nationalNumber.substring(
          0,
          2
        )} ${nationalNumber.substring(2, 7)}-${nationalNumber.substring(7)}`;
      }
      // Outros países, apenas agrupe em blocos de 3-4
      return `+${countryCode} ${nationalNumber.replace(
        /(\d{3})(\d{3})(\d{4})/,
        "$1 $2 $3"
      )}`;
    }

    return `+${countryCode} ${nationalNumber}`;
  };

  if (loading || !contact) {
    return null;
  }

  const getFirstLetters = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h2">
          {i18n.t("contactDetailsModal.title")}
        </Typography>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <div className={classes.root}>
          <div className={classes.section}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  className={classes.avatar}
                  src={contact.profilePicUrl}
                  alt={contact.name}
                >
                  {!contact.profilePicUrl && getFirstLetters(contact.name)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography className={classes.contactName}>
                  {contact.name}
                </Typography>
                <Typography className={classes.contactTitle}>
                  {contact.extraInfo?.jobTitle || "CEO"} at{" "}
                  {contact.extraInfo?.company ||
                    contact.name.split(" ")[0] + " Enterprises"}
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Enviar mensagem">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      onClose();
                      // Aqui você pode adicionar lógica para abrir o chat
                    }}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar contato">
                  <IconButton
                    onClick={() => {
                      onClose();
                      // Aqui você pode adicionar lógica para editar o contato
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </div>

          <div className={classes.section}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography className={classes.sectionTitle}>
                  {i18n.t("contactDetailsModal.tags")}
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title={i18n.t("contactDetailsModal.addTags")}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleOpenTagModal()}
                  >
                    <LocalOfferIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Box mt={1}>{contact && <TagsContainer ticket={contact} />}</Box>
          </div>

          <Divider className={classes.divider} />

          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>
              {i18n.t("contactDetailsModal.contactInfo")}
            </Typography>

            <div className={classes.contactInfoItem}>
              <PhoneIcon />
              <div>
                <Typography className={classes.infoLabel}>
                  {i18n.t("contactDetailsModal.whatsappNumber")}
                </Typography>
                <div className={classes.phoneWithFlag}>
                  <Flag
                    code={getCountryCode(contact.number)}
                    className={classes.countryFlag}
                  />
                  <Typography className={classes.infoText}>
                    {formatPhoneNumber(contact.number)}
                  </Typography>
                </div>
              </div>
            </div>

            <div className={classes.contactInfoItem}>
              <EmailIcon />
              <div>
                <Typography className={classes.infoLabel}>
                  {i18n.t("contactDetailsModal.email")}
                </Typography>
                <Typography className={classes.infoText}>
                  {contact.email || "-"}
                </Typography>
              </div>
            </div>

            <div className={classes.contactInfoItem}>
              <BusinessIcon />
              <div>
                <Typography className={classes.infoLabel}>
                  {i18n.t("contactDetailsModal.company")}
                </Typography>
                <Typography className={classes.infoText}>
                  {contact.extraInfo?.company ||
                    contact.name.split(" ")[0] + " Enterprises"}
                </Typography>
              </div>
            </div>

            <div className={classes.contactInfoItem}>
              <WorkIcon />
              <div>
                <Typography className={classes.infoLabel}>
                  {i18n.t("contactDetailsModal.position")}
                </Typography>
                <Typography className={classes.infoText}>
                  {contact.extraInfo?.jobTitle || "CEO"}
                </Typography>
              </div>
            </div>
          </div>

          {contact.extraInfo && contact.extraInfo.length > 0 && (
            <div className={classes.section}>
              <Typography className={classes.sectionTitle}>
                {i18n.t("contactDetailsModal.additionalInfo")}
              </Typography>

              {contact.extraInfo.map((info, index) => (
                <Paper
                  key={index}
                  className={classes.extraInfoItem}
                  elevation={0}
                >
                  <Typography className={classes.extraInfoName}>
                    {info.name}:
                  </Typography>
                  <Typography className={classes.extraInfoValue}>
                    {info.value}
                  </Typography>
                </Paper>
              ))}
            </div>
          )}

          <div className={classes.section}>
            <Typography className={classes.sectionTitle}>
              {i18n.t("contactDetailsModal.notes")}
            </Typography>

            <div className={classes.notesContainer}>
              {editingNotes ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    placeholder="Adicione observações sobre este contato..."
                    className={classes.notesInput}
                  />
                  <div className={classes.actionButtons}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(contact.notes || "");
                      }}
                      className={classes.actionButton}
                      startIcon={<CloseIcon />}
                    >
                      {i18n.t("contactDetailsModal.cancelButton")}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={handleSaveNotes}
                      className={`${classes.actionButton} ${classes.saveButton}`}
                      startIcon={<SaveIcon />}
                    >
                      {i18n.t("contactDetailsModal.saveButton")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Paper className={classes.notesPaper} elevation={0}>
                    <Typography>
                      {notes || i18n.t("contactDetailsModal.noNotes")}
                    </Typography>
                  </Paper>
                  <div className={classes.actionButtons}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setEditingNotes(true)}
                      className={`${classes.actionButton} ${classes.editButton}`}
                      startIcon={<EditIcon />}
                    >
                      {notes
                        ? i18n.t("contactDetailsModal.editNote")
                        : i18n.t("contactDetailsModal.addNote")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagId={selectedTagId}
        reload={reloadContact}
      />
    </Dialog>
  );
};

export default ContactDetailsModal;
