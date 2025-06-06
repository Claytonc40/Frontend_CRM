import React, { useEffect, useState } from "react";

import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { toast } from "sonner";
import useSettings from "../../hooks/useSettings";

import { Box, Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  ArrowRightLeft,
  Bot,
  KeyRound,
  Link2,
  Lock,
  MessageCircle,
  Phone,
  Plug,
  Server,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Smile,
  UserCheck,
} from "lucide-react";

//import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: "100%",
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
    padding: theme.spacing(4, 0, 6, 0),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sectionCard: {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 4px 32px rgba(93,63,211,0.10)",
    padding: theme.spacing(3, 3, 2, 3),
    marginBottom: theme.spacing(4),
    maxWidth: 1200,
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 1, 1, 1),
      borderRadius: 12,
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 22,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionDesc: {
    color: "#888",
    fontSize: 15,
    fontWeight: 400,
    marginLeft: 2,
    marginTop: 2,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: "#faf9fd",
    borderRadius: 12,
    boxShadow: "0 1px 6px rgba(93,63,211,0.06)",
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    transition: "box-shadow 0.2s, background 0.2s",
    "&:hover": {
      background: "#f3f0fa",
      boxShadow: "0 2px 12px rgba(93,63,211,0.10)",
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
    },
  },
  optionLabel: {
    fontWeight: 600,
    color: "#222",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 220,
  },
  select: {
    marginLeft: "auto",
    minWidth: 140,
    borderRadius: 10,
    background: "#fff",
    fontWeight: 600,
    fontSize: 15,
    color: "#5D3FD3",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#5D3FD3",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#4930A8",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#4930A8",
    },
  },
  textField: {
    minWidth: 180,
    borderRadius: 10,
    background: "#fff",
    fontWeight: 500,
    fontSize: 15,
    color: "#5D3FD3",
    marginLeft: theme.spacing(2),
  },
  tab: {
    backgroundColor: theme.palette.options,
    borderRadius: 4,
    width: "100%",
    marginBottom: 10,
    "& .MuiTab-wrapper": {
      color: theme.palette.fontecor,
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center",
    },
  },
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [callType, setCallType] = useState("enabled");
  const [chatbotType, setChatbotType] = useState("");
  const [CheckMsgIsGroup, setCheckMsgIsGroupType] = useState("enabled");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [loadingCallType, setLoadingCallType] = useState(false);
  const [loadingChatbotType, setLoadingChatbotType] = useState(false);

  const [ipixcType, setIpIxcType] = useState("");
  const [loadingIpIxcType, setLoadingIpIxcType] = useState(false);
  const [tokenixcType, setTokenIxcType] = useState("");
  const [loadingTokenIxcType, setLoadingTokenIxcType] = useState(false);

  const [ipmkauthType, setIpMkauthType] = useState("");
  const [loadingIpMkauthType, setLoadingIpMkauthType] = useState(false);
  const [clientidmkauthType, setClientIdMkauthType] = useState("");
  const [loadingClientIdMkauthType, setLoadingClientIdMkauthType] =
    useState(false);
  const [clientsecretmkauthType, setClientSecrectMkauthType] = useState("");
  const [loadingClientSecrectMkauthType, setLoadingClientSecrectMkauthType] =
    useState(false);

  const [asaasType, setAsaasType] = useState("");
  const [loadingAsaasType, setLoadingAsaasType] = useState(false);

  // Adicionar states para controlar os tabs
  const [mainIntegrationTab, setMainIntegrationTab] = useState(0);
  const [mkauthTab, setMkauthTab] = useState(0);
  const [asaasTab, setAsaasTab] = useState(0);

  // recursos a mais da plw design

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("disabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] =
    useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("disabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] =
    useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] =
    useState("disabled");
  const [
    loadingSendGreetingMessageOneQueues,
    setLoadingSendGreetingMessageOneQueues,
  ] = useState(false);

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }
      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }
      const callType = settings.find((s) => s.key === "call");
      if (callType) {
        setCallType(callType.value);
      }
      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroupType(CheckMsgIsGroup.value);
      }

      // PLW DESIGN SAUDAÇÃO
      const SendGreetingAccepted = settings.find(
        (s) => s.key === "sendGreetingAccepted"
      );
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }
      // PLW DESIGN SAUDAÇÃO

      // TRANSFERIR TICKET
      const SettingsTransfTicket = settings.find(
        (s) => s.key === "sendMsgTransfTicket"
      );
      if (SettingsTransfTicket) {
        setSettingsTransfTicket(SettingsTransfTicket.value);
      }
      // TRANSFERIR TICKET

      const sendGreetingMessageOneQueues = settings.find(
        (s) => s.key === "sendGreetingMessageOneQueues"
      );
      if (sendGreetingMessageOneQueues) {
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value);
      }

      const chatbotType = settings.find((s) => s.key === "chatBotType");
      if (chatbotType) {
        setChatbotType(chatbotType.value);
      }

      const ipixcType = settings.find((s) => s.key === "ipixc");
      if (ipixcType) {
        setIpIxcType(ipixcType.value);
      }

      const tokenixcType = settings.find((s) => s.key === "tokenixc");
      if (tokenixcType) {
        setTokenIxcType(tokenixcType.value);
      }

      const ipmkauthType = settings.find((s) => s.key === "ipmkauth");
      if (ipmkauthType) {
        setIpMkauthType(ipmkauthType.value);
      }

      const clientidmkauthType = settings.find(
        (s) => s.key === "clientidmkauth"
      );
      if (clientidmkauthType) {
        setClientIdMkauthType(clientidmkauthType.value);
      }

      const clientsecretmkauthType = settings.find(
        (s) => s.key === "clientsecretmkauth"
      );
      if (clientsecretmkauthType) {
        setClientSecrectMkauthType(clientsecretmkauthType.value);
      }

      const asaasType = settings.find((s) => s.key === "asaas");
      if (asaasType) {
        setAsaasType(asaasType.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUserRating(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      key: "sendGreetingMessageOneQueues",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    //toast.success("Oraçãpeo atualizada com sucesso.");
    toast.success("Operação atualizada com sucesso.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "light",
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleCallType(value) {
    setCallType(value);
    setLoadingCallType(true);
    await update({
      key: "call",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingCallType(false);
  }

  async function handleChatbotType(value) {
    setChatbotType(value);
    setLoadingChatbotType(true);
    await update({
      key: "chatBotType",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingChatbotType(false);
  }

  async function handleGroupType(value) {
    setCheckMsgIsGroupType(value);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setCheckMsgIsGroupType(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSendGreetingAccepted(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      key: "sendMsgTransfTicket",
      value,
    });

    toast.success("Operação atualizada com sucesso.");
    setLoadingSettingsTransfTicket(false);
  }

  async function handleChangeIPIxc(value) {
    setIpIxcType(value);
    setLoadingIpIxcType(true);
    await update({
      key: "ipixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpIxcType(false);
  }

  async function handleChangeTokenIxc(value) {
    setTokenIxcType(value);
    setLoadingTokenIxcType(true);
    await update({
      key: "tokenixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenIxcType(false);
  }

  async function handleChangeIpMkauth(value) {
    setIpMkauthType(value);
    setLoadingIpMkauthType(true);
    await update({
      key: "ipmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpMkauthType(false);
  }

  async function handleChangeClientIdMkauth(value) {
    setClientIdMkauthType(value);
    setLoadingClientIdMkauthType(true);
    await update({
      key: "clientidmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientIdMkauthType(false);
  }

  async function handleChangeClientSecrectMkauth(value) {
    setClientSecrectMkauthType(value);
    setLoadingClientSecrectMkauthType(true);
    await update({
      key: "clientsecretmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientSecrectMkauthType(false);
  }

  async function handleChangeAsaas(value) {
    setAsaasType(value);
    setLoadingAsaasType(true);
    await update({
      key: "asaas",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingAsaasType(false);
  }
  return (
    <div className={classes.mainWrapper}>
      {/* Seção Geral */}
      <Paper className={classes.sectionCard} elevation={0}>
        <div className={classes.sectionHeader}>
          <SettingsIcon size={28} style={{ color: "#5D3FD3" }} />
          <div>
            <div className={classes.sectionTitle}>Configurações Gerais</div>
            <div className={classes.sectionDesc}>
              Personalize o funcionamento básico do sistema.
            </div>
          </div>
        </div>
        <Grid spacing={3} container>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <Smile size={18} /> Avaliações
              </span>
              <Select
                value={userRating}
                onChange={async (e) => {
                  handleChangeUserRating(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
                <MenuItem value={"enabled"}>Habilitadas</MenuItem>
              </Select>
              <FormHelperText>
                {loadingUserRating && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <SlidersHorizontal size={18} /> Gerenciamento de Expediente
              </span>
              <Select
                value={scheduleType}
                onChange={async (e) => {
                  handleScheduleType(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desabilitado</MenuItem>
                <MenuItem value={"queue"}>Fila</MenuItem>
                <MenuItem value={"company"}>Empresa</MenuItem>
              </Select>
              <FormHelperText>
                {loadingScheduleType && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <MessageCircle size={18} /> Ignorar Mensagens de Grupos
              </span>
              <Select
                value={CheckMsgIsGroup}
                onChange={async (e) => {
                  handleGroupType(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desativado</MenuItem>
                <MenuItem value={"enabled"}>Ativado</MenuItem>
              </Select>
              <FormHelperText>
                {loadingScheduleType && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <Phone size={18} /> Aceitar Chamada
              </span>
              <Select
                value={callType}
                onChange={async (e) => {
                  handleCallType(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Não Aceitar</MenuItem>
                <MenuItem value={"enabled"}>Aceitar</MenuItem>
              </Select>
              <FormHelperText>
                {loadingCallType && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <Bot size={18} /> Tipo Chatbot
              </span>
              <Select
                value={chatbotType}
                onChange={async (e) => {
                  handleChatbotType(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"text"}>Texto</MenuItem>
              </Select>
              <FormHelperText>
                {loadingChatbotType && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <Smile size={18} /> Enviar saudação ao aceitar o ticket
              </span>
              <Select
                value={SendGreetingAccepted}
                onChange={async (e) => {
                  handleSendGreetingAccepted(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desabilitado</MenuItem>
                <MenuItem value={"enabled"}>Habilitado</MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendGreetingAccepted && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <ArrowRightLeft size={18} /> Enviar mensagem de transferência de
                Fila/agente
              </span>
              <Select
                value={SettingsTransfTicket}
                onChange={async (e) => {
                  handleSettingsTransfTicket(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desabilitado</MenuItem>
                <MenuItem value={"enabled"}>Habilitado</MenuItem>
              </Select>
              <FormHelperText>
                {loadingSettingsTransfTicket && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
          <Grid xs={12} sm={6} md={4} item>
            <div className={classes.optionRow}>
              <span className={classes.optionLabel}>
                <Smile size={18} /> Enviar saudação quando houver somente 1 fila
              </span>
              <Select
                value={sendGreetingMessageOneQueues}
                onChange={async (e) => {
                  handleSendGreetingMessageOneQueues(e.target.value);
                }}
                className={classes.select}
                variant="outlined"
                margin="dense"
              >
                <MenuItem value={"disabled"}>Desabilitado</MenuItem>
                <MenuItem value={"enabled"}>Habilitado</MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendGreetingMessageOneQueues && "Atualizando..."}
              </FormHelperText>
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Integrações */}
      <Paper className={classes.sectionCard} elevation={0}>
        <div className={classes.sectionHeader}>
          <Plug size={26} style={{ color: "#5D3FD3" }} />
          <div>
            <div className={classes.sectionTitle}>Integrações</div>
            <div className={classes.sectionDesc}>
              Configure integrações com sistemas externos.
            </div>
          </div>
        </div>
        <Tabs
          value={mainIntegrationTab}
          onChange={(event, newValue) => setMainIntegrationTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
          style={{ marginBottom: 20 }}
        >
          <Tab label="IXC" />
          <Tab label="MK-AUTH" />
          <Tab label="ASAAS" />
        </Tabs>
        {/* IXC */}
        <Box mb={2}>
          <Grid spacing={3} container>
            <Grid xs={12} sm={6} md={6} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <Server size={18} /> IP do IXC
                </span>
                <TextField
                  id="ipixc"
                  name="ipixc"
                  margin="dense"
                  label="IP do IXC"
                  variant="outlined"
                  value={ipixcType}
                  onChange={async (e) => {
                    handleChangeIPIxc(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingIpIxcType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
            <Grid xs={12} sm={6} md={6} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <KeyRound size={18} /> Token do IXC
                </span>
                <TextField
                  id="tokenixc"
                  name="tokenixc"
                  margin="dense"
                  label="Token do IXC"
                  variant="outlined"
                  value={tokenixcType}
                  onChange={async (e) => {
                    handleChangeTokenIxc(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingTokenIxcType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
          </Grid>
        </Box>
        {/* MK-AUTH */}
        <Tabs
          value={mkauthTab}
          onChange={(event, newValue) => setMkauthTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="MK-AUTH" />
        </Tabs>
        <Box mb={2}>
          <Grid spacing={3} container>
            <Grid xs={12} sm={12} md={4} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <Server size={18} /> IP Mk-Auth
                </span>
                <TextField
                  id="ipmkauth"
                  name="ipmkauth"
                  margin="dense"
                  label="Ip Mk-Auth"
                  variant="outlined"
                  value={ipmkauthType}
                  onChange={async (e) => {
                    handleChangeIpMkauth(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingIpMkauthType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
            <Grid xs={12} sm={12} md={4} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <UserCheck size={18} /> Client Id
                </span>
                <TextField
                  id="clientidmkauth"
                  name="clientidmkauth"
                  margin="dense"
                  label="Client Id"
                  variant="outlined"
                  value={clientidmkauthType}
                  onChange={async (e) => {
                    handleChangeClientIdMkauth(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingClientIdMkauthType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
            <Grid xs={12} sm={12} md={4} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <Lock size={18} /> Client Secret
                </span>
                <TextField
                  id="clientsecretmkauth"
                  name="clientsecretmkauth"
                  margin="dense"
                  label="Client Secret"
                  variant="outlined"
                  value={clientsecretmkauthType}
                  onChange={async (e) => {
                    handleChangeClientSecrectMkauth(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingClientSecrectMkauthType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
          </Grid>
        </Box>
        {/* ASAAS */}
        <Tabs
          value={asaasTab}
          onChange={(event, newValue) => setAsaasTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="ASAAS" />
        </Tabs>
        <Box mb={2}>
          <Grid spacing={3} container>
            <Grid xs={12} sm={12} md={12} item>
              <div className={classes.optionRow}>
                <span className={classes.optionLabel}>
                  <Link2 size={18} /> Token Asaas
                </span>
                <TextField
                  id="asaas"
                  name="asaas"
                  margin="dense"
                  label="Token Asaas"
                  variant="outlined"
                  value={asaasType}
                  onChange={async (e) => {
                    handleChangeAsaas(e.target.value);
                  }}
                  className={classes.textField}
                />
                <FormHelperText>
                  {loadingAsaasType && "Atualizando..."}
                </FormHelperText>
              </div>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </div>
  );
}
