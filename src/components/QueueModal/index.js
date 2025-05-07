import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  Box,
  Tooltip,
  Divider
} from "@material-ui/core";

import { 
  AttachFile, 
  Colorize, 
  DeleteOutline, 
  FormatColorFill,
  Queue as QueueIcon,
  Sort as SortIcon,
  Chat as ChatIcon,
  AccessTime as AccessTimeIcon,
  SettingsInputComponent as IntegrationIcon,
  Code as CodeIcon
} from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";
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
  colorAdorment: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  colorPickerButton: {
    color: "#5D3FD3",
  },
  tabsContainer: {
    backgroundColor: "#f5f5f5",
    "& .MuiTab-root": {
      minWidth: 120,
      padding: theme.spacing(1.5),
    },
    "& .Mui-selected": {
      color: "#5D3FD3",
      fontWeight: 500,
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#5D3FD3",
    },
  },
  tabContent: {
    padding: theme.spacing(3),
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

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto!")
    .max(50, "Nome muito longo!")
    .required("O nome é obrigatório"),
  color: Yup.string().min(3, "Cor inválida!").max(9, "Cor inválida!").required("A cor é obrigatória"),
  greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    color: "#5D3FD3",
    greetingMessage: "",
    outOfHoursMessage: "",
    orderQueue: "",
    integrationId: "",
    promptId: ""
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [tab, setTab] = useState(0);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);
  const greetingRef = useRef();
  const [integrations, setIntegrations] = useState([]);
  const [queueEditable, setQueueEditable] = useState(true);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const [schedules, setSchedules] = useState([
    { weekday: "Segunda-feira", weekdayEn: "monday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Terça-feira", weekdayEn: "tuesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quarta-feira", weekdayEn: "wednesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quinta-feira", weekdayEn: "thursday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "08:00", endTime: "12:00", },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "00:00", endTime: "00:00", },
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "queue");
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration");

        setIntegrations(data.queueIntegrations);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);

        setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
        outOfHoursMessage: "",
        orderQueue: "",
        integrationId: ""
      });
    };
  }, [queueId, open]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };


  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (queue.mediaPath) {
      await api.delete(`/queue/${queue.id}/media-upload`);
      setQueue((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success("Mídia excluída com sucesso!");
    }
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, {
          ...values, schedules, promptId: selectedPrompt ? selectedPrompt : null
        });
		if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/queue/${queueId}/media-upload`, formData);
        }
        toast.success("Fila atualizada com sucesso!");
      } else {
        await api.post("/queue", {
          ...values, schedules, promptId: selectedPrompt ? selectedPrompt : null
        });
        toast.success("Fila criada com sucesso!");
		if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/queue/${queueId}/media-upload`, formData);
      }
	  }
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
    setTab(0);
  };

  const handleChangePrompt = (e) => {
    setSelectedPrompt(e.target.value);
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title="Excluir mídia"
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        Tem certeza que deseja excluir esta mídia?
      </ConfirmationModal>
    
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll="paper"
        className={classes.dialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          {queueId
            ? "Editar Fila de Atendimento"
            : "Nova Fila de Atendimento"}
          <div style={{ display: "none" }}>
            <input
              type="file"
              ref={attachmentFile}
              onChange={(e) => handleAttachmentFile(e)}
            />
          </div>
        </DialogTitle>
        
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, v) => setTab(v)}
          className={classes.tabsContainer}
        >
          <Tab label="Dados da Fila" icon={<QueueIcon />} />
          {schedulesEnabled && <Tab label="Horários de Atendimento" icon={<AccessTimeIcon />} />}
        </Tabs>
        
        {tab === 0 && (
          <Paper>
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values }) => (
                <Form>
                  <DialogContent dividers className={classes.dialogContent}>
                    <Paper className={classes.infoPanel} elevation={0}>
                      <Typography variant="body2">
                        <span>ℹ️</span> Configure suas filas de atendimento para organizar seus atendentes e mensagens específicas por departamento.
                      </Typography>
                    </Paper>
                    
                    <div className={classes.formSection}>
                      <Typography className={classes.sectionTitle}>
                        Informações Básicas
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            label="Nome da Fila"
                            autoFocus
                            name="name"
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            variant="outlined"
                            fullWidth
                            className={classes.textField}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <QueueIcon style={{ color: "#5D3FD3" }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            label="Cor da Fila"
                            name="color"
                            id="color"
                            onFocus={() => {
                              setColorPickerModalOpen(true);
                              greetingRef.current.focus();
                            }}
                            error={touched.color && Boolean(errors.color)}
                            helperText={touched.color && errors.color}
                            variant="outlined"
                            fullWidth
                            className={classes.textField}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FormatColorFill style={{ color: "#5D3FD3" }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <div
                                    style={{ backgroundColor: values.color }}
                                    className={classes.colorAdorment}
                                  ></div>
                                  <Tooltip title="Escolher cor" arrow placement="top">
                                    <IconButton
                                      size="small"
                                      className={classes.colorPickerButton}
                                      onClick={() => setColorPickerModalOpen(true)}
                                    >
                                      <Colorize />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          />

                          <ColorPicker
                            open={colorPickerModalOpen}
                            handleClose={() => setColorPickerModalOpen(false)}
                            onChange={(color) => {
                              values.color = color;
                              setQueue((prevState) => {
                                return { ...prevState, color };
                              });
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            label="Ordem de Atendimento"
                            name="orderQueue"
                            variant="outlined"
                            fullWidth
                            className={classes.textField}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SortIcon style={{ color: "#5D3FD3" }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Typography className={classes.helpText}>
                            Define a ordem de prioridade desta fila (menor número = maior prioridade)
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel>Integração</InputLabel>
                            <Field
                              as={Select}
                              label="Integração"
                              name="integrationId"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <IntegrationIcon style={{ color: "#5D3FD3" }} />
                                  </InputAdornment>
                                ),
                              }}
                            >
                              <MenuItem value="">
                                <em>Nenhuma</em>
                              </MenuItem>
                              {integrations.map((integration) => (
                                <MenuItem key={integration.id} value={integration.id}>
                                  {integration.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </FormControl>
                          <Typography className={classes.helpText}>
                            Associa esta fila a uma integração existente
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                    
                    <Divider style={{ margin: '16px 0' }} />
                    
                    <div className={classes.formSection}>
                      <Typography className={classes.sectionTitle}>
                        Configuração de Mensagens
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Mensagem de Saudação"
                            name="greetingMessage"
                            multiline
                            inputRef={greetingRef}
                            rows={4}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                            helperText={touched.greetingMessage && errors.greetingMessage}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
                                  <ChatIcon style={{ color: "#5D3FD3" }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Typography className={classes.helpText}>
                            Mensagem exibida quando um cliente entra em contato com esta fila
                          </Typography>
                        </Grid>
                        
                        {schedulesEnabled && (
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              label="Mensagem Fora do Horário"
                              name="outOfHoursMessage"
                              multiline
                              rows={4}
                              fullWidth
                              variant="outlined"
                              className={classes.textField}
                              error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                              helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
                                    <AccessTimeIcon style={{ color: "#5D3FD3" }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <Typography className={classes.helpText}>
                              Mensagem exibida quando um cliente entra em contato fora do horário de atendimento
                            </Typography>
                          </Grid>
                        )}
                        
                        <Grid item xs={12}>
                          <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel>Prompt de IA</InputLabel>
                            <Select
                              label="Prompt de IA"
                              name="promptId"
                              value={selectedPrompt || ""}
                              onChange={handleChangePrompt}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CodeIcon style={{ color: "#5D3FD3" }} />
                                  </InputAdornment>
                                ),
                              }}
                            >
                              <MenuItem value="">
                                <em>Nenhum</em>
                              </MenuItem>
                              {prompts.map((prompt) => (
                                <MenuItem key={prompt.id} value={prompt.id}>
                                  {prompt.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Typography className={classes.helpText}>
                            Associa um prompt de IA a esta fila para respostas automáticas
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                    
                    <Divider style={{ margin: '16px 0' }} />
                    
                    <div className={classes.formSection}>
                      <Typography className={classes.sectionTitle}>
                        Opções Avançadas
                      </Typography>
                      
                      <QueueOptions queueId={queueId} />
                      
                      {(queue.mediaPath || attachment) && (
                        <Box className={classes.attachmentDisplay}>
                          <Button startIcon={<AttachFile />}>
                            {attachment != null
                              ? attachment.name
                              : queue.mediaName}
                          </Button>
                          {queueEditable && (
                            <IconButton
                              onClick={() => setConfirmationOpen(true)}
                              color="secondary"
                            >
                              <DeleteOutline />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </div>
                  </DialogContent>
                  
                  <DialogActions className={classes.dialogActions}>
                    {!attachment && !queue.mediaPath && queueEditable && (
                      <Button
                        startIcon={<AttachFile />}
                        onClick={() => attachmentFile.current.click()}
                        disabled={isSubmitting}
                        variant="outlined"
                        className={classes.attachButton}
                      >
                        Anexar Arquivo
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      variant="outlined"
                      className={classes.cancelButton}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.saveButton}
                    >
                      {queueId
                        ? "Atualizar"
                        : "Adicionar"}
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
          </Paper>
        )}
        {tab === 1 && schedulesEnabled && (
          <Paper className={classes.tabContent}>
            <SchedulesForm
              loading={false}
              onSubmit={handleSaveSchedules}
              initialValues={schedules}
              labelSaveButton="Salvar"
            />
          </Paper>
        )}
      </Dialog>
    </div>
  );
};

export default QueueModal;
