import React, { useContext, useEffect, useRef, useState } from "react";

import { Field, Form, Formik } from "formik";
import { head } from "lodash";
import { toast } from "sonner";
import * as Yup from "yup";

import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import moment from "moment";
import { i18n } from "../../translate/i18n";

import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";

import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff",
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    padding: theme.spacing(3),
    borderBottom: "1px solid rgba(93,63,211,0.1)",
  },
  dialogContent: {
    padding: theme.spacing(3),
    background: "#fff",
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    background: "#f8f7ff",
    borderTop: "1px solid rgba(93,63,211,0.1)",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
    },
  },
  formControl: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
    },
  },
  tabRoot: {
    backgroundColor: "#f8f7ff",
    borderRadius: "12px 12px 0 0",
    minHeight: 48,
    "& .MuiTab-root": {
      minHeight: 48,
      color: "#666",
      "&.Mui-selected": {
        color: "#5D3FD3",
        fontWeight: 600,
      },
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#5D3FD3",
      height: 3,
    },
  },
  messageBox: {
    padding: theme.spacing(3),
    background: "#f8f7ff",
    borderRadius: "0 0 12px 12px",
    marginTop: -1,
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
  actionButton: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    padding: "8px 24px",
  },
  attachButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    background: "#f8f7ff",
    color: "#5D3FD3",
    "&:hover": {
      background: "#e5e0fa",
    },
  },
  deleteButton: {
    color: "#ff4d4f",
    "&:hover": {
      background: "rgba(255,77,79,0.1)",
    },
  },
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const CampaignModal = ({
  open,
  onClose,
  campaignId,
  initialValues,
  onSave,
  resetPagination,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [file, setFile] = useState(null);

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    confirmationMessage1: "",
    confirmationMessage2: "",
    confirmationMessage3: "",
    confirmationMessage4: "",
    confirmationMessage5: "",
    status: "INATIVA", // INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA,
    confirmation: false,
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "Nenhuma",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);
  const [tagLists, setTagLists] = useState([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId },
        });

        setFile(data.files);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      api
        .get(`/contact-lists/list`, { params: { companyId } })
        .then(({ data }) => setContactLists(data));

      api
        .get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => setWhatsapps(data));

      api
        .get(`/tags`, { params: { companyId } })
        .then(({ data }) => {
          const fetchedTags = data.tags;
          // Perform any necessary data transformation here
          const formattedTagLists = fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));
          setTagLists(formattedTagLists);
        })
        .catch((error) => {
          console.error("Error retrieving tags:", error);
        });

      if (!campaignId) return;

      api.get(`/campaigns/${campaignId}`).then(({ data }) => {
        setCampaign((prev) => {
          let prevCampaignData = Object.assign({}, prev);

          Object.entries(data).forEach(([key, value]) => {
            if (key === "scheduledAt" && value !== "" && value !== null) {
              prevCampaignData[key] = moment(value).format("YYYY-MM-DDTHH:mm");
            } else {
              prevCampaignData[key] = value === null ? "" : value;
            }
          });

          return prevCampaignData;
        });
      });
    }
  }, [campaignId, open, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "INATIVA" ||
      (campaign.status === "PROGRAMADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);

        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalziadas."
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const renderConfirmationMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          style: {
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(93,63,211,0.1)",
          },
        }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography
            variant="h6"
            style={{ color: "#5D3FD3", fontWeight: 600 }}
          >
            {campaignEditable
              ? campaignId
                ? `${i18n.t("campaigns.dialog.update")}`
                : `${i18n.t("campaigns.dialog.new")}`
              : `${i18n.t("campaigns.dialog.readonly")}`}
          </Typography>
        </DialogTitle>

        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>

        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
                <Grid spacing={3} container>
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="contactList-selection-label">
                        {i18n.t("campaigns.dialog.form.contactList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.contactList")}
                        placeholder={i18n.t(
                          "campaigns.dialog.form.contactList"
                        )}
                        labelId="contactList-selection-label"
                        id="contactListId"
                        name="contactListId"
                        error={
                          touched.contactListId && Boolean(errors.contactListId)
                        }
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {contactLists &&
                          contactLists.map((contactList) => (
                            <MenuItem
                              key={contactList.id}
                              value={contactList.id}
                            >
                              {contactList.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="tagList-selection-label">
                        {i18n.t("campaigns.dialog.form.tagList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.tagList")}
                        placeholder={i18n.t("campaigns.dialog.form.tagList")}
                        labelId="tagList-selection-label"
                        id="tagListId"
                        name="tagListId"
                        error={touched.tagListId && Boolean(errors.tagListId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {Array.isArray(tagLists) &&
                          tagLists.map((tagList) => (
                            <MenuItem key={tagList.id} value={tagList.id}>
                              {tagList.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="whatsapp-selection-label">
                        {i18n.t("campaigns.dialog.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.whatsapp")}
                        placeholder={i18n.t("campaigns.dialog.form.whatsapp")}
                        labelId="whatsapp-selection-label"
                        id="whatsappId"
                        name="whatsappId"
                        error={touched.whatsappId && Boolean(errors.whatsappId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {whatsapps &&
                          whatsapps.map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      margin="dense"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.FormControl}
                      fullWidth
                    >
                      <InputLabel id="fileListId-selection-label">
                        {i18n.t("campaigns.dialog.form.fileList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.fileList")}
                        name="fileListId"
                        id="fileListId"
                        placeholder={i18n.t("campaigns.dialog.form.fileList")}
                        labelId="fileListId-selection-label"
                        value={values.fileListId || ""}
                      >
                        <MenuItem value={""}>{"Nenhum"}</MenuItem>
                        {file.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} item>
                    <Tabs
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      className={classes.tabRoot}
                      onChange={(e, v) => setMessageTab(v)}
                      variant="fullWidth"
                      centered
                    >
                      <Tab label="Msg. 1" />
                      <Tab label="Msg. 2" />
                      <Tab label="Msg. 3" />
                      <Tab label="Msg. 4" />
                      <Tab label="Msg. 5" />
                    </Tabs>
                    <Box className={classes.messageBox}>
                      {messageTab === 0 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message1")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage1"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message1")}</>
                          )}
                        </>
                      )}
                      {messageTab === 1 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message2")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage2"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message2")}</>
                          )}
                        </>
                      )}
                      {messageTab === 2 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message3")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage3"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message3")}</>
                          )}
                        </>
                      )}
                      {messageTab === 3 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message4")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage4"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message4")}</>
                          )}
                        </>
                      )}
                      {messageTab === 4 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message5")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage5"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message5")}</>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                  {(campaign.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Button
                          startIcon={<AttachFileIcon />}
                          className={classes.attachButton}
                        >
                          {attachment != null
                            ? attachment.name
                            : campaign.mediaName}
                        </Button>
                        {campaignEditable && (
                          <IconButton
                            onClick={() => setConfirmationOpen(true)}
                            className={classes.deleteButton}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>

              <DialogActions className={classes.dialogActions}>
                {campaign.status === "CANCELADA" && (
                  <Button
                    color="primary"
                    onClick={() => restartCampaign()}
                    variant="outlined"
                    className={classes.actionButton}
                  >
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}
                {campaign.status === "EM_ANDAMENTO" && (
                  <Button
                    color="primary"
                    onClick={() => cancelCampaign()}
                    variant="outlined"
                    className={classes.actionButton}
                  >
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}
                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                    className={classes.actionButton}
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.actionButton}
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={`${classes.actionButton} ${classes.btnWrapper}`}
                  >
                    {campaignId
                      ? `${i18n.t("campaigns.dialog.buttons.edit")}`
                      : `${i18n.t("campaigns.dialog.buttons.add")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;
