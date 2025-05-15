import { Field, Form, Formik } from "formik";
import { head } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { i18n } from "../../translate/i18n";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import AnnouncementIcon from "@material-ui/icons/Announcement";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";

import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 12,
    },
  },
  dialogTitle: {
    background: "linear-gradient(90deg, #5D3FD3 0%, #6151FF 100%)",
    color: "white",
    padding: theme.spacing(3),
    "& h2": {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
    marginBottom: theme.spacing(2),
  },
  saveButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4b32a8",
    },
    borderRadius: 8,
    padding: "8px 24px",
    fontWeight: 600,
  },
  cancelButton: {
    color: "#5D3FD3",
    borderColor: "#5D3FD3",
    "&:hover": {
      borderColor: "#4b32a8",
      backgroundColor: "rgba(93, 63, 211, 0.04)",
    },
    borderRadius: 8,
    padding: "8px 24px",
    fontWeight: 600,
  },
  attachButton: {
    color: "#5D3FD3",
    borderColor: "#5D3FD3",
    "&:hover": {
      borderColor: "#4b32a8",
      backgroundColor: "rgba(93, 63, 211, 0.04)",
    },
    borderRadius: 8,
    padding: "8px 16px",
    marginRight: theme.spacing(2),
  },
  sectionTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "30%",
      height: 2,
      bottom: -4,
      left: 0,
      backgroundColor: "#5D3FD3",
      borderRadius: 2,
    },
  },
  infoPanel: {
    backgroundColor: "rgba(93, 63, 211, 0.05)",
    padding: theme.spacing(2),
    borderRadius: 8,
    marginBottom: theme.spacing(3),
  },
  attachmentDisplay: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: 8,
    "& .MuiButton-root": {
      textTransform: "none",
    },
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  helpText: {
    fontSize: "0.75rem",
    color: "rgba(0, 0, 0, 0.6)",
    marginTop: -theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}));

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Obrigatório"),
  text: Yup.string().required("Obrigatório"),
});

const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
  const classes = useStyles();

  const initialState = {
    title: "",
    text: "",
    priority: 3,
    status: true,
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!announcementId) return;

        const { data } = await api.get(`/announcements/${announcementId}`);
        setAnnouncement((prevState) => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toast.error(err.message);
    }
  }, [announcementId, open]);

  const handleClose = () => {
    setAnnouncement(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveAnnouncement = async (values) => {
    const announcementData = { ...values };
    try {
      if (announcementId) {
        await api.put(`/announcements/${announcementId}`, announcementData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(
            `/announcements/${announcementId}/media-upload`,
            formData
          );
        }
        toast.success(i18n.t("announcements.toasts.success"));
      } else {
        const { data } = await api.post("/announcements", announcementData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/announcements/${data.id}/media-upload`, formData);
        }
        toast.success(i18n.t("announcements.toasts.success"));
      }

      if (typeof reload === "function") {
        reload();
      }
      handleClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (announcement.mediaPath) {
      await api.delete(`/announcements/${announcement.id}/media-upload`);
      setAnnouncement((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("announcements.toasts.deleted"));
      if (typeof reload === "function") {
        reload();
      }
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        className={classes.dialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          {announcementId
            ? `${i18n.t("announcements.dialog.edit")}`
            : `${i18n.t("announcements.dialog.add")}`}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={announcement}
          enableReinitialize={true}
          validationSchema={AnnouncementSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveAnnouncement(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
                <Paper className={classes.infoPanel} elevation={0}>
                  <Typography variant="body2">
                    <span>ℹ️</span> Crie e gerencie anúncios para manter sua
                    equipe e clientes informados sobre atualizações importantes.
                  </Typography>
                </Paper>

                <div className={classes.formSection}>
                  <Typography className={classes.sectionTitle}>
                    Informações do Anúncio
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        label={i18n.t("announcements.dialog.form.title")}
                        name="title"
                        error={touched.title && Boolean(errors.title)}
                        helperText={touched.title && errors.title}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AnnouncementIcon style={{ color: "#5D3FD3" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        label={i18n.t("announcements.dialog.form.text")}
                        name="text"
                        error={touched.text && Boolean(errors.text)}
                        helperText={touched.text && errors.text}
                        variant="outlined"
                        margin="dense"
                        multiline={true}
                        rows={7}
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="status-selection-label">
                          {i18n.t("announcements.dialog.form.status")}
                        </InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("announcements.dialog.form.status")}
                          labelId="status-selection-label"
                          id="status"
                          name="status"
                          error={touched.status && Boolean(errors.status)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ToggleOnIcon style={{ color: "#5D3FD3" }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value={true}>Ativo</MenuItem>
                          <MenuItem value={false}>Inativo</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel id="priority-selection-label">
                          {i18n.t("announcements.dialog.form.priority")}
                        </InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("announcements.dialog.form.priority")}
                          labelId="priority-selection-label"
                          id="priority"
                          name="priority"
                          error={touched.priority && Boolean(errors.priority)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PriorityHighIcon
                                  style={{ color: "#5D3FD3" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value={1}>Alta</MenuItem>
                          <MenuItem value={2}>Média</MenuItem>
                          <MenuItem value={3}>Baixa</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>

                    {(announcement.mediaPath || attachment) && (
                      <Grid item xs={12}>
                        <Box className={classes.attachmentDisplay}>
                          <Button startIcon={<AttachFileIcon />}>
                            {attachment
                              ? attachment.name
                              : announcement.mediaName}
                          </Button>
                          <IconButton
                            onClick={() => setConfirmationOpen(true)}
                            color="secondary"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </DialogContent>

              <DialogActions className={classes.dialogActions}>
                {!attachment && !announcement.mediaPath && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                    className={classes.attachButton}
                    startIcon={<AttachFileIcon />}
                  >
                    {i18n.t("announcements.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.cancelButton}
                >
                  {i18n.t("announcements.dialog.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={`${classes.btnWrapper} ${classes.saveButton}`}
                >
                  {announcementId
                    ? `${i18n.t("announcements.dialog.buttons.edit")}`
                    : `${i18n.t("announcements.dialog.buttons.add")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default AnnouncementModal;
