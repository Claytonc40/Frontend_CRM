import React, { useState, useEffect } from "react";

import { Avatar, CardHeader, Typography, Box } from "@material-ui/core";
import { PersonRounded } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if(document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if(document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer", transition: 'box-shadow 0.2s', borderRadius: 12, boxShadow: '0 1px 4px rgba(93,63,211,0.07)' }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={
				<Avatar
					src={contact.profilePicUrl}
					alt="contact_image"
					style={{
						width: 52,
						height: 52,
						border: '2.5px solid #5D3FD3',
						boxShadow: '0 2px 8px rgba(93,63,211,0.10)'
					}}
				/>
			}
			title={
				<Box display="flex" alignItems="center" gap={1}>
					<Typography style={{ color: '#5D3FD3', fontWeight: 700, fontSize: 18 }}>
						{contactName}
					</Typography>
					<Typography style={{ color: '#888', fontWeight: 500, fontSize: 13, marginLeft: 8 }}>
						#{ticket.id}
					</Typography>
				</Box>
			}
			subheader={
				ticket.user && (
					<Box display="flex" alignItems="center" gap={1}>
						<PersonRounded style={{ fontSize: 18, color: '#5D3FD3', marginRight: 4 }} />
						<Typography style={{ color: '#666', fontWeight: 500, fontSize: 15 }}>
							{userName}
						</Typography>
					</Box>
				)
			}
		/>
	);
};

export default TicketInfo;
