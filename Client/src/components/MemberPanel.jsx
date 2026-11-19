const MembersPanel = ({
    members,
    isAdmin,
    memberEmail,
    loading,
    submitting,
    message,
    error,
    onClose,
    onEmailChange,
    onAddMember,
    onRemoveMember,
}) => {
    return (
        <>
            <button
                type="button"
                aria-label="Close members panel"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/30"
            />

            <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                        Board Members
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded border px-3 py-1 "
                    >
                        Close
                    </button>
                </div>

                {/* Add member form: admins only */}
                {isAdmin && (
                    <form onSubmit={onAddMember} className="mt-6 space-y-3">
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
                            onChange={(e) => onEmailChange(e.target.value)}
                            placeholder="Enter email"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            required
                        />

                        <button
                            type="submit"
                            disabled={submitting || !memberEmail.trim()}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                        >
                            {submitting ? "Please wait..." : "Add Member"}
                        </button>
                    </form>
                )}

                {/*Success and error messages*/}
                {message && (
                    <p role="status" className="mt-4 text-sm text-gray-700">
                        {message}
                    </p>
                )}

                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/*Member list */}
                <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-gray-900">Member List</h3>

                    {loading ? (
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

                                {isAdmin && member.role !== "admin" && (
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() =>
                                            onRemoveMember(member.userId)
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
    );
};
export default MembersPanel;
