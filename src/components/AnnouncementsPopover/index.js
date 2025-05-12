import React, { useEffect, useReducer, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Popover from "@material-ui/core/Popover";
import AnnouncementIcon from "@material-ui/icons/Announcement";

import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  Paper,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Tooltip,
  Fade,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "sonner";
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 400,
    maxWidth: 360,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
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
  announcementHeader: {
    padding: theme.spacing(2),
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    background: 'linear-gradient(145deg, #5D3FD3 0%, #7058e6 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 12,
    borderTopRight: 12,
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(1),
      fontSize: 20,
    }
  },
  announcementItem: {
    margin: theme.spacing(1, 0),
    transition: 'all 0.2s ease',
    borderRadius: 8,
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.05)',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }
  },
  priorityHigh: {
    borderLeft: '4px solid #b81111',
  },
  priorityMedium: {
    borderLeft: '4px solid orange',
  },
  priorityLow: {
    borderLeft: '4px solid grey',
  },
  announcementTitle: {
    fontWeight: 600,
    color: '#333',
    fontSize: 14,
  },
  announcementDate: {
    fontSize: 12,
    color: '#666',
    marginRight: theme.spacing(1),
  },
  announcementText: {
    color: '#555',
    marginTop: theme.spacing(0.5),
    fontSize: 13,
    maxHeight: 40,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  buttonIcon: {
    color: '#5D3FD3',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#4930A8',
    }
  },
  badge: {
    backgroundColor: '#5D3FD3',
    transition: 'all 0.3s ease',
  },
  emptyAnnouncements: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: theme.spacing(2),
  },
  emptyIcon: {
    fontSize: 48,
    color: '#5D3FD3',
    opacity: 0.6,
    marginBottom: theme.spacing(2),
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 12,
      boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
    }
  },
  dialogTitle: {
    backgroundColor: '#5D3FD3',
    color: '#FFFFFF',
    '& .MuiTypography-root': {
      fontWeight: 600,
    },
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  dialogMedia: {
    border: '1px solid #f1f1f1',
    margin: '0 auto 20px',
    textAlign: 'center',
    width: '100%',
    maxWidth: 400,
    height: 300,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }
  },
  dialogText: {
    color: '#333',
    lineHeight: 1.6,
  },
  dialogActions: {
    padding: theme.spacing(2),
  },
  closeButton: {
    color: '#5D3FD3',
    borderColor: '#5D3FD3',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.08)',
      borderColor: '#4930A8',
    }
  },
}));

function AnnouncementDialog({ announcement, open, handleClose }) {
  const classes = useStyles();
  
  const getMediaPath = (filename) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/${filename}`;
  };
  
  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={classes.dialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="alert-dialog-title" className={classes.dialogTitle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AnnouncementIcon style={{ marginRight: 8 }} />
          {announcement.title}
        </div>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {announcement.mediaPath && (
          <div
            className={classes.dialogMedia}
            style={{
              backgroundImage: `url(${getMediaPath(announcement.mediaPath)})`,
            }}
          ></div>
        )}
        <DialogContentText id="alert-dialog-description" className={classes.dialogText}>
          {announcement.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button 
          onClick={() => handleClose()} 
          variant="outlined"
          className={classes.closeButton}
          autoFocus
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

export default function AnnouncementsPopover() {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);
    
    if (!socket) {
      return () => {}; 
    }

    socket.on(`company-announcement`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        setInvisible(false);
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getPriorityClass = (priority) => {
    if (priority === 1) {
      return classes.priorityHigh;
    }
    if (priority === 2) {
      return classes.priorityMedium;
    }
    if (priority === 3) {
      return classes.priorityLow;
    }
    return "";
  };

  const getMediaPath = (filename) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/${filename}`;
  };

  const handleShowAnnouncementDialog = (record) => {
    setAnnouncement(record);
    setShowAnnouncementDialog(true);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <AnnouncementDialog
        announcement={announcement}
        open={showAnnouncementDialog}
        handleClose={() => setShowAnnouncementDialog(false)}
      />
      <Tooltip 
        title="Informativos" 
        arrow 
        TransitionComponent={Fade} 
        TransitionProps={{ timeout: 600 }}
      >
        <IconButton
          variant="contained"
          aria-describedby={id}
          onClick={handleClick}
          className={classes.buttonIcon}
        >
          <Badge
            color="secondary"
            variant="dot"
            classes={{ badge: classes.badge }}
            invisible={invisible || announcements.length < 1}
          >
            <AnnouncementIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
        >
          <div className={classes.announcementHeader}>
            <Typography className={classes.headerTitle}>
              <AnnouncementIcon fontSize="small" />
              Informativos
            </Typography>
            <Badge
              color="error"
              badgeContent={announcements.length}
              max={99}
            >
              <AnnouncementIcon fontSize="small" />
            </Badge>
          </div>
          
          <List
            component="nav"
            aria-label="main mailbox folders"
          >
            {isArray(announcements) && announcements.length > 0 ? (
              announcements.map((item, key) => (
                <ListItem
                  key={key}
                  className={`${classes.announcementItem} ${getPriorityClass(item.priority)}`}
                  onClick={() => handleShowAnnouncementDialog(item)}
                  button
                >
                  {item.mediaPath && (
                    <ListItemAvatar>
                      <Avatar
                        alt={item.mediaName}
                        src={getMediaPath(item.mediaPath)}
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={
                      <Typography className={classes.announcementTitle}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" className={classes.announcementDate}>
                          {moment(item.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                        <Typography component="div" className={classes.announcementText}>
                          {item.text}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <div className={classes.emptyAnnouncements}>
                <AnnouncementIcon className={classes.emptyIcon} />
                <Typography>Nenhum informativo</Typography>
              </div>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
