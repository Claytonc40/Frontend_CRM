import React from "react";
import Typography from "@material-ui/core/Typography";

const Title = ({ children, className }) => {
	return (
		<Typography
			component="h2"
			variant="h5"
			style={{
				color: '#5D3FD3',
				fontWeight: 800,
				fontSize: 22,
				marginBottom: 18,
			}}
			gutterBottom
			className={className}
		>
			{children}
		</Typography>
	);
};

export default Title;
