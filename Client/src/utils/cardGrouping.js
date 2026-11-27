export const groupCardsByList = (cards, lists) => {
    const groupedCards = {};

    //Create an empty group for every list,
    //including lists that currently are empty
    lists.forEach((list) => {
        groupedCards[String(list._id)] = [];
    });

    //Put every card into its corresponding list.
    cards.forEach((card) => {
        const listId = String(card.listId);

        if (!groupedCards[listId]) {
            groupedCards[listId] = [];
        }

        groupedCards[listId].push({
            id: String(card._id),
            card,
        });
    });

    //Keep cards in their existing order
    Object.values(groupedCards).forEach((listCards) => {
        listCards.sort((a, b) => a.card.order - b.card.order);
    });
    return groupedCards;
};

export const flattenGroupedCards = (groupedCards) => {
    return Object.entries(groupedCards).flatMap(([listId, listCards]) =>
        listCards.map((item, index) => ({
            ...item.card,
            listId,
            order: index,
        })),
    );
};