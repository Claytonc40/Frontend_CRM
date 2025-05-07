import React, { useState, useEffect, useContext } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import {  WhatsApp } from "@material-ui/icons";
import { Grid, ListItemText, MenuItem, Select } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { toast } from "react-toastify";
//import ShowTicketOpen from "../ShowTicketOpenModal";

const useStyles = makeStyles((theme) => ({
  online: {
    fontSize: 11,
    color: "#25d366"
  },
  offline: {
    fontSize: 11,
    color: "#e1306c"
  },
  dialogPaper: {
    borderRadius: 18,
    boxShadow: '0 8px 32px rgba(93, 63, 211, 0.15)',
    overflow: 'hidden',
  },
  dialogTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#5D3FD3',
    padding: '28px 32px 10px 32px',
    letterSpacing: 0.2,
    [theme.breakpoints.down('xs')]: {
      padding: '20px 16px 8px 16px',
      fontSize: 20,
    },
  },
  dialogContent: {
    padding: '24px 32px',
    background: '#faf9fd',
    [theme.breakpoints.down('xs')]: {
      padding: '16px',
    },
  },
  dialogActions: {
    padding: '18px 32px 28px 32px',
    justifyContent: 'flex-end',
    gap: 16,
    background: '#faf9fd',
    [theme.breakpoints.down('xs')]: {
      padding: '12px 16px 20px 16px',
      gap: 8,
    },
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      fontSize: 16,
      height: 48,
      background: '#fff',
      '& fieldset': {
        borderColor: '#5D3FD3',
      },
      '&:hover fieldset': {
        borderColor: '#5D3FD3',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#5D3FD3',
        boxShadow: '0 0 0 2px #e5e0fa',
      },
    },
    '& label': {
      color: '#5D3FD3',
      fontWeight: 500,
      fontSize: 15,
    },
    '& .MuiInputBase-input': {
      fontSize: 16,
    },
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      fontSize: 16,
      height: 48,
      background: '#fff',
      '& fieldset': {
        borderColor: '#5D3FD3',
      },
      '&:hover fieldset': {
        borderColor: '#5D3FD3',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#5D3FD3',
        boxShadow: '0 0 0 2px #e5e0fa',
      },
    },
    '& .MuiSelect-select': {
      fontSize: 16,
      padding: '14px 12px',
    },
  },
  buttonOutlined: {
    borderRadius: 10,
    borderColor: '#5D3FD3',
    color: '#5D3FD3',
    fontWeight: 600,
    fontSize: 16,
    padding: '10px 24px',
    textTransform: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#f3f0fa',
      borderColor: '#5D3FD3',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '8px 16px',
      fontSize: 14,
    },
  },
  buttonContained: {
    borderRadius: 10,
    background: '#5D3FD3',
    color: '#fff',
    fontWeight: 600,
    fontSize: 16,
    padding: '10px 24px',
    textTransform: 'none',
    boxShadow: '0 2px 8px rgba(93, 63, 211, 0.15)',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#4b2fc7',
      boxShadow: '0 4px 12px rgba(93, 63, 211, 0.2)',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '8px 16px',
      fontSize: 14,
    },
  },
}));

const filter = createFilterOptions({
  trim: true,
});

