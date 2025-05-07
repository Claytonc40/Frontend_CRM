import { Box, Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0 16px 16px',
    [theme.breakpoints.down("xs")]: {
      padding: '0 8px 8px',
    },
  },
  chip: {
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.10)",
    background: "#5D3FD3",
    color: "#fff",
    margin: 2,
    border: "none",
    '& .MuiChip-label': {
      padding: '0 10px',
    },
  },
  autocomplete: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 12,
      background: '#fff',
      '& fieldset': {
        borderColor: '#5D3FD3',
      },
      '&:hover fieldset': {
        borderColor: '#5D3FD3',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#5D3FD3',
        boxShadow: '0 0 0 2px #e5e0fa',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: 15,
    },
  },
}));

export function UsersFilter({ onFiltered, initialUsers }) {
  const classes = useStyles();
  const [users, setUsers] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadUsers();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelecteds([]);
    if (
      Array.isArray(initialUsers) &&
      Array.isArray(users) &&
      users.length > 0
    ) {
      onChange(initialUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUsers, users]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/users/list`);
      const userList = data.map((u) => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  return (
    <Box className={classes.root}>
      <Autocomplete
        multiple
        size="small"
        options={users}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        getOptionSelected={(option, value) => {
          return (
            option?.id === value?.id ||
            option?.name.toLowerCase() === value?.name.toLowerCase()
          );
        }}
        className={classes.autocomplete}
        renderTags={(value, getUserProps) =>
          value.map((option, index) => (
            <Chip
              variant="default"
              className={classes.chip}
              label={option.name}
              {...getUserProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Filtro por Usuários"
          />
        )}
      />
    </Box>
  );
}
