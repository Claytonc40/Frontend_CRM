import React, { useState, useRef } from "react";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import Tooltip from "@material-ui/core/Tooltip";
import Fade from "@material-ui/core/Fade";

import { Grid, Slider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    tabContainer: {
        padding: theme.spacing(2),
    },
    popoverPaper: {
        width: "100%",
        maxWidth: 350,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        [theme.breakpoints.down("sm")]: {
            maxWidth: 270,
        },
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        border: '1px solid rgba(93, 63, 211, 0.1)',
        animation: '$slideIn 0.3s ease-out',
    },
    '@keyframes slideIn': {
        '0%': {
            opacity: 0,
            transform: 'translateY(-10px)'
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)'
        }
    },
    noShadow: {
        boxShadow: "none !important",
    },
    buttonIcon: {
        color: '#5D3FD3',
        transition: 'all 0.3s ease',
        '&:hover': {
            color: '#4930A8',
        }
    },
    icons: {
        color: '#5D3FD3',
    },
    volumeSlider: {
        color: '#5D3FD3',
        '& .MuiSlider-thumb': {
            backgroundColor: '#5D3FD3',
        },
        '& .MuiSlider-track': {
            backgroundColor: '#5D3FD3',
        },
        '& .MuiSlider-rail': {
            backgroundColor: 'rgba(93, 63, 211, 0.2)',
        },
    },
    customBadge: {
        backgroundColor: "#f44336",
        color: "#fff",
    },
}));

const NotificationsVolume = ({ volume, setVolume }) => {
    const classes = useStyles();

    const anchorEl = useRef();
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleClickAway = () => {
        setIsOpen(false);
    };

    const handleVolumeChange = (value) => {
        setVolume(value);
        localStorage.setItem("volume", value);
    };

    return (
        <>
            <Tooltip 
                title="Volume" 
                arrow 
                TransitionComponent={Fade} 
                TransitionProps={{ timeout: 600 }}
            >
                <IconButton
                    onClick={handleClick}
                    ref={anchorEl}
                    aria-label="Ajustar Volume"
                    color="inherit"
                    className={classes.buttonIcon}
                    size="medium"
                >
                    <VolumeUpIcon />
                </IconButton>
            </Tooltip>
            <Popover
                disableScrollLock
                open={isOpen}
                anchorEl={anchorEl.current}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                classes={{ paper: classes.popoverPaper }}
                onClose={handleClickAway}
            >
                <List dense className={classes.tabContainer}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <VolumeDownIcon className={classes.icons} />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={volume}
                                aria-labelledby="continuous-slider"
                                step={0.1}
                                min={0}
                                max={1}
                                onChange={(e, value) =>
                                    handleVolumeChange(value)
                                }
                                className={classes.volumeSlider}
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUpIcon className={classes.icons} />
                        </Grid>
                    </Grid>
                </List>
            </Popover>
        </>
    );
};

export default NotificationsVolume;
