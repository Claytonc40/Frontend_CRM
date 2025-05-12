import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from "@material-ui/core";
import {
  BookOpen,
  Edit as EditIcon,
  FileText,
  Plus,
  Youtube,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import useHelps from "../../hooks/useHelps";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: "100%",
    flex: 1,
    padding: theme.spacing(3),
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: 22,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(3),
    margin: "0 auto",
    transition: "all 0.3s",
    position: "relative",
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
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing(2),
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardDesc: {
    color: "#444",
    fontSize: 15,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  cardVideo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#c62828",
    fontWeight: 500,
    fontSize: 15,
    marginTop: theme.spacing(1),
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

function HelpModal({ open, onClose, onSubmit, initialValue, loading }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Informações Básicas", "Conteúdo do Vídeo"];
  const [record, setRecord] = useState({
    title: "",
    description: "",
    video: "",
    ...initialValue,
  });
  useEffect(() => {
    setRecord({
      title: "",
      description: "",
      video: "",
      ...initialValue,
    });
    setActiveStep(0);
  }, [initialValue, open]);
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(record);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BookOpen size={26} style={{ color: "#5D3FD3" }} />
        {record.id ? "Editar Ajuda" : "Nova Ajuda"}
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
              <Grid item xs={12}>
                <TextField
                  label="Título"
                  name="title"
                  value={record.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  name="description"
                  value={record.description}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="dense"
                />
              </Grid>
            </Grid>
          )}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Código do Vídeo (YouTube)"
                  name="video"
                  value={record.video}
                  onChange={handleChange}
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

function HelpsManagerGrid({ records, onSelect }) {
  const classes = useStyles();
  return (
    <Grid container spacing={3}>
      {records.map((row) => (
        <Grid item xs={12} sm={6} md={4} key={row.id}>
          <Paper className={classes.card}>
            <div className={classes.cardHeader}>
              <BookOpen size={22} />
              <span className={classes.cardTitle}>{row.title || "-"}</span>
              <IconButton onClick={() => onSelect(row)} aria-label="edit">
                <EditIcon />
              </IconButton>
            </div>
            <div className={classes.cardDesc}>
              <FileText size={16} style={{ marginRight: 4 }} />{" "}
              {row.description || "-"}
            </div>
            <Divider style={{ margin: "10px 0" }} />
            <div className={classes.cardVideo}>
              <Youtube size={18} /> {row.video || "-"}
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default function HelpsManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useHelps();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    title: "",
    description: "",
    video: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await loadHelps();
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHelps = async () => {
    setLoading(true);
    try {
      const helpList = await list();
      setRecords(helpList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadHelps();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma ajuda com o mesmo nome ou se os campos foram preenchidos corretamente",
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadHelps();
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
      title: "",
      description: "",
      video: "",
    });
    setModalOpen(false);
  };

  const handleSelect = (data) => {
    setRecord({
      id: data.id,
      title: data.title || "",
      description: data.description || "",
      video: data.video || "",
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
      <HelpModal
        open={modalOpen}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        initialValue={record}
        loading={loading}
      />
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <HelpsManagerGrid records={records} onSelect={handleSelect} />
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
