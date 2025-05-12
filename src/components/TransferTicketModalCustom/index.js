import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { ListItemText, Typography, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";

import CircularProgress from "@material-ui/core/CircularProgress";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { toast } from "sonner";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";

import { AuthContext } from "../../context/Auth/AuthContext";
import useQueues from "../../hooks/useQueues";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  dialogPaper: {
    borderRadius: 18,
    boxShadow: "0 6px 32px rgba(93,63,211,0.13)",
    padding: 0,
  },
  dialogTitle: {
    color: "#5D3FD3",
    fontWeight: 700,
    fontSize: 24,
    padding: "28px 32px 10px 32px",
    letterSpacing: 0.2,
  },
  dialogContent: {
    padding: "16px 32px 24px 32px",
    background: "#faf9fd",
    borderRadius: "0 0 18px 18px",
    minWidth: 340,
    [theme.breakpoints.down("xs")]: {
      padding: "12px 8px",
      minWidth: 0,
    },
  },
  input: {
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 1px 4px rgba(93,63,211,0.07)",
    marginBottom: 24,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      fontSize: 16,
      height: 48,
      background: "#fff",
      "& fieldset": {
        borderColor: "#5D3FD3",
      },
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#5D3FD3",
        boxShadow: "0 0 0 2px #e5e0fa",
      },
    },
    "& label": {
      color: "#5D3FD3",
      fontWeight: 500,
      fontSize: 15,
      top: 0,
    },
  },
  select: {
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 1px 4px rgba(93,63,211,0.07)",
    marginBottom: 24,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      fontSize: 16,
      height: 48,
      background: "#fff",
      "& fieldset": {
        borderColor: "#5D3FD3",
      },
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#5D3FD3",
        boxShadow: "0 0 0 2px #e5e0fa",
      },
    },
    "& label": {
      color: "#5D3FD3",
      fontWeight: 500,
      fontSize: 15,
      top: 0,
    },
  },
  dialogActions: {
    padding: "18px 32px 28px 32px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    background: "#faf9fd",
    borderRadius: "0 0 18px 18px",
    [theme.breakpoints.down("xs")]: {
      padding: "12px 8px",
      gap: 8,
    },
  },
  buttonOutlined: {
    borderRadius: 10,
    borderColor: "#5D3FD3",
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: 16,
    padding: "8px 22px",
    textTransform: "none",
    transition: "all 0.2s",
    "&:hover": {
      background: "#f3f0fa",
      borderColor: "#5D3FD3",
    },
  },
  buttonContained: {
    borderRadius: 10,
    background: "#5D3FD3",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    padding: "8px 22px",
    textTransform: "none",
    boxShadow: "0 2px 8px rgba(93,63,211,0.10)",
    "&:hover": {
      background: "#4b2fc7",
    },
  },
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModalCustom = ({ modalOpen, onClose, ticketid }) => {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const isMounted = useRef(true);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => setWhatsapps(data));
      };

      if (whatsappId !== null && whatsappId !== undefined) {
        setSelectedWhatsapp(whatsappId);
      }

      if (user.queues.length === 1) {
        setSelectedQueue(user.queues[0].id);
      }
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toast.errorr(err.message);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!ticketid) return;
    if (!selectedQueue || selectedQueue === "") return;
    setLoading(true);
    try {
      let data = {};

      if (selectedUser) {
        data.userId = selectedUser.id;
      }

      if (selectedQueue && selectedQueue !== null) {
        data.queueId = selectedQueue;

        if (!selectedUser) {
          data.status = "pending";
          data.userId = null;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = selectedWhatsapp;
      }
      await api.put(`/tickets/${ticketid}`, data);

      history.push(`/tickets`);
    } catch (err) {
      setLoading(false);
      toast.errorr(err.message);
    }
  };

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      maxWidth="lg"
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      <form onSubmit={handleSaveTicket} autoComplete="off">
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {i18n.t("transferTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          <Autocomplete
            style={{ width: "100%", marginBottom: 24 }}
            getOptionLabel={(option) => `${option.name}`}
            onChange={(e, newValue) => {
              setSelectedUser(newValue);
              if (newValue != null && Array.isArray(newValue.queues)) {
                setQueues(newValue.queues);
              } else {
                setQueues(allQueues);
                setSelectedQueue("");
              }
            }}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
            noOptionsText={i18n.t("transferTicketModal.noOptions")}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("transferTicketModal.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
                className={classes.input}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          <FormControl variant="outlined" className={classes.select} fullWidth>
            <InputLabel style={{ color: "#5D3FD3" }}>
              {i18n.t("transferTicketModal.fieldQueueLabel")}
            </InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* CONEXAO */}
          <FormControl variant="outlined" className={classes.select} fullWidth>
            <InputLabel style={{ color: "#5D3FD3" }}>Conexão</InputLabel>
            <Select
              required
              fullWidth
              displayEmpty
              value={selectedWhatsapp}
              onChange={(e) => {
                setSelectedWhatsapp(e.target.value);
              }}
              label="Conexão"
              MenuProps={{
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
              renderValue={() => {
                if (selectedWhatsapp === "") {
                  return "Selecione uma Conexão";
                }
                const whatsapp = whatsapps.find(
                  (w) => w.id === selectedWhatsapp,
                );
                return whatsapp?.name || "";
              }}
            >
              {whatsapps?.length > 0 &&
                whatsapps.map((whatsapp, key) => (
                  <MenuItem dense key={key} value={whatsapp.id}>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            component="span"
                            style={{
                              fontSize: 14,
                              marginLeft: "10px",
                              display: "inline-flex",
                              alignItems: "center",
                              lineHeight: "2",
                            }}
                          >
                            {whatsapp.name} &nbsp;{" "}
                            <span
                              style={{
                                color:
                                  whatsapp.status === "CONNECTED"
                                    ? "#5D3FD3"
                                    : "#aaa",
                                fontWeight: 600,
                              }}
                            >
                              ({whatsapp.status})
                            </span>
                          </Typography>
                        </>
                      }
                    />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            className={classes.buttonOutlined}
          >
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            className={classes.buttonContained}
            loading={loading}
          >
            {i18n.t("transferTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferTicketModalCustom;
