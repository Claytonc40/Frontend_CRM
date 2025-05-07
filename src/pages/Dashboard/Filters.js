import React, { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";

import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    makeStyles
} from "@material-ui/core";
import { Filter } from 'lucide-react';
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
    paper: {
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
        padding: theme.spacing(4, 3, 3, 3),
        marginBottom: theme.spacing(2),
        background: "#fff",
    },
    title: {
        color: '#5D3FD3',
        fontWeight: 700,
        fontSize: 20,
        marginBottom: theme.spacing(2),
    },
    formControl: {
        borderRadius: 10,
        background: '#faf9fd',
        minHeight: 48,
        marginBottom: theme.spacing(1),
    },
    select: {
        borderRadius: 10,
        background: '#fff',
        minHeight: 48,
    },
    textField: {
        borderRadius: 10,
        background: '#fff',
        minHeight: 48,
    },
    button: {
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 16,
        padding: '12px 0',
        background: '#5D3FD3',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(93,63,211,0.10)',
        textTransform: 'none',
        '&:hover': {
            background: '#4930A8',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
}));

const Filters = ({
    classes: propClasses,
    setDateStartTicket,
    setDateEndTicket,
    dateStartTicket,
    dateEndTicket,
    setQueueTicket,
    queueTicket,
}) => {
    const { user } = useContext(AuthContext);
    const classes = useStyles();

    const [queues, setQueues] = React.useState(queueTicket);
    const [dateStart, setDateStart] = React.useState(dateStartTicket);
    const [dateEnd, setDateEnd] = React.useState(dateEndTicket);

    return (
        <Grid item xs={12}>
            <Paper className={classes.paper} elevation={6}>
                <div className={classes.title}><Title>Filtros</Title></div>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth className={classes.formControl} variant="outlined">
                            <InputLabel id="queue-label">
                                Departamentos
                            </InputLabel>
                            <Select
                                labelId="queue-label"
                                id="queue-select"
                                value={queues}
                                label="Departamentos"
                                onChange={(e) => setQueues(e.target.value)}
                                className={classes.select}
                            >
                                <MenuItem value={false}>
                                    Todos os Departamentos
                                </MenuItem>
                                {user.queues.map((queue) => (
                                    <MenuItem key={queue.id} value={queue.id}>
                                        {queue.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            name="dateStart"
                            label="De"
                            InputLabelProps={{ shrink: true }}
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                            variant="outlined"
                            className={classes.textField}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            name="dateEnd"
                            label="Até"
                            InputLabelProps={{ shrink: true }}
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                            variant="outlined"
                            className={classes.textField}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            onClick={() => {
                                setQueueTicket(queues);
                                setDateStartTicket(dateStart);
                                setDateEndTicket(dateEnd);
                            }}
                            startIcon={<Filter size={18} />}
                        >
                            Filtrar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    );
};

export default Filters;
