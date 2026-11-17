import api from "@/lib/api";

export const checkAuth = async () => {
    const response = await api.get("/user/check-auth");
    return response.data;
}