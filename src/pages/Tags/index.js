import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import Fade from "@material-ui/core/Fade";
import AddIcon from "@material-ui/icons/Add";
import Box from "@material-ui/core/Box";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip, Tooltip } from "@material-ui/core";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    marginTop: theme.spacing(4),
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  searchContainer: {
    flex: 1,
    maxWidth: 480,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "100%",
      marginBottom: theme.spacing(1),
    },
  },
  searchInput: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  addButton: {
    marginLeft: theme.spacing(2),
    height: 40,
    whiteSpace: "nowrap",
    backgroundColor: "#5D3FD3",
    "&:hover": {
      backgroundColor: "#4b32a8",
    },
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginLeft: 0,
    },
  },
  cardContainer: {
    minWidth: 280,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: theme.shadows[5],
    },
  },
  tagCard: {
    position: "relative",
    padding: theme.spacing(2),
    borderRadius: 10,
    border: "1px solid rgba(0, 0, 0, 0.09)",
  },
  tagName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    textShadow: "1px 1px 1px rgba(0,0,0,0.2)",
  },
  tagCount: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.12)",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  cardActions: {
    justifyContent: "flex-end",
    paddingTop: 0,
  },
  actionButton: {
    padding: theme.spacing(1),
    color: "#555",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(93, 63, 211, 0.08)",
      transform: "scale(1.1)",
    },
  },
  editButton: {
    color: "#5D3FD3",
    "&:hover": {
      color: "#4930A8",
    },
  },
  deleteButton: {
    color: "#F44336",
    "&:hover": {
      color: "#D32F2F",
    },
  },
  gridContainer: {
    marginTop: theme.spacing(2),
  },
  noTagsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(8),
    width: "100%",
  },
  noTagsIcon: {
    fontSize: 80,
    color: "rgba(0, 0, 0, 0.2)",
    marginBottom: theme.spacing(2),
  },
  noTagsText: {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: "1.1rem",
    maxWidth: 300,
    textAlign: "center",
  },
  pageTitle: {
    color: "#5D3FD3",
    fontWeight: 600,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(2),
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "40%",
      height: 3,
      bottom: -5,
      left: 0,
      backgroundColor: "#5D3FD3",
      borderRadius: 2,
    },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
}));

const Tags = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [displayedTags, setDisplayedTags] = useState([]);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tags/", {
        params: { searchParam: "", pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  }, [pageNumber]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pageNumber, fetchTags]);

  useEffect(() => {
    // Filtrar as tags com base no searchParam
    if (searchParam.trim() !== "") {
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchParam.toLowerCase())
      );
      setDisplayedTags(filtered);
    } else {
      setDisplayedTags(tags);
    }
  }, [searchParam, tags]);

  useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tags });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, user]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value);
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
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

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
      />
      <MainHeader>
        <div className={classes.titleContainer}>
          <Typography className={classes.pageTitle}>
            {i18n.t("tags.title")}
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerContainer}>
            <div className={classes.searchContainer}>
              <TextField
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={handleSearch}
                className={classes.searchInput}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.addButton}
                onClick={handleOpenTagModal}
                startIcon={<AddIcon />}
              >
                {i18n.t("tags.buttons.add")}
              </Button>
            </div>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        {displayedTags.length === 0 && !loading ? (
          <div className={classes.noTagsContainer}>
            <LocalOfferIcon className={classes.noTagsIcon} />
            <Typography className={classes.noTagsText}>
              {searchParam 
                ? i18n.t("tags.noTagsFound") 
                : i18n.t("tags.noTags")}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={3} className={classes.gridContainer}>
            {displayedTags.map((tag) => (
              <Fade in={true} key={tag.id} timeout={500}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    className={classes.cardContainer}
                    style={{ 
                      borderLeft: `5px solid ${tag.color}`,
                    }}
                  >
                    <CardContent 
                      className={classes.tagCard}
                      style={{ backgroundColor: `${tag.color}15` }} // Cor com 15% de opacidade
                    >
                      <Typography 
                        variant="h6" 
                        className={classes.tagName} 
                        style={{ color: tag.color }}
                      >
                        {tag.name}
                      </Typography>
                      <Chip
                        variant="outlined"
                        style={{
                          backgroundColor: tag.color,
                          textShadow: "1px 1px 1px #000",
                          color: "white",
                        }}
                        label={tag.name}
                        size="small"
                      />
                      <div 
                        className={classes.tagCount}
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.ticketsCount}
                      </div>
                    </CardContent>
                    <CardActions className={classes.cardActions}>
                      <Tooltip title={i18n.t("tags.buttons.edit")} arrow placement="top">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditTag(tag)}
                          className={`${classes.actionButton} ${classes.editButton}`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("tags.buttons.delete")} arrow placement="top">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingTag(tag);
                          }}
                          className={`${classes.actionButton} ${classes.deleteButton}`}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              </Fade>
            ))}
            
            {loading && 
              [...Array(4)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                  <Skeleton 
                    variant="rect" 
                    width="100%" 
                    height={120} 
                    animation="wave"
                    style={{ borderRadius: 10 }}
                  />
                </Grid>
              ))
            }
          </Grid>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Tags;
