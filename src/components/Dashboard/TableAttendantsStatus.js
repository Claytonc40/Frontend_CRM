import React from "react";

import Paper from "@material-ui/core/Paper";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Skeleton from "@material-ui/lab/Skeleton";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from '@material-ui/core/colors';

import { CheckCircle, AlertCircle } from 'lucide-react';
import moment from 'moment';

import Rating from '@material-ui/lab/Rating';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(theme => ({
	on: {
		color: green[600],
		fontSize: 26,
		verticalAlign: 'middle',
	},
	off: {
		color: red[500],
		fontSize: 26,
		verticalAlign: 'middle',
	},
    pointer: {
        cursor: "pointer"
    },
    tableHead: {
        background: 'linear-gradient(90deg, #f3f0fa 0%, #faf9fd 100%)',
    },
    tableCellHead: {
        color: '#5D3FD3',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: 0.2,
        borderBottom: '2px solid #ece6fa',
        background: 'none',
    },
    tableRow: {
        transition: 'background 0.15s',
        '&:hover': {
            background: '#f3f0fa',
        },
    },
    tableCell: {
        fontSize: 15,
        padding: '14px 10px',
        borderBottom: '1px solid #f0eef7',
    },
}));

export function RatingBox ({ rating }) {
    const ratingTrunc = rating === null ? 0 : Math.trunc(rating);
    return <Rating
        defaultValue={ratingTrunc}
        max={3}
        readOnly
        size="small"
    />
}

export default function TableAttendantsStatus(props) {
    const { loading, attendants } = props
	const classes = useStyles();

    function renderList () {
        return attendants.map((a, k) => (
            <TableRow key={k} className={classes.tableRow}>
                <TableCell className={classes.tableCell}>{a.name}</TableCell>
                <TableCell align="center" className={classes.tableCell}>
                    <Tooltip title="1 - Insatisfeito, 2 - Satisfeito, 3 - Muito Satisfeito" arrow>
                        <span className={classes.pointer}>
                            <RatingBox rating={a.rating} />
                        </span>
                    </Tooltip>
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>{formatTime(a.avgSupportTime, 2)}</TableCell>
                <TableCell align="center" className={classes.tableCell}>
                    { a.online ?
                        <CheckCircle className={classes.on} />
                        : <AlertCircle className={classes.off} />
                    }
                </TableCell>
            </TableRow>
        ))
    }

	function formatTime(minutes){
		return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]');
	}

    return ( !loading ?
        <TableContainer component={Paper} style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(93,63,211,0.08)' }}>
            <Table>
                <TableHead className={classes.tableHead}>
                    <TableRow>
                        <TableCell className={classes.tableCellHead}>Nome</TableCell>
                        <TableCell align="center" className={classes.tableCellHead}>Avaliações</TableCell>
                        <TableCell align="center" className={classes.tableCellHead}>T.M. de Atendimento</TableCell>
                        <TableCell align="center" className={classes.tableCellHead}>Status (Atual)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { renderList() }
                </TableBody>
            </Table>
        </TableContainer>
        : <Skeleton variant="rect" height={150} style={{ borderRadius: 16 }} />
    )
}