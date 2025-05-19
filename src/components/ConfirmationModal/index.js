import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Slide from "@material-ui/core/Slide";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";

import { i18n } from "../../translate/i18n";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  dialogRoot: {
    "& .MuiDialog-paper": {
      borderRadius: 18,
      padding: 0,
      boxShadow: "0 8px 32px rgba(93, 63, 211, 0.15)",
      overflow: "hidden",
    },
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#5D3FD3",
    padding: "28px 32px 10px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    letterSpacing: 0.2,
    [theme.breakpoints.down("xs")]: {
      padding: "20px 16px 8px 16px",
      fontSize: 20,
    },
  },
  dialogContent: {
    padding: "24px 32px",
    background: "#faf9fd",
    [theme.breakpoints.down("xs")]: {
      padding: "16px",
    },
  },
  dialogActions: {
    padding: "18px 32px 28px 32px",
    justifyContent: "center",
    gap: 16,
    background: "#faf9fd",
    [theme.breakpoints.down("xs")]: {
      padding: "12px 16px 20px 16px",
      gap: 8,
    },
  },
  cancelButton: {
    backgroundColor: "#fff",
    color: "#5D3FD3",
    padding: "10px 24px",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 10,
    border: "2px solid #5D3FD3",
    textTransform: "none",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f3f0fa",
      borderColor: "#5D3FD3",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "8px 16px",
      fontSize: 14,
    },
  },
  confirmButton: {
    backgroundColor: "#5D3FD3",
    color: "#fff",
    padding: "10px 24px",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 10,
    textTransform: "none",
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.15)",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#4b2fc7",
      boxShadow: "0 4px 12px rgba(93, 63, 211, 0.2)",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "8px 16px",
      fontSize: 14,
    },
  },
  buttonIcon: {
    marginRight: 8,
    fontSize: 20,
  },
  closeButton: {
    color: "#5D3FD3",
    padding: 8,
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f3f0fa",
    },
  },
  contentText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 1.6,
    textAlign: "center",
  },
}));

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="confirm-dialog"
      className={classes.dialogRoot}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        disableTypography
        className={classes.dialogTitle}
        id="confirm-dialog"
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton
          className={classes.closeButton}
          onClick={() => onClose(false)}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Typography className={classes.contentText}>{children}</Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          onClick={() => onClose(false)}
          className={classes.cancelButton}
          startIcon={<CancelIcon className={classes.buttonIcon} />}
        >
          {i18n.t("confirmationModal.buttons.cancel") || "Cancelar"}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose(false);
            onConfirm();
          }}
          className={classes.confirmButton}
          startIcon={<CheckCircleIcon className={classes.buttonIcon} />}
        >
          {i18n.t("confirmationModal.buttons.confirm") || "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
