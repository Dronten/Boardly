const DeleteBoardDialog = ({
    boardTitle,
    error,
    submitting,
    onCancel,
    onConfirm,
}) => {
    return (
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
                        {boardTitle}
                    </span>
                    ? All lists and cards inside this board will also be deleted
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700
                            "
                    >
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onCancel}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2
                             text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Deleting..." : "Delete Board"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteBoardDialog;
