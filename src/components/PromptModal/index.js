import React, { useState, useEffect } from "react";

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
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Typography, Divider, Grid, Paper, Box, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff, Code, SettingsVoice, Speed, Whatshot, Message, Lock } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../../components/QueueSelectSingle";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
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
    textField: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 8,
        },
        marginBottom: theme.spacing(2),
    },
    formSection: {
        marginBottom: theme.spacing(3),
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
    fieldIcon: {
        color: "#5D3FD3",
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
    infoPanel: {
        backgroundColor: "rgba(93, 63, 211, 0.05)",
        padding: theme.spacing(2),
        borderRadius: 8,
        marginBottom: theme.spacing(3),
    },
    infoIcon: {
        color: "#5D3FD3",
        marginRight: theme.spacing(1),
        fontSize: 20,
    },
    selectRoot: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 8,
        },
        marginBottom: theme.spacing(2),
    },
    helpText: {
        fontSize: "0.75rem",
        color: "rgba(0, 0, 0, 0.6)",
        marginTop: -theme.spacing(1.5),
        marginBottom: theme.spacing(2),
    },
}));

const PromptSchema = Yup.object().shape({
    name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
    prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
    voice: Yup.string().required("Informe o modo para Voz"),
    maxTokens: Yup.number().required("Informe o número máximo de tokens"),
    temperature: Yup.number().required("Informe a temperatura"),
    apiKey: Yup.string().required("Informe a API Key"),
    queueId: Yup.number().required("Informe a fila"),
    maxMessages: Yup.number().required("Informe o número máximo de mensagens")
});

