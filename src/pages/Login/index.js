import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { toast } from "sonner";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const Copyright = () => {
  return (
    <Typography variant="body2" color="primary" align="center"></Typography>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    background:
      "linear-gradient(to right,rgb(244, 244, 246),rgb(141, 145, 254))",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  paper: {
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 30px",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: "400px",
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
    marginBottom: "30px",
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
  forgotPassword: {
    color: "#6151FF",
    textAlign: "right",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  rememberMe: {
    fontSize: "14px",
  },
}));

const Login = () => {
  const classes = useStyles();
  const history = useHistory();
  const [isMounted, setIsMounted] = useState(true);
  const [user, setUser] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleChangeInput = (e) => {
    if (isMounted) {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleRememberMeChange = (e) => {
    if (isMounted) {
      setRememberMe(e.target.checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted) return;

    try {
      setLoading(true);
      await handleLogin(user);
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.error || "Erro ao fazer login");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography className={classes.title} component="h1" variant="h5">
            Verity<span style={{ color: "#4C3FD9" }}>CRM</span>
          </Typography>
          <Typography className={classes.subtitle} component="p">
            {i18n.t("login.title")}
          </Typography>

          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              label={i18n.t("login.form.email")}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon className={classes.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              placeholder="********"
              type="password"
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon className={classes.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                      size="small"
                      disabled={loading}
                    />
                  }
                  label={
                    <Typography className={classes.rememberMe}>
                      Lembrar-me
                    </Typography>
                  }
                />
              </Grid>
              <Grid item>
                <Link
                  component={RouterLink}
                  to="/forgetpsw"
                  className={classes.forgotPassword}
                >
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
            >
              {loading ? "Entrando..." : i18n.t("login.buttons.submit")}
            </Button>
            <Grid container>
              <Grid item>
                <Link
                  href="#"
                  variant="body2"
                  component={RouterLink}
                  to="/signup"
                  className={classes.forgotPassword}
                >
                  {i18n.t("login.buttons.register")}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );
};

export default Login;
