import React, { useEffect, useRef, useState } from "react";

import { Field, FieldArray, Form, Formik } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import * as Yup from "yup";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Slide from "@material-ui/core/Slide";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CancelIcon from "@material-ui/icons/Cancel";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import SaveIcon from "@material-ui/icons/Save";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 12,
    padding: theme.spacing(1),
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  dialogTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    padding: theme.spacing(2, 3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  dialogActions: {
    padding: theme.spacing(1, 3, 2),
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      height: 56,
    },
    "& .MuiInputLabel-outlined": {
      transform: "translate(14px, 16px) scale(1)",
    },
    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
  extraAttr: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 10,
    padding: theme.spacing(2, 2),
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      boxShadow: "0 3px 5px rgba(0,0,0,0.08)",
    },
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#5D3FD3",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: 40,
      height: 3,
      bottom: -5,
      left: 0,
      backgroundColor: "#5D3FD3",
      borderRadius: 2,
    },
  },
  addInfoButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    borderRadius: 10,
    padding: theme.spacing(1, 3),
    textTransform: "none",
    fontWeight: 600,
    marginTop: theme.spacing(1),
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  infoFieldContainer: {
    marginBottom: theme.spacing(1),
  },
  emptyInfoText: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    margin: theme.spacing(2, 0),
    fontStyle: "italic",
  },
  infoFieldTitle: {
    fontSize: "0.75rem",
    color: "#5D3FD3",
    marginBottom: theme.spacing(0.5),
    fontWeight: 600,
  },
  btnWrapper: {
    position: "relative",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#666",
    borderRadius: 10,
    padding: theme.spacing(1, 3),
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  saveButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    borderRadius: 10,
    padding: theme.spacing(1, 3),
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  closeButton: {
    color: theme.palette.grey[500],
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  infoSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  extraInfoTextField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      fontSize: "1rem",
    },
    "& .MuiOutlinedInput-input": {
      padding: "12px 14px",
    },
  },
  phoneInputContainer: {
    marginBottom: theme.spacing(2),
    "& .react-tel-input": {
      fontFamily: theme.typography.fontFamily,
      "& .form-control": {
        width: "100%",
        height: 56,
        borderRadius: 10,
        fontSize: "1rem",
        borderColor: "rgba(0, 0, 0, 0.23)",
        "&:hover": {
          borderColor: "rgba(0, 0, 0, 0.42)",
        },
        "&:focus": {
          borderColor: "#5D3FD3",
          boxShadow: "0 0 0 2px rgba(93, 63, 211, 0.2)",
        },
      },
      "& .flag-dropdown": {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        "&:hover, &.open": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
      "& .selected-flag": {
        paddingLeft: 16,
        "& .flag": {
          transform: "scale(1.2)",
        },
      },
      "& .country-list": {
        borderRadius: 10,
        marginTop: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      },
    },
  },
  phoneLabel: {
    marginBottom: theme.spacing(0.75),
    fontSize: "0.75rem",
    fontWeight: 400,
    color: "rgba(0, 0, 0, 0.6)",
    lineHeight: 1.2,
    letterSpacing: "0.03em",
    transform: "translate(0, 0) scale(1)",
    paddingLeft: 5,
  },
  phoneErrorHelper: {
    color: theme.palette.error.main,
    fontSize: "0.75rem",
    marginTop: 3,
    marginLeft: 14,
  },
  formGrid: {
    marginTop: theme.spacing(2),
  },
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto")
    .max(50, "Nome muito longo")
    .required("Nome é obrigatório"),
  number: Yup.string().test(
    "is-valid-phone",
    "Número de telefone inválido",
    (value) => {
      if (!value) return true; // Não é obrigatório
      // Números de telefone internacionais válidos começam com + seguido pelo código do país
      // E devem ter pelo menos 8 dígitos após o código do país
      return /^\+?[1-9]\d{1,3}[-\s]?\d{4,14}$/.test(value);
    }
  ),
  email: Yup.string().email("Email inválido"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    name: "",
    number: "",
    email: "",
    extraInfo: [],
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
        const { data } = await api.get(`/contacts/${contactId}`);
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
      // Garantir que o número tenha o código do país
      const formattedValues = { ...values };

      // Se o número não estiver vazio, garantir que está no formato correto
      if (formattedValues.number) {
        // React-phone-input-2 já adiciona o + automaticamente, não precisamos adicionar
        // Apenas garantimos que não temos caracteres inválidos
        formattedValues.number = formattedValues.number.replace(/[^\d+]/g, "");
      }

      if (contactId) {
        await api.put(`/contacts/${contactId}`, formattedValues);
        handleClose();
      } else {
        const { data } = await api.post("/contacts", formattedValues);
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
        maxWidth="md"
        scroll="paper"
        TransitionComponent={Transition}
        PaperProps={{ className: classes.dialogPaper }}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6">
            {contactId
              ? i18n.t("contactModal.title.edit")
              : i18n.t("contactModal.title.add")}
          </Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
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
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent className={classes.dialogContent} dividers>
                <Typography
                  variant="subtitle1"
                  className={classes.sectionTitle}
                >
                  {i18n.t("contactModal.form.mainInfo") || "Dados do contato"}
                </Typography>

                <Grid container spacing={2} className={classes.formGrid}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.name") || "Nome"}
                      name="name"
                      autoFocus
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div className={classes.phoneInputContainer}>
                      <div style={{ width: "100%", marginTop: 0 }}>
                        <PhoneInput
                          country="br"
                          value={values.number}
                          onChange={(phone) => setFieldValue("number", phone)}
                          enableSearch={true}
                          disableSearchIcon={true}
                          countryCodeEditable={false}
                          placeholder=""
                          specialLabel=""
                          preferredCountries={["br", "ar", "cl", "us", "pt"]}
                          containerStyle={{
                            width: "100%",
                          }}
                          inputStyle={{
                            width: "100%",
                            height: "56px",
                            fontSize: "16px",
                            borderRadius: "10px",
                          }}
                          buttonStyle={{
                            borderTopLeftRadius: "10px",
                            borderBottomLeftRadius: "10px",
                          }}
                          dropdownStyle={{
                            width: "400px",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        />
                      </div>
                      {touched.number && errors.number && (
                        <div className={classes.phoneErrorHelper}>
                          {errors.number}
                        </div>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.email") || "Email"}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      placeholder="Email"
                      fullWidth
                      variant="outlined"
                      className={classes.textField}
                    />
                  </Grid>
                </Grid>

                {contact?.whatsapp && (
                  <div className={classes.infoSection}>
                    <Typography
                      variant="subtitle1"
                      className={classes.sectionTitle}
                    >
                      {i18n.t("contactModal.form.whatsapp") || "Conexão Origem"}
                    </Typography>
                    <Box
                      border={1}
                      borderColor="rgba(0, 0, 0, 0.1)"
                      borderRadius={10}
                      p={2}
                      bgcolor="rgba(0, 0, 0, 0.02)"
                    >
                      <Typography variant="body2">
                        {contact?.whatsapp.name}
                      </Typography>
                    </Box>
                  </div>
                )}

                <div className={classes.infoSection}>
                  <Typography
                    variant="subtitle1"
                    className={classes.sectionTitle}
                  >
                    {i18n.t("contactModal.form.extraInfo") ||
                      "Informações adicionais"}
                  </Typography>

                  <FieldArray name="extraInfo">
                    {({ push, remove }) => (
                      <>
                        {values.extraInfo && values.extraInfo.length > 0 ? (
                          values.extraInfo.map((info, index) => (
                            <Paper
                              elevation={0}
                              className={classes.extraAttr}
                              key={`${index}-info`}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={5}>
                                  <div className={classes.infoFieldContainer}>
                                    <Typography
                                      className={classes.infoFieldTitle}
                                    >
                                      {i18n.t("contactModal.form.extraName") ||
                                        "Campo"}
                                    </Typography>
                                    <Field
                                      as={TextField}
                                      placeholder="Nome do campo"
                                      name={`extraInfo[${index}].name`}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      className={classes.extraInfoTextField}
                                    />
                                  </div>
                                </Grid>
                                <Grid item xs={6}>
                                  <div className={classes.infoFieldContainer}>
                                    <Typography
                                      className={classes.infoFieldTitle}
                                    >
                                      {i18n.t("contactModal.form.extraValue") ||
                                        "Valor"}
                                    </Typography>
                                    <Field
                                      as={TextField}
                                      placeholder="Valor do campo"
                                      name={`extraInfo[${index}].value`}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      className={classes.extraInfoTextField}
                                    />
                                  </div>
                                </Grid>
                                <Grid
                                  item
                                  xs={1}
                                  container
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Tooltip title="Remover campo" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => remove(index)}
                                      style={{ color: "#f44336" }}
                                    >
                                      <DeleteOutlineIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))
                        ) : (
                          <Typography className={classes.emptyInfoText}>
                            Nenhuma informação adicional. Clique no botão abaixo
                            para adicionar.
                          </Typography>
                        )}
                        <div style={{ textAlign: "center", marginTop: 16 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => push({ name: "", value: "" })}
                            className={classes.addInfoButton}
                            startIcon={<AddCircleOutlineIcon />}
                          >
                            {i18n.t("contactModal.buttons.addExtraInfo") ||
                              "+ Adicionar informação"}
                          </Button>
                        </div>
                      </>
                    )}
                  </FieldArray>
                </div>
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  className={classes.cancelButton}
                  startIcon={<CancelIcon />}
                  disabled={isSubmitting}
                >
                  {i18n.t("contactModal.buttons.cancel") || "Cancelar"}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    variant="contained"
                    className={classes.saveButton}
                    startIcon={contactId ? <SaveIcon /> : <PersonAddIcon />}
                    disabled={isSubmitting}
                  >
                    {contactId
                      ? i18n.t("contactModal.buttons.okEdit") || "Salvar"
                      : i18n.t("contactModal.buttons.okAdd") || "Adicionar"}
                  </Button>
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </div>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ContactModal;
