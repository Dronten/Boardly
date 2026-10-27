import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";

function Board() {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
    const [editedBoardTitle, setEditedBoardTitle] = useState("");

    // List form state
    const [newListTitle, setNewListTitle] = useState("");
    const [editingListId, setEditingListId] = useState(null);
    const [editingListTitle, setEditingListTitle] = useState("");
    const [listSubmitting, setListSubmitting] = useState(false);

    // Card form state
    const [newCardListId, setNewCardListId] = useState(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [newCardDescription, setNewCardDescription] = useState("");

    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDescription, setEditingCardDescription] = useState("");

    const [cardSubmitting, setCardSubmitting] = useState(false);

    // Shared message for list and card actions
    const [actionError, setActionError] = useState("");

    // Load the board, its lists, and its cards
    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/board/${boardId}`);

                if (response.data.success) {
                    setBoard(response.data.board);
                    setLists(response.data.lists);
                    setCards(response.data.cards);
                } else {
                    setError(
                        response.data.message ||
                            "Failed to load Board. Please try again",
                    );
                }
            } catch (error) {
                setError(
                    error.response?.data?.message || "Unable to load board.",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [boardId]);

    const handleUpdateBoardTitle = async (e) => {
        e.preventDefault();
        setActionError("");

        const title = editedBoardTitle.trim();

        if (!title) return;

        try {
            const response = await api.patch(`/board/${boardId}`, { title });

            setBoard(response.data.board);
            setIsEditingBoardTitle(false);
        } catch (error) {}
    };

    // Create a list
    const handleCreateList = async (e) => {
        e.preventDefault();

        const title = newListTitle.trim();

        if (!title || listSubmitting) return;

        setListSubmitting(true);
        setActionError("");

        try {
            const response = await api.post(`/list/${boardId}`, { title });

            setLists((prev) =>
                [...prev, response.data.list].sort((a, b) => a.order - b.order),
            );

            setNewListTitle("");
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to create list.",
            );
        } finally {
            setListSubmitting(false);
        }
    };

    // Edit list title
    const handleUpdateList = async (listId) => {
        const title = editingListTitle.trim();

        if (!title || listSubmitting) return;

        setListSubmitting(true);
        setActionError("");

        try {
            const response = await api.patch(`/list/${boardId}/${listId}`, {
                title,
            });

            setLists((prev) =>
                prev.map((list) =>
                    list._id === listId ? response.data.list : list,
                ),
            );

            setEditingListId(null);
            setEditingListTitle("");
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to update list.",
            );
        } finally {
            setListSubmitting(false);
        }
    };

    // Delete list and its cards
    const handleDeleteList = async (listId) => {
        if (listSubmitting) return;

        const confirmed = window.confirm(
            "Delete this list and all cards inside it?",
        );

        if (!confirmed) return;

        setListSubmitting(true);
        setActionError("");

        try {
            await api.delete(`/list/${boardId}/${listId}`);

            setLists((prev) => prev.filter((list) => list._id !== listId));

            setCards((prev) => prev.filter((card) => card.listId !== listId));
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to delete list.",
            );
        } finally {
            setListSubmitting(false);
        }
    };

    const handleCreateCard = async (e, listId) => {
        e.preventDefault();

        const title = newCardTitle.trim();
        const description = newCardDescription.trim();

        if (!title || cardSubmitting) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            const response = await api.post(`/card/${listId}`, {
                title,
                description,
            });

            setCards((prev) => [...prev, response.data.card]);

            setNewCardTitle("");
            setNewCardDescription("");
            setNewCardListId(null);
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to create card.",
            );
        } finally {
            setCardSubmitting(false);
        }
    };

    const handleUpdateCard = async (listId, cardId) => {
        const title = editingCardTitle.trim();
        const description = editingCardDescription.trim();

        if (!title || cardSubmitting) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            const response = await api.patch(`/card/${listId}/${cardId}`, {
                title,
                description,
            });

            setCards((prev) =>
                prev.map((card) =>
                    card._id === cardId ? response.data.card : card,
                ),
            );

            setEditingCardId(null);
            setEditingCardTitle("");
            setEditingCardDescription("");
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to update card.",
            );
        } finally {
            setCardSubmitting(false);
        }
    };

    const handleDeleteCard = async (listId, cardId) => {
        if (cardSubmitting) return;

        const confirmed = window.confirm("Delete this card?");
        if (!confirmed) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            await api.delete(`/card/${listId}/${cardId}`);

            setCards((prev) => prev.filter((card) => card._id !== cardId));
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to delete card.",
            );
        } finally {
            setCardSubmitting(false);
        }
    };

    if (loading) {
        return <p className="p-8">Loading Board...</p>;
    }

    if (error) {
        return (
            <div className="p-8">
                <p role="alert" className="text-red-600">
                    {error}
                </p>
                <button
                    onClick={() => navigate("/home")}
                    className="mt-4 underline cursor-pointer"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    if (!board) {
        return <p className="p-8">Board not found.</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <button
                onClick={() => navigate("/home")}
                className="mb-6 text-sm text-gray-600 cursor-pointer hover:underline"
            >
                Back to Home
            </button>
            {isEditingBoardTitle ? (
                <form
                    onSubmit={handleUpdateBoardTitle}
                    className="mb-6 flex gap-2"
                >
                    <input
                        value={editedBoardTitle}
                        onChange={(e) => setEditedBoardTitle(e.target.value)}
                        className="rounded-lg border p-2"
                        placeholder="Board title"
                        required
                        autoFocus
                    />

                    <button
                        type="submit"
                        className="rounded-lg border px-3 py-2"
                    >
                        Save
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg border px-3 py-2"
                        onClick={() => setIsEditingBoardTitle(false)}
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <div className="mb-6 flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {board.title}
                    </h1>

                    <button
                        type="button"
                        className="rounded-lg border px-3 py-2"
                        onClick={() => {
                            setEditedBoardTitle(board.title);
                            setIsEditingBoardTitle(true);
                        }}
                    >
                        Edit
                    </button>
                </div>
            )}

            <form onSubmit={handleCreateList} className="mt-6 flex gap-3">
                <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter a new list title"
                    maxLength={100}
                    aria-label="New list title"
                    className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                    type="submit"
                    disabled={listSubmitting || !newListTitle.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {listSubmitting ? "Creating..." : "Add List"}
                </button>
            </form>

            {actionError && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    {actionError}
                </p>
            )}

            <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
                {lists.map((list) => (
                    <div
                        key={list._id}
                        className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        {editingListId === list._id ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateList(list._id);
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    autoFocus
                                    value={editingListTitle}
                                    onChange={(e) =>
                                        setEditingListTitle(e.target.value)
                                    }
                                    maxLength={100}
                                    aria-label="Edit list title"
                                    className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-gray-900"
                                />
                                <button
                                    type="submit"
                                    disabled={
                                        listSubmitting ||
                                        !editingListTitle.trim()
                                    }
                                    className="text-sm font-medium text-blue-600 disabled:opacity-50"
                                >
                                    Save
                                </button>

                                <button
                                    type="button"
                                    disabled={listSubmitting}
                                    onClick={() => {
                                        setEditingListId(null);
                                        setEditingListTitle("");
                                    }}
                                    className="text-sm text-gray-500"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="font-semibold text-gray-900">
                                    {list.title}
                                </h2>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        disabled={listSubmitting}
                                        onClick={() => {
                                            setEditingListId(list._id);
                                            setEditingListTitle(list.title);
                                            setActionError("");
                                        }}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        disabled={listSubmitting}
                                        onClick={() =>
                                            handleDeleteList(list._id)
                                        }
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 space-y-3">
                            {cards
                                .filter((card) => card.listId === list._id)
                                .sort((a, b) => a.order - b.order)
                                .map((card) => (
                                    <div
                                        key={card._id}
                                        className="rounded-md border p-3"
                                    >
                                        {editingCardId === card._id ? (
                                            <div className="space-y-2">
                                                <input
                                                    value={editingCardTitle}
                                                    onChange={(e) =>
                                                        setEditingCardTitle(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Card title"
                                                    className="w-full rounded border p-2"
                                                />
                                                <textarea
                                                    value={
                                                        editingCardDescription
                                                    }
                                                    onChange={(e) =>
                                                        setEditingCardDescription(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Description"
                                                    className="w-full rounded border p-2"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={cardSubmitting}
                                                    onClick={() =>
                                                        handleUpdateCard(
                                                            list._id,
                                                            card._id,
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCardId(null);
                                                        setEditingCardTitle("");
                                                        setEditingCardDescription(
                                                            "",
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="font-medium">
                                                    {card.title}
                                                </h3>
                                                {card.description && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {card.description}
                                                    </p>
                                                )}

                                                <div className="mt-3 flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCardId(
                                                                card._id,
                                                            );
                                                            setEditingCardTitle(
                                                                card.title,
                                                            );
                                                            setEditingCardDescription(
                                                                card.description ||
                                                                    "",
                                                            );
                                                        }}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            cardSubmitting
                                                        }
                                                        onClick={() =>
                                                            handleDeleteCard(
                                                                list._id,
                                                                card._id,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>
                        {newCardListId === list._id ? (
                            <form
                                onSubmit={(e) => handleCreateCard(e, list._id)}
                                className="mt-3 w-full space-y-2"
                            >
                                <input
                                    value={newCardTitle}
                                    onChange={(e) =>
                                        setNewCardTitle(e.target.value)
                                    }
                                    placeholder="Card Title"
                                    className="w-full rounded-lg border p-2"
                                    required
                                />

                                <textarea
                                    value={newCardDescription}
                                    onChange={(e) =>
                                        setNewCardDescription(e.target.value)
                                    }
                                    placeholder="Description (optional)"
                                    className="w-full rounded-lg border p-2"
                                />

                                <button
                                    type="submit"
                                    disabled={cardSubmitting}
                                    className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                                >
                                    {cardSubmitting ? "Adding..." : "Add Card"}
                                </button>

                                <button
                                    type="button"
                                    className="w-full rounded-lg border px-3 py-2"
                                    onClick={() => {
                                        setNewCardListId(null);
                                        setNewCardTitle("");
                                        setNewCardDescription("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                className="mt-3 w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
                                onClick={() => {
                                    setNewCardListId(list._id);
                                    setNewCardTitle("");
                                    setNewCardDescription("");
                                }}
                            >
                                + Add Card
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Board;
