import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import { Field, Form, Formik } from "formik";
import { Edit, User, Users as UsersIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { Can } from "../Can";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialogPaper: {
    borderRadius: 12,
    background: "linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)",
  },
  dialogTitle: {
    background: "#fff",
    padding: theme.spacing(3),
    borderBottom: "1px solid #e3e6fd",
    "& h2": {
      color: "#5D3FD3",
      fontWeight: 600,
      fontSize: "1.5rem",
    },
  },
  dialogContent: {
    padding: theme.spacing(3),
    background: "#fff",
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
    background: "#fff",
    borderTop: "1px solid #e3e6fd",
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1.1rem",
  },
  multFieldLine: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(1),
    },
  },
  field: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5D3FD3",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5D3FD3",
      },
    },
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5D3FD3",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5D3FD3",
      },
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
  cancelButton: {
    color: "#666",
    borderColor: "#666",
    "&:hover": {
      borderColor: "#333",
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  saveButton: {
    background: "linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(90deg, #4930A8 0%, #6A5ACD 100%)",
    },
  },
  divider: {
    margin: theme.spacing(3, 0),
    borderColor: "#e3e6fd",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();
  const { user: loggedInUser } = useContext(AuthContext);

  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
    allTicket: "enabled",
  };

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => {
          return { ...prevState, ...data };
        });
        const userQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(userQueueIds);
        setWhatsappId(data.whatsappId ? data.whatsappId : "");
      } catch (err) {
        toastError(err);
      }
    };

    fetchUser();
  }, [userId, open]);

  const handleClose = () => {
    onClose();
    setUser(initialState);
  };

  const handleSaveUser = async (values) => {
    const userData = {
      ...values,
      whatsappId,
      queueIds: selectedQueueIds,
      allTicket: values.allTicket,
    };
    try {
      if (userId) {
        await api.put(`/users/${userId}`, userData);
      } else {
        await api.post("/users", userData);
      }
      toast.success(i18n.t("userModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Box display="flex" alignItems="center" gap={1}>
          <UsersIcon size={24} />
          {userId
            ? `${i18n.t("userModal.title.edit")}`
            : `${i18n.t("userModal.title.add")}`}
        </Box>
      </DialogTitle>
      <Formik
        initialValues={user}
        enableReinitialize={true}
        validationSchema={UserSchema}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            handleSaveUser(values);
            actions.setSubmitting(false);
          }, 400);
        }}
      >
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent className={classes.dialogContent}>
              <div className={classes.formSection}>
                <Typography className={classes.sectionTitle}>
                  <User size={20} />
                  Informações Básicas
                </Typography>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.field}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.password")}
                    type="password"
                    name="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.field}
                  />
                </div>
                <Field
                  as={TextField}
                  label={i18n.t("userModal.form.email")}
                  name="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.field}
                />
              </div>

              <Divider className={classes.divider} />

              <div className={classes.formSection}>
                <Typography className={classes.sectionTitle}>
                  <Edit size={20} />
                  Configurações
                </Typography>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                >
                  <Can
                    role={loggedInUser.profile}
                    perform="user-modal:editProfile"
                    yes={() => (
                      <>
                        <InputLabel id="profile-selection-input-label">
                          {i18n.t("userModal.form.profile")}
                        </InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("userModal.form.profile")}
                          name="profile"
                          labelId="profile-selection-label"
                          id="profile-selection"
                          required
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                        </Field>
                      </>
                    )}
                  />
                </FormControl>

                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <QueueSelect
                      selectedQueueIds={selectedQueueIds}
                      onChange={(values) => setSelectedQueueIds(values)}
                    />
                  )}
                />

                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editProfile"
                  yes={() => (
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.formControl}
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("userModal.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        value={whatsappId}
                        onChange={(e) => setWhatsappId(e.target.value)}
                        label={i18n.t("userModal.form.whatsapp")}
                      >
                        <MenuItem value={""}>&nbsp;</MenuItem>
                        {whatsApps.map((whatsapp) => (
                          <MenuItem key={whatsapp.id} value={whatsapp.id}>
                            {whatsapp.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  )}
                />

                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editProfile"
                  yes={() =>
                    !loading && (
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                        margin="dense"
                        fullWidth
                      >
                        <InputLabel id="allTicket-selection-input-label">
                          {i18n.t("userModal.form.allTicket")}
                        </InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("allTicket.form.viewTags")}
                          name="allTicket"
                          labelId="allTicket-selection-label"
                          id="allTicket-selection"
                          required
                        >
                          <MenuItem value="enabled">
                            {i18n.t("userModal.form.allTicketEnabled")}
                          </MenuItem>
                          <MenuItem value="desabled">
                            {i18n.t("userModal.form.allTicketDesabled")}
                          </MenuItem>
                        </Field>
                      </FormControl>
                    )
                  }
                />
              </div>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                variant="outlined"
                className={classes.cancelButton}
              >
                {i18n.t("userModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="contained"
                className={`${classes.btnWrapper} ${classes.saveButton}`}
              >
                {userId
                  ? `${i18n.t("userModal.buttons.okEdit")}`
                  : `${i18n.t("userModal.buttons.okAdd")}`}
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
  );
};

export default UserModal;
