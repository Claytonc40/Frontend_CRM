import { has, isArray } from "lodash";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { toast } from "sonner";

import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          config.headers["Authorization"] = `Bearer ${parsedToken}`;
          setIsAuth(true);
        } catch (err) {
          console.error("Erro ao processar token:", err);
          localStorage.removeItem("token");
          setIsAuth(false);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Tenta refresh token para erros 401 (token expirado) ou 403 (sem permissão)
      if ((error?.response?.status === 401 || error?.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Não tenta refresh se a requisição original já era para refresh_token
        if (originalRequest.url?.includes('/auth/refresh_token')) {
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("userId");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
          if (isMounted) {
            history.push("/login");
          }
          return Promise.reject(error);
        }

        try {
          console.log("Tentando refresh token...");
          console.log("URL da API:", process.env.REACT_APP_BACKEND_URL);
          console.log("Cookies disponíveis:", document.cookie);
          
          // Remove o header Authorization para a chamada de refresh token
          // O refresh token deve vir do cookie, não do header
          const refreshRequest = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: undefined
            }
          };
          
          const { data } = await api.post("/auth/refresh_token", {}, {
            headers: {
              Authorization: undefined // Remove o token expirado do header
            }
          });
          
          if (data?.token) {
            console.log("Token renovado com sucesso");
            const tokenString = JSON.stringify(data.token);
            localStorage.setItem("token", tokenString);
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Erro ao atualizar token:", refreshError);
          console.error("Status do erro:", refreshError.response?.status);
          console.error("Dados do erro:", refreshError.response?.data);
          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("userId");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
          if (isMounted) {
            history.push("/login");
          }
        }
      }

      // Se não conseguiu fazer refresh ou não é erro de autenticação
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        localStorage.removeItem("userId");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
        if (isMounted) {
          history.push("/login");
        }
      }

      return Promise.reject(error);
    },
  );

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          if (data?.token) {
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            if (isMounted) {
              setIsAuth(true);
              setUser(data.user);
            }
          }
        } catch (err) {
          console.error("Erro ao atualizar token:", err);
          if (isMounted) {
            toast.error("Sessão expirada. Por favor, faça login novamente.");
            history.push("/login");
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    })();
  }, [isMounted, history]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId && socketManager) {
      const socket = socketManager.getSocket(companyId);
      if (socket) {
        const handleUserUpdate = (data) => {
          if (
            data.action === "update" &&
            data.user.id === user.id &&
            isMounted
          ) {
            setUser(data.user);
          }
        };

        socket.on(`company-${companyId}-user`, handleUserUpdate);

        return () => {
          socket.off(`company-${companyId}-user`, handleUserUpdate);
        };
      }
    }
  }, [socketManager, user, isMounted]);

  const handleLogin = async (userData) => {
    if (!isMounted) return;
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      const {
        user: { companyId, id, company },
      } = data;

      if (has(company, "settings") && isArray(company.settings)) {
        const setting = company.settings.find(
          (s) => s.key === "campaignsEnabled",
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", "true");
        }
      }

      moment.locale("pt-br");
      const dueDate = data.user.company.dueDate;
      const vencimento = moment(dueDate).format("DD/MM/yyyy");

      const diff = moment(dueDate).diff(moment(moment()).format());
      const before = moment(moment().format()).isBefore(dueDate);
      const dias = moment.duration(diff).asDays();

      if (before === true) {
        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("companyId", companyId);
        localStorage.setItem("userId", id);
        localStorage.setItem("companyDueDate", vencimento);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;

        if (isMounted) {
          setUser(data.user);
          setIsAuth(true);
          toast.success(i18n.t("auth.toasts.success"));
          if (Math.round(dias) < 5) {
            toast.warn(
              `Sua assinatura vence em ${Math.round(dias)} ${
                Math.round(dias) === 1 ? "dia" : "dias"
              }`,
            );
          }
          history.push("/tickets");
        }
      } else {
        if (isMounted) {
          toast.error(
            `Opss! Sua assinatura venceu ${vencimento}. Entre em contato com o Suporte para mais informações!`,
          );
        }
      }
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.error || "Erro ao fazer login");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    if (!isMounted) return;
    setLoading(true);

    try {
      await api.delete("/auth/logout");
      if (isMounted) {
        setIsAuth(false);
        setUser({});
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        localStorage.removeItem("userId");
        localStorage.removeItem("cshow");
        api.defaults.headers.Authorization = undefined;
        history.push("/login");
      }
    } catch (err) {
      if (isMounted) {
        toast.error(err.response?.data?.error || "Erro ao fazer logout");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      if (isMounted) {
        toast.error(
          err.response?.data?.error || "Erro ao obter informações do usuário",
        );
      }
      return null;
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;
