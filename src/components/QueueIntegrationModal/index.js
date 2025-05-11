import React, { useEffect, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";

import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
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
  btnLeft: {
    display: "flex",
    marginRight: "auto",
    marginLeft: 12,
  },
  colorAdorment: {
    width: 20,
    height: 20,
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
  sectionTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: theme.spacing(2),
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

const IntegrationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto!")
    .max(50, "Nome muito longo!")
    .required("O nome é obrigatório"),
});

const IntegrationModal = ({ open, onClose, integrationId }) => {
  const classes = useStyles();

  const initialState = {
    type: "typebot",
    name: "",
    projectName: "",
    jsonContent: "",
    language: "",
    urlN8N: "",
    typebotDelayMessage: 1000,
    typebotExpires: 1,
    typebotKeywordFinish: "",
    typebotKeywordRestart: "",
    typebotRestartMessage: "",
    typebotSlug: "",
    typebotUnknownMessage: "",
  };

  const [integration, setIntegration] = useState(initialState);

  useEffect(() => {
    (async () => {
      if (!integrationId) return;
      try {
        const { data } = await api.get(`/queueIntegration/${integrationId}`);
        setIntegration((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toast.error(err?.message || "Erro desconhecido");
      }
    })();

    return () => {
      setIntegration({
        type: "dialogflow",
        name: "",
        projectName: "",
        jsonContent: "",
        language: "",
        urlN8N: "",
        typebotDelayMessage: 1000,
      });
    };
  }, [integrationId, open]);

  const handleClose = () => {
    onClose();
    setIntegration(initialState);
  };

  const handleTestSession = async (event, values) => {
    try {
      const { projectName, jsonContent, language } = values;

      await api.post(`/queueIntegration/testSession`, {
        projectName,
        jsonContent,
        language,
      });

      toast.success("Teste de sessão realizado com sucesso!");
    } catch (err) {
      toast.error(err?.message || "Erro desconhecido");
    }
  };

  const handleSaveIntegration = async (values) => {
    try {
      if (
        values.type === "n8n" ||
        values.type === "webhook" ||
        values.type === "typebot"
      )
        values.projectName = values.name;
      if (integrationId) {
        await api.put(`/queueIntegration/${integrationId}`, values);
        toast.success("Integração atualizada com sucesso!");
      } else {
        await api.post("/queueIntegration", values);
        toast.success("Integração criada com sucesso!");
      }
      handleClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        className={classes.dialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          {integrationId ? "Editar Integração" : "Nova Integração"}
        </DialogTitle>
        <Formik
          initialValues={integration}
          enableReinitialize={true}
          validationSchema={IntegrationSchema}
          onSubmit={(values, actions, event) => {
            setTimeout(() => {
              handleSaveIntegration(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers className={classes.dialogContent}>
                <Paper className={classes.infoPanel} elevation={0}>
                  <Typography variant="body2">
                    <span>ℹ️</span> As integrações permitem conectar seu
                    atendimento a ferramentas externas como chatbots, automações
                    e webhooks.
                  </Typography>
                </Paper>

                <div className={classes.formSection}>
                  <Typography className={classes.sectionTitle}>
                    Informações Básicas
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                        margin="dense"
                        fullWidth
                      >
                        <InputLabel id="type-selection-input-label">
                          Tipo de Integração
                        </InputLabel>

                        <Field
                          as={Select}
                          label="Tipo de Integração"
                          name="type"
                          labelId="profile-selection-label"
                          error={touched.type && Boolean(errors.type)}
                          helpertext={touched.type && errors.type}
                          id="type"
                          required
                        >
                          <MenuItem value="dialogflow">DialogFlow</MenuItem>
                          <MenuItem value="n8n">N8N</MenuItem>
                          <MenuItem value="webhook">WebHooks</MenuItem>
                          <MenuItem value="typebot">Typebot</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label="Nome da Integração"
                        autoFocus
                        name="name"
                        fullWidth
                        error={touched.name && Boolean(errors.name)}
                        helpertext={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                        className={classes.formControl}
                      />
                    </Grid>
                  </Grid>
                </div>

                {values.type === "dialogflow" && (
                  <div className={classes.formSection}>
                    <Typography className={classes.sectionTitle}>
                      Configuração do DialogFlow
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl
                          variant="outlined"
                          className={classes.formControl}
                          margin="dense"
                          fullWidth
                        >
                          <InputLabel id="language-selection-input-label">
                            Idioma
                          </InputLabel>

                          <Field
                            as={Select}
                            label="Idioma"
                            name="language"
                            labelId="profile-selection-label"
                            fullWidth
                            error={touched.language && Boolean(errors.language)}
                            helpertext={touched.language && errors.language}
                          >
                            <MenuItem value="pt-BR">
                              Português (Brasil)
                            </MenuItem>
                            <MenuItem value="en">Inglês</MenuItem>
                            <MenuItem value="es">Espanhol</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="Nome do Projeto"
                          name="projectName"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          error={
                            touched.projectName && Boolean(errors.projectName)
                          }
                          helpertext={touched.projectName && errors.projectName}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="JSON de Autenticação"
                          multiline
                          rows={5}
                          name="jsonContent"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          error={
                            touched.jsonContent && Boolean(errors.jsonContent)
                          }
                          helpertext={touched.jsonContent && errors.jsonContent}
                        />
                        <Typography className={classes.helpText}>
                          Cole aqui o conteúdo do JSON com as credenciais de
                          serviço do DialogFlow
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="flex-start" mt={2}>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={(e) => handleTestSession(e, values)}
                      >
                        Testar Conexão
                      </Button>
                    </Box>
                  </div>
                )}

                {values.type === "n8n" && (
                  <div className={classes.formSection}>
                    <Typography className={classes.sectionTitle}>
                      Configuração do N8N
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="URL do N8N"
                          name="urlN8N"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          placeholder="https://seu-n8n.com/webhook/..."
                          error={touched.urlN8N && Boolean(errors.urlN8N)}
                          helpertext={touched.urlN8N && errors.urlN8N}
                        />
                        <Typography className={classes.helpText}>
                          Informe a URL completa do webhook do N8N
                        </Typography>
                      </Grid>
                    </Grid>
                  </div>
                )}

                {values.type === "webhook" && (
                  <div className={classes.formSection}>
                    <Typography className={classes.sectionTitle}>
                      Configuração do Webhook
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="URL do Webhook"
                          name="urlN8N"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          placeholder="https://exemplo.com/api/webhook"
                          error={touched.urlN8N && Boolean(errors.urlN8N)}
                          helpertext={touched.urlN8N && errors.urlN8N}
                        />
                        <Typography className={classes.helpText}>
                          Informe a URL que receberá as notificações
                        </Typography>
                      </Grid>
                    </Grid>
                  </div>
                )}

                {values.type === "typebot" && (
                  <div className={classes.formSection}>
                    <Typography className={classes.sectionTitle}>
                      Configuração do Typebot
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="URL do Typebot"
                          name="urlN8N"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          placeholder="https://bot.typebot.io/meu-bot"
                          error={touched.urlN8N && Boolean(errors.urlN8N)}
                          helpertext={touched.urlN8N && errors.urlN8N}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="Slug do Typebot"
                          name="typebotSlug"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          error={
                            touched.typebotSlug && Boolean(errors.typebotSlug)
                          }
                          helpertext={touched.typebotSlug && errors.typebotSlug}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="Tempo de Expiração (dias)"
                          name="typebotExpires"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          type="number"
                          error={
                            touched.typebotExpires &&
                            Boolean(errors.typebotExpires)
                          }
                          helpertext={
                            touched.typebotExpires && errors.typebotExpires
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="Atraso da Mensagem (ms)"
                          name="typebotDelayMessage"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          type="number"
                          error={
                            touched.typebotDelayMessage &&
                            Boolean(errors.typebotDelayMessage)
                          }
                          helpertext={
                            touched.typebotDelayMessage &&
                            errors.typebotDelayMessage
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider style={{ margin: "12px 0" }} />
                        <Typography
                          variant="subtitle2"
                          style={{ marginBottom: 8 }}
                        >
                          Configurações de Comandos
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="Palavra-chave para Reiniciar"
                          name="typebotKeywordRestart"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          error={
                            touched.typebotKeywordRestart &&
                            Boolean(errors.typebotKeywordRestart)
                          }
                          helpertext={
                            touched.typebotKeywordRestart &&
                            errors.typebotKeywordRestart
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label="Palavra-chave para Finalizar"
                          name="typebotKeywordFinish"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          className={classes.formControl}
                          error={
                            touched.typebotKeywordFinish &&
                            Boolean(errors.typebotKeywordFinish)
                          }
                          helpertext={
                            touched.typebotKeywordFinish &&
                            errors.typebotKeywordFinish
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="Mensagem de Reinício"
                          name="typebotRestartMessage"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          multiline
                          rows={2}
                          className={classes.formControl}
                          error={
                            touched.typebotRestartMessage &&
                            Boolean(errors.typebotRestartMessage)
                          }
                          helpertext={
                            touched.typebotRestartMessage &&
                            errors.typebotRestartMessage
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label="Mensagem para Comandos Desconhecidos"
                          name="typebotUnknownMessage"
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          multiline
                          rows={2}
                          className={classes.formControl}
                          error={
                            touched.typebotUnknownMessage &&
                            Boolean(errors.typebotUnknownMessage)
                          }
                          helpertext={
                            touched.typebotUnknownMessage &&
                            errors.typebotUnknownMessage
                          }
                        />
                      </Grid>
                    </Grid>
                  </div>
                )}
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  className={classes.cancelButton}
                  disabled={isSubmitting}
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
                  {integrationId ? "Atualizar" : "Adicionar"}
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

export default IntegrationModal;
