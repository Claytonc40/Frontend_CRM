import { useEffect, useState } from "react";

import api from "../../services/api";

const useUsers = () => {
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users", {
            params: {},
          });
          setUsers(data.users);
          setHasMore(data.hasMore);
          setCount(data.count);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toast.error(err.message);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  return { users, loading, hasMore, count };
};

export default useUsers;
