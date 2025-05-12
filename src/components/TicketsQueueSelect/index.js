import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%",
    minWidth: 120,
    marginTop: 0,
    [theme.breakpoints.down("xs")]: {
      minWidth: 80,
    },
  },
  select: {
    borderRadius: 12,
    background: "#fff",
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      fontSize: 15,
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
    "& .MuiSelect-select": {
      fontSize: 15,
      padding: "12px 10px",
    },
  },
  menuItem: {
    borderRadius: 10,
    margin: "2px 0",
    transition: "background 0.2s",
    "&:hover": {
      background: "#f3f0fa",
    },
  },
  checkbox: {
    color: "#5D3FD3 !important",
    transition: "all 0.2s",
    "&.Mui-checked": {
      color: "#5D3FD3",
    },
  },
}));

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const classes = useStyles();
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ width: 140, marginTop: 0 }}>
      <FormControl fullWidth margin="dense" className={classes.formControl}>
        <Select
          multiple
          displayEmpty
          variant="outlined"
          value={selectedQueueIds}
          onChange={handleChange}
          className={classes.select}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
            PaperProps: {
              style: {
                borderRadius: 14,
                boxShadow: "0 4px 16px rgba(93, 63, 211, 0.08)",
              },
            },
          }}
          renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
        >
          {userQueues?.length > 0 &&
            userQueues.map((queue) => (
              <MenuItem
                dense
                key={queue.id}
                value={queue.id}
                className={classes.menuItem}
                style={{ borderLeft: `5px solid ${queue.color}` }}
              >
                <Checkbox
                  className={classes.checkbox}
                  size="small"
                  color="primary"
                  checked={selectedQueueIds.indexOf(queue.id) > -1}
                />
                <ListItemText primary={queue.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;
