const BoardHeader = ({
    title,
    isEditing,
    editedTitle,
    onTitleChange,
    onSubmit,
    onEditClick,
    onCancelEdit,
    onDeleteClick,
}) => {
    return isEditing ? (
        <form onSubmit={onSubmit} className="mb-6 flex gap-2">
            <input
                value={editedTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="rounded-lg border p-2"
                placeholder="Board title"
                required
                autoFocus
            />

            <button type="submit" className="rounded-lg border px-3 py-2">
                Save
            </button>

            <button
                type="button"
                className="rounded-lg border px-3 py-2"
                onClick={onCancelEdit}
            >
                Cancel
            </button>
        </form>
    ) : (
        <div className="mb-6 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

            <button
                type="button"
                className="rounded-lg border px-3 py-2"
                onClick={onEditClick}
            >
                Edit
            </button>

            <button
                type="button"
                onClick={onDeleteClick}
                className="ml-auto rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-700"
            >
                Delete Board
            </button>
        </div>
    );
};

export default BoardHeader;
