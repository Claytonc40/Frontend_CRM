import React, { useContext, useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";
import Divider from "@material-ui/core/Divider";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import Tooltip from "@material-ui/core/Tooltip";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import Fade from "@material-ui/core/Fade";
import Chip from "@material-ui/core/Chip";

import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";

import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Box,
} from "@material-ui/core";
import ConfirmationModal from "../ConfirmationModal";

const path = require('path');

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    dialog: {
        borderRadius: 12,
        padding: theme.spacing(1),
    },
    dialogTitle: {
        background: "linear-gradient(90deg, #5D3FD3 0%, #6A5ACD 100%)",
        color: "#ffffff",
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        borderRadius: "12px 12px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    closeButton: {
        color: "white",
    },
    titleText: {
        fontWeight: 600,
        fontSize: "1.2rem",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
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
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
    shortcodeInput: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "&:hover fieldset": {
                borderColor: "#5D3FD3",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#5D3FD3",
            },
        },
        "& .MuiFormLabel-root.Mui-focused": {
            color: "#5D3FD3",
        },
    },
    messageInput: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "&:hover fieldset": {
                borderColor: "#5D3FD3",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#5D3FD3",
            },
        },
        "& .MuiFormLabel-root.Mui-focused": {
            color: "#5D3FD3",
        },
    },
    attachButton: {
        backgroundColor: "#5D3FD3",
        color: "white",
        borderRadius: 10,
        padding: theme.spacing(1, 2),
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#4b32a8",
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[3],
        },
    },
    cancelButton: {
        borderRadius: 10,
        padding: theme.spacing(1, 2),
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "rgba(244, 67, 54, 0.08)",
            transform: "translateY(-2px)",
        },
    },
    saveButton: {
        backgroundColor: "#5D3FD3",
        color: "white",
        borderRadius: 10,
        padding: theme.spacing(1, 2),
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#4b32a8",
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[3],
        },
    },
    dialogActions: {
        padding: theme.spacing(2),
        justifyContent: "space-between",
    },
    filePreview: {
        backgroundColor: "rgba(93, 63, 211, 0.08)",
        borderRadius: 10,
        padding: theme.spacing(1, 2),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: theme.spacing(1),
    },
    fileName: {
        display: "flex",
        alignItems: "center",
        color: "#5D3FD3",
        fontWeight: 500,
        "& svg": {
            marginRight: theme.spacing(1),
            color: "#5D3FD3",
        },
    },
    deleteButton: {
        color: "#F44336",
        "&:hover": {
            backgroundColor: "rgba(244, 67, 54, 0.08)",
        },
    },
    variablesSection: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        border: "1px dashed #5D3FD3",
    },
    variablesTitle: {
        display: "flex",
        alignItems: "center",
        fontSize: "0.9rem",
        color: "#555",
        marginBottom: theme.spacing(1),
        "& svg": {
            marginRight: theme.spacing(1),
            color: "#5D3FD3",
        },
    },
    variableChips: {
        display: "flex",
        flexWrap: "wrap",
        "& > *": {
            margin: theme.spacing(0.5),
            backgroundColor: "rgba(93, 63, 211, 0.08)",
            color: "#5D3FD3",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
                backgroundColor: "rgba(93, 63, 211, 0.15)",
                transform: "translateY(-2px)",
            },
        },
    },
}));

const QuickeMessageSchema = Yup.object().shape({
    shortcode: Yup.string().required("Obrigatório"),
    //   message: Yup.string().required("Obrigatório"),
});

const VARIABLES = [
    { label: "Nome do Contato", value: "{contact.name}" },
    { label: "Nome do Atendente", value: "{user.name}" },
    { label: "Saudação", value: "{greeting}" },
    { label: "Empresa", value: "{company.name}" },
];

