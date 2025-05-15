import {
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import {
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  People as PeopleIcon,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import TableRowSkeleton from "../../components/TableRowSkeleton";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  contactListCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(93,63,211,0.10)",
    padding: theme.spacing(3),
    margin: "0 auto",
    transition: "all 0.3s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 160,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(93,63,211,0.15)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing(2),
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: "#5D3FD3",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardContacts: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#666",
    fontWeight: 600,
    fontSize: 16,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: theme.spacing(2),
  },
  actionButton: {
    color: "#666",
    "&:hover": {
      background: "rgba(93,63,211,0.1)",
      color: "#5D3FD3",
    },
  },
  deleteButton: {
    color: "#ff4d4f",
    "&:hover": {
      background: "rgba(255,77,79,0.1)",
    },
  },
}));

function ContactListsTable(props) {
  const {
    contactLists,
    showLoading,
    editContactList,
    deleteContactList,
    readOnly,
  } = props;
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    if (Array.isArray(contactLists)) {
      setRows(contactLists);
    }
    if (showLoading !== undefined) {
      setLoading(showLoading);
    }
  }, [contactLists, showLoading]);

  const handleEdit = (contactList) => {
    editContactList(contactList);
  };

  const handleDelete = (contactList) => {
    deleteContactList(contactList);
  };

  const renderCards = () => {
    return rows.map((contactList) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={contactList.id}>
        <Card className={classes.contactListCard} elevation={0}>
          <div className={classes.cardHeader}>
            <Typography className={classes.cardTitle}>
              {contactList.name}
            </Typography>
            <div className={classes.cardContacts}>
              <PeopleIcon style={{ color: "#5D3FD3" }} />
              {contactList.contactsCount || 0}
            </div>
          </div>
          <CardContent style={{ padding: 0 }}>
            {/* Espaço para descrição ou outras infos futuramente */}
          </CardContent>
          {!readOnly && (
            <div className={classes.cardActions}>
              <IconButton
                size="small"
                onClick={() => handleEdit(contactList)}
                title="Editar Lista"
                className={classes.actionButton}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(contactList)}
                title="Excluir Lista"
                className={classes.deleteButton}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          )}
        </Card>
      </Grid>
    ));
  };

  return (
    <Grid container spacing={3} className={classes.cardGrid}>
      {loading ? (
        <Grid item xs={12}>
          <TableRowSkeleton columns={readOnly ? 2 : 3} />
        </Grid>
      ) : (
        renderCards()
      )}
    </Grid>
  );
}

ContactListsTable.propTypes = {
  contactLists: PropTypes.array.isRequired,
  showLoading: PropTypes.bool,
  editContactList: PropTypes.func.isRequired,
  deleteContactList: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default ContactListsTable;
