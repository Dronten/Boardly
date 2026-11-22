import Card from "@/components/Card";
import AddCardForm from "@/components/AddCardForm";
import { SortableCard, DroppableList } from "@/hooks/useDragAndDrop";

const List = ({
    list,
    cards,
    // list title editing
    isEditing,
    editedTitle,
    submitting,
    onTitleChange,
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDelete,
    // cards
    editingCardId,
    editedCardTitle,
    editedCardDescription,
    cardSubmitting,
    onCardTitleChange,
    onCardDescriptionChange,
    onSaveCard,
    onCancelEditCard,
    onEditCard,
    onDeleteCard,
    // add card form
    isAddingCard,
    newCardTitle,
    newCardDescription,
    onNewCardTitleChange,
    onNewCardDescriptionChange,
    onCreateCard,
    onCancelAddCard,
    onOpenAddCard,
}) => {
    return (
        <div className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {isEditing ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSaveEdit();
                    }}
                    className="flex gap-2"
                >
                    <input
                        autoFocus
                        value={editedTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        maxLength={100}
                        aria-label="Edit list title"
                        className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-gray-900"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !editedTitle.trim()}
                        className="text-sm font-medium text-blue-600 disabled:opacity-50"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onCancelEdit}
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
                            disabled={submitting}
                            onClick={onEditClick}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onDelete}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            <DroppableList listId={list._id}>
                <div className="mt-4 space-y-3">
                    {cards.map((card, index) => (
                        <SortableCard
                            key={card._id}
                            card={card}
                            index={index}
                            listId={list._id}
                        >
                            <Card
                                card={card}
                                isEditing={editingCardId === card._id}
                                editedTitle={editedCardTitle}
                                editedDescription={editedCardDescription}
                                submitting={cardSubmitting}
                                onTitleChange={onCardTitleChange}
                                onDescriptionChange={onCardDescriptionChange}
                                onSave={() => onSaveCard(card._id)}
                                onCancelEdit={onCancelEditCard}
                                onEditClick={() => onEditCard(card)}
                                onDelete={() => onDeleteCard(card._id)}
                            />
                        </SortableCard>
                    ))}
                </div>
            </DroppableList>

            <AddCardForm
                isOpen={isAddingCard}
                title={newCardTitle}
                description={newCardDescription}
                submitting={cardSubmitting}
                onTitleChange={onNewCardTitleChange}
                onDescriptionChange={onNewCardDescriptionChange}
                onCreate={onCreateCard}
                onCancel={onCancelAddCard}
                onAddCard={onOpenAddCard}
            />
        </div>
    );
};

export default List;
