import { Box, Button, Typography } from "@material-ui/core";
import { AlertCircle } from "lucide-react";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Aqui você pode adicionar um serviço de logging de erros
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          textAlign="center"
          bgcolor="#f5f5f5"
        >
          <AlertCircle size={64} color="#f44336" />
          <Typography variant="h4" color="error" gutterBottom>
            Ops! Algo deu errado
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Desculpe pelo inconveniente. Ocorreu um erro inesperado.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            style={{ marginTop: 16 }}
          >
            Tentar Novamente
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
