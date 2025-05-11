import { useEffect, useState } from "react";
import { toast } from "sonner";

import api from "../../services/api";

const useTickets = ({
  searchParam,
  tags,
  users,
  pageNumber,
  status,
  date,
  updatedAt,
  showAll,
  queueIds,
  withUnreadMessages,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTickets = async () => {
        try {
          const { data } = await api.get("/tickets", {
            params: {
              searchParam,
              pageNumber,
              tags,
              users,
              status,
              date,
              updatedAt,
              showAll,
              queueIds,
              withUnreadMessages,
            },
          });
          setTickets(data.tickets);
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toast.error(err.message);
        }
      };
      fetchTickets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    tags,
    users,
    pageNumber,
    status,
    date,
    updatedAt,
    showAll,
    queueIds,
    withUnreadMessages,
  ]);

  return { tickets, loading, hasMore };
};

export default useTickets;
