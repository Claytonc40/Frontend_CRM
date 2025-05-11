import qs from 'query-string';
import React, { useEffect, useState } from "react";

import {
	CircularProgress,
	Divider
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import BusinessIcon from "@material-ui/icons/Business";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import PhoneIcon from "@material-ui/icons/Phone";
import { Field, Form, Formik } from "formik";
import InputMask from 'react-input-mask';
import { Link as RouterLink, useHistory } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";

import moment from "moment";

import { openApi } from "../../services/api";

const Copyright = () => {
  return (
    <Typography variant="body2" color="primary" align="center"></Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    minHeight: "100vh",
    background:
      "linear-gradient(to right,rgb(244, 244, 246),rgb(141, 145, 254))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px 0",
  },
  paper: {
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 30px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "800px",
    maxWidth: "95%",
  },
  title: {
    color: "#6151FF",
    fontWeight: "bold",
    fontSize: "28px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: "12px",
    backgroundColor: "#6151FF",
    borderRadius: "6px",
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "16px",
    "&:hover": {
      backgroundColor: "#4C3FD9",
    },
  },
  textField: {
    marginBottom: "15px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "6px",
    },
  },
  inputIcon: {
    color: "#6151FF",
  },
  link: {
    color: "#6151FF",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  stepper: {
    backgroundColor: "transparent",
    padding: "20px 0 30px",
    width: "100%",
    "& .MuiStepIcon-root.MuiStepIcon-active": {
      color: "#6151FF",
    },
    "& .MuiStepIcon-root.MuiStepIcon-completed": {
      color: "#4CAF50",
    },
  },
  planCard: {
    marginBottom: "15px",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    boxShadow: "0 8px 16px rgba(97, 81, 255, 0.2)",
    borderColor: "#6151FF",
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      width: "0",
      height: "0",
      borderTop: "40px solid #6151FF",
      borderLeft: "40px solid transparent",
    },
  },
  planCardHeader: {
    backgroundColor: "#F5F5F5",
    padding: "16px",
    borderBottom: "1px solid #E0E0E0",
  },
  planCardHeaderSelected: {
    backgroundColor: "rgba(97, 81, 255, 0.08)",
  },
  planCardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333",
  },
  planCardPrice: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#6151FF",
    marginBottom: "8px",
  },
  planCardContent: {
    padding: "16px",
  },
  planFeature: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    textAlign: "left",
  },
  planFeatureIcon: {
    color: "#4CAF50",
    marginRight: "8px",
    fontSize: "18px",
  },
  planCardActions: {
    padding: "16px",
    justifyContent: "center",
    borderTop: "1px solid #E0E0E0",
  },
  stepButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  backButton: {
    color: "#6151FF",
    borderColor: "#6151FF",
    borderRadius: "6px",
    padding: "10px 20px",
    textTransform: "none",
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#6151FF",
    color: "white",
    borderRadius: "6px",
    padding: "10px 20px",
    textTransform: "none",
    fontWeight: "500",
    "&:hover": {
      backgroundColor: "#4C3FD9",
    },
  },
  checkIcon: {
    position: "absolute",
    top: "10px",
    right: "10px",
    color: "#4CAF50",
    backgroundColor: "white",
    borderRadius: "50%",
    padding: "2px",
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

function getSteps() {
  return ["Informações da Empresa", "Escolha seu Plano", "Resumo"];
}

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = getSteps();

  let companyId = null;

  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = {
    name: "",
    email: "",
    phone: "",
    password: "",
    planId: "",
  };

  const [user, setUser] = useState(initialState);
  const dueDate = moment().add(3, "day").format();

  const handleSignUp = async (values) => {
    setIsSubmitting(true);
    Object.assign(values, { recurrence: "MENSAL" });
    Object.assign(values, { dueDate: dueDate });
    Object.assign(values, { status: "t" });
    Object.assign(values, { campaignsEnabled: true });
    try {
      await openApi.post("/companies/cadastro", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [plans, setPlans] = useState([]);
  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
      if (list.length > 0) {
        setSelectedPlan(list[0].id);
      }
    }
    fetchData();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setUser({ ...user, planId: planId });
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Formik
            initialValues={user}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              setUser({ ...user, ...values });
              handleNext();
            }}
          >
            {({
              touched,
              errors,
              isSubmitting,
              handleSubmit,
              values,
              handleChange,
            }) => (
              <Form className={classes.form} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      autoComplete="name"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      fullWidth
                      id="name"
                      label="Nome da Empresa"
                      className={classes.textField}
                      value={values.name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon className={classes.inputIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      id="email"
                      label={i18n.t("signup.form.email")}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      autoComplete="email"
                      className={classes.textField}
                      value={values.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon className={classes.inputIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={InputMask}
                      mask="(99) 99999-9999"
                      variant="outlined"
                      fullWidth
                      id="phone"
                      name="phone"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      autoComplete="phone"
                      value={values.phone}
                      onChange={handleChange}
                      required
                    >
                      {({ field }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          fullWidth
                          label="Telefone"
                          className={classes.textField}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon className={classes.inputIcon} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      fullWidth
                      name="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      label={i18n.t("signup.form.password")}
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      className={classes.textField}
                      value={values.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon className={classes.inputIcon} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <div className={classes.stepButtons}>
                  <Button
                    disabled
                    className={classes.backButton}
                    variant="outlined"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.nextButton}
                  >
                    Próximo
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        );
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Escolha o plano que melhor atende suas necessidades
            </Typography>
            <Grid container spacing={3}>
              {plans.map((plan) => (
                <Grid item xs={12} md={6} key={plan.id}>
                  <Card
                    className={`${classes.planCard} ${
                      selectedPlan === plan.id ? classes.planCardSelected : ""
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {selectedPlan === plan.id && (
                      <CheckCircleIcon className={classes.checkIcon} />
                    )}
                    <CardHeader
                      title={
                        <Typography className={classes.planCardTitle}>
                          {plan.name}
                        </Typography>
                      }
                      className={`${classes.planCardHeader} ${
                        selectedPlan === plan.id
                          ? classes.planCardHeaderSelected
                          : ""
                      }`}
                    />
                    <CardContent className={classes.planCardContent}>
                      <Typography className={classes.planCardPrice}>
                        R$ {plan.value}/mês
                      </Typography>
                      <Divider style={{ margin: "10px 0" }} />
                      <div className={classes.planFeature}>
                        <CheckCircleIcon className={classes.planFeatureIcon} />
                        <Typography>{plan.users} atendentes</Typography>
                      </div>
                      <div className={classes.planFeature}>
                        <CheckCircleIcon className={classes.planFeatureIcon} />
                        <Typography>
                          {plan.connections} conexões de WhatsApp
                        </Typography>
                      </div>
                      <div className={classes.planFeature}>
                        <CheckCircleIcon className={classes.planFeatureIcon} />
                        <Typography>{plan.queues} filas</Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <div className={classes.stepButtons}>
              <Button
                onClick={handleBack}
                className={classes.backButton}
                variant="outlined"
              >
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                className={classes.nextButton}
                disabled={!selectedPlan}
              >
                Próximo
              </Button>
            </div>
          </>
        );
      case 2:
        const selectedPlanData = plans.find((p) => p.id === selectedPlan) || {};
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Resumo do Cadastro
            </Typography>
            <Paper
              elevation={0}
              style={{
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{ fontWeight: "bold" }}
                  >
                    Dados da Empresa
                  </Typography>
                  <Divider style={{ margin: "8px 0 16px" }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Nome da Empresa
                  </Typography>
                  <Typography variant="body1">{user.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Grid>

                <Grid item xs={12} style={{ marginTop: "20px" }}>
                  <Typography
                    variant="subtitle1"
                    style={{ fontWeight: "bold" }}
                  >
                    Plano Selecionado
                  </Typography>
                  <Divider style={{ margin: "8px 0 16px" }} />
                </Grid>
                <Grid item xs={12}>
                  <Card
                    style={{ border: "1px solid #6151FF", borderRadius: "8px" }}
                  >
                    <CardHeader
                      title={selectedPlanData.name}
                      style={{ backgroundColor: "rgba(97, 81, 255, 0.08)" }}
                    />
                    <CardContent>
                      <Typography
                        variant="h6"
                        style={{ color: "#6151FF", fontWeight: "bold" }}
                      >
                        R$ {selectedPlanData.value}/mês
                      </Typography>
                      <Divider style={{ margin: "10px 0" }} />
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Atendentes
                          </Typography>
                          <Typography variant="body1">
                            {selectedPlanData.users}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Conexões
                          </Typography>
                          <Typography variant="body1">
                            {selectedPlanData.connections}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Filas
                          </Typography>
                          <Typography variant="body1">
                            {selectedPlanData.queues}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
            <div className={classes.stepButtons}>
              <Button
                onClick={handleBack}
                className={classes.backButton}
                variant="outlined"
              >
                Voltar
              </Button>
              <Button
                onClick={() => handleSignUp({ ...user, planId: selectedPlan })}
                variant="contained"
                color="primary"
                className={classes.nextButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Finalizar Cadastro"
                )}
              </Button>
            </div>
          </>
        );
      default:
        return "Unknown step";
    }
  }

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography className={classes.title} component="h1" variant="h5">
            Verity<span style={{ color: "#4C3FD9" }}>CRM</span>
          </Typography>
          <Typography className={classes.subtitle} component="p">
            {i18n.t("signup.title")}
          </Typography>

          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}

          <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
            <Grid item>
              <Link className={classes.link} component={RouterLink} to="/login">
                {i18n.t("signup.buttons.login")}
              </Link>
            </Grid>
          </Grid>
        </div>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );
};

export default SignUp;
