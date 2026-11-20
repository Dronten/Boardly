const AddListForm = ({
    newListTitle,
    onCreateList,
    onTitleChange,
    submitting,
}) => {
    return (
        <form onSubmit={onCreateList} className="mt-6 flex gap-3">
            <input
                type="text"
                value={newListTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter a new list title"
                maxLength={100}
                aria-label="New list title"
                className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
                type="submit"
                disabled={submitting || !newListTitle.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting ? "Creating..." : "Add List"}
            </button>
        </form>
    );
};

export default AddListForm;