const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const { profile } = user;
    const messageInputRef = useRef();

    const initialState = {
        shortcode: "",
        message: "",
        geral: false,
        status: true,
    };

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [quickemessage, setQuickemessage] = useState(initialState);
    const [attachment, setAttachment] = useState(null);
    const attachmentFile = useRef(null);

    useEffect(() => {
        try {
            (async () => {
                if (!quickemessageId) return;

                const { data } = await api.get(`/quick-messages/${quickemessageId}`);

                setQuickemessage((prevState) => {
                    return { ...prevState, ...data };
                });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [quickemessageId, open]);

    const handleClose = () => {
        setQuickemessage(initialState);
        setAttachment(null);
        onClose();
    };

    const handleAttachmentFile = (e) => {
      
        const file = head(e.target.files);
        if (file) {
            setAttachment(file);
        }
    };

    const handleSaveQuickeMessage = async (values) => {

        const quickemessageData = { ...values, isMedia: true, mediaPath: attachment ? String(attachment.name).replace(/ /g, "_") : values.mediaPath ? path.basename(values.mediaPath).replace(/ /g, "_") : null };

        try {
            if (quickemessageId) {
                await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(
                        `/quick-messages/${quickemessageId}/media-upload`,
                        formData
                    );
                }
            } else {
                const { data } = await api.post("/quick-messages", quickemessageData);
                if (attachment != null) {
                    const formData = new FormData();
                    formData.append("typeArch", "quickMessage");
                    formData.append("file", attachment);
                    await api.post(`/quick-messages/${data.id}/media-upload`, formData);
                }
            }
            toast.success(i18n.t("quickMessages.toasts.success"));
            if (typeof reload == "function") {
                reload();
            }
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    const deleteMedia = async () => {
        if (attachment) {
            setAttachment(null);
            attachmentFile.current.value = null;
        }

        if (quickemessage.mediaPath) {
            await api.delete(`/quick-messages/${quickemessage.id}/media-upload`);
            setQuickemessage((prev) => ({
                ...prev,
                mediaPath: null,
            }));
            toast.success(i18n.t("quickMessages.toasts.deleted"));
            if (typeof reload == "function") {
                reload();
            }
        }
    };

    const handleClickMsgVar = async (msgVar, setValueFunc) => {
        const el = messageInputRef.current;
        const firstHalfText = el.value.substring(0, el.selectionStart);
        const secondHalfText = el.value.substring(el.selectionEnd);
        const newCursorPos = el.selectionStart + msgVar.length;

        setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

        await new Promise(r => setTimeout(r, 100));
        messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    };

    return (
        <div className={classes.root}>
            <ConfirmationModal
                title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
                open={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={deleteMedia}
            >
                {i18n.t("quickMessages.confirmationModal.deleteMessage")}
            </ConfirmationModal>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                scroll="paper"
                PaperProps={{ 
                    className: classes.dialog,
                    elevation: 8
                }}
                TransitionComponent={Fade}
                transitionDuration={300}
            >
                <DialogTitle disableTypography className={classes.dialogTitle}>
                    <Typography className={classes.titleText}>
                        {quickemessageId
                            ? i18n.t("quickMessages.dialog.edit")
                            : i18n.t("quickMessages.dialog.add")}
                    </Typography>
                    <IconButton onClick={handleClose} className={classes.closeButton}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <div style={{ display: "none" }}>
                    <input
                        type="file"
                        ref={attachmentFile}
                        onChange={(e) => handleAttachmentFile(e)}
                    />
                </div>
                <Formik
                    initialValues={quickemessage}
                    enableReinitialize={true}
                    validationSchema={QuickeMessageSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveQuickeMessage(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, setFieldValue, values }) => (
                        <Form>
                            <DialogContent>
                                <Grid spacing={3} container>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            autoFocus
                                            label={i18n.t("quickMessages.dialog.shortcode")}
                                            name="shortcode"
                                            error={touched.shortcode && Boolean(errors.shortcode)}
                                            helperText={touched.shortcode && errors.shortcode}
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <Typography variant="h6" style={{ color: "#5D3FD3", marginRight: 8 }}>
                                                        !
                                                    </Typography>
                                                ),
                                            }}
                                            fullWidth
                                            className={classes.shortcodeInput}
                                        />
                                    </Grid>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("quickMessages.dialog.message")}
                                            name="message"
                                            inputRef={messageInputRef}
                                            error={touched.message && Boolean(errors.message)}
                                            helperText={touched.message && errors.message}
                                            variant="outlined"
                                            multiline={true}
                                            rows={7}
                                            fullWidth
                                            className={classes.messageInput}
                                            placeholder={i18n.t("quickMessages.dialog.messagePlaceholder")}
                                        />
                                    </Grid>
                                    
                                    <Grid xs={12} item>
                                        <Box className={classes.variablesSection}>
                                            <Typography className={classes.variablesTitle}>
                                                <FormatQuoteIcon />
                                                {i18n.t("messageVariablesPicker.label")}
                                            </Typography>
                                            <Box className={classes.variableChips}>
                                                <Tooltip title="{name}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.contactName")}
                                                        onClick={() => handleClickMsgVar("{{name}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="{{firstName}}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.contactFirstName")}
                                                        onClick={() => handleClickMsgVar("{{firstName}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="{{ms}}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.greeting")}
                                                        onClick={() => handleClickMsgVar("{{ms}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="{{protocol}}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.protocolNumber")}
                                                        onClick={() => handleClickMsgVar("{{protocol}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="{{date}}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.date")}
                                                        onClick={() => handleClickMsgVar("{{date}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="{{hour}}" arrow placement="top">
                                                    <Chip
                                                        label={i18n.t("messageVariablesPicker.vars.hour")}
                                                        onClick={() => handleClickMsgVar("{{hour}}", setFieldValue)}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    {(quickemessage.mediaPath || attachment) && (
                                        <Grid xs={12} item>
                                            <Paper elevation={0} className={classes.filePreview}>
                                                <Typography className={classes.fileName}>
                                                    <AttachFileIcon />
                                                    {attachment ? attachment.name : quickemessage.mediaName}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => setConfirmationOpen(true)}
                                                    className={classes.deleteButton}
                                                    size="small"
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </DialogContent>
                            <Divider />
                            <DialogActions className={classes.dialogActions}>
                                <div>
                                    {!attachment && !quickemessage.mediaPath && (
                                        <Button
                                            color="primary"
                                            onClick={() => attachmentFile.current.click()}
                                            disabled={isSubmitting}
                                            className={classes.attachButton}
                                            startIcon={<AttachFileIcon />}
                                        >
                                            {i18n.t("quickMessages.buttons.attach")}
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    <Button
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className={classes.cancelButton}
                                        style={{ marginRight: 8 }}
                                    >
                                        {i18n.t("quickMessages.buttons.cancel")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={classes.saveButton}
                                        startIcon={quickemessageId ? <SaveIcon /> : <AddIcon />}
                                    >
                                        {quickemessageId
                                            ? i18n.t("quickMessages.buttons.edit")
                                            : i18n.t("quickMessages.buttons.add")}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.buttonProgress}
                                            />
                                        )}
                                    </Button>
                                </div>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default QuickMessageDialog;