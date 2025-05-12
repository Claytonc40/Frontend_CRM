import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { FileText, Image, KeyRound, Mail, Send } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useHistory } from "react-router-dom";
import { toast } from "sonner";

import usePlans from "../../hooks/usePlans";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(4, 2, 8, 2),
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: theme.spacing(3),
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 28,
    color: "#5D3FD3",
    letterSpacing: 0.2,
  },
  headerDesc: {
    color: "#888",
    fontSize: 16,
    fontWeight: 400,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
    marginBottom: theme.spacing(4),
    background: "#fff",
    overflow: "hidden",
  },
  cardHeader: {
    background: "linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)",
    color: "#fff",
    padding: theme.spacing(2, 3),
    fontWeight: 600,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  cardContent: {
    padding: theme.spacing(3, 3, 2, 3),
  },
  exampleBox: {
    background: "#f8f7ff",
    borderRadius: 10,
    padding: theme.spacing(2),
    margin: theme.spacing(2, 0),
    fontFamily: "monospace",
    fontSize: 15,
    color: "#5D3FD3",
    wordBreak: "break-all",
  },
  formSection: {
    marginTop: theme.spacing(2),
    background: "#f7f8fa",
    borderRadius: 12,
    padding: theme.spacing(2, 2, 2, 2),
  },
  btnWrapper: {
    minWidth: 120,
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    textTransform: "none",
    background: "linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(93,63,211,0.10)",
    "&:hover": {
      background: "linear-gradient(90deg, #4930A8 0%, #6A5ACD 100%)",
    },
  },
  textRight: {
    textAlign: "right",
  },
  labelIcon: {
    color: "#5D3FD3",
    marginRight: 6,
    verticalAlign: "middle",
  },
  dropzone: {
    border: "2px dashed #7B68EE",
    borderRadius: 14,
    background: "#f8f7ff",
    padding: theme.spacing(3),
    textAlign: "center",
    color: "#5D3FD3",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    outline: "none",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "&:hover, &.active": {
      borderColor: "#5D3FD3",
      background: "#e3e6fd",
    },
  },
  dropzoneIcon: {
    color: "#7B68EE",
    marginBottom: 8,
  },
  dropzoneFileName: {
    color: "#444",
    fontWeight: 500,
    marginTop: 8,
    fontSize: 15,
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();

  const [formMessageTextData] = useState({ token: "", number: "", body: "" });
  const [formMessageMediaData] = useState({
    token: "",
    number: "",
    medias: "",
  });
  const [file, setFile] = useState(null);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.",
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + "/api/messages/send";
  };

  const handleSendTextMessage = async (values) => {
    const { number, body } = values;
    const data = { number, body };
    try {
      await axios.request({
        url: getEndpoint(),
        method: "POST",
        data,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${values.token}`,
        },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSendMediaMessage = async (values) => {
    try {
      if (!file) {
        toast.error("Selecione um arquivo para enviar.");
        return;
      }
      const data = new FormData();
      data.append("number", values.number);
      data.append("body", file.name);
      data.append("medias", file);
      await axios.request({
        url: getEndpoint(),
        method: "POST",
        data,
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${values.token}`,
        },
      });
      toast.success("Mensagem enviada com sucesso");
      setFile(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm();
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={
                    <>
                      <KeyRound className={classes.labelIcon} size={16} />
                      Token
                    </>
                  }
                  name="token"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={
                    <>
                      <Mail className={classes.labelIcon} size={16} />
                      Número
                    </>
                  }
                  name="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={
                    <>
                      <FileText className={classes.labelIcon} size={16} />
                      Mensagem
                    </>
                  }
                  name="body"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  multiline
                  minRows={2}
                />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  startIcon={<Send size={18} />}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Enviar"}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  };

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm();
            setFile(null);
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={
                    <>
                      <KeyRound className={classes.labelIcon} size={16} />
                      Token
                    </>
                  }
                  name="token"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={
                    <>
                      <Mail className={classes.labelIcon} size={16} />
                      Número
                    </>
                  }
                  name="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <div
                  {...getRootProps({
                    className: `${classes.dropzone} ${
                      isDragActive ? "active" : ""
                    }`,
                  })}
                >
                  <input {...getInputProps()} />
                  <Image size={36} className={classes.dropzoneIcon} />
                  {isDragActive ? (
                    <Typography variant="body2">
                      Solte o arquivo aqui...
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2">
                        Arraste e solte um arquivo aqui, ou clique para
                        selecionar
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Formatos aceitos: imagem, PDF, doc, etc.
                      </Typography>
                    </>
                  )}
                  {file && (
                    <div className={classes.dropzoneFileName}>
                      <b>Arquivo selecionado:</b> {file.name}
                    </div>
                  )}
                </div>
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  startIcon={<Send size={18} />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Enviar"}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <Paper className={classes.mainPaper} variant="outlined">
      <div className={classes.header}>
        <Send size={36} style={{ color: "#5D3FD3" }} />
        <div>
          <div className={classes.headerTitle}>Envio de Mensagens via API</div>
          <div className={classes.headerDesc}>
            Utilize os métodos abaixo para enviar mensagens de texto ou mídia
            via integração direta.
          </div>
        </div>
      </div>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card} elevation={0}>
            <div className={classes.cardHeader}>
              <Send size={20} /> Mensagem de Texto
            </div>
            <CardContent className={classes.cardContent}>
              <Typography variant="body1" gutterBottom>
                Envie mensagens de texto simples para um número de WhatsApp.
              </Typography>
              <Divider style={{ margin: "16px 0" }} />
              <Typography variant="subtitle2" color="primary">
                Exemplo de Requisição
              </Typography>
              <div className={classes.exampleBox}>
                Endpoint: <b>{getEndpoint()}</b>
                <br />
                Método: <b>POST</b>
                <br />
                Headers: <b>Authorization</b> (Bearer token),{" "}
                <b>Content-Type</b> (application/json)
                <br />
                Body:
                <br />
                {`{
  "number": "5599999999999",
  "body": "Sua mensagem"
}`}
              </div>
              <Typography
                variant="subtitle2"
                color="primary"
                style={{ marginTop: 16 }}
              >
                Teste de Envio
              </Typography>
              <div className={classes.formSection}>
                {renderFormMessageText()}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className={classes.card} elevation={0}>
            <div className={classes.cardHeader}>
              <Image size={20} /> Mensagem de Mídia
            </div>
            <CardContent className={classes.cardContent}>
              <Typography variant="body1" gutterBottom>
                Envie arquivos de mídia (imagens, documentos, etc) para um
                número de WhatsApp.
              </Typography>
              <Divider style={{ margin: "16px 0" }} />
              <Typography variant="subtitle2" color="primary">
                Exemplo de Requisição
              </Typography>
              <div className={classes.exampleBox}>
                Endpoint: <b>{getEndpoint()}</b>
                <br />
                Método: <b>POST</b>
                <br />
                Headers: <b>Authorization</b> (Bearer token),{" "}
                <b>Content-Type</b> (multipart/form-data)
                <br />
                FormData:
                <br />
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>number:</b> 5599999999999
                  </li>
                  <li>
                    <b>medias:</b> arquivo
                  </li>
                </ul>
              </div>
              <Typography
                variant="subtitle2"
                color="primary"
                style={{ marginTop: 16 }}
              >
                Teste de Envio
              </Typography>
              <div className={classes.formSection}>
                {renderFormMessageMedia()}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box mt={6}>
        <Typography variant="body2" color="textSecondary">
          <b>Observações importantes:</b>
          <br />
          - Antes de enviar mensagens, cadastre o token vinculado à conexão no
          menu "Conexões".
          <br />
          - O número deve conter apenas dígitos: código do país + DDD + número.
          <br />
        </Typography>
      </Box>
    </Paper>
  );
};

export default MessagesAPI;
