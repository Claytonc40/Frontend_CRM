import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import { i18n } from "../../translate/i18n";

// Ícones
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import EventNoteIcon from '@material-ui/icons/EventNote';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import SortIcon from '@material-ui/icons/Sort';
import FilterListIcon from '@material-ui/icons/FilterList';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  mainContainer: {
    padding: theme.spacing(2),
    overflowY: 'auto',
    flex: 1,
    marginTop: theme.spacing(4),
  },
  inputContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: theme.spacing(3),
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  input: {
    flexGrow: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1),
      width: '100%',
    },
  },
  addButton: {
    backgroundColor: '#5D3FD3',
    color: 'white',
    height: 56,
    borderRadius: 10,
    padding: theme.spacing(0, 3),
    '&:hover': {
      backgroundColor: '#4930A8',
    },
    [theme.breakpoints.down('xs')]: {
    width: '100%',
    },
  },
  tasksList: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginTop: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
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
  taskItem: {
    borderLeft: '3px solid #5D3FD3',
    margin: theme.spacing(1),
    borderRadius: 8,
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    '&:hover': {
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
  },
  taskItemCompleted: {
    borderLeft: '3px solid #9e9e9e',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: 'rgba(0, 0, 0, 0.5)',
    },
  },
  taskText: {
    fontWeight: 500,
  },
  taskDate: {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.54)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    color: '#5D3FD3',
    '&.Mui-checked': {
      color: '#5D3FD3',
    },
  },
  taskActions: {
    display: 'flex',
  },
  actionButton: {
    padding: theme.spacing(1),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.1)',
    },
  },
  editButton: {
    color: '#5D3FD3',
  },
  deleteButton: {
    color: '#f44336',
  },
  categoryChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    height: 24,
    fontSize: '0.7rem',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
    borderRadius: 10,
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  filterButton: {
    color: '#5D3FD3',
    marginLeft: theme.spacing(1),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.08)',
      transform: 'scale(1.1)',
    },
  },
  filterMenu: {
    '& .MuiPaper-root': {
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'visible',
      marginTop: 10,
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: -10,
        right: 14,
        width: 20,
        height: 20,
        backgroundColor: 'white',
        transform: 'rotate(45deg)',
        zIndex: 0,
      },
    },
  },
  filterMenuItem: {
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.08)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(93, 63, 211, 0.12)',
      '&:hover': {
        backgroundColor: 'rgba(93, 63, 211, 0.16)',
      },
      '&:before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#5D3FD3',
        borderRadius: '0 4px 4px 0',
      },
    },
  },
  menuDivider: {
    margin: theme.spacing(1, 0),
  },
  filterIcon: {
    marginRight: theme.spacing(1.5),
    fontSize: '1.1rem',
    color: '#5D3FD3',
  },
  filterHeader: {
    padding: theme.spacing(1.5, 2),
    color: '#5D3FD3',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },
  noTasksContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    backgroundColor: 'white',
    borderRadius: 10,
    textAlign: 'center',
  },
  noTasksIcon: {
    fontSize: 80,
    color: 'rgba(93, 63, 211, 0.2)',
    marginBottom: theme.spacing(2),
  },
  noTasksText: {
    color: 'rgba(0, 0, 0, 0.7)',
    maxWidth: 400,
  },
  categoriesSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  titleContainer: {
    marginTop: theme.spacing(4),
    display: "flex",
    alignItems: "center",
  },
  categoryMenu: {
    '& .MuiPaper-root': {
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'visible',
      marginTop: 10,
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: -10,
        right: 14,
        width: 20,
        height: 20,
        backgroundColor: 'white',
        transform: 'rotate(45deg)',
        zIndex: 0,
      },
    },
  },
  categoryMenuItem: {
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.08)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(93, 63, 211, 0.12)',
      '&:hover': {
        backgroundColor: 'rgba(93, 63, 211, 0.16)',
      },
      '&:before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#5D3FD3',
        borderRadius: '0 4px 4px 0',
      },
    },
  },
  categoryHeader: {
    padding: theme.spacing(1.5, 2),
    color: '#5D3FD3',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },
  categoryIcon: {
    marginRight: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
  },
  categoryColorDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    marginRight: theme.spacing(1.5),
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    border: '2px solid white',
  },
  taskMenu: {
    '& .MuiPaper-root': {
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'visible',
      marginTop: 10,
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: -10,
        right: 14,
        width: 20,
        height: 20,
        backgroundColor: 'white',
        transform: 'rotate(45deg)',
        zIndex: 0,
      },
    },
  },
  taskMenuItem: {
    padding: theme.spacing(1.5, 2),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(93, 63, 211, 0.08)',
    },
  },
  taskMenuIconContainer: {
    marginRight: theme.spacing(1.5),
    display: 'flex',
    minWidth: 24,
  },
  completeIcon: {
    color: '#5D3FD3',
  },
  editIcon: {
    color: '#5D3FD3',
  },
  deleteIcon: {
    color: '#F44336',
  },
  taskMenuHeader: {
    padding: theme.spacing(1.5, 2),
    color: '#5D3FD3',
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  },
}));

