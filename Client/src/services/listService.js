import api from "@/lib/api";

export const createList = async (boardId, title) => {
    const response = await api.post(`/list/${boardId}`, { title });
    return response.data;
}

export const editListTitle = async (boardId, listId, title) => {
    const response = await api.patch(`/list/${boardId}/${listId}`, {
        title,
    });
    return response.data;
}

export const deleteList = async (boardId, listId) => {
    const response = await api.delete(`/list/${boardId}/${listId}`);
    return response.data;
}