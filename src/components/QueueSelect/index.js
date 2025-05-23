import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const QueueSelect = ({
  selectedQueueIds,
  onChange,
  multiple = true,
  title = "",
  style = {},
  className = "",
}) => {
  const classes = useStyles();
  const [queues, setQueues] = useState([]);

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const { data } = await api.get("/queue");
      setQueues(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <FormControl
        fullWidth
        margin="dense"
        variant="outlined"
        style={{ ...style, width: "100%" }}
        className={className}
      >
        <InputLabel shrink={selectedQueueIds ? true : false}>
          {title}
        </InputLabel>
        <Select
          label={title}
          multiple={multiple}
          labelWidth={60}
          value={selectedQueueIds}
          onChange={handleChange}
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
          }}
          style={{ ...style, width: "100%" }}
          className={className}
          renderValue={(selected) => {
            return (
              <div className={classes.chips}>
                {selected?.length > 0 && multiple ? (
                  selected.map((id) => {
                    const queue = queues.find((q) => q.id === id);
                    return queue ? (
                      <Chip
                        key={id}
                        style={{ backgroundColor: queue.color }}
                        variant="outlined"
                        label={queue.name}
                        className={classes.chip}
                      />
                    ) : null;
                  })
                ) : (
                  <Chip
                    key={selected}
                    variant="outlined"
                    style={{
                      backgroundColor: queues.find((q) => q.id === selected)
                        ?.color,
                    }}
                    label={queues.find((q) => q.id === selected)?.name}
                    className={classes.chip}
                  />
                )}
              </div>
            );
          }}
        >
          {!multiple && <MenuItem value={null}>Nenhum</MenuItem>}
          {queues.map((queue) => (
            <MenuItem key={queue.id} value={queue.id}>
              {queue.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default QueueSelect;
