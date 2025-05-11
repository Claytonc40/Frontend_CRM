import React, { useContext, useEffect, useRef, useState } from "react";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import { toast } from "sonner";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";

import { makeStyles } from "@material-ui/core/styles";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ScheduleIcon from "@material-ui/icons/Schedule";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    borderRadius: 14,
    boxShadow: "0 4px 24px rgba(93,63,211,0.10)",
    minWidth: 220,
    padding: 0,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 600,
    fontSize: 15,
    padding: "12px 20px",
    borderRadius: 10,
    margin: "4px 8px",
    transition: "background 0.2s",
    "&:hover": {
      background: "#f3f0fa",
    },
  },
  iconSchedule: {
    color: "#5D3FD3",
    fontSize: 22,
  },
  iconTransfer: {
    color: "#1976d2",
    fontSize: 22,
  },
  iconDelete: {
    color: "#e53935",
    fontSize: 22,
  },
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toast.errorr(err.message);
    }
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleOpenScheduleModal = () => {
    handleClose();
    setContactId(ticket.contact.id);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setContactId(null);
  };

  return (
    <>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
        PaperProps={{ className: classes.menuPaper }}
      >
        <MenuItem
          onClick={handleOpenScheduleModal}
          className={classes.menuItem}
        >
          <ScheduleIcon className={classes.iconSchedule} />
          {i18n.t("ticketOptionsMenu.schedule")}
        </MenuItem>
        <MenuItem
          onClick={handleOpenTransferModal}
          className={classes.menuItem}
        >
          <SwapHorizIcon className={classes.iconTransfer} />
          {i18n.t("ticketOptionsMenu.transfer")}
        </MenuItem>
        <Can
          role={user.profile}
          perform="ticket-options:deleteTicket"
          yes={() => (
            <MenuItem
              onClick={handleOpenConfirmationModal}
              className={classes.menuItem}
            >
              <DeleteOutlineIcon className={classes.iconDelete} />
              {i18n.t("ticketOptionsMenu.delete")}
            </MenuItem>
          )}
        />
      </Menu>
      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
          ticket.id
        } ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
          ticket.contact.name
        }?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        aria-labelledby="form-dialog-title"
        contactId={contactId}
      />
    </>
  );
};

export default TicketOptionsMenu;