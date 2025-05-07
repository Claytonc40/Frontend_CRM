import React, { useState, useEffect, useReducer, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Card, CardContent, Typography, Button, CircularProgress, Box, Chip, Avatar, Tooltip } from "@material-ui/core";
import { User, MessageSquare, Phone, Eye } from 'lucide-react';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    background: "#f7f8fa",
    minHeight: "100vh",
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  kanbanColumn: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(93,63,211,0.07)",
    margin: theme.spacing(1),
    minWidth: 320,
    maxWidth: 370,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  kanbanHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 1, 2),
    borderBottom: '1px solid #eee',
    background: 'rgba(93,63,211,0.04)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  kanbanTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: '#5D3FD3',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  kanbanBadge: {
    background: '#5D3FD3',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 12,
    fontSize: 13,
    padding: '2px 10px',
  },
  kanbanCard: {
    margin: theme.spacing(2, 2, 1, 2),
    borderRadius: 10,
    boxShadow: '0 1px 6px rgba(93,63,211,0.08)',
    background: '#fafbfc',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(93,63,211,0.13)',
    },
  },
  cardContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 16,
    color: '#222',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#555',
    fontSize: 14,
  },
  cardButton: {
    marginTop: theme.spacing(1),
    background: '#5D3FD3',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 8,
    textTransform: 'none',
    '&:hover': {
      background: '#4930A8',
    },
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tagChip: {
    marginTop: theme.spacing(1),
    background: '#5D3FD3',
    color: '#fff',
    fontWeight: 500,
  },
  loadingBox: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [tags, setTags] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState({ lanes: [] });
  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);
  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      await fetchTickets(jsonString);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Erro ao buscar tags do Kanban');
    }
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async (jsonString) => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      setTickets([]);
      toast.error('Erro ao buscar tickets do Kanban');
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);
    const lanes = [
      {
        id: "lane0",
        title: i18n.t("Em aberto"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => kanbanCard(ticket)),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });
        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets.length.toString(),
          cards: filteredTickets.map(ticket => kanbanCard(ticket, tag)),
          style: { backgroundColor: tag.color, color: "white" }
        };
      }),
    ];
    setFile({ lanes });
  };

  const kanbanCard = (ticket, tag) => ({
    id: ticket.id.toString(),
    label: `Ticket nº ${ticket.id}`,
    description: (
      <Card className={classes.kanbanCard} elevation={0}>
        <CardContent className={classes.cardContent}>
          <div className={classes.cardTitle}>
            <User size={16} /> {ticket.contact.name}
          </div>
          <div className={classes.cardInfo}>
            <Phone size={15} /> {ticket.contact.number}
          </div>
          <div className={classes.cardInfo}>
            <MessageSquare size={15} />
            <Tooltip title={ticket.lastMessage || ''} arrow>
              <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {ticket.lastMessage ? (ticket.lastMessage.length > 40 ? ticket.lastMessage.substring(0, 40) + '...' : ticket.lastMessage) : 'Sem mensagem'}
              </span>
            </Tooltip>
          </div>
          {tag && (
            <Chip label={tag.name} className={classes.tagChip} size="small" />
          )}
          <Button
            className={classes.cardButton}
            onClick={() => handleCardClick(ticket.uuid)}
            startIcon={<Eye size={18} />}
            fullWidth
          >
            Ver Ticket
          </Button>
        </CardContent>
      </Card>
    ),
    title: ticket.contact.name,
    draggable: true,
    href: "/tickets/" + ticket.uuid,
  });

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
    // eslint-disable-next-line
  }, [tags, tickets, reloadData]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
    } catch (err) {
      toast.error('Erro ao mover o ticket!');
    }
  };

  if (loading) {
    return (
      <Box className={classes.loadingBox}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <Board
        data={file}
        onCardMoveAcrossLanes={handleCardMove}
        style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
        components={{
          LaneHeader: ({ title, label }) => (
            <div className={classes.kanbanHeader}>
              <span className={classes.kanbanTitle}>{title}</span>
              <span className={classes.kanbanBadge}>{label}</span>
            </div>
          ),
        }}
        draggable
        laneStyle={{
          borderRadius: 12,
          margin: 8,
          minWidth: 320,
          maxWidth: 370,
          background: '#fff',
          boxShadow: '0 2px 12px rgba(93,63,211,0.07)',
        }}
        cardStyle={{
          borderRadius: 10,
          background: '#fafbfc',
          boxShadow: '0 1px 6px rgba(93,63,211,0.08)',
        }}
      />
    </div>
  );
};

export default Kanban;
