import api from "@/lib/api";

export const createCard = async (listId, title, description) => {
    const response = await api.post(`/card/${listId}`, {
        title,
        description,
    });
    return response.data;
}

export const updateCard = async (listId, cardId, title, description) => {
    const response = await api.patch(`/card/${listId}/${cardId}`, {
        title,
        description,
    });
    return response.data;
}

export const deleteCard = async (listId, cardId) => {
    const response = await api.delete(`/card/${listId}/${cardId}`);
    return response.data;
}

export const moveCard = async (sourceListId, cardId, destinationListId, newOrder) => {
    const response = await api.patch(
        `/card/${sourceListId}/${cardId}/move`,
        { destinationListId, order: newOrder },
    );
    return response.data;
}