const PromptModal = ({ open, onClose, promptId }) => {
    const classes = useStyles();
    const [selectedVoice, setSelectedVoice] = useState("texto");
    const [showApiKey, setShowApiKey] = useState(false);

    const handleToggleApiKey = () => {
        setShowApiKey(!showApiKey);
    };

    const initialState = {
        name: "",
        prompt: "",
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        maxTokens: 100,
        temperature: 1,
        apiKey: "",
        queueId: null,
        maxMessages: 10
    };

    const [prompt, setPrompt] = useState(initialState);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                return;
            }
            try {
                const { data } = await api.get(`/prompt/${promptId}`);
                setPrompt(prevState => {
                    return { ...prevState, ...data };
                });
                setSelectedVoice(data.voice);
            } catch (err) {
                toastError(err);
            }
        };

        fetchPrompt();
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedVoice("texto");
        onClose();
    };

    const handleChangeVoice = (e) => {
        setSelectedVoice(e.target.value);
    };

    const handleSavePrompt = async values => {
        const promptData = { ...values, voice: selectedVoice };
        if (!values.queueId) {
            toastError("Informe o setor");
            return;
        }
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
                className={classes.dialog}
            >
                <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
                    {promptId
                        ? `${i18n.t("promptModal.title.edit")}`
                        : `${i18n.t("promptModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    validationSchema={PromptSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers className={classes.dialogContent}>
                                <Paper className={classes.infoPanel} elevation={0}>
                                    <Typography variant="body2">
                                        <span className={classes.infoIcon}>ℹ️</span> Os prompts permitem que você configure como a IA do OpenAI irá interagir em suas conversas. Defina as instruções de comportamento, tom de voz e conhecimentos específicos para seu atendimento.
                                    </Typography>
                                </Paper>
                                
                                <div className={classes.formSection}>
                                    <Typography className={classes.sectionTitle}>
                                        Informações Básicas
                                    </Typography>
                                    
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        className={classes.textField}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Code className={classes.fieldIcon} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    
                                    <FormControl fullWidth margin="dense" variant="outlined" className={classes.textField}>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.apikey")}
                                            name="apiKey"
                                            type={showApiKey ? 'text' : 'password'}
                                            error={touched.apiKey && Boolean(errors.apiKey)}
                                            helperText={touched.apiKey && errors.apiKey}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock className={classes.fieldIcon} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleToggleApiKey}>
                                                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </FormControl>
                                </div>
                                
                                <div className={classes.formSection}>
                                    <Typography className={classes.sectionTitle}>
                                        Configuração do Prompt
                                    </Typography>
                                    
                                    <Field
                                        as={TextField}
                                        label={i18n.t("promptModal.form.prompt")}
                                        name="prompt"
                                        error={touched.prompt && Boolean(errors.prompt)}
                                        helperText={touched.prompt && errors.prompt}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        rows={8}
                                        multiline={true}
                                        className={classes.textField}
                                        placeholder="Descreva como a IA deve se comportar, que tipo de respostas deve fornecer, e qual conhecimento específico ela deve demonstrar..."
                                    />
                                    <Typography className={classes.helpText}>
                                        Seja detalhado nas instruções para obter melhores resultados da IA
                                    </Typography>
                                    
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
                                            Selecione a fila de atendimento
                                        </Typography>
                                        <QueueSelectSingle />
                                    </Box>
                                </div>
                                
                                <div className={classes.formSection}>
                                    <Typography className={classes.sectionTitle}>
                                        Configuração de Voz
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth variant="outlined" className={classes.selectRoot}>
                                                <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                                                <Select
                                                    id="type-select"
                                                    labelWidth={60}
                                                    name="voice"
                                                    value={selectedVoice}
                                                    onChange={handleChangeVoice}
                                                    multiple={false}
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <SettingsVoice className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    }
                                                >
                                                    <MenuItem key={"texto"} value={"texto"}>
                                                        Texto
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-FranciscaNeural"} value={"pt-BR-FranciscaNeural"}>
                                                        Francisa
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-AntonioNeural"} value={"pt-BR-AntonioNeural"}>
                                                        Antônio
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-BrendaNeural"} value={"pt-BR-BrendaNeural"}>
                                                        Brenda
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-DonatoNeural"} value={"pt-BR-DonatoNeural"}>
                                                        Donato
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-ElzaNeural"} value={"pt-BR-ElzaNeural"}>
                                                        Elza
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-FabioNeural"} value={"pt-BR-FabioNeural"}>
                                                        Fábio
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-GiovannaNeural"} value={"pt-BR-GiovannaNeural"}>
                                                        Giovanna
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-HumbertoNeural"} value={"pt-BR-HumbertoNeural"}>
                                                        Humberto
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-JulioNeural"} value={"pt-BR-JulioNeural"}>
                                                        Julio
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-LeilaNeural"} value={"pt-BR-LeilaNeural"}>
                                                        Leila
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-LeticiaNeural"} value={"pt-BR-LeticiaNeural"}>
                                                        Letícia
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-ManuelaNeural"} value={"pt-BR-ManuelaNeural"}>
                                                        Manuela
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-NicolauNeural"} value={"pt-BR-NicolauNeural"}>
                                                        Nicolau
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-ValerioNeural"} value={"pt-BR-ValerioNeural"}>
                                                        Valério
                                                    </MenuItem>
                                                    <MenuItem key={"pt-BR-YaraNeural"} value={"pt-BR-YaraNeural"}>
                                                        Yara
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        
                                        {selectedVoice !== "texto" && (
                                            <>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("promptModal.form.voiceKey")}
                                                        name="voiceKey"
                                                        error={touched.voiceKey && Boolean(errors.voiceKey)}
                                                        helperText={touched.voiceKey && errors.voiceKey}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        className={classes.textField}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Field
                                                        as={TextField}
                                                        label={i18n.t("promptModal.form.voiceRegion")}
                                                        name="voiceRegion"
                                                        error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                                                        helperText={touched.voiceRegion && errors.voiceRegion}
                                                        variant="outlined"
                                                        margin="dense"
                                                        fullWidth
                                                        className={classes.textField}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </div>
                                
                                <div className={classes.formSection}>
                                    <Typography className={classes.sectionTitle}>
                                        Parâmetros Avançados
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.temperature")}
                                                name="temperature"
                                                error={touched.temperature && Boolean(errors.temperature)}
                                                helperText={touched.temperature && errors.temperature}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                className={classes.textField}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Whatshot className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Typography className={classes.helpText}>
                                                Valores mais altos (ex: 1) geram respostas mais criativas
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.max_tokens")}
                                                name="maxTokens"
                                                error={touched.maxTokens && Boolean(errors.maxTokens)}
                                                helperText={touched.maxTokens && errors.maxTokens}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                className={classes.textField}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Speed className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Typography className={classes.helpText}>
                                                Limite máximo de caracteres gerados por resposta
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.max_messages")}
                                                name="maxMessages"
                                                error={touched.maxMessages && Boolean(errors.maxMessages)}
                                                helperText={touched.maxMessages && errors.maxMessages}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                className={classes.textField}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Message className={classes.fieldIcon} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Typography className={classes.helpText}>
                                                Número máximo de mensagens consideradas no histórico
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </div>
                            </DialogContent>
                            <DialogActions className={classes.dialogActions}>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                    className={classes.cancelButton}
                                >
                                    {i18n.t("promptModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={`${classes.btnWrapper} ${classes.saveButton}`}
                                >
                                    {promptId
                                        ? `${i18n.t("promptModal.buttons.okEdit")}`
                                        : `${i18n.t("promptModal.buttons.okAdd")}`}
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

export default PromptModal;