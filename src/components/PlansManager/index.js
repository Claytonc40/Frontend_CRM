import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import {
  Brain,
  Calendar,
  CheckCircle,
  Code,
  DollarSign,
  Edit as EditIcon,
  GitBranch,
  Link,
  List,
  Megaphone,
  MessageSquare,
  Plus,
  Trash2,
  Trello,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import usePlans from "../../hooks/usePlans";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#5D3FD3",
      borderRadius: "4px",
      "&:hover": {
        background: "#4930A8",
      },
    },
  },
  fullWidth: {
    width: "100%",
  },
  planCard: {
    background: "#fff",
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: "0 4px 20px rgba(93,63,211,0.08)",
    transition: "all 0.3s ease",
    border: "1px solid #f0f0f0",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },
  planName: {
    fontSize: 24,
    fontWeight: 700,
    color: "#5D3FD3",
    marginBottom: theme.spacing(1),
  },
  planValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.spacing(2),
  },
  planFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: theme.spacing(2),
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    background: "#f8f7ff",
    borderRadius: 12,
    "& svg": {
      color: "#5D3FD3",
    },
  },
  featureLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: 500,
  },
  featureValue: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  addButton: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    borderRadius: "50%",
    width: 56,
    height: 56,
    background: "linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)",
    boxShadow: "0 4px 12px rgba(93,63,211,0.15)",
    "&:hover": {
      background: "linear-gradient(90deg, #4930A8 0%, #6A5ACD 100%)",
    },
  },
  modalContent: {
    padding: theme.spacing(3),
  },
  stepContent: {
    marginTop: theme.spacing(3),
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#5D3FD3",
    marginBottom: theme.spacing(2),
  },
  formGrid: {
    marginBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    borderTop: "1px solid #f0f0f0",
  },
}));

const steps = ["Informações Básicas", "Recursos do Plano"];

