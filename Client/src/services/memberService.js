import api from "@/lib/api";

export const getMembers = async (boardId) => {
    const response = await api.get(`/board/${boardId}/memberslist`);
    return response.data;
}

export const addMember = async (boardId, email) => {
    const response = await api.post(`/board/${boardId}/members`, {
        email,
    });
    return response.data;
}

export const removeMember = async (boardId, userId) => {
    const response = await api.delete(
        `/board/${boardId}/members/${userId}`,
    );
    return response.data;
}