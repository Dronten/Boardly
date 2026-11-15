import api from "@/lib/api";

export const getBoard = async (boardId) => {
    const response = await api.get(`/board/${boardId}`);
    return response.data;
}

export const updateBoardTitle = async (boardId, title) => {
    const response = await api.patch(`/board/${boardId}`, { title });
    return response.data;
}

export const deleteBoard = async (boardId) => {
    const response = await api.delete(`/board/${boardId}`);
    return response.data;
}