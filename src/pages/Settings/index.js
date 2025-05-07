import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";
import { Settings as SettingsIcon, UserPlus } from 'lucide-react';
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0, 0, 6, 0),
  },
  card: {
    maxWidth: 480,
    width: '100%',
    margin: '0 auto',
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 4px 32px rgba(93,63,211,0.10)',
    padding: theme.spacing(4, 4, 3, 4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 1.5, 2, 1.5),
      borderRadius: 12,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
  title: {
    fontWeight: 700,
    fontSize: 26,
    color: '#5D3FD3',
    letterSpacing: 0.2,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  desc: {
    color: '#888',
    fontSize: 16,
    fontWeight: 400,
    marginLeft: 2,
    marginTop: 2,
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    background: '#faf9fd',
    borderRadius: 12,
    boxShadow: '0 1px 6px rgba(93,63,211,0.06)',
    padding: theme.spacing(2, 2.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    transition: 'box-shadow 0.2s, background 0.2s',
    '&:hover': {
      background: '#f3f0fa',
      boxShadow: '0 2px 12px rgba(93,63,211,0.10)',
    },
  },
  settingLabel: {
    fontWeight: 600,
    color: '#222',
    fontSize: 17,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  select: {
    marginLeft: 'auto',
    minWidth: 140,
    borderRadius: 10,
    background: '#fff',
    fontWeight: 600,
    fontSize: 15,
    color: '#5D3FD3',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#5D3FD3',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4930A8',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4930A8',
    },
  },
}));

const Settings = () => {
  const classes = useStyles();
  const [settings, setSettings] = useState([]);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);
    socket.on(`company-${companyId}-settings`, (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;
    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const found = settings.find((s) => s.key === key);
    return found ? found.value : '';
  };

  return (
    <div className={classes.mainWrapper}>
      <Container maxWidth="sm">
        <Paper className={classes.card} elevation={0}>
          <div className={classes.header}>
            <SettingsIcon size={32} style={{ color: '#5D3FD3' }} />
            <div>
              <div className={classes.title}>{i18n.t("settings.title")}</div>
              <div className={classes.desc}>Gerencie as principais configurações do sistema de forma simples e segura.</div>
            </div>
          </div>
          <div className={classes.settingRow}>
            <span className={classes.settingLabel}><UserPlus size={20} /> {i18n.t("settings.settings.userCreation.name")}</span>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="userCreation-setting"
              name="userCreation"
              value={settings && settings.length > 0 && getSettingValue("userCreation")}
              className={classes.select}
              onChange={handleChangeSetting}
            >
              <option value="enabled">
                {i18n.t("settings.settings.userCreation.options.enabled")}
              </option>
              <option value="disabled">
                {i18n.t("settings.settings.userCreation.options.disabled")}
              </option>
            </Select>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default Settings;
