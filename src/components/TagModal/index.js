import React, { useContext, useEffect, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Slide from "@material-ui/core/Slide";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { LocalOffer } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

import { FormControlLabel, InputAdornment } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { AuthContext } from "../../context/Auth/AuthContext";

import api from "../../services/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    marginBottom: theme.spacing(2),
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(93, 63, 211, 0.2)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(93, 63, 211, 0.5)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#5D3FD3",
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
    borderRadius: 4,
  },
  colorPickerContainer: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: theme.palette.background.default,
    border: "1px solid rgba(93, 63, 211, 0.1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(145deg, #5D3FD3 0%, #7058e6 100%)",
    color: "#FFFFFF",
    "& h2": {
      display: "flex",
      alignItems: "center",
      color: "#FFFFFF",
    },
  },
  titleIcon: {
    marginRight: theme.spacing(1),
    color: "#FFFFFF",
  },
  previewContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 10,
    backgroundColor: theme.palette.background.default,
    border: "1px solid rgba(93, 63, 211, 0.1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  previewTitle: {
    marginBottom: theme.spacing(1),
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  previewTag: {
    padding: theme.spacing(1, 2),
    borderRadius: 20,
    color: "white",
    textShadow: "1px 1px 1px #000",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
    },
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
  },
  colorOptions: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
    gap: theme.spacing(1),
    justifyContent: "center",
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 4,
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    },
  },
  selectedColor: {
    border: `2px solid #5D3FD3`,
    transform: "scale(1.1)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },
  dialogActions: {
    padding: theme.spacing(2),
    justifyContent: "space-between",
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  cancelButton: {
    color: "#333",
    borderRadius: 10,
    borderColor: "rgba(0,0,0,0.12)",
    padding: theme.spacing(1, 2),
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
    },
  },
  saveButton: {
    backgroundColor: "#5D3FD3",
    color: "#FFF",
    borderRadius: 10,
    padding: theme.spacing(1, 3),
    "&:hover": {
      backgroundColor: "#4930A8",
    },
  },
}));

const TagSchema = Yup.object().shape({
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório"),
});

// Cores pré-definidas para rápida seleção
const predefinedColors = [
  "#2DDD7F",
  "#5D3FD3",
  "#FF5733",
  "#1E88E5",
  "#8E24AA",
  "#F4511E",
  "#43A047",
  "#3949AB",
  "#00ACC1",
  "#E53935",
  "#607D8B",
  "#F9A825",
];

const TagModal = ({ open, onClose, tagId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    name: "",
    color: "#5D3FD3",
    kanban: 0,
  };

  const [tag, setTag] = useState(initialState);
  const [kanban, setKanban] = useState(0);

  useEffect(() => {
    try {
      (async () => {
        if (!tagId) return;

        const { data } = await api.get(`/tags/${tagId}`);
        setKanban(data.kanban);
        setTag((prevState) => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toast.error(err.message);
    }
  }, [tagId, open]);

  const handleClose = () => {
    setTag(initialState);
    onClose();
  };

  const handleKanbanChange = (e) => {
    setKanban(e.target.checked ? 1 : 0);
  };

  const handleSaveTag = async (values) => {
    const tagData = { ...values, userId: user.id, kanban };
    try {
      if (tagId) {
        await api.put(`/tags/${tagId}`, tagData);
      } else {
        await api.post("/tags", tagData);
      }
      toast.success(i18n.t("tagModal.success"));
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toast.error(err.message);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
        TransitionComponent={Transition}
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          <LocalOffer className={classes.titleIcon} />
          {tagId
            ? `${i18n.t("tagModal.title.edit")}`
            : `${i18n.t("tagModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={tag}
          enableReinitialize={true}
          validationSchema={TagSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveTag(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("tagModal.form.name")}
                    name="name"
                    autoFocus
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    fullWidth
                  />
                </div>

                {/* Preview da tag */}
                <Paper elevation={0} className={classes.previewContainer}>
                  <Typography className={classes.previewTitle}>
                    {i18n.t("tagModal.preview")}
                  </Typography>
                  <div
                    className={classes.previewTag}
                    style={{
                      backgroundColor: values.color || "#5D3FD3",
                    }}
                  >
                    <LocalOffer fontSize="small" />
                    {values.name || i18n.t("tagModal.form.name")}
                  </div>
                </Paper>

                {/* Seletor de cores */}
                <Paper elevation={0} className={classes.colorPickerContainer}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    style={{ marginBottom: 12, color: "#555" }}
                  >
                    {i18n.t("tagModal.form.color")}
                  </Typography>

                  <div className={classes.colorOptions}>
                    {predefinedColors.map((color) => (
                      <Tooltip title={color} key={color} arrow>
                        <div
                          className={`${classes.colorOption} ${
                            values.color === color ? classes.selectedColor : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setTag({ ...values, color });
                          }}
                        />
                      </Tooltip>
                    ))}
                  </div>

                  <div
                    className={classes.multFieldLine}
                    style={{ marginTop: 16 }}
                  >
                    <Field
                      as={TextField}
                      label={i18n.t("tagModal.form.colorCode")}
                      name="color"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              className={classes.colorAdorment}
                              style={{ backgroundColor: values.color }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </Paper>

                {/* Opção Kanban */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={kanban === 1}
                      onChange={handleKanbanChange}
                      color="primary"
                    />
                  }
                  label={i18n.t("tagModal.form.kanban")}
                  className={classes.checkboxContainer}
                />
              </DialogContent>
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                  className={classes.cancelButton}
                >
                  {i18n.t("tagModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.saveButton}
                >
                  {tagId
                    ? `${i18n.t("tagModal.buttons.okEdit")}`
                    : `${i18n.t("tagModal.buttons.okAdd")}`}
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

export default TagModal;
