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
import { has, isArray } from "lodash";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Edit as EditIcon,
  Layers,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import useCompanies from "../../hooks/useCompanies";
import { useDate } from "../../hooks/useDate";
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
  },
  fullWidth: {
    width: "100%",
  },
  companyCard: {
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
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },
  companyName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#5D3FD3",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: theme.spacing(2),
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#666",
    fontSize: 15,
    background: "#f8f7ff",
    borderRadius: 10,
    padding: "7px 14px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    padding: "6px 14px",
    fontWeight: 600,
    fontSize: 13,
    boxShadow: "0 2px 8px rgba(93,63,211,0.08)",
  },
  badgeAtivo: {
    background: "#e6fbe6",
    color: "#2e7d32",
  },
  badgeInativo: {
    background: "#ffebee",
    color: "#c62828",
  },
  badgeCampanha: {
    background: "#e3e6fd",
    color: "#5D3FD3",
  },
  badgeCampanhaOff: {
    background: "#f0f0f0",
    color: "#888",
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
    zIndex: 10,
  },
}));

function CompanyModal({
  open,
  onClose,
  onSubmit,
  initialValue,
  plans,
  loading,
}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Dados da Empresa", "Configurações e Datas"];

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    ...initialValue,
  });

  useEffect(() => {
    setRecord({
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      campaignsEnabled: false,
      dueDate: "",
      recurrence: "",
      ...initialValue,
    });
    setActiveStep(0);
  }, [initialValue, open]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecord((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(record);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <User size={28} style={{ color: "#5D3FD3" }} />
        {record.id ? "Editar Empresa" : "Nova Empresa"}
      </DialogTitle>
      <DialogContent style={{ padding: 32 }}>
        <Stepper activeStep={activeStep} style={{ marginBottom: 24 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form onSubmit={handleSubmit} autoComplete="off">
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome da Empresa"
                  name="name"
                  value={record.name}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  name="email"
                  value={record.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Telefone"
                  name="phone"
                  value={record.phone}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl variant="outlined" fullWidth margin="dense">
                  <InputLabel>Plano</InputLabel>
                  <Select
                    name="planId"
                    value={record.planId}
                    onChange={handleChange}
                    label="Plano"
                    required
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl variant="outlined" fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={record.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value={true}>Ativo</MenuItem>
                    <MenuItem value={false}>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl variant="outlined" fullWidth margin="dense">
                  <InputLabel>Campanhas</InputLabel>
                  <Select
                    name="campaignsEnabled"
                    value={record.campaignsEnabled}
                    onChange={handleChange}
                    label="Campanhas"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl variant="outlined" fullWidth margin="dense">
                  <InputLabel>Recorrência</InputLabel>
                  <Select
                    name="recurrence"
                    value={record.recurrence}
                    onChange={handleChange}
                    label="Recorrência"
                  >
                    <MenuItem value="MENSAL">Mensal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Data de Vencimento"
                  name="dueDate"
                  type="date"
                  value={record.dueDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </Grid>
          )}
          <DialogActions style={{ marginTop: 24 }}>
            <Button onClick={onClose}>Cancelar</Button>
            {activeStep > 0 && <Button onClick={handleBack}>Voltar</Button>}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" color="primary" onClick={handleNext}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompanyUsersModal({ open, onClose, company }) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && company?.id) {
      loadUsers();
    }
  }, [open, company]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Aqui você deve implementar a chamada à API para buscar os usuários da empresa
      // const response = await api.get(`/companies/${company.id}/users`);
      // setUsers(response.data);
      setLoading(false);
    } catch (err) {
      toast.error("Erro ao carregar usuários");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={28} style={{ color: "#5D3FD3" }} />
        Gerenciar Usuários - {company?.name}
      </DialogTitle>
      <DialogContent style={{ padding: 32 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Lista de Usuários</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={20} />}
                onClick={() => {
                  // Implementar adição de usuário
                }}
              >
                Adicionar Usuário
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography color="textSecondary">
                  Nenhum usuário encontrado
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <Paper className={classes.companyCard}>
                      <div className={classes.cardHeader}>
                        <div className={classes.companyName}>
                          <User size={22} /> {user.name}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <IconButton
                            onClick={() => {
                              // Implementar edição de usuário
                            }}
                            aria-label="edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              // Implementar exclusão de usuário
                            }}
                            aria-label="delete"
                            style={{ color: "#c62828" }}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </div>
                      </div>
                      <div className={classes.infoList}>
                        <div className={classes.infoItem}>
                          <Mail size={16} /> {user.email}
                        </div>
                        <div className={classes.infoItem}>
                          <Phone size={16} /> {user.phone || "-"}
                        </div>
                      </div>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect, onDelete, onManageUsers } = props;
  const classes = useStyles();
  const { dateToClient } = useDate();

  const renderStatus = (row) => (
    <span
      className={`${classes.badge} ${
        row.status ? classes.badgeAtivo : classes.badgeInativo
      }`}
    >
      {row.status ? <CheckCircle size={15} /> : <XCircle size={15} />}{" "}
      {row.status ? "Ativo" : "Inativo"}
    </span>
  );

  const renderPlan = (row) => (
    <span className={classes.infoItem} style={{ background: "#f0f7ff" }}>
      <Briefcase size={16} /> {row.planId !== null ? row.plan?.name : "-"}
    </span>
  );

  const renderCampaignsStatus = (row) => {
    let enabled = false;
    if (
      has(row, "settings") &&
      isArray(row.settings) &&
      row.settings.length > 0
    ) {
      const setting = row.settings.find((s) => s.key === "campaignsEnabled");
      if (setting) enabled = setting.value === "true";
    }
    return (
      <span
        className={`${classes.badge} ${
          enabled ? classes.badgeCampanha : classes.badgeCampanhaOff
        }`}
      >
        {enabled ? <CheckCircle size={14} /> : <XCircle size={14} />} Campanhas{" "}
        {enabled ? "Habilitadas" : "Desabilitadas"}
      </span>
    );
  };

  return (
    <Grid container spacing={3}>
      {records.map((row, key) => (
        <Grid item xs={12} sm={6} md={4} key={key}>
          <Paper
            className={classes.companyCard}
            onClick={() => onManageUsers(row)}
            style={{ cursor: "pointer" }}
          >
            <div className={classes.cardHeader}>
              <div className={classes.companyName}>
                <User size={22} /> {row.name || "-"}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(row);
                  }}
                  aria-label="edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row);
                  }}
                  aria-label="delete"
                  style={{ color: "#c62828" }}
                >
                  <Trash2 size={20} />
                </IconButton>
              </div>
            </div>
            <div className={classes.infoList}>
              <div className={classes.infoItem}>
                <Mail size={16} /> {row.email || "-"}
              </div>
              <div className={classes.infoItem}>
                <Phone size={16} /> {row.phone || "-"}
              </div>
              {renderPlan(row)}
              <div className={classes.infoItem}>
                <Calendar size={16} /> Vencimento: {dateToClient(row.dueDate)}
              </div>
              <div className={classes.infoItem}>
                <Layers size={16} /> Recorrência: {row.recurrence || "-"}
              </div>
            </div>
            <Divider style={{ margin: "12px 0" }} />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {renderStatus(row)}
              {renderCampaignsStatus(row)}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();
  const { list: listPlans } = usePlans();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const companyList = await list();
      setRecords(companyList);
      const plansList = await listPlans();
      setPlans(plansList);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      const companyList = await list();
      setRecords(companyList);
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      const companyList = await list();
      setRecords(companyList);
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
      email: "",
      phone: "",
      planId: "",
      status: true,
      campaignsEnabled: false,
      dueDate: "",
      recurrence: "",
    });
    setModalOpen(false);
  };

  const handleSelect = (data) => {
    let campaignsEnabled = false;
    const setting = data.settings?.find(
      (s) => s.key.indexOf("campaignsEnabled") > -1
    );
    if (setting) {
      campaignsEnabled =
        setting.value === "true" || setting.value === "enabled";
    }
    setRecord({
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
    });
    setModalOpen(true);
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <IconButton
        className={classes.addButton}
        color="primary"
        onClick={() => {
          setRecord({});
          setModalOpen(true);
        }}
      >
        <Plus size={24} color="#fff" />
      </IconButton>
      <CompanyModal
        open={modalOpen}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        initialValue={record}
        plans={plans}
        loading={loading}
      />
      <CompanyUsersModal
        open={usersModalOpen}
        onClose={() => {
          setUsersModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
      />
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <CompaniesManagerGrid
            records={records}
            onSelect={handleSelect}
            onDelete={(data) => {
              setRecord(data);
              handleOpenDeleteDialog();
            }}
            onManageUsers={(company) => {
              setSelectedCompany(company);
              setUsersModalOpen(true);
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