export function PlanManagerForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);

  const [record, setRecord] = useState({
    name: "",
    users: 0,
    connections: 0,
    queues: 0,
    value: 0,
    useCampaigns: true,
    useSchedules: true,
    useInternalChat: true,
    useExternalApi: true,
    useKanban: true,
    useOpenAi: true,
    useIntegrations: true,
  });

  useEffect(() => {
    setRecord(initialValue);
    if (initialValue.id) {
      setOpen(true);
    }
  }, [initialValue]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    onCancel();
  };

  const handleSubmit = async (values) => {
    onSubmit(values);
    handleClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography className={classes.formTitle}>
                Detalhes do Plano
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Nome do Plano"
                name="name"
                variant="outlined"
                fullWidth
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                label="Valor"
                name="value"
                variant="outlined"
                fullWidth
                margin="dense"
                type="text"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Usuários"
                name="users"
                variant="outlined"
                fullWidth
                margin="dense"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Conexões"
                name="connections"
                variant="outlined"
                fullWidth
                margin="dense"
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                as={TextField}
                label="Filas"
                name="queues"
                variant="outlined"
                fullWidth
                margin="dense"
                type="number"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography className={classes.formTitle}>
                Recursos Disponíveis
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Campanhas</InputLabel>
                <Field as={Select} name="useCampaigns" label="Campanhas">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Agendamentos</InputLabel>
                <Field as={Select} name="useSchedules" label="Agendamentos">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Chat Interno</InputLabel>
                <Field as={Select} name="useInternalChat" label="Chat Interno">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>API Externa</InputLabel>
                <Field as={Select} name="useExternalApi" label="API Externa">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Kanban</InputLabel>
                <Field as={Select} name="useKanban" label="Kanban">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Open.Ai</InputLabel>
                <Field as={Select} name="useOpenAi" label="Open.Ai">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Integrações</InputLabel>
                <Field as={Select} name="useIntegrations" label="Integrações">
                  <MenuItem value={true}>Habilitado</MenuItem>
                  <MenuItem value={false}>Desabilitado</MenuItem>
                </Field>
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <IconButton
        className={classes.addButton}
        color="primary"
        onClick={() => setOpen(true)}
      >
        <Plus size={24} color="#fff" />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{record.id ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        <DialogContent className={classes.modalContent}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div className={classes.stepContent}>
            <Formik
              enableReinitialize
              initialValues={record}
              onSubmit={handleSubmit}
            >
              {(formikProps) => (
                <Form>
                  {renderStepContent(activeStep)}
                  <DialogActions className={classes.dialogActions}>
                    <Button onClick={handleClose}>Cancelar</Button>
                    {record.id && (
                      <Button
                        color="secondary"
                        onClick={() => onDelete(record)}
                      >
                        Excluir
                      </Button>
                    )}
                    {activeStep > 0 && (
                      <Button onClick={handleBack}>Voltar</Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                      >
                        Próximo
                      </Button>
                    ) : (
                      <ButtonWithSpinner
                        loading={loading}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Salvar
                      </ButtonWithSpinner>
                    )}
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PlansManagerGrid(props) {
  const { records, onSelect, onDelete } = props;
  const classes = useStyles();

  const renderFeature = (enabled, icon, label) => (
    <div className={classes.featureItem}>
      {icon}
      <span className={classes.featureLabel}>{label}</span>
      <div className={classes.featureValue}>
        {enabled ? (
          <CheckCircle size={16} color="#2e7d32" />
        ) : (
          <XCircle size={16} color="#c62828" />
        )}
      </div>
    </div>
  );

  return (
    <Grid container spacing={3}>
      {records.map((plan) => (
        <Grid item xs={12} sm={6} md={4} key={plan.id}>
          <Paper className={classes.planCard}>
            <div className={classes.planHeader}>
              <div>
                <Typography className={classes.planName}>
                  {plan.name}
                </Typography>
                <div className={classes.planValue}>
                  <DollarSign size={24} />
                  {plan.value?.toLocaleString("pt-br", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <IconButton onClick={() => onSelect(plan)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(plan)}
                  style={{ color: "#c62828" }}
                >
                  <Trash2 size={20} />
                </IconButton>
              </div>
            </div>

            <Divider />

            <div className={classes.planFeatures}>
              {renderFeature(
                plan.users > 0,
                <Users size={18} />,
                `${plan.users} Usuários`
              )}
              {renderFeature(
                plan.connections > 0,
                <Link size={18} />,
                `${plan.connections} Conexões`
              )}
              {renderFeature(
                plan.queues > 0,
                <List size={18} />,
                `${plan.queues} Filas`
              )}
              {renderFeature(
                plan.useCampaigns,
                <Megaphone size={18} />,
                "Campanhas"
              )}
              {renderFeature(
                plan.useSchedules,
                <Calendar size={18} />,
                "Agendamentos"
              )}
              {renderFeature(
                plan.useInternalChat,
                <MessageSquare size={18} />,
                "Chat Interno"
              )}
              {renderFeature(
                plan.useExternalApi,
                <Code size={18} />,
                "API Externa"
              )}
              {renderFeature(plan.useKanban, <Trello size={18} />, "Kanban")}
              {renderFeature(plan.useOpenAi, <Brain size={18} />, "Open.Ai")}
              {renderFeature(
                plan.useIntegrations,
                <GitBranch size={18} />,
                "Integrações"
              )}
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function PlansManager() {
  const classes = useStyles();
  const { list, save, update, remove } = usePlans();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    users: 0,
    connections: 0,
    queues: 0,
    value: 0,
    useCampaigns: true,
    useSchedules: true,
    useInternalChat: true,
    useExternalApi: true,
    useKanban: true,
    useOpenAi: true,
    useIntegrations: true,
  });

  useEffect(() => {
    async function fetchData() {
      await loadPlans();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const planList = await list();
      setRecords(planList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    console.log(data);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma plano com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      id: undefined,
      name: "",
      users: 0,
      connections: 0,
      queues: 0,
      value: 0,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true,
    });
  };

  const handleSelect = (data) => {
    let useCampaigns = data.useCampaigns === false ? false : true;
    let useSchedules = data.useSchedules === false ? false : true;
    let useInternalChat = data.useInternalChat === false ? false : true;
    let useExternalApi = data.useExternalApi === false ? false : true;
    let useKanban = data.useKanban === false ? false : true;
    let useOpenAi = data.useOpenAi === false ? false : true;
    let useIntegrations = data.useIntegrations === false ? false : true;

    setRecord({
      id: data.id,
      name: data.name || "",
      users: data.users || 0,
      connections: data.connections || 0,
      queues: data.queues || 0,
      value:
        data.value?.toLocaleString("pt-br", { minimumFractionDigits: 0 }) || 0,
      useCampaigns,
      useSchedules,
      useInternalChat,
      useExternalApi,
      useKanban,
      useOpenAi,
      useIntegrations,
    });
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <PlanManagerForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid xs={12} item>
          <PlansManagerGrid
            records={records}
            onSelect={handleSelect}
            onDelete={(data) => {
              setRecord(data);
              handleOpenDeleteDialog();
            }}
          />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}
