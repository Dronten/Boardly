import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/lib/api";

function PublicRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get("/user/check-auth");
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <p className="p-6">Loading...</p>;
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default PublicRoute;
