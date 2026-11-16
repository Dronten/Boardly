import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import Board from "@/pages/Board";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/board/:boardId"
                    element={
                        <ProtectedRoute>
                            <Board />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Navigate to="/signup/" replace />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
