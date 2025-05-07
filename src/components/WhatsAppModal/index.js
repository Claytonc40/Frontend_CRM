import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@material-ui/core";

import {
  WhatsApp as WhatsAppIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapHorizIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 10,
    maxHeight: "80vh",
  },
  dialogTitle: {
    backgroundColor: "#f8f8f8",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: theme.spacing(2),
  },
  dialogTitleText: {
    color: "#5D3FD3",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: "#25D366",
    },
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
    color: "#5D3FD3",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  sectionTitle: {
    color: "#5D3FD3",
    fontSize: "1rem",
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  sectionContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  stepper: {
    backgroundColor: "transparent",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2, 0),
  },
  stepIcon: {
    "&$activeStep": {
      color: "#5D3FD3",
    },
    "&$completedStep": {
      color: "#5D3FD3",
    },
    fontSize: 36,
  },
  activeStep: {},
  completedStep: {},
  stepLabel: {
    "& .MuiStepLabel-label": {
      fontWeight: 500,
    },
    "& .MuiStepLabel-active": {
      color: "#5D3FD3",
      fontWeight: 600,
    },
    "& .MuiStepLabel-completed": {
      color: "#5D3FD3",
      fontWeight: 600,
    },
  },
  formButton: {
    borderRadius: 8,
    "& .MuiButton-label": {
      display: "flex",
      alignItems: "center",
    },
    "& svg": {
      marginRight: theme.spacing(0.5),
    },
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  saveButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  selectField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  stepContent: {
    minHeight: 300,
    padding: theme.spacing(2, 0),
  },
  stepperButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
  stepButton: {
    borderRadius: 10,
  },
  backButton: {
    borderColor: "#e0e0e0",
    color: "#555",
  },
  nextButton: {
    backgroundColor: "#5D3FD3",
    color: "white",
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
  infoText: {
    color: "#666",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(2),
  },
  sectionDivider: {
    margin: theme.spacing(3, 0),
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    greetingMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    ratingMessage: "",
    isDefault: false,
    token: "",
    provider: "beta",
    expiresInactiveMessage: "",
    expiresTicket: 0,
    timeUseBotQueues: 0,
    maxUseBotQueues: 3
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showComplation, setShowComplation] = useState(false);
  const [showOutOfHours, setShowOutOfHours] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  const steps = [
    {
      label: 'Básico',
      icon: <WhatsAppIcon />
    },
    {
      label: 'Mensagens',
      icon: <MessageIcon />
    },
    {
      label: 'Integrações',
      icon: <SettingsIcon />
    },
    {
      label: 'Filas',
      icon: <SwapHorizIcon />
    }
  ];
    
  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}?session=0`);
        setWhatsApp(data);

        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
        setSelectedQueueId(data.transferQueueId);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [whatsAppId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = {
      ...values, queueIds: selectedQueueIds, transferQueueId: selectedQueueId,
      promptId: selectedPrompt ? selectedPrompt : null
    };
    delete whatsappData["queues"];
    delete whatsappData["session"];

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleChangeQueue = (e) => {
    setSelectedQueueIds(e);
    setSelectedPrompt(null);
  };

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
    setSelectedQueueIds([]);
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
    setSelectedQueueId(null);
    setSelectedQueueIds([]);
    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step, values, touched, errors) => {
    switch (step) {
      case 0:
        return (
          <Box className={classes.stepContent}>
            <Typography className={classes.sectionTitle}>
              Informações Básicas
            </Typography>
            <Typography className={classes.infoText}>
              Configure as informações básicas da conexão WhatsApp
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Field
                  as={TextField}
                  label="Nome"
                  autoFocus
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name ? errors.name : ""}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    style: {
                      borderRadius: 12,
                      boxShadow: touched.name && errors.name ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                      background: '#fff',
                      height: 52,
                      fontSize: 17,
                      padding: '0 14px',
                      alignItems: 'center',
                      display: 'flex',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} style={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Field
                      as={Switch}
                      color="primary"
                      name="isDefault"
                      checked={values.isDefault}
                    />
                  }
                  label="Padrão"
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label="Token"
                  type={showToken ? "text" : "password"}
                  fullWidth
                  name="token"
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    style: {
                      borderRadius: 12,
                      boxShadow: touched.token && errors.token ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                      background: '#fff',
                      height: 52,
                      fontSize: 17,
                      padding: '0 14px',
                      alignItems: 'center',
                      display: 'flex',
                    },
                    endAdornment: (
                      <IconButton
                        aria-label={showToken ? "Ocultar token" : "Revelar token"}
                        onClick={() => setShowToken((prev) => !prev)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box className={classes.stepContent}>
            <Typography className={classes.sectionTitle}>
              Configurações de Mensagens
            </Typography>
            <Typography className={classes.infoText}>
              Configure as mensagens automáticas enviadas aos contatos
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={showGreeting} onChange={() => setShowGreeting(v => !v)} color="primary" />}
                  label="Ativar mensagem de saudação"
                />
                {showGreeting && (
                  <Field
                    as={TextField}
                    label="Mensagem de saudação"
                    type="greetingMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="greetingMessage"
                    error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                    helperText={touched.greetingMessage && errors.greetingMessage}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      style: {
                        borderRadius: 12,
                        boxShadow: touched.greetingMessage && errors.greetingMessage ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                        background: '#fff',
                        minHeight: 52,
                        fontSize: 17,
                        padding: '0 14px',
                        alignItems: 'center',
                        display: 'flex',
                      },
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={showComplation} onChange={() => setShowComplation(v => !v)} color="primary" />}
                  label="Ativar mensagem de conclusão"
                />
                {showComplation && (
                  <Field
                    as={TextField}
                    label="Mensagem de conclusão"
                    type="complationMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="complationMessage"
                    error={touched.complationMessage && Boolean(errors.complationMessage)}
                    helperText={touched.complationMessage && errors.complationMessage}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      style: {
                        borderRadius: 12,
                        boxShadow: touched.complationMessage && errors.complationMessage ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                        background: '#fff',
                        minHeight: 52,
                        fontSize: 17,
                        padding: '0 14px',
                        alignItems: 'center',
                        display: 'flex',
                      },
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={showOutOfHours} onChange={() => setShowOutOfHours(v => !v)} color="primary" />}
                  label="Ativar mensagem de fora de expediente"
                />
                {showOutOfHours && (
                  <Field
                    as={TextField}
                    label="Mensagem de fora de expediente"
                    type="outOfHoursMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="outOfHoursMessage"
                    error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                    helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      style: {
                        borderRadius: 12,
                        boxShadow: touched.outOfHoursMessage && errors.outOfHoursMessage ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                        background: '#fff',
                        minHeight: 52,
                        fontSize: 17,
                        padding: '0 14px',
                        alignItems: 'center',
                        display: 'flex',
                      },
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={showRating} onChange={() => setShowRating(v => !v)} color="primary" />}
                  label="Ativar mensagem de avaliação"
                />
                {showRating && (
                  <Field
                    as={TextField}
                    label="Mensagem de avaliação"
                    type="ratingMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="ratingMessage"
                    error={touched.ratingMessage && Boolean(errors.ratingMessage)}
                    helperText={touched.ratingMessage && errors.ratingMessage}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      style: {
                        borderRadius: 12,
                        boxShadow: touched.ratingMessage && errors.ratingMessage ? '0 0 0 2px #ff1744' : '0 1px 4px rgba(93,63,211,0.07)',
                        background: '#fff',
                        minHeight: 52,
                        fontSize: 17,
                        padding: '0 14px',
                        alignItems: 'center',
                        display: 'flex',
                      },
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box className={classes.stepContent}>
            <Typography className={classes.sectionTitle}>
              Integrações
            </Typography>
            <Typography className={classes.infoText}>
              Configure as integrações para esta conexão de WhatsApp
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" style={{ marginBottom: "8px", color: "#666" }}>
                  Filas
                </Typography>
                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={(selectedIds) => handleChangeQueue(selectedIds)}
                  className={classes.selectField}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(93,63,211,0.07)',
                    background: '#fff',
                    height: 52,
                    fontSize: 17,
                    padding: '0 14px',
                    alignItems: 'center',
                    display: 'flex',
                    marginTop: 8,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" style={{ marginBottom: "8px", color: "#666", marginTop: "16px" }}>
                  Prompt
                </Typography>
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  className={classes.selectField}
                  style={{ marginTop: 8 }}
                >
                  <Select
                    labelId="dialog-select-prompt-label"
                    id="dialog-select-prompt"
                    name="promptId"
                    value={selectedPrompt || ""}
                    onChange={handleChangePrompt}
                    fullWidth
                    displayEmpty
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                    style={{
                      borderRadius: 12,
                      boxShadow: '0 1px 4px rgba(93,63,211,0.07)',
                      background: '#fff',
                      height: 52,
                      fontSize: 17,
                      padding: '0 14px',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                    inputProps={{
                      style: {
                        borderRadius: 12,
                        padding: '0 14px',
                        height: 52,
                        fontSize: 17,
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Selecione um prompt</em>
                    </MenuItem>
                    {prompts.map((prompt) => (
                      <MenuItem
                        key={prompt.id}
                        value={prompt.id}
                        style={{ fontSize: 16 }}
                      >
                        {prompt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box className={classes.stepContent}>
            <Typography className={classes.sectionTitle}>
              Redirecionamento de Fila
            </Typography>
            <Typography className={classes.infoText}>
              Selecione uma fila para os contatos que não possuem fila serem redirecionados
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Field
                  fullWidth
                  type="number"
                  as={TextField}
                  label="Transferir após x (minutos)"
                  name="timeToTransfer"
                  error={touched.timeToTransfer && Boolean(errors.timeToTransfer)}
                  helperText={touched.timeToTransfer && errors.timeToTransfer}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  InputLabelProps={{ shrink: values.timeToTransfer ? true : false }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <QueueSelect
                  selectedQueueIds={selectedQueueId}
                  onChange={(selectedId) => {
                    setSelectedQueueId(selectedId)
                  }}
                  multiple={false}
                  title="Fila de Transferência"
                  className={classes.selectField}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(93,63,211,0.07)',
                    background: '#fff',
                    height: 52,
                    fontSize: 17,
                    padding: '0 14px',
                    alignItems: 'center',
                    display: 'flex',
                    marginTop: 8,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider className={classes.sectionDivider} />
                <Typography className={classes.sectionTitle}>
                  Configurações de Chat
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" style={{ marginBottom: "8px", color: "#666" }}>
                  Encerrar chats abertos após x minutos
                </Typography>
                <Field
                  as={TextField}
                  fullWidth
                  name="expiresTicket"
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  error={touched.expiresTicket && Boolean(errors.expiresTicket)}
                  helperText={touched.expiresTicket && errors.expiresTicket}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label="Mensagem de encerramento por inatividade"
                  multiline
                  rows={4}
                  fullWidth
                  name="expiresInactiveMessage"
                  error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)}
                  helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return "Etapa desconhecida";
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6" className={classes.dialogTitleText}>
            <WhatsAppIcon />
            {whatsAppId
              ? i18n.t("whatsappModal.title.edit")
              : i18n.t("whatsappModal.title.add")}
          </Typography>
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            if (activeStep === steps.length - 1) {
              setTimeout(() => {
                handleSaveWhatsApp(values);
                actions.setSubmitting(false);
              }, 400);
            }
          }}
        >
          {({ values, touched, errors, isSubmitting, handleSubmit, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <Stepper activeStep={activeStep} className={classes.stepper} alternativeLabel>
                  {steps.map((step) => (
                    <Step key={step.label}>
                      <StepLabel 
                        className={classes.stepLabel}
                        StepIconProps={{
                          classes: {
                            root: classes.stepIcon,
                            active: classes.activeStep,
                            completed: classes.completedStep,
                          }
                        }}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                {getStepContent(activeStep, values, touched, errors)}
                
                <div className={classes.stepperButtons}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    className={`${classes.stepButton} ${classes.backButton}`}
                    startIcon={<ArrowBackIcon />}
                  >
                    VOLTAR
                  </Button>
                  
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      className={`${classes.stepButton} ${classes.nextButton}`}
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveWhatsApp(values);
                      }}
                    >
                      SALVAR
                      {isSubmitting && (
                        <CircularProgress size={24} className={classes.buttonProgress} />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNext();
                      }}
                      className={`${classes.stepButton} ${classes.nextButton}`}
                      endIcon={<ArrowForwardIcon />}
                    >
                      PRÓXIMO
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);
