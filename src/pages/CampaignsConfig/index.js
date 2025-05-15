import React, { useEffect, useState } from "react";

import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "sonner";

import Container from "@material-ui/core/Container";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import MainHeader from "../../components/MainHeader";
import api from "../../services/api";

import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    ...theme.scrollbarStyles,
  },
  textRight: {
    textAlign: "right",
  },
  tabPanelsContainer: {
    padding: theme.spacing(2),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2.5, 3),
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(93,63,211,0.13)",
    minHeight: 64,
  },
  headerIcon: {
    color: "#5D3FD3",
    fontSize: 32,
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 24,
    color: "#5D3FD3",
    letterSpacing: 0.2,
  },
  cardSection: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(93,63,211,0.08)",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  formControl: {
    borderRadius: 12,
    background: "#f7f8fa",
    marginBottom: theme.spacing(2),
  },
  input: {
    borderRadius: 12,
    background: "#f7f8fa",
  },
  button: {
    borderRadius: 12,
    fontWeight: 600,
    minWidth: 120,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    textTransform: "none",
    fontSize: 15,
    marginRight: theme.spacing(2),
  },
  addButton: {
    borderRadius: 12,
    fontWeight: 600,
    minWidth: 120,
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    textTransform: "none",
    fontSize: 15,
    background: "#5D3FD3",
    color: "#fff",
    marginRight: theme.spacing(2),
    "&:hover": {
      background: "#4930A8",
    },
  },
  table: {
    background: "#f7f8fa",
    borderRadius: 12,
    marginTop: theme.spacing(2),
  },
  tableHead: {
    background: "#e5e0fa",
  },
  tableCell: {
    fontWeight: 600,
    color: "#5D3FD3",
    fontSize: 15,
  },
}));

const initialSettings = {
  messageInterval: 20,
  longerIntervalAfter: 20,
  greaterInterval: 60,
  variables: [],
};

