import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { SortableCard, DroppableList } from "@/hooks/useDragAndDrop";
import { isSortable } from "@dnd-kit/react/sortable";

const groupCardsByList = (cards, lists) => {
    const groupedCards = {};

    // Create an empty group for every list,
    // including lists that currently are empty
    lists.forEach((list) => {
        groupedCards[String(list._id)] = [];
    });

    ///Put every card into its corresponding list.
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

    // Keep cards in their existing order
    Object.values(groupedCards).forEach((listCards) => {
        listCards.sort((a, b) => a.card.order - b.card.order);
    });
    return groupedCards;
};

const flattenGroupedCards = (groupedCards) => {
    return Object.entries(groupedCards).flatMap(([listId, listCards]) =>
        listCards.map((item, index) => ({
            ...item.card,
            listId,
            order: index,
        })),
    );
};
const Board = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
    const [editedBoardTitle, setEditedBoardTitle] = useState("");

    // Delete Board state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

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

    // Member panel state
    const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberLoading, setMemberLoading] = useState(false);
    const [memberSubmitting, setMemberSubmitting] = useState(false);
    const [memberError, setMemberError] = useState("");
    const [memberMessage, setMemberMessage] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);

    // Shared message for list and card actions
    const [actionError, setActionError] = useState("");

    const cardsRef = useRef(cards);
    const dragStartCardsRef = useRef(null);

    useEffect(() => {
        cardsRef.current = cards;
    }, [cards]);

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

    // Update Board title
    const handleUpdateBoardTitle = async (e) => {
        e.preventDefault();
        setActionError("");

        const title = editedBoardTitle.trim();

        if (!title) return;

        try {
            const response = await api.patch(`/board/${boardId}`, { title });

            setBoard(response.data.board);
            setIsEditingBoardTitle(false);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to update board title.",
            );
        }
    };

    // Delete the Board
    const handleDeleteBoard = async () => {
        if (deleteSubmitting) return;

        setDeleteSubmitting(true);
        setDeleteError("");

        try {
            await api.delete(`board/${boardId}`);

            navigate("/home");
        } catch (error) {
            setDeleteError(
                error.response?.data?.message || "Failed to delete board.",
            );
        } finally {
            setDeleteSubmitting(false);
        }
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

    // Fetch Board members
    const fetchMembers = async () => {
        setMemberLoading(true);
        setMemberError("");

        try {
            const [membersResponse, userResponse] = await Promise.all([
                api.get(`/board/${boardId}/memberslist`),
                api.get("/user/check-auth"),
            ]);
            setMembers(membersResponse.data.members);
            setCurrentUserId(userResponse.data.userId);
        } catch (error) {
            setMemberError(
                error.response?.data?.message || "Failed to fetch members.",
            );
        } finally {
            setMemberLoading(false);
        }
    };

    // Open or close the member panel
    const handleToggleMemberPanel = () => {
        if (isMemberPanelOpen) {
            setIsMemberPanelOpen(false);
            return;
        }

        setIsMemberPanelOpen(true);
        setMemberMessage("");
        fetchMembers();
    };

    // Add a member using their email
    const handleAddMember = async (e) => {
        e.preventDefault();

        const email = memberEmail.trim();

        if (!email || memberSubmitting) return;

        setMemberSubmitting(true);
        setMemberError("");
        setMemberMessage("");

        try {
            const response = await api.post(`/board/${boardId}/members`, {
                email,
            });

            setMemberEmail("");
            setMemberMessage(
                response.data.message || "Member added successfully.",
            );

            await fetchMembers();
        } catch (error) {
            setMemberError(
                error.response?.data?.message || "Failed to add member.",
            );
        } finally {
            setMemberSubmitting(false);
        }
    };

    // Remove a member
    const handleRemoveMember = async (userId) => {
        if (memberSubmitting) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove this Member?",
        );

        if (!confirmed) return;

        setMemberSubmitting(true);
        setMemberError("");
        setMemberMessage("");

        try {
            const response = await api.delete(
                `/board/${boardId}/members/${userId}`,
            );

            setMembers((prev) =>
                prev.filter(
                    (member) => String(member.userId) !== String(userId),
                ),
            );

            setMemberMessage(
                response.data.message || "Member removed Successfully.",
            );
        } catch (error) {
            setMemberError(
                error.response?.data?.message || "Failed to remove member.",
            );
        } finally {
            setMemberSubmitting(false);
        }
    };

    const isCurrentUserAdmin = members.some(
        (member) =>
            String(member.userId) === String(currentUserId) &&
            member.role === "admin",
    );

    const handleDragOver = (event) => {
        const { source } = event.operation;

        if (!isSortable(source)) return;

        // Get the latest card data.
        const currentCards = cardsRef.current;

        // Convert our flat cards into grouped lists.
        const groupedCards = groupCardsByList(currentCards, lists);

        // Let DnD Kit move the card between groups.
        const movedCards = move(groupedCards, event);

        // Convert the result back into our normal flat array.
        const nextCards = flattenGroupedCards(movedCards);

        // Update both the ref and React state.
        cardsRef.current = nextCards;
        setCards(nextCards);
    };

    const handleDragEnd = async (event) => {
        const { source, target } = event.operation;

        // State before the drag started (saved in onDragStart)
        const startCards = dragStartCardsRef.current;
        dragStartCardsRef.current = null;

        const rollback = () => {
            if (startCards) {
                cardsRef.current = startCards;
                setCards(startCards);
            }
        };

        if (event.canceled || !target || !isSortable(source) || !startCards) {
            rollback();
            return;
        }

        const cardId = String(source.id);
        const originalCard = startCards.find((c) => String(c._id) === cardId);
        const movedCard = cardsRef.current.find(
            (c) => String(c._id) === cardId,
        );

        if (!originalCard || !movedCard) {
            rollback();
            return;
        }

        const sourceListId = String(originalCard.listId);
        const destinationListId = String(movedCard.listId);
        const newOrder = movedCard.order;

        // Nothing changed
        if (
            sourceListId === destinationListId &&
            originalCard.order === newOrder
        ) {
            return;
        }

        try {
            setActionError("");

            const response = await api.patch(
                `/card/${sourceListId}/${cardId}/move`,
                { destinationListId, order: newOrder },
            );

            const updatedCards = cardsRef.current.map((card) =>
                String(card._id) === cardId
                    ? {
                          ...card,
                          ...response.data.card,
                          listId: destinationListId,
                          order: newOrder,
                      }
                    : card,
            );

            cardsRef.current = updatedCards;
            setCards(updatedCards);
        } catch (error) {
            console.error("Card movement failed:", error);
            setActionError(
                error.response?.data?.message || "Failed to move card.",
            );
            rollback();
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
                        type="button"
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

                    <button
                        type="button"
                        onClick={() => {
                            setDeleteError("");
                            setIsDeleteDialogOpen(true);
                        }}
                        className="ml-auto rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                    >
                        Delete Board
                    </button>
                </div>
            )}

            {/* Members button */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={handleToggleMemberPanel}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-100"
                >
                    {isMemberPanelOpen ? "Close Members" : "Members"}
                </button>
            </div>

            {/*Members side panel */}
            {isMemberPanelOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close members panel"
                        onClick={() => setIsMemberPanelOpen(false)}
                        className="fixed inset-0 z-40 bg-black/30"
                    />

                    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900">
                                Board Members
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsMemberPanelOpen(false)}
                                className="rounded border px-3 py-1 "
                            >
                                Close
                            </button>
                        </div>

                        {/* Add member form: admins only */}
                        {isCurrentUserAdmin && (
                            <form
                                onSubmit={handleAddMember}
                                className="mt-6 space-y-3"
                            >
                                <label
                                    htmlFor="member-email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Add member by email
                                </label>

                                <input
                                    id="member-email"
                                    type="email"
                                    value={memberEmail}
                                    onChange={(e) =>
                                        setMemberEmail(e.target.value)
                                    }
                                    placeholder="Enter email"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        memberSubmitting || !memberEmail.trim()
                                    }
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                                >
                                    {memberSubmitting
                                        ? "Please wait..."
                                        : "Add Member"}
                                </button>
                            </form>
                        )}

                        {/*Success and error messages*/}
                        {memberMessage && (
                            <p
                                role="status"
                                className="mt-4 text-sm text-gray-700"
                            >
                                {memberMessage}
                            </p>
                        )}

                        {memberError && (
                            <p
                                role="alert"
                                className="mt-4 text-sm text-red-600"
                            >
                                {memberError}
                            </p>
                        )}

                        {/*Member list */}
                        <div className="mt-6 space-y-3">
                            <h3 className="font-semibold text-gray-900">
                                Member List
                            </h3>

                            {memberLoading ? (
                                <p className="text-sm text-gray-500">
                                    Loading members...
                                </p>
                            ) : members.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No members found.
                                </p>
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.userId}
                                        className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="wrap-break-word font-medium text-gray-900">
                                                    {member.userName}
                                                </p>

                                                {member.role === "admin" && (
                                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 break-all text-sm text-gray-600">
                                                {member.email}
                                            </p>
                                        </div>

                                        {isCurrentUserAdmin &&
                                            member.role !== "admin" && (
                                                <button
                                                    type="button"
                                                    disabled={memberSubmitting}
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            member.userId,
                                                        )
                                                    }
                                                    className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                </>
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

            <DragDropProvider
                onDragStart={() => {
                    //Save the original positions before the dragging begins.
                    dragStartCardsRef.current = cardsRef.current.map(
                        (card) => ({
                            ...card,
                        }),
                    );
                }}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
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

                            <DroppableList listId={list._id}>
                                <div className="mt-4 space-y-3">
                                    {cards
                                        .filter(
                                            (card) => card.listId === list._id,
                                        )
                                        .sort((a, b) => a.order - b.order)
                                        .map((card, index) => (
                                            <SortableCard
                                                key={card._id}
                                                card={card}
                                                index={index}
                                                listId={list._id}
                                            >
                                                <div
                                                    key={card._id}
                                                    className="rounded-md border p-3"
                                                >
                                                    {editingCardId ===
                                                    card._id ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                value={
                                                                    editingCardTitle
                                                                }
                                                                onChange={(e) =>
                                                                    setEditingCardTitle(
                                                                        e.target
                                                                            .value,
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
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Description"
                                                                className="w-full rounded border p-2"
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    cardSubmitting
                                                                }
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
                                                                    setEditingCardId(
                                                                        null,
                                                                    );
                                                                    setEditingCardTitle(
                                                                        "",
                                                                    );
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
                                                                    {
                                                                        card.description
                                                                    }
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
                                            </SortableCard>
                                        ))}
                                </div>
                            </DroppableList>
                            {newCardListId === list._id ? (
                                <form
                                    onSubmit={(e) =>
                                        handleCreateCard(e, list._id)
                                    }
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
                                            setNewCardDescription(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Description (optional)"
                                        className="w-full rounded-lg border p-2"
                                    />

                                    <button
                                        type="submit"
                                        disabled={cardSubmitting}
                                        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                                    >
                                        {cardSubmitting
                                            ? "Adding..."
                                            : "Add Card"}
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
            </DragDropProvider>
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-board-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                                !
                            </div>

                            <div>
                                <h2
                                    id="delete-board-title"
                                    className="text-xl font-bold text-gray-900"
                                >
                                    Are you sure you want to delete this board?
                                </h2>
                            </div>
                        </div>
                        <p className="mb-5 text-sm leading-6 text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-gray-900">
                                {board.title}
                            </span>
                            ? All lists and cards inside this board will also be
                            deleted
                        </p>

                        {deleteError && (
                            <p
                                role="alert"
                                className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700
                            "
                            >
                                {deleteError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleteSubmitting}
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeleteError("");
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleteSubmitting}
                                onClick={handleDeleteBoard}
                                className="rounded-lg bg-red-600 px-4 py-2
                             text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleteSubmitting
                                    ? "Deleting..."
                                    : "Delete Board"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Board;
