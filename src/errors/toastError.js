import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";
import { isString } from 'lodash';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import React from 'react';

const CustomErrorToast = ({ message }) => (
	<div style={{
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		background: '#5D3FD3',
		color: '#fff',
		borderRadius: 14,
		padding: '14px 20px',
		fontWeight: 500,
		fontSize: 16,
		boxShadow: '0 4px 16px rgba(93,63,211,0.12)',
		minWidth: 220,
		maxWidth: 400,
		wordBreak: 'break-word',
	}}>
		<ErrorOutlineIcon style={{ fontSize: 28, color: '#fff' }} />
		<span>{message}</span>
	</div>
);

const toastError = err => {
	const errorMsg = err.response?.data?.error;
	let message = '';
	if (errorMsg) {
		if (i18n.exists(`backendErrors.${errorMsg}`)) {
			message = i18n.t(`backendErrors.${errorMsg}`);
		} else {
			message = errorMsg;
		}
	} else if (isString(err)) {
		message = err;
	} else {
		message = "Ocorreu um erro!";
	}
	toast.error(<CustomErrorToast message={message} />, {
		toastId: message,
		autoClose: 3500,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "colored",
		style: { background: 'transparent', boxShadow: 'none', padding: 0, minWidth: 0 },
		bodyStyle: { padding: 0, margin: 0 },
		icon: false,
	});
};

export default toastError;
