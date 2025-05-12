import { useMediaQuery } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastErrorBoundary from "./components/ToastErrorBoundary";
import { AuthProvider } from "./context/Auth/AuthContext";
import {
  SocketContext,
  SocketManager,
  SocketProvider,
} from "./context/Socket/SocketContext";
import { WhatsAppsProvider } from "./context/WhatsApp/WhatsAppsContext";
import ColorModeContext from "./layout/themeContext";
import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(
    preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
  );

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = createTheme(
    {
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#5D3FD3",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(93, 63, 211, 0.05)",
        },
      },
      scrollbarStylesSoft: {
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#5D3FD3",
          borderRadius: "2px",
          opacity: 0.7,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(93, 63, 211, 0.05)",
        },
      },
      palette: {
        type: mode,
        primary: { main: mode === "light" ? "#5D3FD3" : "#FFFFFF" },
        textPrimary: mode === "light" ? "#5D3FD3" : "#FFFFFF",
        borderPrimary: mode === "light" ? "#5D3FD3" : "#FFFFFF",
        dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
        light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
        tabHeaderBackground: mode === "light" ? "#EEE" : "#666",
        optionsBackground: mode === "light" ? "#fafafa" : "#333",
        options: mode === "light" ? "#fafafa" : "#666",
        fontecor: mode === "light" ? "#5D3FD3" : "#fff",
        fancyBackground: mode === "light" ? "#fafafa" : "#333",
        bordabox: mode === "light" ? "#eee" : "#333",
        newmessagebox: mode === "light" ? "#eee" : "#333",
        inputdigita: mode === "light" ? "#fff" : "#666",
        contactdrawer: mode === "light" ? "#fff" : "#666",
        announcements: mode === "light" ? "#ededed" : "#333",
        login: mode === "light" ? "#fff" : "#1C1C1C",
        announcementspopover: mode === "light" ? "#fff" : "#666",
        chatlist: mode === "light" ? "#eee" : "#666",
        boxlist: mode === "light" ? "#ededed" : "#666",
        boxchatlist: mode === "light" ? "#ededed" : "#333",
        total: mode === "light" ? "#fff" : "#222",
        messageIcons: mode === "light" ? "grey" : "#F3F3F3",
        inputBackground: mode === "light" ? "#FFFFFF" : "#333",
        barraSuperior:
          mode === "light"
            ? "linear-gradient(to right, #5D3FD3, #5D3FD3 , #5D3FD3)"
            : "#666",
        boxticket: mode === "light" ? "#EEE" : "#666",
        campaigntab: mode === "light" ? "#ededed" : "#666",
        mediainput: mode === "light" ? "#ededed" : "#1c1c1c",
      },
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  return (
    <ErrorBoundary>
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <SocketProvider>
              <AuthProvider>
                <WhatsAppsProvider>
                  <SocketContext.Provider value={SocketManager}>
                    <BrowserRouter>
                      <Routes />
                    </BrowserRouter>
                  </SocketContext.Provider>
                </WhatsAppsProvider>
              </AuthProvider>
            </SocketProvider>
            <ToastErrorBoundary />
          </QueryClientProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
