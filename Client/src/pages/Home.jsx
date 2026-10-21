import { use, useEffect, useState } from "react";
import api from "@/lib/api";

function Home() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBoards = async () => {
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900">
                Welcome To Boardly
            </h1>

            <p className="mt-2 text-gray-600">Your Boards will appear here.</p>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Your Boards
                </h2>

                {loading && (
                    <p className="mt-4 text-gray-500">Loading Boards...</p>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && boards.length === 0 && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {boards.map((board) => (
                            <div
                                key={board._id}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
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
