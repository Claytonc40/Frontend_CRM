import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { CreditCard, Receipt, CheckCircle2, XCircle, Clock, ArrowRightCircle, Calendar, DollarSign, Hash } from 'lucide-react';
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #f7f8fa 60%, #e5e0fa 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(0, 0, 6, 0),
  },
  card: {
    maxWidth: 1100,
    width: '100%',
    margin: '0 auto',
    background: '#fff',
    borderRadius: 22,
    boxShadow: '0 4px 32px rgba(93,63,211,0.10)',
    padding: theme.spacing(3, 2, 2, 2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1, 0.5, 1, 0.5),
      borderRadius: 12,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
  title: {
    fontWeight: 700,
    fontSize: 26,
    color: '#5D3FD3',
    letterSpacing: 0.2,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  desc: {
    color: '#888',
    fontSize: 16,
    fontWeight: 400,
    marginLeft: 2,
    marginTop: 2,
  },
  invoiceCard: {
    background: '#fff',
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(93,63,211,0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #f0f0f0',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(93,63,211,0.15)',
    },
  },
  invoiceCardVencido: {
    background: '#fff5f5',
    border: '1px solid #ffebee',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  invoiceId: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    background: '#f8f7ff',
    padding: '6px 14px',
    borderRadius: 12,
  },
  invoiceValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#5D3FD3',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing(1),
  },
  invoiceDetail: {
    color: '#444',
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 500,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: '#f8f7ff',
    borderRadius: 12,
    flex: 1,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: theme.spacing(2),
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#666',
    fontSize: 14,
    padding: '10px 16px',
    background: '#f8f7ff',
    borderRadius: 12,
    '& svg': {
      color: '#5D3FD3',
    },
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: 14,
    boxShadow: '0 2px 8px rgba(93,63,211,0.08)',
  },
  badgePago: {
    background: '#e6fbe6',
    color: '#2e7d32',
  },
  badgeVencido: {
    background: '#ffebee',
    color: '#c62828',
  },
  badgeAberto: {
    background: '#e3e6fd',
    color: '#5D3FD3',
  },
  actionSection: {
    marginTop: 'auto',
    paddingTop: theme.spacing(2),
  },
  payButton: {
    borderRadius: 16,
    fontWeight: 600,
    fontSize: 16,
    padding: '12px 24px',
    textTransform: 'none',
    background: 'linear-gradient(90deg, #5D3FD3 0%, #7B68EE 100%)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(93,63,211,0.15)',
    transition: 'all 0.2s',
    '&:hover': {
      background: 'linear-gradient(90deg, #4930A8 0%, #6A5ACD 100%)',
      boxShadow: '0 6px 16px rgba(93,63,211,0.25)',
    },
    width: '100%',
  },
  paidButton: {
    borderRadius: 16,
    fontWeight: 600,
    fontSize: 16,
    padding: '12px 24px',
    textTransform: 'none',
    background: '#e6fbe6',
    color: '#2e7d32',
    boxShadow: '0 2px 8px rgba(46,125,50,0.08)',
    width: '100%',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    color: '#888',
    gap: 12,
    background: '#fff',
    borderRadius: 12,
    margin: theme.spacing(4, 0),
    boxShadow: '0 1px 6px rgba(93,63,211,0.06)',
  },
  gridContainer: {
    marginTop: theme.spacing(2),
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Invoices = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);


  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };


  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);


  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  const rowStyle = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    if (dias < 0 && record.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    const status = record.status;
    if (status === "paid") {
      return { label: "Pago", badge: classes.badgePago, icon: <CheckCircle2 size={16} /> };
    }
    if (dias < 0) {
      return { label: "Vencido", badge: classes.badgeVencido, icon: <XCircle size={16} /> };
    } else {
      return { label: "Em Aberto", badge: classes.badgeAberto, icon: <Clock size={16} /> };
    }
  };

  return (
    <div className={classes.mainWrapper}>
      <MainContainer style={{ boxShadow: 'none', background: 'transparent' }}>
        <div className={classes.card}>
          <div className={classes.header}>
            <CreditCard size={36} style={{ color: '#5D3FD3' }} />
            <div>
              <div className={classes.title}>Faturas</div>
              <div className={classes.desc}>Gerencie e pague suas faturas de forma simples, rápida e segura.</div>
            </div>
          </div>
          
          {invoices.length === 0 ? (
            <Box className={classes.emptyBox}>
              <Receipt size={48} />
              <Typography variant="h6" style={{ color: '#5D3FD3', fontWeight: 600 }}>
                Nenhuma fatura encontrada
              </Typography>
              <Typography variant="body2">
                Suas faturas aparecerão aqui assim que forem geradas.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} className={classes.gridContainer}>
              {invoices.map((invoice) => {
                const statusObj = rowStatus(invoice);
                const isVencido = statusObj.label === "Vencido";
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={invoice.id}>
                    <Paper 
                      className={`${classes.invoiceCard} ${isVencido ? classes.invoiceCardVencido : ''}`}
                      elevation={0}
                    >
                      <div className={classes.cardHeader}>
                        <div className={classes.cardLeft}>
                          <div className={classes.invoiceId}>
                            <Hash size={16} />
                            #{invoice.id}
                          </div>
                          <div className={classes.invoiceValue}>
                            <DollarSign size={28} />
                            {invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        <div className={classes.cardRight}>
                          <span className={`${classes.badge} ${statusObj.badge}`}>
                            {statusObj.icon} {statusObj.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className={classes.invoiceDetail}>
                        {invoice.detail}
                      </div>
                      
                      <div className={classes.infoSection}>
                        <div className={classes.infoItem}>
                          <Calendar size={18} />
                          Vencimento: {moment(invoice.dueDate).format("DD/MM/YYYY")}
                        </div>
                      </div>
                      
                      <div className={classes.actionSection}>
                        {statusObj.label !== "Pago" ? (
                          <Button
                            variant="contained"
                            className={classes.payButton}
                            startIcon={<ArrowRightCircle size={20} />}
                            onClick={() => handleOpenContactModal(invoice)}
                          >
                            PAGAR AGORA
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            className={classes.paidButton}
                            startIcon={<CheckCircle2 size={20} />}
                            disabled
                          >
                            PAGO
                          </Button>
                        )}
                      </div>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
          
          {loading && (
            <Grid container spacing={3} className={classes.gridContainer}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <TableRowSkeleton columns={1} />
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </MainContainer>
    </div>
  );
};

export default Invoices;
