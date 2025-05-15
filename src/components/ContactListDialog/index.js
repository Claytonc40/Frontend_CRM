import React, { useEffect, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.13)",
    background: "#fff",
    padding: theme.spacing(1, 0),
  },
  dialogTitle: {
    fontWeight: 700,
    fontSize: 22,
    color: "#5D3FD3",
    textAlign: "center",
    padding: theme.spacing(3, 2, 1, 2),
    letterSpacing: 0.2,
  },
  dialogContent: {
    padding: theme.spacing(3, 3, 2, 3),
    background: "#f7f8fa",
    borderRadius: 14,
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
  actionButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 24px",
    boxShadow: "0 4px 12px rgba(93,63,211,0.10)",
    transition: "all 0.2s",
    "&:hover": {
      boxShadow: "0 6px 16px rgba(93,63,211,0.18)",
    },
  },
  cancelButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 24px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    color: "#5D3FD3",
    marginRight: theme.spacing(1),
    "&:hover": {
      background: "#f7f8fa",
      color: "#4930A8",
    },
  },
}));

const ContactListSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const ContactListModal = ({ open, onClose, contactListId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
  };

  const [contactList, setContactList] = useState(initialState);

  useEffect(() => {
    const fetchContactList = async () => {
      if (!contactListId) return;
      try {
        const { data } = await api.get(`/contact-lists/${contactListId}`);
        setContactList((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchContactList();
  }, [contactListId, open]);

  const handleClose = () => {
    onClose();
    setContactList(initialState);
  };

  const handleSaveContactList = async (values) => {
    const contactListData = { ...values };
    try {
      if (contactListId) {
        await api.put(`/contact-lists/${contactListId}`, contactListData);
      } else {
        await api.post("/contact-lists", contactListData);
      }
      toast.success(i18n.t("contactList.dialog"));
    } catch (err) {
      toast.error(err.message);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {contactListId
            ? `${i18n.t("contactLists.dialog.edit")}`
            : `${i18n.t("contactLists.dialog.add")}`}
        </DialogTitle>
        <Formik
          initialValues={contactList}
          enableReinitialize={true}
          validationSchema={ContactListSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContactList(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("contactLists.dialog.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    InputProps={{
                      style: { borderRadius: 10, background: "#fff" },
                    }}
                  />
                </div>
              </DialogContent>
              <DialogActions style={{ padding: 24, paddingTop: 8 }}>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.cancelButton}
                >
                  {i18n.t("contactLists.dialog.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.actionButton}
                >
                  {contactListId
                    ? `${i18n.t("contactLists.dialog.okEdit")}`
                    : `${i18n.t("contactLists.dialog.okAdd")}`}
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

export default ContactListModal;
