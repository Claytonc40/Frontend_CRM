import { Box, Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 16,
    [theme.breakpoints.down("xs")]: {
      padding: 8,
    },
  },
  chip: {
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.10)",
    background: "#e5e0fa",
    color: "#5D3FD3",
    margin: 2,
    border: "none",
    "& .MuiChip-label": {
      padding: "0 10px",
    },
  },
  chipColored: {
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(93, 63, 211, 0.10)",
    color: "#fff",
    margin: 2,
    border: "none",
    "& .MuiChip-label": {
      padding: "0 10px",
    },
  },
  autocomplete: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      background: "#fff",
      "& fieldset": {
        borderColor: "#5D3FD3",
      },
      "&:hover fieldset": {
        borderColor: "#5D3FD3",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#5D3FD3",
        boxShadow: "0 0 0 2px #e5e0fa",
      },
    },
    "& .MuiInputBase-input": {
      fontSize: 15,
    },
  },
}));

export function TagsFilter({ onFiltered }) {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadTags();
    }
    fetchData();
  }, []);

  const loadTags = async () => {
    try {
      const { data } = await api.get(`/tags/list`);
      setTags(data);
    } catch (err) {
      toast.error(err.message);
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
        options={tags}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        className={classes.autocomplete}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="default"
              className={option.color ? classes.chipColored : classes.chip}
              style={option.color ? { backgroundColor: option.color } : {}}
              label={option.name}
              {...getTagProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Filtro por Tags"
          />
        )}
      />
    </Box>
  );
}
