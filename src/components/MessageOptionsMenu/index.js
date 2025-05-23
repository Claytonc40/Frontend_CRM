import React, { useContext, useState } from "react";

import { Menu } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import { toast } from "sonner";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../ConfirmationModal";
import EditMessageModal from "../EditMessageModal";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationEditOpen, setEditMessageOpenModal] = useState(false);

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toast.errorr(err.message);
    }
  };

  const handleEditMessage = async () => {
    try {
      await api.put(`/messages/${message.id}`);
    } catch (err) {
      toast.errorr(err.message);
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenEditMessageModal = (e) => {
    setEditMessageOpenModal(true);
    handleClose();
  };

  return (
    <>
      <ConfirmationModal
        title={i18n.t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <EditMessageModal
        title={i18n.t("messageOptionsMenu.editMessageModal.title")}
        open={confirmationEditOpen}
        onClose={setEditMessageOpenModal}
        onSave={handleEditMessage}
        message={message}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </EditMessageModal>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {message.fromMe && (
          <MenuItem onClick={handleOpenEditMessageModal}>
            {i18n.t("messageOptionsMenu.edit")}
          </MenuItem>
        )}
        {message.fromMe && (
          <MenuItem onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>
        )}
        <MenuItem onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
