import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Salas from "./pages/Salas";
import SalaDetalhes from "./pages/SalaDetalhes";
import Banco from "./pages/Banco";
import ExtratoPartida from "./pages/ExtratoPartida";
import { storage } from "./services/storage";
import UpdateButton from "./components/shared/UpdateButton";
import "./App.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken();
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  // Restaurar token ao inicializar o app
  useEffect(() => {
    // Forçar restauração do backup na inicialização
    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user) {
      // Tentar restaurar do backup
      console.log(
        "Token ou usuário não encontrado, tentando restaurar do backup..."
      );
      // O storage.getToken() já faz a restauração automaticamente
      // Mas vamos forçar uma verificação
      const restoredToken = storage.getToken();
      if (restoredToken) {
        console.log("Token restaurado com sucesso!");
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <UpdateButton />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/salas"
          element={
            <PrivateRoute>
              <Salas />
            </PrivateRoute>
          }
        />
        <Route
          path="/sala/:id"
          element={
            <PrivateRoute>
              <SalaDetalhes />
            </PrivateRoute>
          }
        />
        <Route
          path="/banco/:id"
          element={
            <PrivateRoute>
              <Banco />
            </PrivateRoute>
          }
        />
        <Route
          path="/extrato/:id"
          element={
            <PrivateRoute>
              <ExtratoPartida />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
