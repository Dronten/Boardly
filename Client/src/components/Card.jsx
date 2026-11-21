const Card = ({
    card,
    isEditing,
    editedTitle,
    editedDescription,
    submitting,
    onTitleChange,
    onDescriptionChange,
    onSave,
    onCancelEdit,
    onEditClick,
    onDelete,
}) => {
    return (
        <div className="rounded-md border p-3">
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        value={editedTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Card title"
                        className="w-full rounded border p-2"
                    />
                    <textarea
                        value={editedDescription}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Description"
                        className="w-full rounded border p-2"
                    />
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onSave}
                    >
                        Save
                    </button>{" "}
                    <button type="button" onClick={onCancelEdit}>
                        Cancel
                    </button>
                </div>
            ) : (
                <>
                    <h3 className="font-medium">{card.title}</h3>
                    {card.description && (
                        <p className="mt-1 text-sm text-gray-600">
                            {card.description}
                        </p>
                    )}

                    <div className="mt-3 flex gap-3">
                        <button type="button" onClick={onEditClick}>
                            Edit
                        </button>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onDelete}
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
export default Card;
