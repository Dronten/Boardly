import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    deleteBoard,
    getBoard,
    updateBoardTitle,
} from "@/services/boardService";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { createList, deleteList, editListTitle } from "@/services/listService";
import {
    createCard,
    updateCard,
    deleteCard,
    moveCard,
} from "@/services/cardService";
import { addMember, getMembers, removeMember } from "@/services/memberService";
import { checkAuth } from "@/services/authService";
import DeleteBoardDialog from "@/components/DeleteBoardDialog";
import MembersPanel from "@/components/MemberPanel";
import AddListForm from "@/components/AddListForm";
import BoardHeader from "@/components/BoardHeader";
import List from "@/components/List";
import { flattenGroupedCards, groupCardsByList } from "@/utils/cardGrouping";

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
                const data = await getBoard(boardId);

                if (data.success) {
                    setBoard(data.board);
                    setLists(data.lists);
                    setCards(data.cards);
                } else {
                    setError(
                        data.message ||
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
            const data = await updateBoardTitle(boardId, title);

            setBoard(data.board);
            setIsEditingBoardTitle(false);
        } catch (error) {
            setActionError(
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
            await deleteBoard(boardId);

            navigate("/home");
        } catch (error) {
            setDeleteError(
                error.response?.data?.message || "Failed to delete board.",
            );
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // Close delete dialog
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setDeleteError("");
    };

    // Create a list
    const handleCreateList = async (e) => {
        e.preventDefault();

        const title = newListTitle.trim();

        if (!title || listSubmitting) return;

        setListSubmitting(true);
        setActionError("");

        try {
            const data = await createList(boardId, title);

            setLists((prev) =>
                [...prev, data.list].sort((a, b) => a.order - b.order),
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
            const data = await editListTitle(boardId, listId, title);

            setLists((prev) =>
                prev.map((list) => (list._id === listId ? data.list : list)),
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
            await deleteList(boardId, listId);

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

    const handleStartEditList = (list) => {
        setEditingListId(list._id);
        setEditingListTitle(list.title);
        setActionError("");
    };

    const handleCancelEditList = () => {
        setEditingListId(null);
        setEditingListTitle("");
    };

    // Create a card
    const handleCreateCard = async (e, listId) => {
        e.preventDefault();

        const title = newCardTitle.trim();
        const description = newCardDescription.trim();

        if (!title || cardSubmitting) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            const data = await createCard(listId, title, description);

            setCards((prev) => [...prev, data.card]);

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

    // Update a card
    const handleUpdateCard = async (listId, cardId) => {
        const title = editingCardTitle.trim();
        const description = editingCardDescription.trim();

        if (!title || cardSubmitting) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            const data = await updateCard(listId, cardId, title, description);

            setCards((prev) =>
                prev.map((card) => (card._id === cardId ? data.card : card)),
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

    // Delete a card
    const handleDeleteCard = async (listId, cardId) => {
        if (cardSubmitting) return;

        const confirmed = window.confirm("Delete this card?");
        if (!confirmed) return;

        setCardSubmitting(true);
        setActionError("");

        try {
            await deleteCard(listId, cardId);

            setCards((prev) => prev.filter((card) => card._id !== cardId));
        } catch (error) {
            setActionError(
                error.response?.data?.message || "Failed to delete card.",
            );
        } finally {
            setCardSubmitting(false);
        }
    };

    const handleStartEditCard = (card) => {
        setEditingCardId(card._id);
        setEditingCardTitle(card.title);
        setEditingCardDescription(card.description || "");
    };

    const handleCancelEditCard = () => {
        setEditingCardId(null);
        setEditingCardTitle("");
        setEditingCardDescription("");
    };

    // Fetch Board members
    const fetchMembers = async () => {
        setMemberLoading(true);
        setMemberError("");

        try {
            const [memberData, userData] = await Promise.all([
                getMembers(boardId),
                checkAuth(),
            ]);
            setMembers(memberData.members);
            setCurrentUserId(userData.userId);
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
            const data = await addMember(boardId, email);

            setMemberEmail("");
            setMemberMessage(data.message || "Member added successfully.");

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
            const data = await removeMember(boardId, userId);

            setMembers((prev) =>
                prev.filter(
                    (member) => String(member.userId) !== String(userId),
                ),
            );

            setMemberMessage(data.message || "Member removed Successfully.");
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

            const data = await moveCard(
                sourceListId,
                cardId,
                destinationListId,
                newOrder,
            );

            const updatedCards = cardsRef.current.map((card) =>
                String(card._id) === cardId
                    ? {
                          ...card,
                          ...data.card,
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

    const handleStartEditBoardTitle = () => {
        setEditedBoardTitle(board.title);
        setIsEditingBoardTitle(true);
    };
    const handleCancelEditBoardTitle = () => {
        setIsEditingBoardTitle(false);
    };
    const handleOpenDeleteDialog = () => {
        setDeleteError("");
        setIsDeleteDialogOpen(true);
    };

    const handleCancelCard = () => {
        setNewCardListId(null);
        setNewCardTitle("");
        setNewCardDescription("");
    };

    const handleAddCard = (list) => {
        setNewCardListId(list._id);
        setNewCardTitle("");
        setNewCardDescription("");
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
            <BoardHeader
                title={board.title}
                isEditing={isEditingBoardTitle}
                editedTitle={editedBoardTitle}
                onTitleChange={setEditedBoardTitle}
                onSubmit={handleUpdateBoardTitle}
                onEditClick={handleStartEditBoardTitle}
                onCancelEdit={handleCancelEditBoardTitle}
                onDeleteClick={handleOpenDeleteDialog}
            />

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
                <MembersPanel
                    members={members}
                    isAdmin={isCurrentUserAdmin}
                    memberEmail={memberEmail}
                    loading={memberLoading}
                    submitting={memberSubmitting}
                    message={memberMessage}
                    error={memberError}
                    onClose={() => setIsMemberPanelOpen(false)}
                    onEmailChange={setMemberEmail}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                />
            )}

            <AddListForm
                newListTitle={newListTitle}
                onCreateList={handleCreateList}
                onTitleChange={setNewListTitle}
                submitting={listSubmitting}
            />

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
                        <List
                            key={list._id}
                            list={list}
                            cards={cards
                                .filter((card) => card.listId === list._id)
                                .sort((a, b) => a.order - b.order)}
                            isEditing={editingListId === list._id}
                            editedTitle={editingListTitle}
                            submitting={listSubmitting}
                            onTitleChange={setEditingListTitle}
                            onSaveEdit={() => handleUpdateList(list._id)}
                            onCancelEdit={handleCancelEditList}
                            onEditClick={() => handleStartEditList(list)}
                            onDelete={() => handleDeleteList(list._id)}
                            editingCardId={editingCardId}
                            editedCardTitle={editingCardTitle}
                            editedCardDescription={editingCardDescription}
                            cardSubmitting={cardSubmitting}
                            onCardTitleChange={setEditingCardTitle}
                            onCardDescriptionChange={setEditingCardDescription}
                            onSaveCard={(cardId) =>
                                handleUpdateCard(list._id, cardId)
                            }
                            onCancelEditCard={handleCancelEditCard}
                            onEditCard={handleStartEditCard}
                            onDeleteCard={(cardId) =>
                                handleDeleteCard(list._id, cardId)
                            }
                            isAddingCard={newCardListId === list._id}
                            newCardTitle={newCardTitle}
                            newCardDescription={newCardDescription}
                            onNewCardTitleChange={setNewCardTitle}
                            onNewCardDescriptionChange={setNewCardDescription}
                            onCreateCard={(e) => handleCreateCard(e, list._id)}
                            onCancelAddCard={handleCancelCard}
                            onOpenAddCard={() => handleAddCard(list)}
                        />
                    ))}
                </div>
            </DragDropProvider>
            {isDeleteDialogOpen && (
                <DeleteBoardDialog
                    boardTitle={board.title}
                    error={deleteError}
                    submitting={deleteSubmitting}
                    onCancel={handleCloseDeleteDialog}
                    onConfirm={handleDeleteBoard}
                />
            )}
        </div>
    );
};

export default Board;
