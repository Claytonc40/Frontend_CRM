import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  InputBase
} from "@material-ui/core";
import { X, CheckCircle } from "lucide-react";
import { makeStyles } from "@material-ui/core";
import MarkdownWrapper from "../MarkdownWrapper";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  messagesList: {
    backgroundSize: "370px",
    backgroundImage: theme.backgroundImage,
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
    padding: "16px",
    overflowY: "auto",
    "@media (max-width: 600px)": {
      paddingBottom: "70px"
    },
    ...theme.scrollbarStyles,
    minHeight: "120px",
    minWidth: "400px",
    maxWidth: "600px",
    background: "#faf9fd",
  },
  textContentItem: {
    overflowWrap: "break-word",
    padding: "8px 12px",
  },
  messageRight: {
    fontSize: "13px",
    marginLeft: 16,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 510,
    height: "auto",
    display: "block",
    position: "relative",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-end",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#f3f0fa",
    border: "1px solid #e8e8e8",
  },
  inputmsg: {
    backgroundColor: "#fff",
    display: "flex",
    width: "100%",
    margin: "8px 0",
    borderRadius: 8,
    border: "1px solid #e8e8e8",
    transition: "all 0.2s",
    "&:focus-within": {
      borderColor: "#5D3FD3",
      boxShadow: "0 1px 4px rgba(93,63,211,0.08)",
    }
  },
  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#666"
  },
  titleBackground: {
    color: "#fff",
    backgroundColor: "#5D3FD3",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    "& .MuiIconButton-root": {
      padding: 4,
      marginRight: 8,
      "&:hover": {
        background: "rgba(255,255,255,0.1)",
      }
    }
  },
  dialogPaper: {
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(93,63,211,0.12)",
  },
  saveButton: {
    padding: 8,
    margin: "0 8px",
    color: "#5D3FD3",
    "&:hover": {
      background: "#f3f0fa",
    }
  },
  inputBase: {
    padding: "12px 16px",
    fontSize: 14,
    color: "#333",
    "&::placeholder": {
      color: "#999",
      opacity: 1
    }
  }
}));

const EditMessageModal = ({ open, onClose, onSave, message }) => {
  const classes = useStyles();
  const [editedMessage, setEditedMessage] = useState(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (open) {
      setEditedMessage(message?.body);
    }
  }, [open, message]);

  const handleSave = async (editedMessage) => {
    if(editedMessage){
      try {
        const messages = {
          read: 1,
          fromMe: true,
          mediaUrl: "",
          body: editedMessage,
          quotedMsg: null,
        };
        await api.post(`/messages/edit/${message.id}`, messages);
        onClose(false);
      } catch (err) {
        // Handle error
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="edit-message-dialog"
      PaperProps={{
        className: classes.dialogPaper
      }}
      ref={modalRef}
    >
      <DialogTitle id="edit-message-dialog" className={classes.titleBackground}>
        <IconButton 
          edge="start" 
          color="inherit" 
          onClick={() => onClose(false)} 
          aria-label="close"
        >
          <X size={20} />
        </IconButton>
        Editar Mensagem
      </DialogTitle>
      <DialogContent style={{ padding: 0 }}>
        <Box>
          <Box className={classes.messagesList}>
            <Box
              component="div"
              className={classes.messageRight}
            >
              <Box className={classes.textContentItem}>
                <Box component="div" style={{ color: "#333" }}>
                  <MarkdownWrapper>{message?.body}</MarkdownWrapper>
                </Box>
              </Box>
            </Box>
          </Box>
          <Paper
            component="form"
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 0,
              backgroundColor: "#fff",
              borderTop: "1px solid #e8e8e8"
            }}
          >
            <Box className={classes.inputmsg}>
              <InputBase
                className={classes.inputBase}
                multiline
                maxRows={6}
                placeholder="Digite sua mensagem..."
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                inputProps={{ "aria-label": "edit message" }}
              />
            </Box>
            <IconButton 
              className={classes.saveButton}
              onClick={() => handleSave(editedMessage)}
            >
              <CheckCircle size={20} />
            </IconButton>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditMessageModal;