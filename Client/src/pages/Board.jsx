import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";

function Board() {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get(`/board/${boardId}`);

                if (response.data.success) {
                    console.log(" Boards:", response.data.board);
                    console.log(" Lists:", response.data.lists);
                    console.log("Cards:", response.data.cards);
                    setBoard(response.data.board);
                    setLists(response.data.lists);
                    setCards(response.data.cards);
                } else {
                    setError(
                        response.data.message ||
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
            <h1 className="text-3xl font-bold text-gray-900">{board.title}</h1>

            <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
                {lists.map((list) => (
                    <div
                        key={list._id}
                        className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h2 className="font-semibold text-gray-900">
                            {list.title}
                        </h2>

                        <div className="mt-4 space-y-3">
                            {cards
                                .filter((card) => card.listId === list._id)
                                .map((card) => (
                                    <div
                                        key={card._id}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                    >
                                        <h3 className="font-medium text-gray-900">
                                            {card.title}
                                        </h3>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Board;