const NewTicketModal = ({ modalOpen, onClose, initialContact }) => {
  const classes = useStyles();
  const [options, setOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [newContact, setNewContact] = useState({});
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;

  const [ openAlert, setOpenAlert ] = useState(false);
	const [ userTicketOpen, setUserTicketOpen] = useState("");
	const [ queueTicketOpen, setQueueTicketOpen] = useState("");

  useEffect(() => {
    if (initialContact?.id !== undefined) {
      setOptions([initialContact]);
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => setWhatsapps(data));
      };

      if (whatsappId !== null && whatsappId!== undefined) {
        setSelectedWhatsapp(whatsappId)
      }

      if (user.queues.length === 1) {
        setSelectedQueue(user.queues[0].id)
      }
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [])

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  // const IconChannel = (channel) => {
  //   switch (channel) {
  //     case "facebook":
  //       return <Facebook style={{ color: "#3b5998", verticalAlign: "middle" }} />;
  //     case "instagram":
  //       return <Instagram style={{ color: "#e1306c", verticalAlign: "middle" }} />;
  //     case "whatsapp":
  //       return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle" }} />
  //     default:
  //       return "error";
  //   }
  // };

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
    setSelectedContact(null);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setLoading(false);
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
  };

  const handleSaveTicket = async contactId => {
    if (!contactId) return;
    if (selectedQueue === "" && user.profile !== 'admin') {
      toast.error("Selecione uma fila");
      return;
    }
    
    setLoading(true);
    try {
      const queueId = selectedQueue !== "" ? selectedQueue : null;
      const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null;
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        queueId,
        whatsappId,
        userId: user.id,
        status: "open",
      });      

      onClose(ticket);
    } catch (err) {
      
      const ticket  = JSON.parse(err.response.data.error);

      if (ticket.userId !== user?.id) {
        setOpenAlert(true);
        setUserTicketOpen(ticket.user.name);
        setQueueTicketOpen(ticket.queue.name);
      } else {
        setOpenAlert(false);
        setUserTicketOpen("");
        setQueueTicketOpen("");
        setLoading(false);
        onClose(ticket);
      }
    }  
    setLoading(false);
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);    
  };

  const handleAddNewContactTicket = contact => {
    handleSaveTicket(contact.id);
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  const renderOption = option => {
    if (option.number) {
      return <>
        {/* {IconChannel(option.channel)} */}
        <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
          {option.name} - {option.number}
        </Typography>
      </>
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const renderOptionLabel = option => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const renderContactAutocomplete = () => {
    if (initialContact === undefined || initialContact.id === undefined) {
      return (
        <Grid xs={12} item>
          <Autocomplete
            fullWidth
            options={options}
            loading={loading}
            clearOnBlur
            autoHighlight
            freeSolo
            clearOnEscape
            getOptionLabel={renderOptionLabel}
            renderOption={renderOption}
            filterOptions={createAddContactOption}
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            renderInput={params => (
              <TextField
                {...params}
                label={i18n.t("newTicketModal.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={e => setSearchParam(e.target.value)}
                onKeyPress={e => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleSaveTicket(selectedContact.id);
                  }
                }}
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
        </Grid>
      )
    }
    return null;
  }

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={handleCloseContactModal}
        onSave={handleAddNewContactTicket}
      ></ContactModal>
      <Dialog open={modalOpen} onClose={handleClose} classes={{ paper: classes.dialogPaper }}>
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          {i18n.t("newTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          <Grid style={{ width: 300 }} container spacing={2}>
            {/* CONTATO */}
            {renderContactAutocomplete()}
            {/* FILA */}
            <Grid xs={12} item>
              <Select
                required
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedQueue}
                onChange={(e) => {
                  setSelectedQueue(e.target.value)
                }}
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
                  if (selectedQueue === "") {
                    return "Selecione uma fila"
                  }
                  const queue = user.queues.find(q => q.id === selectedQueue)
                  return queue.name
                }}
                className={classes.select}
              >
                {user.queues?.length > 0 &&
                  user.queues.map((queue, key) => (
                    <MenuItem dense key={key} value={queue.id} style={{ borderRadius: 8 }}>
                      <ListItemText primary={queue.name} />
                    </MenuItem>
                  ))
                }
              </Select>
            </Grid>
            {/* CONEXAO */}
            <Grid xs={12} item>
              <Select
                required
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedWhatsapp}
                onChange={(e) => {
                  setSelectedWhatsapp(e.target.value)
                }}
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
                    return "Selecione uma Conexão"
                  }
                  const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp)
                  return whatsapp.name
                }}
                className={classes.select}
              >
                {whatsapps?.length > 0 &&
                  whatsapps.map((whatsapp, key) => (
                    <MenuItem dense key={key} value={whatsapp.id} style={{ borderRadius: 8 }}>
                      <ListItemText
                        primary={
                          <>
                            {/* {IconChannel(whatsapp.channel)} */}
                            <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
                              {whatsapp.name} &nbsp; <p className={(whatsapp.status) === 'CONNECTED' ? classes.online : classes.offline} >({whatsapp.status})</p>
                            </Typography>
                          </>
                        }
                      />
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
            className={classes.buttonOutlined}
          >
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={!selectedContact}
            onClick={() => handleSaveTicket(selectedContact.id)}
            color="primary"
            loading={loading}
            className={classes.buttonContained}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
        {/* <ShowTicketOpen
          isOpen={openAlert}
          handleClose={handleCloseAlert}
          user={userTicketOpen}
          queue={queueTicketOpen}
			  /> */}
      </Dialog >
    </>
  );
};
export default NewTicketModal;