// Categorias predefinidas
const getCategories = (i18n) => [
  { id: 'leads', label: i18n.t("toDoList.categories.leads"), color: '#5D3FD3' },
  { id: 'clients', label: i18n.t("toDoList.categories.clients"), color: '#5D3FD3' },
  { id: 'meetings', label: i18n.t("toDoList.categories.meetings"), color: '#FF5733' },
  { id: 'followup', label: i18n.t("toDoList.categories.followup"), color: '#1E88E5' },
  { id: 'sales', label: i18n.t("toDoList.categories.sales"), color: '#FFC107' },
  { id: 'support', label: i18n.t("toDoList.categories.support"), color: '#607D8B' },
];

const ToDoList = () => {
  const classes = useStyles();
  const categories = getCategories(i18n);

  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, updatedAt
  const [anchorEl, setAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Carregar tarefas do localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Converter strings de data para objetos Date
        const tasksWithDates = parsedTasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        setTasks([]);
      }
    }
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskChange = (event) => {
    setTask(event.target.value);
  };

  const handleAddTask = () => {
    if (!task.trim()) {
      return;
    }

    const now = new Date();

    if (editIndex >= 0) {
      // Editar tarefa existente
      const newTasks = [...tasks];
      newTasks[editIndex] = {
        ...newTasks[editIndex],
        text: task,
        updatedAt: now,
        category: selectedCategory || newTasks[editIndex].category || categories[5].id
      };
      setTasks(newTasks);
      setTask('');
      setEditIndex(-1);
      setSelectedCategory(null);
    } else {
      // Adicionar nova tarefa
      setTasks([
        ...tasks,
        {
          text: task,
          createdAt: now,
          updatedAt: now,
          completed: false,
          category: selectedCategory || categories[5].id
        }
      ]);
      setTask('');
      setSelectedCategory(null);
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setEditIndex(index);
    setSelectedCategory(tasks[index].category);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleToggleComplete = (index) => {
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      completed: !newTasks[index].completed,
      updatedAt: new Date()
    };
    setTasks(newTasks);
  };

  const handleOpenMenu = (event, index) => {
    setAnchorEl(event.currentTarget);
    setCurrentTaskIndex(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentTaskIndex(null);
  };

  const handleOpenCategoryMenu = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCloseCategoryMenu = () => {
    setCategoryAnchorEl(null);
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    handleCloseCategoryMenu();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  // Filtrar e ordenar tarefas
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks];

    // Aplicar filtro
    if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filter === 'pending') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    // Aplicar ordenação
    filteredTasks.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return b.createdAt - a.createdAt;
      } else {
        return b.updatedAt - a.updatedAt;
      }
    });

    return filteredTasks;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Função para formatar a data
  const formatDate = (date) => {
    const now = new Date();
    const taskDate = new Date(date);

    // Verificar se é hoje
    if (taskDate.toDateString() === now.toDateString()) {
      return `${i18n.t("toDoList.today")}, ${taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Verificar se é ontem
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (taskDate.toDateString() === yesterday.toDateString()) {
      return `${i18n.t("toDoList.yesterday")}, ${taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Outras datas
    return taskDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor e rótulo da categoria
  const getCategoryInfo = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId) || categories[5];
    return {
      label: category.label,
      color: category.color
    };
  };

  return (
    <MainContainer>
      <MainHeader>
        <div className={classes.titleContainer}>
          <Typography className={classes.pageTitle}>
            {i18n.t("toDoList.title")}
          </Typography>
        </div>
        <MainHeaderButtonsWrapper>
          <div>
            <Tooltip title={i18n.t("toDoList.filterTitle")} arrow>
              <IconButton
                className={classes.filterButton}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && currentTaskIndex === null}
              onClose={() => setAnchorEl(null)}
              className={classes.filterMenu}
              elevation={3}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Typography className={classes.filterHeader}>
                {i18n.t("toDoList.filterTitle")}
              </Typography>
              <MenuItem
                onClick={() => {
                  handleFilterChange('all');
                  setAnchorEl(null);
                }}
                selected={filter === 'all'}
                className={classes.filterMenuItem}
              >
                <FormatListBulletedIcon className={classes.filterIcon} />
                {i18n.t("toDoList.all")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleFilterChange('pending');
                  setAnchorEl(null);
                }}
                selected={filter === 'pending'}
                className={classes.filterMenuItem}
              >
                <AssignmentTurnedInIcon className={classes.filterIcon} style={{ opacity: 0.5 }} />
                {i18n.t("toDoList.pending")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleFilterChange('completed');
                  setAnchorEl(null);
                }}
                selected={filter === 'completed'}
                className={classes.filterMenuItem}
              >
                <AssignmentTurnedInIcon className={classes.filterIcon} />
                {i18n.t("toDoList.completed")}
              </MenuItem>
              <Divider className={classes.menuDivider} />
              <Typography className={classes.filterHeader}>
                {i18n.t("toDoList.filterByCreationDate").split(" ")[0]}
              </Typography>
              <MenuItem
                onClick={() => {
                  handleSortChange('createdAt');
                  setAnchorEl(null);
                }}
                selected={sortBy === 'createdAt'}
                className={classes.filterMenuItem}
              >
                <SortIcon className={classes.filterIcon} />
                {i18n.t("toDoList.filterByCreationDate")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleSortChange('updatedAt');
                  setAnchorEl(null);
                }}
                selected={sortBy === 'updatedAt'}
                className={classes.filterMenuItem}
              >
                <SortIcon className={classes.filterIcon} />
                {i18n.t("toDoList.filterByUpdateDate")}
              </MenuItem>
            </Menu>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainContainer}>
      <div className={classes.inputContainer}>
        <TextField
          className={classes.input}
            label={i18n.t("toDoList.newTask")}
          value={task}
          onChange={handleTaskChange}
          variant="outlined"
            placeholder={i18n.t("toDoList.taskPlaceholder")}
            fullWidth
            InputProps={{
              endAdornment: selectedCategory && (
                <InputAdornment position="end">
                  <Chip
                    size="small"
                    label={getCategoryInfo(selectedCategory).label}
                    style={{
                      backgroundColor: getCategoryInfo(selectedCategory).color,
                      color: 'white'
                    }}
                    onDelete={() => setSelectedCategory(null)}
                  />
                </InputAdornment>
              )
            }}
          />
          <Tooltip title={i18n.t("toDoList.selectCategory")} arrow>
            <IconButton
              onClick={handleOpenCategoryMenu}
              className={classes.actionButton}
              style={{ color: '#5D3FD3' }}
            >
              <LocalOfferIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={editIndex >= 0 ? <EditIcon /> : <AddIcon />}
            onClick={handleAddTask}
          >
            {editIndex >= 0 ? i18n.t("toDoList.save") : i18n.t("toDoList.add")}
        </Button>

          <Menu
            anchorEl={categoryAnchorEl}
            open={Boolean(categoryAnchorEl)}
            onClose={handleCloseCategoryMenu}
            className={classes.categoryMenu}
            elevation={3}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Typography className={classes.categoryHeader}>
              {i18n.t("toDoList.selectCategory")}
            </Typography>
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                selected={selectedCategory === category.id}
                className={classes.categoryMenuItem}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <div 
                    className={classes.categoryColorDot}
                    style={{ backgroundColor: category.color }}
                  />
                  <Typography variant="body2">{category.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </div>

        {filteredTasks.length === 0 ? (
          <div className={classes.noTasksContainer}>
            <AssignmentTurnedInIcon className={classes.noTasksIcon} />
            <Typography variant="h6" className={classes.noTasksText}>
              {filter === 'all'
                ? i18n.t("toDoList.noTasks")
                : filter === 'completed'
                  ? i18n.t("toDoList.noCompletedTasks")
                  : i18n.t("toDoList.noPendingTasks")}
            </Typography>
          </div>
        ) : (
          <Paper className={classes.tasksList}>
            <div className={classes.taskHeader}>
              <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                {filter === 'all'
                  ? i18n.t("toDoList.all")
                  : filter === 'completed'
                    ? i18n.t("toDoList.completed")
                    : i18n.t("toDoList.pending")}
                <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)' }}>
                  ({filteredTasks.length})
                </span>
              </Typography>
              <div>
                <Tooltip title={sortBy === 'createdAt' ? i18n.t("toDoList.filterByCreationDate") : i18n.t("toDoList.filterByUpdateDate")} arrow>
                  <IconButton size="small">
                    <SortIcon fontSize="small" style={{ color: '#5D3FD3' }} />
                  </IconButton>
                </Tooltip>
              </div>
      </div>

        <List>
              {filteredTasks.map((task, index) => (
                <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                  <ListItem
                    className={`${classes.taskItem} ${task.completed ? classes.taskItemCompleted : ''}`}
                    button
                  >
                    <ListItemIcon onClick={() => handleToggleComplete(tasks.indexOf(task))}>
                      <Checkbox
                        edge="start"
                        checked={task.completed}
                        className={classes.checkbox}
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography className={classes.taskText}>
                          {task.text}
                        </Typography>
                      }
                      secondary={
                        <div>
                          <Chip
                            size="small"
                            className={classes.categoryChip}
                            label={getCategoryInfo(task.category).label}
                            style={{
                              backgroundColor: getCategoryInfo(task.category).color + '20',
                              color: getCategoryInfo(task.category).color,
                              borderColor: getCategoryInfo(task.category).color + '40',
                              borderWidth: 1,
                              borderStyle: 'solid'
                            }}
                          />
                          <Typography className={classes.taskDate}>
                            <EventNoteIcon fontSize="inherit" style={{ marginRight: 4 }} />
                            {formatDate(task.updatedAt)}
                          </Typography>
                        </div>
                      }
                    />

                    <ListItemSecondaryAction className={classes.taskActions}>
                      <Tooltip title={i18n.t("toDoList.edit")} arrow>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditTask(tasks.indexOf(task))}
                          className={`${classes.actionButton} ${classes.editButton}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={i18n.t("toDoList.delete")} arrow>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteTask(tasks.indexOf(task))}
                          className={`${classes.actionButton} ${classes.deleteButton}`}
                        >
                          <DeleteIcon fontSize="small" />
                </IconButton>
                      </Tooltip>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleOpenMenu(e, tasks.indexOf(task))}
                        className={classes.actionButton}
                      >
                        <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
                </Fade>
          ))}
        </List>
          </Paper>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && currentTaskIndex !== null}
          onClose={handleCloseMenu}
          className={classes.taskMenu}
          elevation={3}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Typography className={classes.taskMenuHeader}>
            {i18n.t("toDoList.title")}
          </Typography>
          <MenuItem 
            onClick={() => {
              handleToggleComplete(currentTaskIndex);
              handleCloseMenu();
            }}
            className={classes.taskMenuItem}
          >
            <div className={classes.taskMenuIconContainer}>
              <AssignmentTurnedInIcon 
                fontSize="small" 
                className={classes.completeIcon}
              />
            </div>
            {tasks[currentTaskIndex]?.completed 
              ? i18n.t("toDoList.markAsPending") 
              : i18n.t("toDoList.markAsCompleted")}
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleEditTask(currentTaskIndex);
              handleCloseMenu();
            }}
            className={classes.taskMenuItem}
          >
            <div className={classes.taskMenuIconContainer}>
              <EditIcon 
                fontSize="small" 
                className={classes.editIcon}
              />
      </div>
            {i18n.t("toDoList.edit")}
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleDeleteTask(currentTaskIndex);
              handleCloseMenu();
            }}
            className={classes.taskMenuItem}
          >
            <div className={classes.taskMenuIconContainer}>
              <DeleteIcon 
                fontSize="small" 
                className={classes.deleteIcon}
              />
    </div>
            {i18n.t("toDoList.delete")}
          </MenuItem>
        </Menu>
      </Paper>
    </MainContainer>
  );
};

export default ToDoList;
