import React, { useContext, useEffect, useRef, useState } from "react";

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
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import EmailIcon from "@material-ui/icons/Email";
import PersonIcon from "@material-ui/icons/Person";
import PhoneIcon from "@material-ui/icons/Phone";

import { i18n } from "../../translate/i18n";

import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    marginBottom: theme.spacing(2),
    background: "#f7f8fa",
    borderRadius: 10,
  },
  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrapper: {
    position: "relative",
    borderRadius: 12,
    minWidth: 120,
    fontWeight: 600,
    fontSize: 16,
    textTransform: "none",
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  dialogPaper: {
    borderRadius: 18,
    boxShadow: "0 8px 32px rgba(93,63,211,0.18)",
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
  dialogActions: {
    padding: theme.spacing(3, 3, 2, 3),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
  },
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email"),
});

const ContactListItemModal = ({
  open,
  onClose,
  contactId,
  initialValues,
  onSave,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const {
    user: { companyId },
  } = useContext(AuthContext);
  const { contactListId } = useParams();

  const initialState = {
    name: "",
    number: "",
    email: "",
  };

  const [contact, setContact] = useState(initialState);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!contactId) return;

      try {
        const { data } = await api.get(`/contact-list-items/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contact-list-items/${contactId}`, {
          ...values,
          companyId,
          contactListId,
        });
        handleClose();
      } else {
        const { data } = await api.post("/contact-list-items", {
          ...values,
          companyId,
          contactListId,
        });
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {contactId
            ? `${i18n.t("contactModal.title.edit")}`
            : `${i18n.t("contactModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={contact}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContact(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <Typography variant="subtitle1" gutterBottom>
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography>
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.name")}
                  name="name"
                  autoFocus
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon style={{ color: "#5D3FD3" }} />
                      </InputAdornment>
                    ),
                    style: { borderRadius: 10, background: "#fff" },
                  }}
                />
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.number")}
                  name="number"
                  error={touched.number && Boolean(errors.number)}
                  helperText={touched.number && errors.number}
                  placeholder="5513912344321"
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon style={{ color: "#5D3FD3" }} />
                      </InputAdornment>
                    ),
                    style: { borderRadius: 10, background: "#fff" },
                  }}
                />
                <Field
                  as={TextField}
                  label={i18n.t("contactModal.form.email")}
                  name="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  placeholder="Email address"
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon style={{ color: "#5D3FD3" }} />
                      </InputAdornment>
                    ),
                    style: { borderRadius: 10, background: "#fff" },
                  }}
                />
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.btnWrapper}
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {contactId
                    ? `${i18n.t("contactModal.buttons.okEdit")}`
                    : `${i18n.t("contactModal.buttons.okAdd")}`}
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

export default ContactListItemModal;
