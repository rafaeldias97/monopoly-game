import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
