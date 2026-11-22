const AddCardForm = ({
    isOpen,
    title,
    description,
    onDescriptionChange,
    onCreate,
    onTitleChange,
    submitting,
    onCancel,
    onAddCard,
}) => {
    return isOpen ? (
        <form onSubmit={(e) => onCreate(e)} className="mt-3 w-full space-y-2">
            <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Card Title"
                className="w-full rounded-lg border p-2"
                required
            />

            <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-lg border p-2"
            />

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
            >
                {submitting ? "Adding..." : "Add Card"}
            </button>

            <button
                type="button"
                className="w-full rounded-lg border px-3 py-2"
                onClick={() => onCancel()}
            >
                Cancel
            </button>
        </form>
    ) : (
        <button
            type="button"
            className="mt-3 w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
            onClick={() => onAddCard()}
        >
            + Add Card
        </button>
    );
};
export default AddCardForm;
