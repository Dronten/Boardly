import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

function Home() {
    const navigate = useNavigate();

    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [boardTitle, setBoardTitle] = useState("");

    useEffect(() => {
        const fetchBoards = async () => {
            setLoading(true);
            setError("");
            
            try {
                const response = await api.get("/board");
                if (response.data.success) {
                    setBoards(response.data.boards);
                } else {
                    setError(response.data.message || "Failed to fetch boards");
                }
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to fetch boards. Please try again.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();

        if (!boardTitle.trim()) {
            return;
        }
        try {
            const response = await api.post("/board", {
                title: boardTitle,
            });

            if (response.data.success) {
                setBoards((prevBoards) => [...prevBoards, response.data.board]);

                setBoardTitle("");
                setShowCreateForm(false);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to create board. Please try again.",
            );
        }
    };

    const handleLogout = async () => {
        try {
            const response = await api.post("/user/logout");

            if (response.data.success) {
                navigate("/login");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to Log out. Please try again.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-6 flex justify-end">
                <Button onClick={handleLogout}>Logout</Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
                Welcome To Boardly
            </h1>

            <p className="mt-2 text-gray-600">
                New Way of Collaboration is here.
            </p>

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Your Boards
                    </h2>

                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? "Cancel" : "Create Board"}
                    </Button>
                </div>
                {showCreateForm && (
                    <form
                        onSubmit={handleCreateBoard}
                        className="mt-4 flex gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Enter Board Title"
                            value={boardTitle}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300"
                        />
                        <Button
                            className="py-5 w-17 mx-1 flex justify-center items-center"
                            type="submit"
                        >
                            Create
                        </Button>
                    </form>
                )}

                {loading && (
                    <p className="mt-4 text-gray-500">Loading Boards...</p>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && boards.length === 0 && (
                    <p className="mt-4 text-gray-500">
                        You don't have any boards yet.
                    </p>
                )}

                {!loading && !error && boards.length > 0 && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {boards.map((board) => (
                            <div
                                key={board._id}
                                onClick={() => navigate(`/board/${board._id}`)}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <h3 className="font-semibold text-gray-900">
                                    {board.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
