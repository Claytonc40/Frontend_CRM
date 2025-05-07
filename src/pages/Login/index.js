import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid"; 
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import InputAdornment from "@material-ui/core/InputAdornment";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import { versionSystem } from "../../../package.json";
import { i18n } from "../../translate/i18n";
import { nomeEmpresa } from "../../../package.json";
import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logo.png";

const Copyright = () => {
	return (
		<Typography variant="body2" color="primary" align="center">
			
 		</Typography>
 	);
 };

const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		display: "flex",
		background: "linear-gradient(to right,rgb(244, 244, 246),rgb(141, 145, 254))",
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
		}
	},
	textField: {
		marginBottom: "15px",
		"& .MuiOutlinedInput-root": {
			borderRadius: "6px",
		}
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
	}
}));

const Login = () => {
	const classes = useStyles();

	const [user, setUser] = useState({ email: "", password: "" });
	const [rememberMe, setRememberMe] = useState(false);

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleRememberMeChange = e => {
		setRememberMe(e.target.checked);
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};

	return (
		<div className={classes.root}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<div className={classes.paper}>
					<Typography className={classes.title} component="h1" variant="h5">
						CRM<span style={{ color: "#4C3FD9" }}>Pro</span>
					</Typography>
					<Typography className={classes.subtitle} component="p">
						{i18n.t("login.title")}
					</Typography>
					
					<form className={classes.form} noValidate onSubmit={handlSubmit}>
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
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<LockIcon className={classes.inputIcon} />
									</InputAdornment>
								),
							}}
						/>
						
						<Grid container alignItems="center" justify="space-between">
							<Grid item>
								<FormControlLabel
									control={
										<Checkbox
											checked={rememberMe}
											onChange={handleRememberMeChange}
											color="primary"
											size="small"
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
						>
							{i18n.t("login.buttons.submit")}
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
				<Box mt={8}><Copyright /></Box>
			</Container>
		</div>
	);
};

export default Login;