const CampaignsConfig = () => {
  const classes = useStyles();

  const [settings, setSettings] = useState(initialSettings);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [variable, setVariable] = useState({ key: "", value: "" });

  useEffect(() => {
    api.get("/campaign-settings").then(({ data }) => {
      const settingsList = [];
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((item) => {
          settingsList.push([item.key, JSON.parse(item.value)]);
        });
        setSettings(Object.fromEntries(settingsList));
      }
    });
  }, []);

  const handleOnChangeVariable = (e) => {
    if (e.target.value !== null) {
      const changedProp = {};
      changedProp[e.target.name] = e.target.value;
      setVariable((prev) => ({ ...prev, ...changedProp }));
    }
  };

  const handleOnChangeSettings = (e) => {
    const changedProp = {};
    changedProp[e.target.name] = e.target.value;
    setSettings((prev) => ({ ...prev, ...changedProp }));
  };

  const addVariable = () => {
    setSettings((prev) => {
      const variablesExists = settings.variables.filter(
        (v) => v.key === variable.key
      );
      const variables = prev.variables;
      if (variablesExists.length === 0) {
        variables.push(Object.assign({}, variable));
        setVariable({ key: "", value: "" });
      }
      return { ...prev, variables };
    });
  };

  const removeVariable = () => {
    const newList = settings.variables.filter((v) => v.key !== selectedKey);
    setSettings((prev) => ({ ...prev, variables: newList }));
    setSelectedKey(null);
  };

  const saveSettings = async () => {
    await api.post("/campaign-settings", { settings });
    toast.success("Configurações salvas");
  };

  return (
    <Container maxWidth="xl" className={classes.container}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={removeVariable}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <MainHeader>
        <div className={classes.headerContainer}>
          <SettingsIcon className={classes.headerIcon} />
          <span className={classes.headerTitle}>
            {i18n.t("campaignsConfig.title")}
          </span>
        </div>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.tabPanelsContainer}>
          <div className={classes.cardSection}>
            <Typography
              component={"h3"}
              style={{ marginBottom: 16, fontWeight: 700, color: "#5D3FD3" }}
            >
              Intervalos
            </Typography>
            <Grid spacing={2} container>
              <Grid xs={12} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="messageInterval-label">
                    Intervalo Randômico de Disparo
                  </InputLabel>
                  <Select
                    name="messageInterval"
                    id="messageInterval"
                    labelId="messageInterval-label"
                    label="Intervalo Randômico de Disparo"
                    value={settings.messageInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                    className={classes.input}
                  >
                    <MenuItem value={0}>Sem Intervalo</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="longerIntervalAfter-label">
                    Intervalo Maior Após
                  </InputLabel>
                  <Select
                    name="longerIntervalAfter"
                    id="longerIntervalAfter"
                    labelId="longerIntervalAfter-label"
                    label="Intervalo Maior Após"
                    value={settings.longerIntervalAfter}
                    onChange={(e) => handleOnChangeSettings(e)}
                    className={classes.input}
                  >
                    <MenuItem value={0}>Não definido</MenuItem>
                    <MenuItem value={1}>1 segundo</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                    <MenuItem value={30}>30 segundos</MenuItem>
                    <MenuItem value={40}>40 segundos</MenuItem>
                    <MenuItem value={60}>60 segundos</MenuItem>
                    <MenuItem value={80}>80 segundos</MenuItem>
                    <MenuItem value={100}>100 segundos</MenuItem>
                    <MenuItem value={120}>120 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={4} item>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  fullWidth
                >
                  <InputLabel id="greaterInterval-label">
                    Intervalo de Disparo Maior
                  </InputLabel>
                  <Select
                    name="greaterInterval"
                    id="greaterInterval"
                    labelId="greaterInterval-label"
                    label="Intervalo de Disparo Maior"
                    value={settings.greaterInterval}
                    onChange={(e) => handleOnChangeSettings(e)}
                    className={classes.input}
                  >
                    <MenuItem value={0}>Sem Intervalo</MenuItem>
                    <MenuItem value={1}>1 segundo</MenuItem>
                    <MenuItem value={5}>5 segundos</MenuItem>
                    <MenuItem value={10}>10 segundos</MenuItem>
                    <MenuItem value={15}>15 segundos</MenuItem>
                    <MenuItem value={20}>20 segundos</MenuItem>
                    <MenuItem value={30}>30 segundos</MenuItem>
                    <MenuItem value={40}>40 segundos</MenuItem>
                    <MenuItem value={60}>60 segundos</MenuItem>
                    <MenuItem value={80}>80 segundos</MenuItem>
                    <MenuItem value={100}>100 segundos</MenuItem>
                    <MenuItem value={120}>120 segundos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} className={classes.textRight} item>
                <Button
                  onClick={() => setShowVariablesForm(!showVariablesForm)}
                  color="primary"
                  className={classes.button}
                >
                  Adicionar Variável
                </Button>
                <Button
                  onClick={saveSettings}
                  color="primary"
                  variant="contained"
                  className={classes.addButton}
                >
                  Salvar Configurações
                </Button>
              </Grid>
            </Grid>
          </div>
          {showVariablesForm && (
            <div className={classes.cardSection}>
              <Typography
                component={"h3"}
                style={{ marginBottom: 16, fontWeight: 700, color: "#5D3FD3" }}
              >
                Nova Variável
              </Typography>
              <Grid spacing={2} container>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Atalho"
                    variant="outlined"
                    value={variable.key}
                    name="key"
                    onChange={handleOnChangeVariable}
                    fullWidth
                    className={classes.input}
                  />
                </Grid>
                <Grid xs={12} md={6} item>
                  <TextField
                    label="Conteúdo"
                    variant="outlined"
                    value={variable.value}
                    name="value"
                    onChange={handleOnChangeVariable}
                    fullWidth
                    className={classes.input}
                  />
                </Grid>
                <Grid xs={12} className={classes.textRight} item>
                  <Button
                    onClick={() => setShowVariablesForm(!showVariablesForm)}
                    color="primary"
                    className={classes.button}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={addVariable}
                    color="primary"
                    variant="contained"
                    className={classes.addButton}
                  >
                    Adicionar
                  </Button>
                </Grid>
              </Grid>
            </div>
          )}
          {settings.variables.length > 0 && (
            <div className={classes.cardSection}>
              <Typography
                component={"h3"}
                style={{ marginBottom: 16, fontWeight: 700, color: "#5D3FD3" }}
              >
                Variáveis
              </Typography>
              <Table size="small" className={classes.table}>
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell style={{ width: "1%" }}></TableCell>
                    <TableCell className={classes.tableCell}>Atalho</TableCell>
                    <TableCell className={classes.tableCell}>
                      Conteúdo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(settings.variables) &&
                    settings.variables.map((v, k) => (
                      <TableRow key={k}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedKey(v.key);
                              setConfirmationOpen(true);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>{"{" + v.key + "}"}</TableCell>
                        <TableCell>{v.value}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CampaignsConfig;
